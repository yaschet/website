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
	test(`portfolio copy feedback keeps stable geometry in ${theme}`, async ({ page }) => {
		await page.addInitScript((value) => {
			localStorage.setItem("theme", value);
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText: async () => {} },
				configurable: true,
			});
		}, theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		for (const [path, href, label, hasIcon] of [
			[
				"/case-studies/clearway-phoenix",
				"/case-studies/clearway-phoenix.md",
				"Copy Markdown",
				true,
			],
			["/case-studies", "/llms-full.txt", "Copy portfolio", false],
		] as const) {
			await page.goto(path);
			await page.evaluate(() => document.fonts.ready);
			let release = () => {};
			const gate = new Promise<void>((resolve) => {
				release = resolve;
			});
			await page.route(`**${href}`, async (route) => {
				await gate;
				await route.fulfill({ contentType: "text/markdown", body: "# Copy fixture" });
			});
			const button = page.getByRole("button", {
				name: new RegExp(`^(${label}|Copying|Copied|Retry copying)$`),
			});
			await expect(button).toHaveAccessibleName(label);
			if (hasIcon)
				await expectCenteredGlyph(button, '.t-icon-swap .t-icon[data-active="true"] > svg');
			const height = await button.evaluate((node) => getComputedStyle(node).height);
			try {
				await button.click();
				await expect(button).toHaveAttribute("aria-busy", "true");
				if (hasIcon) await expectCenteredGlyph(button, '[data-slot="spinner"]');
				// Press feedback transforms the surface without changing its layout height.
				await expect(button).toHaveCSS("height", height);
			} finally {
				release();
			}
			await expect(button).toHaveAccessibleName("Copied");
			if (hasIcon)
				await expectCenteredGlyph(button, '.t-icon-swap .t-icon[data-active="true"] > svg');
			await expect(button).toHaveCSS("height", height);
		}
	});
}
