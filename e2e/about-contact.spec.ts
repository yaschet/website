import { expect, test } from "@playwright/test";

// Geometry and navigation do not need a software-rendered decorative shader.
test.use({
	launchOptions: async ({ browserName }, use) => {
		await use(browserName === "chromium" ? { args: ["--disable-webgl"] } : {});
	},
});

for (const theme of ["light", "dark"] as const) {
	test(`About and Contact retain their hierarchy and geometry in ${theme}`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.goto("/about");
		await expect(page.getByRole("heading", { name: "How I work.", level: 1 })).toBeVisible();
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		await expect(
			page
				.getByRole("region", { name: "How I think", exact: true })
				.getByRole("heading", { level: 3 }),
		).toHaveCount(4);
		for (const name of ["The short version", "Engineering philosophy", "Working with AI"]) {
			await expect(
				page.getByRole("region", { name, exact: true }).getByRole("heading", { level: 2 }),
			).toHaveText(name);
		}
		await expect(page.locator("#profile")).toHaveCount(1);
		await assertFits(page);
		const section = page.locator("#story .portfolio-editorial-section");
		expect(
			await section.evaluate((node) => {
				const s = getComputedStyle(node);
				return new Set([s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft]).size;
			}),
		).toBe(1);

		await page.getByRole("link", { name: "Discuss a project", exact: true }).click();
		await expect(page).toHaveURL(/\/contact$/);
		await expect(page.getByRole("heading", { name: "Let’s talk.", level: 1 })).toBeVisible();
		await expect(page.getByRole("form", { name: "Send a message" })).toHaveCount(0);
		await expect(page.getByRole("button", { name: "Send message", exact: true })).toHaveCount(
			0,
		);
		await expect(page.getByRole("link", { name: "Email", exact: true })).toHaveAttribute(
			"href",
			"mailto:hello@yaschet.com",
		);
		await expect(page.getByRole("link", { name: "Book a call", exact: true })).toHaveAttribute(
			"href",
			"https://cal.com/yassinechettouch/15min",
		);
		await assertFits(page);
		// Launch uses email/booking; form states are reviewed only in isolated Storybook fixtures.
	});
}

async function assertFits(page: import("@playwright/test").Page) {
	await page.evaluate(() => document.fonts.ready);
	expect(
		await page.evaluate(() => ({
			overflow: document.documentElement.scrollWidth > innerWidth + 1,
			// Next retains inactive routes in hidden Activity trees after link navigation.
			duplicateIds: [...document.querySelectorAll("[id]")]
				.filter((element) => element.getClientRects().length > 0)
				.map((el) => el.id)
				.filter((id, i, all) => all.indexOf(id) !== i),
		})),
	).toEqual({ overflow: false, duplicateIds: [] });
}
