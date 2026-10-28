import { expect, test } from "@playwright/test";

test.use({ deviceScaleFactor: 2 });

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`Foundation header and controls keep their geometry at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=primitives-dialog--default&viewMode=story&globals=theme:${theme}`,
			);
			const opener = page.getByRole("button", { name: "Edit example", exact: true });
			await opener.focus();
			await opener.press("Enter");
			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();
			await expect(dialog).toHaveAttribute("data-motion-input", "keyboard");
			await page.evaluate(() => document.fonts.ready);
			const geometry = await dialog.evaluate((node) => {
				const box = (selector: string) => {
					const child = node.querySelector(selector);
					if (!child) throw new Error(`Missing modal part: ${selector}`);
					return child.getBoundingClientRect();
				};
				const frame = node.getBoundingClientRect();
				const icon = box('[data-slot="icon-chamber"]');
				const glyph = box('[data-slot="icon-chamber"] svg');
				const copy = box(".foundation-overlay-heading-copy");
				const close = box(".foundation-overlay-close");
				return {
					iconWidth: icon.width,
					iconHeight: icon.height,
					closeWidth: close.width,
					closeHeight: close.height,
					glyphWidth: glyph.width,
					glyphHeight: glyph.height,
					glyphX: glyph.left + glyph.width / 2 - icon.left,
					glyphY: glyph.top + glyph.height / 2 - icon.top,
					insetLeft: icon.left - frame.left,
					insetRight: frame.right - close.right,
					gapLeft: copy.left - icon.right,
					gapRight: close.left - copy.right,
					iconCenter: icon.top + icon.height / 2,
					copyCenter: copy.top + copy.height / 2,
					closeCenter: close.top + close.height / 2,
					transition: getComputedStyle(node).transitionDuration,
				};
			});
			expect(geometry.iconWidth).toBe(40);
			expect(geometry.iconHeight).toBe(40);
			expect(geometry.closeWidth).toBe(40);
			expect(geometry.closeHeight).toBe(40);
			expect(geometry.glyphWidth).toBe(16);
			expect(geometry.glyphHeight).toBe(16);
			expect(geometry.glyphX).toBe(20);
			expect(geometry.glyphY).toBe(20);
			expect(geometry.insetLeft).toBeCloseTo(geometry.insetRight, 1);
			expect(geometry.insetLeft).toBeGreaterThanOrEqual(16);
			expect(geometry.gapLeft).toBe(16);
			expect(geometry.gapRight).toBe(16);
			expect(geometry.iconCenter).toBeCloseTo(geometry.copyCenter, 1);
			expect(geometry.closeCenter).toBeCloseTo(geometry.copyCenter, 1);
			expect(
				geometry.transition.split(",").every((value) => Number.parseFloat(value) === 0),
			).toBe(true);
			await page.keyboard.press("Escape");
			await expect(dialog).toHaveCount(0);
			await expect(opener).toBeFocused();

			await page.emulateMedia({ reducedMotion: "reduce" });
			await opener.click();
			await expect(dialog).toBeVisible();
			expect(await dialog.evaluate((node) => getComputedStyle(node).transitionDuration)).toBe(
				"0s",
			);
			await page.keyboard.press("Escape");
			await page.emulateMedia({ reducedMotion: "no-preference" });

			await page.goto(
				`/iframe.html?id=components-media-videosettings--default&viewMode=story&globals=theme:${theme}`,
			);
			const speed = page.getByRole("button", { name: "Select playback speed: 1x" });
			await speed.focus();
			await speed.press("Enter");
			const menu = page.getByRole("menu");
			await expect(menu).toHaveAttribute("data-motion-input", "keyboard");
			const canvas = await page.locator("html").evaluate((node) => ({
				root: getComputedStyle(node).backgroundColor,
				body: getComputedStyle(node.ownerDocument.body).backgroundColor,
				unusedGutter: node.clientWidth - node.scrollWidth,
			}));
			expect(canvas.root).toBe(canvas.body);
			expect(canvas.root).not.toBe("rgba(0, 0, 0, 0)");
			expect(canvas.unusedGutter).toBe(0);
			expect(await menu.evaluate((node) => getComputedStyle(node).transitionDuration)).toBe(
				"0s",
			);
			await page.keyboard.press("Escape");
			await expect(speed).toBeFocused();

			await page.goto(
				`/iframe.html?id=forms-password--invalid&viewMode=story&globals=theme:${theme}`,
			);
			const field = page.getByLabel("Example password");
			const reveal = page.getByRole("button", { name: "Show password" });
			await expect(field).toHaveAttribute("aria-invalid", "true");
			const group = page.locator('[data-slot="input-group"]');
			await expect(group).toBeVisible();
			expect((await field.boundingBox())?.height).toBe(40);
			expect((await reveal.boundingBox())?.height).toBe(40);
			expect((await reveal.boundingBox())?.width).toBe(40);
			expect(
				await group.evaluate((node) => getComputedStyle(node, "::after").pointerEvents),
			).toBe("none");
			await expect(field).toHaveCSS("box-shadow", "none");
			await field.click();
			await field.press("Tab");
			await expect(reveal).toBeFocused();
			await reveal.press("Enter");
			await expect(field).toHaveAttribute("type", "text");
			await expect(field).toHaveValue("Example only");

			await page.goto(
				`/iframe.html?id=primitives-button--pending-geometry&viewMode=story&globals=theme:${theme}`,
			);
			const save = page.getByRole("button", { name: /^(Save changes|Saving changes)$/ });
			await expect(save).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			await expect
				.poll(() =>
					save.evaluate(
						(node) =>
							node
								.getAnimations({ subtree: true })
								.filter((motion) => motion instanceof CSSTransition).length,
					),
				)
				.toBe(0);
			const link = page.getByRole("link", { name: "View example" });
			await expect(link).toHaveAttribute("href", "#example-preview");
			await expect(link).toHaveAttribute("data-slot", "button");
			expect((await link.boundingBox())?.height).toBe(40);
			const idle = await save.boundingBox();
			await save.click();
			await expect(save).toBeDisabled();
			await expect(save).toHaveAttribute("aria-busy", "true");
			await expect(save).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
			await expect
				.poll(async () => (await save.boundingBox())?.width)
				.toBeGreaterThan(idle?.width ?? 0);
			const pending = await save.boundingBox();
			expect(pending?.height).toBe(idle?.height);
			await page.getByRole("button", { name: "Reset example" }).click();
			await expect(save).toBeEnabled();
			await expect.poll(async () => (await save.boundingBox())?.width).toBe(idle?.width);

			await page.goto(
				`/iframe.html?id=foundation-overview--portfolio&viewMode=story&globals=theme:${theme}`,
			);
			const label = page.getByText("Yaschet Foundation", { exact: true });
			await expect(label).toBeVisible();
			const type = await label.evaluate((node) => {
				const style = getComputedStyle(node);
				return {
					font: style.fontFamily,
					size: style.fontSize,
					leading: style.lineHeight,
					transform: style.textTransform,
					tracking: style.letterSpacing,
				};
			});
			expect(type.font).toContain("Space Grotesk");
			expect(type.size).toBe("13px");
			expect(type.leading).toBe("20px");
			expect(type.transform).toBe("none");
			expect(type.tracking).toBe("normal");
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
			).toBe(true);
		});
	}
}
