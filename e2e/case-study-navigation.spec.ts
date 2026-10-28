import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`case-study navigation keeps its loading boundary in ${theme}`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (
				/blocking-prerender|instant-shell-url-data|Next\.js encountered (?:uncached|URL|runtime) data/.test(
					message.text(),
				)
			) {
				errors.push(message.text());
			}
		});
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.goto("/");
		const header = await page.locator("#header").elementHandle();

		for (const title of ["Program Matching Engine", "Verto"]) {
			await page.getByRole("link", { name: title, exact: true }).click();
			await expect(
				page.locator("main:visible").getByRole("heading", { level: 1 }),
			).toHaveText(title);
			await expect(page.locator("article.portfolio-article:visible")).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Copy Markdown", exact: true }),
			).toBeVisible();
			await expect(page.getByRole("status", { name: "Loading page" })).toHaveCount(0);
			expect(
				await header?.evaluate((node) => node === document.getElementById("header")),
			).toBe(true);
			await expect(page.getByRole("button", { name: "Open issues overlay" })).toHaveCount(0);
			await page
				.locator("main:visible")
				.getByRole("link", { name: "Case studies", exact: true })
				.click();
			await expect(page).toHaveURL(/\/case-studies$/);
		}

		expect(errors).toEqual([]);
	});
}
