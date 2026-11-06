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
		await expect(
			page.getByRole("heading", {
				name: "I’m Yassine.",
				level: 1,
			}),
		).toBeVisible();
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		await expect(page.getByRole("main").locator('a[href^="/case-studies/"]')).toHaveCount(0);
		for (const name of [
			"I came to software through design",
			"A result should come with an explanation",
			"I can start with a problem or a plan",
		]) {
			await expect(
				page.getByRole("region", { name, exact: true }).getByRole("heading", { level: 2 }),
			).toHaveText(name);
		}
		await expect(
			page
				.locator("#about-intro")
				.getByText(
					"I’m a Product Engineer based in Rabat, Morocco. I came to software through graphic design, and I’ve been building applications for businesses since 2022.",
					{ exact: true },
				),
		).toBeVisible();
		await assertFits(page);
		await expect(page.locator("#about-hero").getByRole("link")).toHaveCount(0);
		await expect(
			page.locator("#profile").getByRole("img", { name: "Yassine Chettouch" }),
		).toBeVisible();
		const section = page.locator("#story .portfolio-box-pad");
		expect(
			await section.evaluate((node) => {
				const s = getComputedStyle(node);
				return new Set([s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft]).size;
			}),
		).toBe(1);
		const headingEdges = await page
			.locator(
				"#about-intro h1, #story h2, #how-i-think h2, #working-with-me h2, #working-together h2, #about-contact h2",
			)
			.evaluateAll((headings) =>
				headings.map((heading) => heading.getBoundingClientRect().left),
			);
		expect(Math.max(...headingEdges) - Math.min(...headingEdges)).toBeLessThanOrEqual(1);
		const workingTogether = page.getByRole("region", { name: "Working together", exact: true });
		await expect(workingTogether.getByRole("heading", { level: 3 })).toHaveCount(7);
		await expect(workingTogether.getByRole("link")).toHaveCount(0);
		await expect(
			page.getByRole("link", { name: "More about working together", exact: true }),
		).toHaveCount(0);
		const pricing = workingTogether.getByRole("button", {
			name: "How do pricing and timing work?",
		});
		await pricing.click();
		await expect(pricing).toHaveAttribute("aria-expanded", "true");
		await expect(workingTogether.getByText(/The written proposal explains/)).toBeVisible();
		await expect(page.locator("#working-together + #about-contact")).toBeVisible();

		await expect(page.getByRole("link", { name: "Book a call", exact: true })).toHaveAttribute(
			"href",
			"https://cal.com/yassinechettouch/15min",
		);
		await page.getByRole("link", { name: "Contact", exact: true }).click();
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
