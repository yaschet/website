import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [320, 390, 1280]) {
		test(`case-study summary Docs reflow at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=layout-casestudysummary--docs&viewMode=docs&globals=theme:${theme}`,
			);
			const docs = page.locator(".sbdocs-content");
			await expect(docs.locator(".sb-story")).toHaveCount(3);
			await expect(docs.locator("iframe")).toHaveCount(0);
			await expect(
				docs.getByRole("heading", { name: "Program Matching Engine", level: 1 }),
			).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			expect(
				await docs.evaluate((root) => ({
					overflows: document.documentElement.scrollWidth > innerWidth + 1,
					previewGutters: [...root.querySelectorAll<HTMLElement>(".docs-story")].filter(
						(el) => el.offsetWidth - el.clientWidth > 1,
					).length,
					scrollers: [...root.querySelectorAll<HTMLElement>("*")].filter(
						(el) =>
							/auto|scroll/.test(getComputedStyle(el).overflowY) &&
							el.clientHeight > 0 &&
							el.scrollHeight > el.clientHeight + 1,
					).length,
					chipsFit: [
						...root.querySelectorAll<HTMLElement>(".portfolio-project-stack li"),
					].every((el) => el.scrollWidth <= el.clientWidth + 1),
				})),
			).toEqual({ overflows: false, previewGutters: 0, scrollers: 0, chipsFit: true });
		});
	}
}
