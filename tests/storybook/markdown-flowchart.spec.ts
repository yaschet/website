import { expect, test } from "@playwright/test";

const DIAGRAM_LABELS = ["Input", "Validate", "Store"] as const;

for (const theme of ["light", "dark"] as const) {
	test(`fenced Markdown flowchart renders and expands in ${theme} mode`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.setViewportSize({ width: 390, height: 844 });
		const response = await page.goto(
			`/iframe.html?id=article-blocks--markdown-flowchart&viewMode=story&globals=theme:${theme}`,
		);
		expect(response?.status()).toBe(200);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));

		const figure = page.locator("figure").filter({ hasText: "Architecture Diagram" });
		const diagram = figure.locator("svg").first();
		await expect(diagram).toBeVisible();
		await figure.scrollIntoViewIfNeeded();
		for (const label of DIAGRAM_LABELS) {
			await expect(diagram.getByText(label, { exact: true })).toBeVisible();
		}
		expect(await diagram.locator("g.node").count()).toBe(3);
		const bounds = await diagram.boundingBox();
		expect(bounds?.width).toBeGreaterThan(0);
		expect(bounds?.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
		expect(bounds?.height).toBeGreaterThan(0);

		await diagram.click();
		const expanded = page.getByRole("dialog");
		await expect(expanded.locator("svg")).toBeVisible();
		for (const label of DIAGRAM_LABELS) {
			await expect(expanded.getByText(label, { exact: true })).toBeVisible();
		}
		await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
		await page.keyboard.press("Escape");
		await expect(expanded).toHaveCount(0);
		await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
		await expect(diagram).toBeVisible();
	});
}
