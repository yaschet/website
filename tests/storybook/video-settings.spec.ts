import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	for (const width of [390, 1280]) {
		test(`video settings keep their dark geometry at ${width}px in ${theme}`, async ({
			page,
		}, info) => {
			await page.setViewportSize({ width, height: 844 });
			await page.goto(
				`/iframe.html?id=components-media-videosettings--default&viewMode=story&globals=theme:${theme}`,
			);
			const quality = page.getByRole("button", { name: /^Select video quality:/ });
			const speed = page.getByRole("button", { name: /^Select playback speed:/ });
			await expect(quality).toHaveCSS("color-scheme", "dark");
			await expect(speed).toHaveCSS("color-scheme", "dark");
			const first = await quality.boundingBox();
			const second = await speed.boundingBox();
			expect(first?.height).toBe(40);
			expect(second?.height).toBe(40);
			expect(first?.y).toBe(second?.y);
			await quality.click();
			const popup = page.getByRole("menu");
			await expect(popup).toBeVisible();
			await expect(popup).toHaveCSS("color-scheme", "dark");
			const box = await popup.boundingBox();
			expect(box?.x).toBeGreaterThanOrEqual(12);
			expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width - 12);
			await page.screenshot({
				path: info.outputPath(`video-settings-${theme}-${width}.png`),
			});
			await page.getByRole("menuitemradio", { name: "720p HD" }).click();
			await expect(quality).toHaveAccessibleName("Select video quality: 720p");
			await expect(popup).toHaveCount(0);
			await speed.click();
			await page.getByRole("menuitemradio", { name: "1.5x" }).click();
			await expect(speed).toHaveAccessibleName("Select playback speed: 1.5x");
			await expect(popup).toHaveCount(0);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
		});
	}
}

for (const theme of ["light", "dark"] as const) {
	for (const viewport of [
		{ width: 320, height: 740 },
		{ width: 390, height: 844 },
		{ width: 667, height: 320 },
	]) {
		test(`compact video settings work at ${viewport.width}x${viewport.height} in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize(viewport);
			await page.goto(
				`/iframe.html?id=components-media-videosettings--compact&viewMode=story&globals=theme:${theme}`,
			);
			const trigger = page.getByRole("button", { name: "Video settings", exact: true });
			const bounds = await trigger.boundingBox();
			expect(bounds?.width).toBeGreaterThanOrEqual(44);
			expect(bounds?.height).toBeGreaterThanOrEqual(44);
			await trigger.focus();
			await trigger.press("Enter");
			const menu = page.getByRole("menu", { name: "Video settings", exact: true });
			await expect(menu).toBeVisible();
			await expect(menu).toHaveCSS("color-scheme", "dark");
			await page.getByRole("menuitemradio", { name: "1.5x", exact: true }).click();
			await expect(menu).toHaveCount(0);
			await expect(trigger).toBeFocused();
			await expect(page.getByRole("status")).toHaveText("Quality: auto. Speed: 1.5x.");
			await trigger.click();
			await expect(
				page.getByRole("menuitemradio", { name: "1.5x", exact: true }),
			).toHaveAttribute("aria-checked", "true");
			const box = await menu.boundingBox();
			expect(box?.x).toBeGreaterThanOrEqual(12);
			expect(box?.y).toBeGreaterThanOrEqual(12);
			expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width - 12);
			expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height - 12);
			const quality = page.getByRole("menuitemradio", { name: "720p HD", exact: true });
			await expect(quality).toHaveCSS("height", "44px");
			await quality.click();
			await expect(menu).toHaveCount(0);
			await expect(trigger).toBeFocused();
			await expect(page.getByRole("status")).toHaveText("Quality: 720. Speed: 1.5x.");
			await trigger.press("Enter");
			await expect(menu).toBeVisible();
			await page.keyboard.press("Escape");
			await expect(menu).toHaveCount(0);
			await expect(trigger).toBeFocused();
		});
	}
}
