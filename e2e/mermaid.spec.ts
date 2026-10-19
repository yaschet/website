import { expect, test } from "@playwright/test";

const DIAGRAM_LABELS = [
	"User Upload",
	"Identity & Security",
	"Orchestrator",
	"Agent 1: Builder",
	"Rolling Context",
	"Agent 2: Auditor",
	"Google Docs Compiler",
	"Ledger & Data",
	"Artifact Storage",
] as const;

for (const theme of ["light", "dark"] as const) {
	test(`Verto architecture renders and expands in ${theme} mode`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		const response = await page.goto("/case-studies/verto");
		expect(response?.status()).toBe(200);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));

		const figure = page.locator("figure").filter({ hasText: "Architecture Diagram" });
		const diagram = figure.locator("svg").first();
		await expect(diagram).toBeVisible();
		await figure.scrollIntoViewIfNeeded();
		for (const label of DIAGRAM_LABELS) {
			await expect(diagram.getByText(label, { exact: true })).toBeVisible();
		}
		expect(await diagram.locator("g.node").count()).toBe(9);
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
