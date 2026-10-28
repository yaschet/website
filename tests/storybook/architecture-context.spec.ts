import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`case-study composition at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=pages-casestudyarchitecture--in-context&viewMode=story&globals=theme:${theme}`,
			);
			await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
			await expect(page.getByRole("heading", { name: "Verto", exact: true })).toBeVisible();
			const figure = page.locator("[data-figure]");
			await figure.scrollIntoViewIfNeeded();
			await expect(figure.locator("[data-architecture-map]")).toHaveAttribute(
				"data-compact",
				width > 640 ? "false" : "true",
			);
			await expect(figure.getByRole("heading", { name: "Verto architecture" })).toBeVisible();
			await expect(figure.getByRole("heading", { name: "Verto architecture" })).toHaveCSS(
				"font-size",
				"16px",
			);
			await expect(figure.getByRole("button", { name: "Intake", exact: true })).toHaveCSS(
				"font-size",
				"14px",
			);
			await figure.getByRole("button", { name: "Check", exact: true }).click();
			await expect(
				figure.getByRole("heading", { name: "A rejected layout returns to its builder." }),
			).toBeVisible();
			await expect(figure.locator('[data-architecture-node="auditor"]')).toBeInViewport();
			const nodes = figure.locator("[data-architecture-node]");
			const readable = await nodes.evaluateAll((items) =>
				items.map((node) => {
					const detail = node.querySelector("strong + span");
					if (!detail) throw new Error("Missing node detail");
					return (
						(Number.parseFloat(getComputedStyle(detail).fontSize) *
							node.getBoundingClientRect().width) /
						224
					);
				}),
			);
			for (const size of readable)
				expect(size).toBeGreaterThanOrEqual(width > 640 ? 13.8 : 12);
			const expand = figure.getByRole("button", { name: "Expand diagram" });
			await expand.click();
			await expect(page.getByRole("dialog")).toBeVisible();
			await page.keyboard.press("Escape");
			await expect(expand).toBeFocused();
			const nextTheme = theme === "light" ? "dark" : "light";
			await page.getByRole("button", { name: `Theme: Switch to ${nextTheme} mode` }).click();
			await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${nextTheme}\\b`));
			await expect(
				page
					.getByRole("navigation", { name: "Main navigation" })
					.getByRole("link", { name: "Case Studies", exact: true }),
			).toHaveAttribute("aria-current", "page");
			await expect(figure.getByRole("heading", { name: "Verto architecture" })).toBeVisible();
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
		});
	}
}

test("canvas manipulation has bounded work and settles at rest", async ({ page }, testInfo) => {
	await page.setViewportSize({ width: 1280, height: 1000 });
	// Accessibility is checked by the story suite in both themes. Its scanner must not
	// load during this isolated interaction sample and be mistaken for canvas work.
	await page.goto(
		"/iframe.html?id=case-study-diagram--system-architecture&viewMode=story&globals=theme:light;a11y.manual:!true",
	);
	const canvas = page.locator("[data-canvas-viewport]");
	const artboard = page.locator("[data-canvas-artboard]");
	await expect(artboard).toBeVisible();
	await canvas.focus();
	await page.keyboard.press("+");
	await page.getByRole("button", { name: "Drag canvas" }).click();
	const box = await canvas.boundingBox();
	if (!box) throw new Error("Missing canvas");
	const start = await artboard.getAttribute("style");
	await page.evaluate(async () => {
		await document.fonts.ready;
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
	});
	const trace = process.env.FIGURE_PERFORMANCE_TRACE
		? await page.context().newCDPSession(page)
		: null;
	const traceEvents: unknown[] = [];
	if (trace) {
		trace.on("Tracing.dataCollected", (event) => traceEvents.push(...event.value));
		await trace.send("Tracing.start", {
			categories: "devtools.timeline,v8.execute,disabled-by-default-devtools.timeline",
		});
	}
	const samples = page.evaluate(
		() =>
			new Promise<{
				intervals: number[];
				longTasks: { startTime: number; duration: number }[];
			}>((resolve) => {
				const intervals: number[] = [];
				const longTasks: { startTime: number; duration: number }[] = [];
				const started = performance.now();
				const observer = new PerformanceObserver((list) => {
					for (const entry of list.getEntries())
						longTasks.push({
							startTime: entry.startTime - started,
							duration: entry.duration,
						});
				});
				observer.observe({ type: "longtask", buffered: false });
				let previous = performance.now();
				const sample = (now: number) => {
					intervals.push(now - previous);
					previous = now;
					if (intervals.length < 120) requestAnimationFrame(sample);
					else {
						observer.disconnect();
						resolve({ intervals: intervals.slice(1), longTasks });
					}
				};
				requestAnimationFrame(sample);
			}),
	);
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2 - 40, { steps: 60 });
	await page.mouse.up();
	expect(await artboard.getAttribute("style")).not.toBe(start);
	await expect(canvas).toHaveAttribute("data-manipulating", "false");
	await expect(artboard).toHaveCSS("will-change", "auto");
	const results = await samples;
	if (trace) {
		const completed = new Promise<void>((resolve) =>
			trace.once("Tracing.tracingComplete", () => resolve()),
		);
		await trace.send("Tracing.end");
		await completed;
		await testInfo.attach("canvas-browser-trace.json", {
			body: JSON.stringify({ traceEvents }),
			contentType: "application/json",
		});
		await trace.detach();
	}
	const sorted = [...results.intervals].sort((a, b) => a - b);
	await testInfo.attach("local-frame-sample.json", {
		body: JSON.stringify(
			{
				frameIntervalMedianMs: sorted[Math.floor(sorted.length / 2)],
				frameIntervalP95Ms: sorted[Math.floor(sorted.length * 0.95)],
				maxFrameIntervalMs: sorted[sorted.length - 1],
				longTasks: results.longTasks,
				note: "Local headless Chromium sample with the Storybook audit scanner paused; accessibility is verified separately. Not a physical display FPS or field-performance guarantee.",
			},
			null,
			2,
		),
		contentType: "application/json",
	});
	expect(
		await artboard.evaluate(
			(element) =>
				element
					.getAnimations({ subtree: true })
					.filter((animation) => animation.playState === "running").length,
		),
	).toBe(0);
});
