import { expect, test } from "@playwright/test";

// An opt-in rendering diagnostic, not a device-independent frame-rate assertion.
test.skip(!process.env.RUN_GALLERY_PROFILE, "Set RUN_GALLERY_PROFILE=1 against a production build");
test.use({ trace: "off", video: "off", screenshot: "off" });

for (const variant of ["full", "no-artwork-blur", "no-glass", "no-atmosphere", "plain"] as const) {
	test(`gallery rendering observation: ${variant}`, async ({ page, browser }, testInfo) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.addInitScript(() => localStorage.setItem("theme", "dark"));
		await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
		await page.goto("/case-studies/clearway-phoenix");
		await page
			.locator("article")
			.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
			.first()
			.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAttribute("data-gallery-state", "open");
		if (variant === "no-artwork-blur" || variant === "plain") {
			await page.addStyleTag({
				content:
					".pswp__img, [data-gallery-frame], [data-portfolio-video] { filter: none !important; }",
			});
		}
		if (variant === "no-glass" || variant === "plain") {
			await page.addStyleTag({
				content:
					".pswp * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }",
			});
		}
		if (variant === "no-atmosphere" || variant === "plain") {
			await page.addStyleTag({
				content: "[data-gallery-ambience] { display: none !important; }",
			});
		}
		// Warm the same decoded destinations before collecting three observations.
		for (const index of [5, 1]) {
			await dialog
				.locator(`[data-gallery-preview="${index}"]`)
				.dispatchEvent("click", { detail: 1 });
			await expect(dialog.locator(`[data-gallery-preview="${index}"]`)).toHaveAttribute(
				"aria-current",
				"true",
			);
			await expect(dialog).not.toHaveAttribute("data-gallery-jump");
		}
		const observations = [];
		for (const index of [5, 1, 5]) {
			observations.push(
				await dialog.evaluate((root, destination) => {
					const clicked = performance.now();
					let first = 0;
					let previous = 0;
					const intervals: number[] = [];
					return new Promise<{ preparation: number; intervals: number[] }>(
						(resolve, reject) => {
							const sample = (now: number) => {
								if (now - clicked > 5_000)
									return reject(new Error("Navigation did not settle"));
								if (root.hasAttribute("data-gallery-jump")) {
									if (!first) first = now;
									if (previous) intervals.push(now - previous);
									previous = now;
								} else if (first) {
									if (previous) intervals.push(now - previous);
									resolve({
										preparation: Math.max(0, first - clicked),
										intervals,
									});
									return;
								}
								requestAnimationFrame(sample);
							};
							root.querySelector(
								`[data-gallery-preview="${destination}"]`,
							)?.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
							requestAnimationFrame(sample);
						},
					);
				}, index),
			);
		}
		const session = await browser.newBrowserCDPSession();
		const { gpu } = await session.send("SystemInfo.getInfo");
		await session.detach();
		await testInfo.attach("rendering-observation", {
			body: JSON.stringify({ variant, observations, gpu }),
			contentType: "application/json",
		});
		await page.keyboard.press("Escape");
	});
}
