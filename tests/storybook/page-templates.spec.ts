import { expect, test } from "@playwright/test";

const templates = [
	{ id: "pages-home", heading: "Business software, built end to end." },
	{ id: "pages-about", heading: "How I work." },
	{ id: "pages-case-studies", heading: "Case studies." },
	{ id: "pages-case-study", heading: "Verto — AI Translation Platform" },
	{ id: "pages-blog", heading: "Blog" },
	{ id: "pages-blog-post", heading: "Article layout preview" },
	{ id: "pages-contact", heading: "Let’s talk." },
];

test.beforeEach(async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.route(/https:\/\/(stream\.mux\.com|.*\.litix\.io)\//, (route) => route.abort());
});

for (const theme of ["light", "dark"] as const) {
	for (const width of [320, 390, 1280]) {
		test(`seven full templates retain one page shell at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			// This review loads seven complete routes serially, including their local media.
			test.setTimeout(60_000);
			await page.setViewportSize({ width, height: 900 });
			for (const { id, heading } of templates) {
				await test.step(id, async () => {
					await page.goto(
						`/iframe.html?id=${id}--full-page&viewMode=story&globals=theme:${theme}`,
					);
					await expect(
						page.getByRole("heading", { level: 1, name: heading, exact: true }),
					).toBeVisible({ timeout: 15_000 });
					await expect(page.locator("html")).toHaveClass(new RegExp(theme));
					await page.evaluate(() => document.fonts.ready);
					await expect(page.locator("#header")).toHaveCount(1);
					await expect(page.getByRole("main")).toHaveCount(1);
					await expect(page.locator("footer")).toHaveCount(1);
					const dock = page.getByRole("navigation", { name: "Main navigation" });
					await expect(dock).toHaveCount(1);
					await expect(
						dock.getByRole("link", { name: "Blog", exact: true }),
					).toBeVisible();
					await expect(page.locator(".workshop-stage")).toHaveCount(0);
					const geometry = await page
						.locator(".workshop-full-page")
						.evaluate((element) => ({
							overflow: document.documentElement.scrollWidth > innerWidth + 1,
							scroll: getComputedStyle(element).overflowY,
							height: element.getBoundingClientRect().height,
							documentHeight: document.documentElement.scrollHeight,
						}));
					expect(geometry.overflow).toBe(false);
					expect(geometry.scroll).toBe("visible");
					expect(geometry.height).toBeLessThanOrEqual(geometry.documentHeight + 1);
					if (width !== 320 && (id === "pages-home" || id === "pages-blog-post")) {
						await page.screenshot({
							path: testInfo.outputPath(`${id}-${width}-${theme}.png`),
						});
					}
					await page.locator("footer").scrollIntoViewIfNeeded();
					await expect(
						page.locator("footer").getByRole("link", { name: "hello@yaschet.com" }),
					).toBeVisible();
				});
			}
		});
	}

	test(`complete case-study bodies and media-free ERP remain reviewable in ${theme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 900 });
		for (const [state, finalSection] of [
			["full-page", "Generate A Native Google Doc"],
			["phoenix", "Keep The Shortlist In The Agency's Workflow"],
			["portal", "Build On The Records The Agency Already Uses"],
			["erp", "Extend The Platform Without Splitting The Records"],
		]) {
			await page.goto(
				`/iframe.html?id=pages-case-study--${state}&viewMode=story&globals=theme:${theme}`,
			);
			const article = page.locator("article");
			const finalHeading = article
				.getByRole("heading", { level: 2 })
				.filter({ hasText: finalSection });
			await expect(finalHeading).toHaveCount(1);
			await finalHeading.scrollIntoViewIfNeeded();
			await expect(finalHeading).toBeVisible();
			if (state === "erp") {
				await expect(
					page.getByRole("button", { name: /Open slide|Play video/ }),
				).toHaveCount(0);
			}
		}
	});

	test(`page Docs mount one full preview and link their edge states in ${theme}`, async ({
		page,
	}) => {
		await page.goto(`/iframe.html?id=pages-contact--docs&viewMode=docs&globals=theme:${theme}`);
		await expect(page.locator(".sbdocs-content .workshop-full-page")).toHaveCount(1);
		await expect(page.locator("#header")).toHaveCount(1);
		await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(1);
		await expect(page.locator(".sbdocs-content iframe")).toHaveCount(0);
		for (const state of [
			"validation-errors",
			"sending",
			"message-sent",
			"delivery-unavailable",
			"rate-limited",
		]) {
			await expect(
				page.locator(`.sbdocs-content a[href="./?path=/story/pages-contact--${state}"]`),
			).toHaveCount(1);
		}
	});
}
