import { expect, test } from "@playwright/test";

// Test real Docs pages: the story test runner alone cannot detect clipped Docs frames.
for (const theme of ["light", "dark"] as const) {
	for (const width of [390, 1280]) {
		test(`gallery Docs use one scroll surface at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=components-projectcardgallery--docs&viewMode=docs&globals=theme:${theme}`,
			);
			const docs = page.locator(".sbdocs-content");
			await expect(
				docs.getByText("A long case-study heading across narrow screens", { exact: true }),
			).toBeVisible();
			await expect(page.locator("html")).toHaveClass(new RegExp(theme));
			await expect(docs.locator("iframe")).toHaveCount(0);
			await expect(docs.locator(".sb-story")).toHaveCount(5);
			await page.evaluate(() => document.fonts.ready);
			const geometry = await docs.evaluate((root) => ({
				horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
				nestedScrollers: [...root.querySelectorAll<HTMLElement>("*")]
					.filter((element) => {
						const style = getComputedStyle(element);
						return (
							element.clientHeight > 0 &&
							/auto|scroll/.test(style.overflowY) &&
							element.scrollHeight > element.clientHeight + 1
						);
					})
					.map((element) => element.className),
				previewHeights: [...root.querySelectorAll<HTMLElement>(".sb-story")].map(
					(element) => element.clientHeight,
				),
				font: getComputedStyle(root.querySelector(".portfolio-heading-sm") ?? root)
					.fontFamily,
			}));
			await expect(geometry.horizontalOverflow).toBe(false);
			await expect(geometry.nestedScrollers).toEqual([]);
			await expect(geometry.previewHeights.every((height) => height > 250)).toBe(true);
			await expect(geometry.font).toContain("Space Grotesk Variable");
			await expect(
				page.evaluate(() => document.fonts.check('400 16px "Space Grotesk Variable"')),
			).resolves.toBe(true);
			await expect(docs.locator("details.workshop-api")).not.toHaveAttribute("open");
		});
	}

	for (const id of ["foundation-overview", "foundation-typography", "foundation-colors"]) {
		test(`${id} Docs fit a narrow screen in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width: 390, height: 900 });
			await page.goto(`/iframe.html?id=${id}--docs&viewMode=docs&globals=theme:${theme}`);
			const docs = page.locator(".sbdocs-content");
			await expect(docs.locator(".sb-story")).toHaveCount(1);
			await expect(docs.locator("iframe")).toHaveCount(0);
			await expect(page.locator("html")).toHaveClass(new RegExp(theme));
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= window.innerWidth + 1,
				),
			).toBe(true);
		});
	}

	test(`field Docs retain unique labels and error descriptions in ${theme}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=forms-fields--docs&viewMode=docs&globals=theme:${theme}`);
		const docs = page.locator(".sbdocs-content");
		await expect(docs.locator(".sb-story")).toHaveCount(5);
		await expect(docs.getByRole("textbox", { name: "Name", exact: true })).toHaveCount(5);
		await expect(docs.locator("iframe")).toHaveCount(0);
		const invalid = docs.getByRole("textbox", { name: "Name", exact: true }).nth(1);
		await expect(invalid).toHaveAccessibleDescription("Enter your name.");
		const duplicateIds = await docs.evaluate((root) => {
			const ids = [...root.querySelectorAll("[id]")].map((element) => element.id);
			return ids.filter((id, index) => ids.indexOf(id) !== index);
		});
		expect(duplicateIds).toEqual([]);
	});

	test(`contact Docs mount one form and link isolated states in ${theme}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=forms-contact--docs&viewMode=docs&globals=theme:${theme}`);
		const docs = page.locator(".sbdocs-content");
		await expect(docs.getByRole("textbox", { name: "Email", exact: true })).toHaveCount(1);
		await expect(docs.getByRole("link", { name: "Rate Limited", exact: true })).toHaveAttribute(
			"href",
			"./?path=/story/forms-contact--rate-limited",
		);
		await expect(docs.locator("iframe")).toHaveCount(0);
	});

	test(`fixed navigation Docs have an intentional, usable viewport in ${theme}`, async ({
		page,
	}) => {
		await page.goto(
			`/iframe.html?id=layout-floatingnav--docs&viewMode=docs&globals=theme:${theme}`,
		);
		const docs = page.locator(".sbdocs-content");
		await expect(docs.locator("iframe")).toHaveCount(0);
		const viewport = docs.locator(".workshop-viewport");
		const nav = viewport.getByRole("navigation");
		await expect(nav).toBeVisible();
		await expect(page.locator("html")).toHaveClass(new RegExp(theme));
		await expect(nav.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
		const bounds = await viewport.boundingBox();
		const navBounds = await nav.boundingBox();
		if (!bounds || !navBounds) throw new Error("Navigation and its viewport must be rendered.");
		expect(navBounds.y).toBeGreaterThanOrEqual(bounds.y);
		expect(navBounds.y + navBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height);
	});
}
