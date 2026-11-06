import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`content loader preserves header and navigation at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 844 });
			await page.goto(
				`/iframe.html?id=pages-loading--with-navigation&viewMode=story&globals=theme:${theme}`,
			);
			const loading = page.getByRole("status", { name: "Loading page" });
			await expect(loading).toBeVisible();
			const frame = page.locator(".workshop-page-frame");
			const header = page.locator("#header");
			await expect(header).toBeVisible();
			await expect(header).not.toHaveAttribute("inert");
			const frameBox = await frame.boundingBox();
			const loadingBox = await loading.boundingBox();
			const headerBox = await header.boundingBox();
			expect(frameBox).not.toBeNull();
			expect(loadingBox?.y).toBeCloseTo((headerBox?.y ?? 0) + (headerBox?.height ?? 0), 0);
			expect(loadingBox?.x).toBe(frameBox?.x);
			expect(loadingBox?.width).toBe(frameBox?.width);
			expect((loadingBox?.y ?? 0) + (loadingBox?.height ?? 0)).toBeLessThanOrEqual(
				(frameBox?.y ?? 0) + (frameBox?.height ?? 0),
			);
			await expect(loading.locator("svg")).toHaveCSS("width", "32px");
			await expect(loading.locator("rect")).toHaveCount(2);
			await expect(loading.locator(".portfolio-page-loading-mark")).toHaveCSS(
				"animation-name",
				"draw-square",
			);
			const nav = page.getByRole("navigation", { name: "Main navigation" });
			await expect(nav).toBeVisible();
			await nav.getByRole("link", { name: "Contact", exact: true }).focus();
			await expect(nav.getByRole("link", { name: "Contact", exact: true })).toBeFocused();
			const glyphBox = await loading.locator("svg").boundingBox();
			expect((glyphBox?.x ?? 0) + (glyphBox?.width ?? 0) / 2).toBeCloseTo(
				(loadingBox?.x ?? 0) + (loadingBox?.width ?? 0) / 2,
				0,
			);
			expect((glyphBox?.y ?? 0) + (glyphBox?.height ?? 0) / 2).toBeCloseTo(
				(loadingBox?.y ?? 0) + (loadingBox?.height ?? 0) / 2,
				0,
			);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
			await page.screenshot({ path: testInfo.outputPath(`loader-${theme}-${width}.png`) });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await expect(loading.locator(".portfolio-page-loading-mark")).toHaveCSS(
				"animation-name",
				"none",
			);
			await expect(loading.locator(".portfolio-page-loading-mark")).toHaveCSS(
				"stroke-dashoffset",
				"0px",
			);
		});
	}
}
