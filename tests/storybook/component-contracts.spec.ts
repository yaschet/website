import { expect, test } from "@playwright/test";

test.use({ deviceScaleFactor: 2 });

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`control dimensions agree at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=foundation-controls--sizes&viewMode=story&globals=theme:${theme}`,
			);
			for (const [size, height] of [
				["xs", 28],
				["sm", 36],
				["md", 40],
				["lg", 44],
				["xl", 48],
			] as const) {
				const row = page.locator(`[data-control-size=${size}]`);
				for (const control of [
					row.getByRole("button").first(),
					row.getByRole("textbox"),
					row.getByRole("button").last(),
				]) {
					await expect(control).toBeVisible();
					expect((await control.boundingBox())?.height).toBe(height);
					expect(
						await control.evaluate((node) => getComputedStyle(node).fontFamily),
					).toContain("Space Grotesk");
				}
				await row.getByRole("button", { name: `${size} menu` }).click();
				const option = page.getByRole("menuitem", { name: `${size} menu option` });
				await expect(option).toBeVisible();
				await expect
					.poll(async () => (await option.boundingBox())?.height)
					.toBeCloseTo(32, 1);
				await page.keyboard.press("Escape");
			}
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
			).toBe(true);
		});

		test(`video menu owns Escape before the lightbox at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			// Test real player controls without downloading or decoding a remote stream.
			await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
			await page.goto(
				`/iframe.html?id=components-media-lightbox--video&viewMode=story&globals=theme:${theme}`,
			);
			const opener = page.getByRole("button", { name: "Expand project images" });
			await opener.click();
			const dialog = page.getByRole("dialog");
			const close = page.getByRole("button", { name: "Close expanded viewer" });
			await expect(close).toBeFocused();
			const trigger = page.getByRole("button", { name: /^Select playback speed:/ });
			await trigger.focus();
			await page.keyboard.press("ArrowDown");
			await expect(page.getByRole("menu")).toBeVisible();
			await expect(dialog).toBeVisible();
			const option = page.getByRole("menuitemradio", { name: "1.5x" });
			await expect.poll(async () => (await option.boundingBox())?.height).toBeCloseTo(40, 1);
			await option.click();
			await expect(trigger).toBeFocused();
			await expect(trigger).toHaveAccessibleName("Select playback speed: 1.5x");
			await expect(trigger.locator('.t-state-label > [data-active="true"]')).toHaveText(
				"1.5x",
			);
			if (width === 1280) {
				await page.getByRole("button", { name: "Enter fullscreen" }).click();
				await expect
					.poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
					.toBe(true);
				await trigger.click();
				await expect(page.getByRole("menu")).toBeVisible();
				expect(
					await page
						.getByRole("menu")
						.evaluate((menu) => document.fullscreenElement?.contains(menu)),
				).toBe(true);
				await page.keyboard.press("Escape");
				await expect(page.getByRole("menu")).toHaveCount(0);
				await expect(dialog).toBeVisible();
				await page.keyboard.press("Escape");
				await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
				await expect(dialog).toBeVisible();
			}
			await trigger.press("ArrowDown");
			await expect(page.getByRole("menu")).toBeVisible();
			await expect
				.poll(() =>
					page
						.getByRole("menu")
						.evaluate((menu) => menu.contains(document.activeElement)),
				)
				.toBe(true);
			await page.keyboard.press("Escape");
			await expect(page.getByRole("menu")).toHaveCount(0);
			await expect(dialog).toBeVisible();
			await expect(trigger).toBeFocused();
			const slider = page.getByRole("slider", { name: "Seek video" });
			await slider.focus();
			await slider.press("ArrowRight");
			await expect(dialog).toHaveAccessibleName("Verto walkthrough");
			await close.click();
			await expect(dialog).toHaveCount(0);
			await expect(opener).toBeFocused();
		});

		test(`inline video keeps its arrow keys at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
			await page.goto(
				`/iframe.html?id=components-media-mediagallery--video-and-image&viewMode=story&globals=theme:${theme}`,
			);
			const gallery = page.locator('[aria-roledescription="carousel"]');
			await page.getByRole("button", { name: "Play video", exact: true }).click();
			const slider = page.getByRole("slider", { name: "Seek video" });
			await slider.focus();
			await slider.press("ArrowRight");
			await expect(gallery.getByText("Slide 1 of 2", { exact: true })).toHaveText(
				"Slide 1 of 2",
			);
			await expect(slider).toBeFocused();
		});

		test(`gallery restores its focus after slide navigation at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=components-media-mediagallery--default&viewMode=story&globals=theme:${theme}`,
			);
			const gallery = page.locator('[aria-roledescription="carousel"]');
			await page.getByRole("button", { name: "Open slide 1 in expanded viewer" }).click();
			const dialog = page.getByRole("dialog");
			const close = dialog.getByRole("button", { name: "Close expanded viewer" });
			await expect(close).toBeFocused();
			await close.press("ArrowRight");
			await expect(dialog.getByRole("status")).toContainText("Slide 2 of 4");
			await close.click();
			await expect(dialog).toHaveCount(0);
			await expect(gallery).toBeFocused();
			await gallery.press("Enter");
			await expect(page.getByRole("dialog").getByRole("status")).toContainText(
				"Slide 2 of 4",
			);
			await page.keyboard.press("Escape");
			await expect(gallery).toBeFocused();
		});

		test(`notification stays readable and dismissible at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=primitives-toaster--long-message&viewMode=story&globals=theme:${theme}`,
			);
			const toast = page.locator('[data-slot="toast"]');
			await expect(toast).toBeVisible();
			// Base UI hides action semantics from the live announcement until focused.
			const close = toast.locator('[data-slot="toast-close"]');
			await close.focus();
			await expect(close).toHaveAccessibleName("Close toast");
			expect((await close.boundingBox())?.height).toBe(40);
			expect((await close.boundingBox())?.width).toBe(40);
			const description = toast.locator('[data-slot="toast-description"]');
			await expect(description).toBeVisible();
			expect(
				await description.evaluate((node) => getComputedStyle(node).fontFamily),
			).toContain("Space Grotesk");
			expect(await description.evaluate((node) => getComputedStyle(node).textTransform)).toBe(
				"none",
			);
			await page.evaluate(() => document.fonts.ready);
			const title = toast.locator('[data-slot="toast-title"]');
			expect(await title.evaluate((node) => getComputedStyle(node).fontSize)).toBe("14px");
			expect(await title.evaluate((node) => getComputedStyle(node).lineHeight)).toBe("20px");
			expect(await description.evaluate((node) => getComputedStyle(node).fontSize)).toBe(
				"12px",
			);
			expect(await description.evaluate((node) => getComputedStyle(node).lineHeight)).toBe(
				"16px",
			);
			const surface = toast.locator(".foundation-notification-heading");
			const geometry = await surface.evaluate((node) => {
				const box = (selector: string) => {
					const child = node.querySelector(selector);
					if (!child) throw new Error(`Missing notification part: ${selector}`);
					return child.getBoundingClientRect();
				};
				const frame = node.getBoundingClientRect();
				const chamber = box('[data-slot="icon-chamber"]');
				const glyph = box('[data-slot="toast-icon"]');
				const copy = box(".toast-copy");
				const close = box('[data-slot="toast-close"]');
				return {
					chamberWidth: chamber.width,
					chamberHeight: chamber.height,
					closeWidth: close.width,
					closeHeight: close.height,
					glyphWidth: glyph.width,
					glyphHeight: glyph.height,
					glyphX: glyph.left + glyph.width / 2 - chamber.left,
					glyphY: glyph.top + glyph.height / 2 - chamber.top,
					leftInset: chamber.left - frame.left,
					rightInset: frame.right - close.right,
					copyLeft: copy.left - chamber.right,
					copyRight: close.left - copy.right,
					chamberCenter: chamber.top + chamber.height / 2,
					copyCenter: copy.top + copy.height / 2,
					closeCenter: close.top + close.height / 2,
				};
			});
			expect(geometry.chamberWidth).toBe(40);
			expect(geometry.chamberHeight).toBe(40);
			expect(geometry.closeWidth).toBe(40);
			expect(geometry.closeHeight).toBe(40);
			expect(geometry.glyphWidth).toBe(16);
			expect(geometry.glyphHeight).toBe(16);
			expect(geometry.glyphX).toBe(20);
			expect(geometry.glyphY).toBe(20);
			expect(geometry.leftInset).toBe(16);
			expect(geometry.rightInset).toBe(16);
			expect(geometry.copyLeft).toBe(16);
			expect(geometry.copyRight).toBe(16);
			expect(geometry.chamberCenter).toBeCloseTo(geometry.copyCenter, 1);
			expect(geometry.closeCenter).toBeCloseTo(geometry.copyCenter, 1);
			expect(await toast.evaluate((node) => getComputedStyle(node).borderColor)).toBe(
				await toast
					.locator('[data-slot="icon-chamber"]')
					.evaluate((node) => getComputedStyle(node).borderColor),
			);
			expect(await toast.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe(
				"none",
			);
			await expect(close).toHaveAttribute("data-appearance", "soft");
			expect(await close.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(
				"rgba(0, 0, 0, 0)",
			);
			const toastBox = await toast.boundingBox();
			const host = page.locator("[data-toast-preview]");
			expect(await host.locator('[data-slot="toast"]').count()).toBe(1);
			const hostBox = await host.boundingBox();
			expect(toastBox?.y).toBeGreaterThanOrEqual(hostBox?.y ?? 0);
			expect((toastBox?.x ?? 0) + (toastBox?.width ?? 0)).toBeLessThanOrEqual(
				(hostBox?.x ?? 0) + (hostBox?.width ?? 0),
			);
			// Chromium can quantize computed border lengths; check the resolved density token.
			expect(
				await toast.evaluate((node) => ({
					dpr: devicePixelRatio,
					hairline: Number.parseFloat(
						getComputedStyle(node).getPropertyValue("--foundation-hairline"),
					),
				})),
			).toEqual({ dpr: 2, hairline: 0.5 });
			expect(toastBox?.x).toBeGreaterThanOrEqual(0);
			expect((toastBox?.x ?? 0) + (toastBox?.width ?? 0)).toBeLessThanOrEqual(width);
			await close.click();
			await expect(toast).toHaveCount(0);
			await page.goto(
				`/iframe.html?id=primitives-toaster--title-only&viewMode=story&globals=theme:${theme}`,
			);
			const compact = page.locator('[data-slot="toast"]');
			await expect(compact).toBeVisible();
			await expect(compact.locator('[data-slot="toast-title"]')).toHaveText("Saved");
			await expect(compact.locator('[data-slot="toast-description"]')).toHaveCount(0);
			expect(
				(await compact.locator(".foundation-notification-heading").boundingBox())?.height,
			).toBe(72);
		});

		test(`status rail holds its first-line alignment at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=primitives-statusdisplay--line-rhythm&viewMode=story&globals=theme:${theme}`,
			);
			await page.evaluate(() => document.fonts.ready);
			const displays = page.getByRole("status");
			await expect(displays).toHaveCount(3);
			for (const [index, height] of [48, 64, 80].entries()) {
				const display = displays.nth(index);
				await expect(display).toBeVisible();
				expect((await display.boundingBox())?.height).toBe(height);
				const geometry = await display.evaluate((node) => {
					const rail = node.querySelector('[data-slot="icon-chamber"]');
					const glyph = node.querySelector(".status-display-icons");
					const copy = node.querySelector('[data-status-copy][data-active="true"]');
					if (!rail || !glyph || !copy) throw new Error("Status geometry is incomplete");
					const r = rail.getBoundingClientRect(),
						g = glyph.getBoundingClientRect(),
						c = copy.getBoundingClientRect();
					return {
						railHeight: r.height,
						railWidth: r.width,
						x: g.left - r.left,
						y: g.top - r.top,
						glyphWidth: g.width,
						glyphHeight: g.height,
						center: g.top + g.height / 2,
						textCenter: c.top + 8,
						fontSize: getComputedStyle(copy).fontSize,
						lineHeight: getComputedStyle(copy).lineHeight,
					};
				});
				expect(geometry.railHeight).toBe(height);
				expect(geometry.railWidth).toBe(48);
				expect(geometry.x).toBe(14);
				expect(geometry.y).toBe(14);
				expect(geometry.glyphWidth).toBe(20);
				expect(geometry.glyphHeight).toBe(20);
				expect(geometry.center).toBe(geometry.textCenter);
				expect(geometry.fontSize).toBe("12px");
				expect(geometry.lineHeight).toBe("16px");
			}
			await page.goto(
				`/iframe.html?id=primitives-alert--error-state&viewMode=story&globals=theme:${theme}`,
			);
			const alert = page.getByRole("status");
			await expect(alert).toBeVisible();
			const compactGeometry = await alert.evaluate((node) => {
				const rail = node.querySelector('[data-slot="icon-chamber"]');
				const glyph = rail?.querySelector("svg");
				const copy = node.querySelector('[data-slot="alert-description"]');
				if (!rail || !glyph || !copy)
					throw new Error("Compact alert geometry is incomplete");
				const r = rail.getBoundingClientRect(),
					g = glyph.getBoundingClientRect(),
					c = copy.getBoundingClientRect();
				return {
					width: r.width,
					height: r.height,
					surfaceHeight: node.getBoundingClientRect().height,
					x: g.left - r.left,
					y: g.top - r.top,
					glyph: g.height,
					center: g.top + g.height / 2,
					firstLineCenter:
						c.top + Number.parseFloat(getComputedStyle(copy).paddingTop) + 10,
				};
			});
			expect(compactGeometry.width).toBe(44);
			expect(compactGeometry.height).toBe(compactGeometry.surfaceHeight);
			expect(compactGeometry.glyph).toBe(20);
			expect(compactGeometry.x).toBe(12);
			expect(compactGeometry.y).toBe(12);
			expect(compactGeometry.center).toBe(compactGeometry.firstLineCenter);
		});
	}
}
