import { expect, test } from "@playwright/test";

const cities = [
	{
		story: "new-york",
		zone: "New York",
		instant: "2026-10-21T00:30:00Z",
		time: "20:30 · UTC−4",
		difference: "Rabat is 4 hours ahead",
		date: "20 Oct 2026",
	},
	{
		story: "dubai",
		zone: "Dubai",
		instant: "2026-10-21T20:30:00Z",
		time: "00:30 · UTC+4",
		difference: "Rabat is 4 hours behind",
		date: "22 Oct 2026",
	},
	{
		story: "pacific",
		zone: "Pacific time",
		instant: "2026-10-21T00:30:00Z",
		time: "17:30 · UTC−7",
		difference: "Rabat is 7 hours ahead",
		date: "20 Oct 2026",
	},
];

test.use({ isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

for (const city of cities) {
	for (const theme of ["light", "dark"]) {
		for (const width of [320, 390]) {
			test(`${city.story} ${theme} ${width}: wrapping and touch`, async ({
				page,
			}, testInfo) => {
				await page.setViewportSize({ width, height: 844 });
				await page.clock.setFixedTime(new Date(city.instant));
				await page.goto(
					`/iframe.html?id=components-contextbadges--${city.story}&viewMode=story&globals=theme:${theme}`,
				);
				const trigger = page.getByRole("button", { name: /Compare your time/ });
				const panel = page.getByRole("dialog", { name: "Time difference" });
				await expect(panel).toHaveCSS("opacity", "1");
				await expect(panel).toHaveCSS("transform", "none");
				await expect(panel.locator("dd").nth(1)).toContainText(city.time);
				await expect(panel.locator("dd").nth(1)).toContainText(city.zone);
				await expect(panel.locator("dd").nth(1)).toContainText(city.date);
				await expect(panel.locator("dd").last()).toHaveText(city.difference);
				await expect(panel).toHaveCSS("transition-duration", "0.15s");
				const geometry = await panel.evaluate((node) => {
					const rect = node.getBoundingClientRect();
					const close = node.querySelector("button");
					if (!close) throw new Error("Missing close control");
					return {
						left: rect.left,
						right: rect.right,
						closeWidth: close.getBoundingClientRect().width,
						closeHeight: close.getBoundingClientRect().height,
						overflow: document.documentElement.scrollWidth > innerWidth,
						cells: Array.from(node.querySelectorAll("dd"), (cell) => ({
							clipped: cell.scrollWidth > cell.clientWidth,
							left: cell.getBoundingClientRect().left,
							right: cell.getBoundingClientRect().right,
						})),
					};
				});
				expect(geometry.left).toBeGreaterThanOrEqual(16);
				expect(geometry.right).toBeLessThanOrEqual(width - 16);
				expect(geometry.overflow).toBe(false);
				expect(geometry.closeWidth).toBe(44);
				expect(geometry.closeWidth).toBe(geometry.closeHeight);
				for (const cell of geometry.cells) {
					expect(cell.clipped).toBe(false);
					expect(cell.left).toBe(geometry.cells[0].left);
					expect(cell.right).toBe(geometry.cells[0].right);
				}
				await panel.getByRole("button", { name: "Close details" }).tap();
				await expect(panel).not.toBeVisible();
				await trigger.tap();
				await expect(panel).toHaveCSS("opacity", "1");
				await page.screenshot({
					path: testInfo.outputPath(`${city.story}-${theme}-${width}.png`),
				});
				await trigger.tap();
				await expect(panel).not.toBeVisible();
				await page.emulateMedia({ reducedMotion: "reduce" });
				await trigger.tap();
				await expect(panel).toBeVisible();
				await expect(panel).toHaveCSS("transition-duration", "0s");
			});
		}
	}
}
