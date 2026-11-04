import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	for (const width of [390, 1280]) {
		test(`article blocks preserve contrast, copying and table insets at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.addInitScript(() => {
				Object.defineProperty(navigator, "clipboard", {
					value: {
						writeText: async (text: string) => {
							document.documentElement.dataset.copiedCode = text;
						},
					},
					configurable: true,
				});
			});
			await page.goto(
				`/iframe.html?id=article-blocks--code&viewMode=story&globals=theme:${theme}`,
			);
			await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
			const code = page.locator(".code-block-pre").first();
			await code.scrollIntoViewIfNeeded();
			const rawCode = await code.textContent();
			const codeLayout = await code.evaluate((node) => ({
				overflow: getComputedStyle(node).overflowX,
				fits: node.getBoundingClientRect().right <= innerWidth,
				fontSize: getComputedStyle(node).fontSize,
				lineHeight: getComputedStyle(node).lineHeight,
			}));
			expect(codeLayout).toEqual({
				overflow: "auto",
				fits: true,
				fontSize: "13px",
				lineHeight: "20px",
			});
			const syntaxContrast = await code.evaluate((node) => {
				const context = document.createElement("canvas").getContext("2d");
				if (!context) throw new Error("Color sampling is unavailable");
				const luminance = (color: string) => {
					context.fillStyle = color;
					context.fillRect(0, 0, 1, 1);
					const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
					const linear = [r, g, b].map((channel) => {
						const value = channel / 255;
						return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
					});
					return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
				};
				// The pre is transparent; its enclosing code frame owns the opaque surface.
				if (!node.parentElement) throw new Error("Code frame is missing");
				const background = luminance(getComputedStyle(node.parentElement).backgroundColor);
				return [...node.querySelectorAll("code span")]
					.filter((span) => span.textContent?.trim())
					.map((span) => {
						const foreground = luminance(getComputedStyle(span).color);
						return {
							token: span.className,
							color: getComputedStyle(span).color,
							ratio:
								(Math.max(foreground, background) + 0.05) /
								(Math.min(foreground, background) + 0.05),
						};
					});
			});
			expect(syntaxContrast.length).toBeGreaterThan(0);
			expect(syntaxContrast.filter((token) => token.ratio < 4.5)).toEqual([]);
			const copyCode = code
				.locator("..")
				.getByRole("button", { name: "Copy code", exact: true });
			expect((await copyCode.boundingBox())?.height).toBe(40);
			if (width === 390) {
				await page.screenshot({ path: testInfo.outputPath(`article-code-${theme}.png`) });
			}
			await copyCode.click();
			await expect(code.locator("..").getByRole("status")).toHaveText(
				"Code copied to clipboard.",
			);
			await expect(page.locator("html")).toHaveAttribute("data-copied-code", rawCode ?? "");
			await expect
				.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
				.toBe(true);

			await page.goto(
				`/iframe.html?id=article-blocks--table&viewMode=story&globals=theme:${theme}`,
			);
			const cells = page.getByRole("table").locator("th, td");
			await expect(cells).toHaveCount(9);
			const insets = await cells.evaluateAll((nodes) =>
				nodes.map((node) => {
					const style = getComputedStyle(node);
					return [
						style.paddingTop,
						style.paddingRight,
						style.paddingBottom,
						style.paddingLeft,
					];
				}),
			);
			expect(insets.every((values) => values.every((value) => value === "16px"))).toBe(true);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
		});
	}
}
