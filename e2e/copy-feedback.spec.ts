import { expect, type Locator, test } from "@playwright/test";

async function expectCenteredGlyph(button: Locator, selector: string) {
	await expect
		.poll(() =>
			button.evaluate((node, glyphSelector) => {
				const frame = node
					.querySelector(".foundation-button-icon")
					?.getBoundingClientRect();
				const glyph = node.querySelector(glyphSelector)?.getBoundingClientRect();
				if (!frame || !glyph) return Infinity;
				return Math.max(
					Math.abs(glyph.x + glyph.width / 2 - frame.x - frame.width / 2),
					Math.abs(glyph.y + glyph.height / 2 - frame.y - frame.height / 2),
					Math.abs(glyph.width - glyph.height),
				);
			}, selector),
		)
		.toBeLessThan(0.1);
}

for (const theme of ["light", "dark"] as const) {
	test(`portfolio copy feedback keeps one centered glyph in ${theme}`, async ({ page }) => {
		await page.addInitScript((value) => {
			localStorage.setItem("theme", value);
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText: async () => {} },
				configurable: true,
			});
		}, theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/case-studies");
		await page.evaluate(() => document.fonts.ready);
		for (const [index, href, label] of [
			[0, "/portfolio.md", "Copied Portfolio"],
			[1, "/llms-full.txt", "Copied Context"],
		] as const) {
			let release = () => {};
			const gate = new Promise<void>((resolve) => {
				release = resolve;
			});
			await page.route(`**${href}`, async (route) => {
				await gate;
				await route.fulfill({ contentType: "text/markdown", body: "# Copy fixture" });
			});
			const button = page.locator(".portfolio-control-row > button").nth(index);
			await expect(button.locator('.t-state-label[data-measured="true"]')).toHaveCount(1);
			await expectCenteredGlyph(button, '.t-icon-swap .t-icon[data-active="true"] > svg');
			const height = (await button.boundingBox())?.height;
			try {
				await button.click();
				await expect(button).toHaveAttribute("aria-busy", "true");
				await expectCenteredGlyph(button, '[data-slot="spinner"]');
				expect((await button.boundingBox())?.height).toBe(height);
			} finally {
				release();
			}
			await expect(button).toHaveAccessibleName(label);
			await expectCenteredGlyph(button, '.t-icon-swap .t-icon[data-active="true"] > svg');
			expect((await button.boundingBox())?.height).toBe(height);
		}
	});
}
