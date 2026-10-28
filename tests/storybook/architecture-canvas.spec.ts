import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [320, 390]) {
		for (const step of ["Intake", "Check", "Write"]) {
			test(`complete ${step} stage has equal visible clearance at ${width}px in ${theme}`, async ({
				page,
			}) => {
				await page.setViewportSize({ width, height: 1000 });
				await page.goto(
					`/iframe.html?id=case-study-diagram--system-architecture&viewMode=story&globals=theme:${theme}`,
				);
				await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
				await page.getByRole("button", { name: step, exact: true }).focus();
				await page.keyboard.press("Enter");
				await expect(page.locator("[data-architecture-node]")).toHaveCount(3);
				await expect
					.poll(async () =>
						page.locator("[data-canvas-viewport]").evaluate((viewport) => {
							const frame = viewport.getBoundingClientRect();
							const items = [
								...viewport.querySelectorAll(
									"[data-figure-node], g[data-active] > path",
								),
							].map((item) => item.getBoundingClientRect());
							const gaps = [
								Math.min(...items.map((item) => item.left)) - frame.left,
								Math.min(...items.map((item) => item.top)) - frame.top,
								frame.right - Math.max(...items.map((item) => item.right)),
								frame.bottom - Math.max(...items.map((item) => item.bottom)),
							];
							return Math.max(...gaps) - Math.min(...gaps);
						}),
					)
					.toBeLessThan(1);
				await expect(page.getByRole("button", { name: "Drag canvas" })).toBeDisabled();
			});
		}
	}

	for (const width of [320, 390, 1280]) {
		test(`architecture camera, geometry and focus at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=case-study-diagram--system-architecture&viewMode=story&globals=theme:${theme}`,
			);
			await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
			const viewport = page.locator("[data-canvas-viewport]");
			const artboard = page.locator("[data-canvas-artboard]");
			await expect(artboard).toBeVisible();
			await expect(page.locator("[data-architecture-node]")).toHaveCount(9);
			await page.evaluate(() => document.fonts.ready);
			const geometry = await page.locator("[data-architecture-node]").evaluateAll((nodes) =>
				nodes.map((node) => {
					const box = node.getBoundingClientRect();
					const chamber = node.querySelector('[data-slot="icon-chamber"]');
					const title = node.querySelector("strong");
					const detail = node.querySelector("strong + span");
					if (!chamber || !title || !detail) throw new Error("Node structure is missing");
					const icon = chamber.getBoundingClientRect();
					const scale = box.width / 224;
					return {
						insets: [
							icon.left - box.left,
							icon.top - box.top,
							box.bottom - icon.bottom,
						].map((value) => value / scale),
						chamber: [icon.width / scale, icon.height / scale],
						titleSize: getComputedStyle(title).fontSize,
						detailSize: getComputedStyle(detail).fontSize,
						textFits: detail.getBoundingClientRect().right <= box.right - 15 * scale,
						readable: Number.parseFloat(getComputedStyle(detail).fontSize) * scale,
					};
				}),
			);
			for (const node of geometry) {
				for (const inset of node.insets) expect(inset).toBeCloseTo(16, 1);
				for (const side of node.chamber) expect(side).toBeCloseTo(40, 1);
				expect(node.titleSize).toBe("16px");
				expect(node.detailSize).toBe("14px");
				expect(node.textFits).toBe(true);
				if (width < 640) expect(node.readable).toBeGreaterThanOrEqual(12);
			}
			await page.getByRole("button", { name: "Fit entire diagram" }).focus();
			await page.keyboard.press("Enter");
			const fitted = await artboard.boundingBox();
			const frame = await viewport.boundingBox();
			if (!fitted || !frame) throw new Error("Viewport geometry unavailable");
			expect(fitted.x).toBeGreaterThanOrEqual(frame.x + 15);
			expect(fitted.y).toBeGreaterThanOrEqual(frame.y + 15);
			expect(fitted.x + fitted.width).toBeLessThanOrEqual(frame.x + frame.width - 15);
			expect(fitted.y + fitted.height).toBeLessThanOrEqual(frame.y + frame.height - 15);
			await expect(page.getByRole("button", { name: "Zoom out" })).toBeDisabled();
			await expect(page.getByRole("button", { name: "Drag canvas" })).toBeDisabled();
			await viewport.focus();
			await page.keyboard.press("+");
			await page.keyboard.press("+");
			const beforePan = await artboard.getAttribute("style");
			await page.keyboard.press(width < 640 ? "ArrowDown" : "ArrowRight");
			expect(await artboard.getAttribute("style")).not.toBe(beforePan);
			await page.keyboard.press("Home");
			await expect(page.getByRole("button", { name: "Zoom out" })).toBeDisabled();
			await expect(page.getByRole("button", { name: "Drag canvas" })).toBeDisabled();
			await page.getByRole("button", { name: "Write", exact: true }).focus();
			await page.keyboard.press("Enter");
			await expect(
				page.getByRole("heading", { name: "Compile the document and record the result." }),
			).toBeVisible();
			await expect(viewport).toHaveAttribute("data-step", "write");
			await expect(page.locator('[data-architecture-node="compiler"]')).toBeInViewport();
			const expand = page.getByRole("button", { name: "Expand diagram" });
			await expand.click();
			const dialog = page.getByRole("dialog");
			await expect(
				dialog.getByRole("button", { name: "Write", exact: true }),
			).toHaveAttribute("aria-pressed", "true");
			await dialog.getByRole("button", { name: "Fit entire diagram" }).click();
			await page.keyboard.press("Escape");
			await expect(expand).toBeFocused();
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
			).toBe(false);
		});
	}

	test(`architecture pointer pan is opt-in and motion is finite in ${theme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 1100 });
		await page.goto(
			`/iframe.html?id=case-study-diagram--system-architecture&viewMode=story&globals=theme:${theme}`,
		);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		const viewport = page.locator("[data-canvas-viewport]");
		const artboard = page.locator("[data-canvas-artboard]");
		await expect(artboard).toBeVisible();
		await expect(viewport).toHaveCSS("touch-action", "auto");
		await page.getByRole("button", { name: "Check", exact: true }).click();
		await expect
			.poll(() =>
				artboard.evaluate(
					(element) =>
						element
							.getAnimations({ subtree: true })
							.filter((animation) => animation.playState === "running").length,
				),
			)
			.toBe(0);
		await page.getByRole("button", { name: "Zoom in" }).click();
		await page.getByRole("button", { name: "Drag canvas" }).click();
		await expect(viewport).toHaveCSS("touch-action", "none");
		const box = await viewport.boundingBox();
		if (!box) throw new Error("Canvas unavailable");
		const previous = await artboard.getAttribute("style");
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await page.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2 - 50, {
			steps: 5,
		});
		await page.mouse.up();
		expect(await artboard.getAttribute("style")).not.toBe(previous);
		await viewport.focus();
		await page.keyboard.press("Escape");
		await expect(viewport).toHaveCSS("touch-action", "auto");
		await expect(page.getByRole("button", { name: "Drag canvas" })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.getByRole("button", { name: "Write", exact: true }).click();
		expect(
			await page
				.locator("[data-figure]")
				.evaluate((element) => element.getAnimations({ subtree: true }).length),
		).toBe(0);
		await page.getByRole("button", { name: "Full explanation" }).click();
		await expect(page.getByRole("list").locator("li")).toHaveCount(4);
	});
}

test("touch pinch, cancellation and native page scrolling coexist", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 900 });
	await page.goto(
		"/iframe.html?id=case-study-diagram--system-architecture&viewMode=story&globals=theme:dark",
	);
	const viewport = page.locator("[data-canvas-viewport]");
	const artboard = page.locator("[data-canvas-artboard]");
	await expect(artboard).toBeVisible();
	await page.getByRole("button", { name: "Drag canvas" }).click();
	const box = await viewport.boundingBox();
	if (!box) throw new Error("Canvas unavailable");
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
	const x = box.x + box.width / 2;
	const y = box.y + 120;
	const zoom = page.getByRole("status", { name: "Diagram zoom" });
	const before = Number.parseInt(await zoom.innerText(), 10);
	await cdp.send("Input.dispatchTouchEvent", {
		type: "touchStart",
		touchPoints: [
			{ x: x - 30, y, id: 1 },
			{ x: x + 30, y, id: 2 },
		],
	});
	await cdp.send("Input.dispatchTouchEvent", {
		type: "touchMove",
		touchPoints: [
			{ x: x - 60, y, id: 1 },
			{ x: x + 60, y, id: 2 },
		],
	});
	await expect
		.poll(async () => Number.parseInt(await zoom.innerText(), 10))
		.toBeGreaterThan(before);
	await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
	const settled = await artboard.getAttribute("style");
	await page.mouse.move(x + 20, y + 20);
	expect(await artboard.getAttribute("style")).toBe(settled);
	await page.getByRole("button", { name: "Drag canvas" }).click();
	await expect(viewport).toHaveCSS("touch-action", "auto");
	await page.mouse.move(x, y);
	const scrollBefore = await page.evaluate(() => window.scrollY);
	await page.mouse.wheel(0, 200);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);
	expect(await artboard.getAttribute("style")).toBe(settled);
	await cdp.detach();
});

for (const theme of ["light", "dark"]) {
	test(`architecture text and meaningful paths retain contrast in ${theme}`, async ({ page }) => {
		await page.goto(
			`/iframe.html?id=case-study-diagram--system-architecture&viewMode=story&globals=theme:${theme}`,
		);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		for (const step of ["Map", "Intake", "Check", "Write"]) {
			await page.getByRole("button", { name: step, exact: true }).focus();
			await page.keyboard.press("Enter");
			const contrasts = await page.locator("[data-architecture-map]").evaluate((map) => {
				const swatch = document.createElement("canvas");
				swatch.width = swatch.height = 1;
				const context = swatch.getContext("2d");
				if (!context) throw new Error("Color measurement unavailable");
				const luminance = (color: string) => {
					context.clearRect(0, 0, 1, 1);
					context.fillStyle = color;
					context.fillRect(0, 0, 1, 1);
					const [r, g, b] = [...context.getImageData(0, 0, 1, 1).data]
						.slice(0, 3)
						.map((value) => {
							const channel = value / 255;
							return channel <= 0.04045
								? channel / 12.92
								: ((channel + 0.055) / 1.055) ** 2.4;
						});
					return r * 0.2126 + g * 0.7152 + b * 0.0722;
				};
				const ratio = (a: string, b: string) => {
					const [bright, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
					return (bright + 0.05) / (dark + 0.05);
				};
				const text = [...map.querySelectorAll("[data-architecture-node]")].flatMap((node) =>
					[...node.querySelectorAll("strong, strong + span")].map((label) =>
						ratio(
							getComputedStyle(label).color,
							getComputedStyle(node).backgroundColor,
						),
					),
				);
				const chambers = [...map.querySelectorAll('[data-slot="icon-chamber"]')].map(
					(icon) =>
						ratio(getComputedStyle(icon).color, getComputedStyle(icon).backgroundColor),
				);
				const canvas = map.closest("[data-canvas-viewport]");
				if (!canvas) throw new Error("Canvas material missing");
				const backgrounds = [getComputedStyle(canvas).backgroundColor];
				const paths = [...map.querySelectorAll("g[data-active] > path")].flatMap((path) =>
					backgrounds.map((background) =>
						ratio(getComputedStyle(path).stroke, background),
					),
				);
				return { text, chambers, paths };
			});
			for (const contrast of contrasts.text)
				expect(contrast, `${step} text`).toBeGreaterThanOrEqual(4.5);
			for (const contrast of [...contrasts.chambers, ...contrasts.paths])
				expect(contrast, `${step} graphic`).toBeGreaterThanOrEqual(3);
		}
	});
}
