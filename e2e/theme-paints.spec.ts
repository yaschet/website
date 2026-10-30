import { expect, test } from "@playwright/test";

// Exercise native snapshot compositing without unrelated software-rendered WebGL.
test.use({
	launchOptions: async ({ browserName }, use) => {
		await use(browserName === "chromium" ? { args: ["--disable-webgl"] } : {});
	},
});
for (const position of ["top", "footer"] as const) {
	test(`theme paint never reverses at the ${position}`, async ({
		page,
		context,
		browserName,
		isMobile,
	}, testInfo) => {
		test.skip(browserName !== "chromium", "Rendered frame capture requires Chromium CDP");
		test.slow();
		await page.addInitScript(() => localStorage.setItem("theme", "dark"));
		await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
		const cdp = await context.newCDPSession(page);
		const frames: { image: string; time: number }[] = [];
		cdp.on("Page.screencastFrame", (frame) => {
			const time = frame.metadata.timestamp;
			if (time !== undefined) frames.push({ image: frame.data, time });
			void cdp
				.send("Page.screencastFrameAck", { sessionId: frame.sessionId })
				.catch(() => {});
		});
		try {
			for (const width of isMobile ? [393] : [1000, 600]) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(position === "top" ? "/" : "/case-studies/clearway-phoenix");
				await expect(page.getByRole("button", { name: /^Theme: Switch/ })).toBeVisible();
				await expect(page.locator("html")).toHaveClass(/\bdark\b/);
				await page.evaluate(() => document.fonts.ready);
				await page.evaluate((position) => {
					if (position === "footer")
						scrollTo({
							top: document.documentElement.scrollHeight,
							behavior: "instant",
						});
					const start = document.startViewTransition.bind(document);
					document.startViewTransition = (update) => {
						delete document.documentElement.dataset.paintFinished;
						const transition = start(update);
						void transition.finished.then(() => {
							document.documentElement.dataset.paintFinished = "true";
						});
						return transition;
					};
				}, position);
				for (const destination of ["light", "dark"] as const) {
					frames.length = 0;
					await cdp.send("Page.startScreencast", {
						format: "png",
						everyNthFrame: 1,
						// Small frames bound capture memory and cost.
						maxWidth: 100,
						maxHeight: 90,
					});
					await expect.poll(() => frames.length).toBeGreaterThan(0);
					await page.getByRole("button", { name: /^Theme: Switch/ }).click();
					await expect(page.locator("html")).toHaveAttribute(
						"data-paint-finished",
						"true",
					);
					// Include teardown paints. Pausing the animation after ready misses this regression.
					await page.evaluate(async () => {
						const end = performance.now() + 250;
						do {
							await new Promise<void>((resolve) =>
								requestAnimationFrame(() => resolve()),
							);
						} while (performance.now() < end);
					});
					await cdp.send("Page.stopScreencast");
					const samples = await page.evaluate(async (frames) => {
						const canvas = new OffscreenCanvas(1, 1);
						const context = canvas.getContext("2d");
						if (!context) throw new Error("The frame check requires a 2D canvas");
						const samples: { time: number; red: number }[] = [];
						for (const frame of frames.slice().sort((a, b) => a.time - b.time)) {
							const bytes = Uint8Array.from(atob(frame.image), (value) =>
								value.charCodeAt(0),
							);
							const bitmap = await createImageBitmap(new Blob([bytes]));
							// Sample the canvas margin below the fixed reading-progress bar.
							context.drawImage(bitmap, 0, 10, 1, 1, 0, 0, 1, 1);
							samples.push({
								time: frame.time,
								red: context.getImageData(0, 0, 1, 1).data[0],
							});
							bitmap.close();
						}
						return samples;
					}, frames);
					await testInfo.attach(`${width}-${position}-${destination}-paints.json`, {
						body: JSON.stringify(samples),
						contentType: "application/json",
					});
					const first = samples[0]?.red;
					const last = samples.at(-1)?.red;
					expect(first).toBeDefined();
					expect(last).toBeDefined();
					if (first === undefined || last === undefined)
						throw new Error("No captured theme paints");
					expect(Math.abs(last - first)).toBeGreaterThan(150);
					expect(samples.some(({ red }) => red > 45 && red < 220)).toBe(true);
					const direction = destination === "light" ? 1 : -1;
					let furthest = direction * first;
					const reversals = samples.filter(({ red }) => {
						const progress = direction * red;
						const reversed = progress < furthest - 2;
						furthest = Math.max(furthest, progress);
						return reversed;
					});
					expect(
						reversals,
						`${width}px ${position}: old-theme pixels must not return`,
					).toEqual([]);
					await expect(page.locator("html")).toHaveClass(
						new RegExp(`\\b${destination}\\b`),
					);
				}
			}
		} finally {
			await cdp.detach().catch(() => {});
		}
	});
}
