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
		const form = page.getByRole("form", { name: "Send a message" });
		await expect(form).toBeVisible();
		for (const name of ["Name", "Email", "Subject"]) {
			const input = form.getByRole("textbox", { name, exact: true });
			await expect(input).toHaveAttribute("aria-required", "true");
			expect(await input.evaluate((el) => el.getBoundingClientRect().height)).toBe(40);
		}
		await expect(form.getByRole("textbox", { name: "Name", exact: true })).toHaveAttribute(
			"autocomplete",
			"name",
		);
		const email = form.getByRole("textbox", { name: "Email", exact: true });
		await expect(email).toHaveAttribute("autocomplete", "email");
		await email.fill("invalid");
		await form.getByRole("textbox", { name: "Subject", exact: true }).focus();
		await expect(email).toHaveAttribute("aria-invalid", "true");
		const errorId = await email.getAttribute("aria-describedby");
		await expect(page.locator(`[id="${errorId}"]`)).toHaveText(
			"Please enter a valid email address",
		);
		await expect(form.getByRole("button", { name: "Send message" })).toBeDisabled();
		await email.fill("reviewer@example.test");
		await expect(email).not.toHaveAttribute("aria-invalid", "true");
		await expect(form.getByRole("textbox", { name: "Message", exact: true })).toBeEmpty();
		expect(
			await form
				.getByRole("textbox", { name: "Message", exact: true })
				.evaluate((node) => node.getBoundingClientRect().height),
		).toBeGreaterThanOrEqual(160);
		await assertFits(page);
		// No submit: real-page verification must never send a contact email.
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
