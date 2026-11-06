import { expect, test } from "@playwright/test";

// Keep interaction checks independent of software-rendered decorative WebGL.
test.use({
	launchOptions: async ({ browserName }, use) => {
		await use(browserName === "chromium" ? { args: ["--disable-webgl"] } : {});
	},
});

for (const theme of ["light", "dark"] as const) {
	for (const reducedMotion of ["reduce", "no-preference"] as const) {
		test(`work navigation remains repeatable in ${theme} with ${reducedMotion} motion`, async ({
			page,
		}) => {
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			await page.emulateMedia({ colorScheme: theme, reducedMotion });
			await page.goto("/");
			const work = page.getByRole("region", { name: "Selected work", exact: true });
			const link = page.getByRole("link", { name: "View my work", exact: true });
			const navigations: string[] = [];
			page.on("request", (request) => {
				if (request.isNavigationRequest() && request.frame() === page.mainFrame())
					navigations.push(request.url());
			});
			const historyBefore = await page.evaluate(() => history.length);
			for (const activation of ["click", "click", "keyboard"] as const) {
				await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
				await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
				if (activation === "keyboard") {
					await link.focus();
					await link.press("Enter");
				} else {
					await link.click();
				}
				await expect(page).toHaveURL(/\/#work$/);
				await expect
					.poll(() =>
						work.evaluate((node) => Math.round(node.getBoundingClientRect().top)),
					)
					.toBe(20);
			}
			expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
			expect(navigations).toEqual([]);
			await expect(page.locator("[data-route-capture]")).toHaveCount(0);
		});
	}
}
