import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	for (const width of [320, 390, 1280]) {
		test(`Lab content and canvas share one bounded rail at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			for (const id of ["experiments-meshgradient", "experiments-swissgridcanvas"]) {
				await page.goto(
					`/iframe.html?id=${id}--default&viewMode=story&globals=theme:${theme}`,
				);
				await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
				await expect(page.locator("html")).toHaveClass(new RegExp(theme));
				await page.evaluate(() => document.fonts.ready);
				await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
					"font-size",
					id === "experiments-meshgradient"
						? width < 360
							? "32px"
							: width < 640
								? "36px"
								: "48px"
						: width < 640
							? "32px"
							: "36px",
				);
				const stage = page.locator(".workshop-stage");
				const inset = width < 640 ? 20 : 40;
				for (const side of ["top", "right", "bottom", "left"]) {
					await expect(stage).toHaveCSS(`padding-${side}`, `${inset}px`);
				}
				const host = page.locator("[data-swiss-grid-host]");
				const rail = page.locator("[data-swiss-grid-bounds]");
				const railBox = await rail.boundingBox();
				if (!railBox) throw new Error("The grid must own a measurable content rail.");
				for (const column of await host.locator(".workshop-grid-column").all()) {
					const box = await column.boundingBox();
					expect(box?.x).toBeCloseTo(railBox.x, 1);
					expect(box?.width).toBeCloseTo(railBox.width, 1);
				}
				for (const panel of await host.locator(".portfolio-box-pad").all()) {
					for (const side of ["top", "right", "bottom", "left"]) {
						await expect(panel).toHaveCSS(`padding-${side}`, `${inset}px`);
					}
				}
				const headingBox = await page.getByRole("heading", { level: 1 }).boundingBox();
				expect(headingBox?.x).toBeCloseTo(railBox.x + inset, 1);
				expect((headingBox?.x ?? 0) + (headingBox?.width ?? 0)).toBeLessThanOrEqual(
					railBox.x + railBox.width - inset + 1,
				);
				const geometry = await host.evaluate((element) => {
					const canvas = element.querySelector("canvas");
					return {
						hostHeight: element.clientHeight,
						canvasHeight: canvas?.height,
						canvasWidth: canvas?.width,
						expectedHeight: Math.round(
							element.clientHeight * Math.min(devicePixelRatio, 1.5),
						),
						expectedWidth: Math.round(
							element.clientWidth * Math.min(devicePixelRatio, 1.5),
						),
						overflow: document.documentElement.scrollWidth > innerWidth + 1,
					};
				});
				expect(geometry.canvasHeight).toBe(geometry.expectedHeight);
				expect(geometry.canvasWidth).toBe(geometry.expectedWidth);
				expect(geometry.hostHeight).toBeLessThan(width < 640 ? 1100 : 800);
				expect(geometry.overflow).toBe(false);
				if (id === "experiments-meshgradient") {
					await expect
						.poll(
							async () =>
								(await page.locator("[data-mesh-gradient]").boundingBox())?.width,
						)
						.toBeCloseTo(railBox.width, 1);
					const mesh = await page.locator("[data-mesh-gradient]").boundingBox();
					expect(mesh?.x).toBeCloseTo(railBox.x, 1);
				}
				await page.screenshot({
					path: testInfo.outputPath(`${id}-${width}-${theme}.png`),
					fullPage: true,
				});
			}
		});

		test(`unfinished route states retain equal outer clearance at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			const inset = width < 640 ? 20 : 40;
			for (const id of ["pages-not-found", "pages-error"]) {
				await page.goto(
					`/iframe.html?id=${id}--default&viewMode=story&globals=theme:${theme}`,
				);
				await expect(
					page.getByRole("heading", {
						name: id === "pages-not-found" ? "Page not found." : "Something broke.",
					}),
				).toBeVisible();
				const stage = page.locator(".workshop-stage");
				for (const side of ["top", "right", "bottom", "left"]) {
					await expect(stage).toHaveCSS(`padding-${side}`, `${inset}px`);
				}
				const frame = await page.locator(".workshop-page-frame").boundingBox();
				const stageBox = await stage.boundingBox();
				expect(frame?.y).toBe(inset);
				expect(frame?.width).toBe(Math.min(1024, width - inset * 2));
				expect((stageBox?.height ?? 0) - (frame?.height ?? 0)).toBe(inset * 2);
				expect(
					await page.evaluate(
						() => document.documentElement.scrollWidth <= innerWidth + 1,
					),
				).toBe(true);
				await page.screenshot({
					path: testInfo.outputPath(`${id}-${width}-${theme}.png`),
					fullPage: true,
				});
			}
		});
	}

	test(`Swiss Grid Docs keep their canvas local in ${theme}`, async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(
			`/iframe.html?id=experiments-swissgridcanvas--docs&viewMode=docs&globals=theme:${theme}`,
		);
		const host = page.locator("[data-swiss-grid-host]");
		await expect(host.getByRole("heading", { name: "Aligned by one grid." })).toBeVisible();
		await expect(page.locator(".sbdocs-content iframe")).toHaveCount(0);
		const allocation = await host.evaluate((element) => ({
			height: element.querySelector("canvas")?.height,
			expected: Math.round(element.clientHeight * Math.min(devicePixelRatio, 1.5)),
			documentHeight: document.documentElement.scrollHeight,
			hostHeight: element.clientHeight,
		}));
		expect(allocation.height).toBe(allocation.expected);
		expect(allocation.hostHeight).toBeLessThan(allocation.documentHeight);
	});
}
