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
