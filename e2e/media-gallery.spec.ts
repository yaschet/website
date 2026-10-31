import { expect, type Page, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	// These checks own the gallery and player controls, with no external video transport.
	await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
});

async function openCaseStudy(page: Page, slug: string) {
	await page.goto(`/case-studies/${slug}`, { waitUntil: "domcontentloaded" });
	await expect(page.getByRole("button", { name: /Theme: Switch to/ })).toBeVisible({
		timeout: 15_000,
	});
	// Development tools are absent in production and otherwise cover the mobile controls in proofs.
	await page.addStyleTag({ content: "nextjs-portal, agentation-toolbar { display: none; }" });
}

for (const theme of ["light", "dark"] as const) {
	test(`case-study media expands and restores focus in ${theme}`, async ({ page }, testInfo) => {
		await page.emulateMedia({ colorScheme: theme });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await openCaseStudy(page, "verto");
		const gallery = page.locator('[aria-roledescription="carousel"]').first();
		const expand = gallery.getByRole("button", { name: "Open expanded viewer", exact: true });
		await expand.scrollIntoViewIfNeeded();
		await gallery.hover();
		await expand.click();
		const dialog = page.getByRole("dialog", {
			name: "Document Translation With Editable Tables — Walkthrough",
		});
		await expect(dialog).toBeVisible();
		await expect(
			dialog.getByRole("heading", {
				name: "Document Translation With Editable Tables — Walkthrough",
				exact: true,
			}),
		).toBeVisible();
		await expect(dialog).toHaveAccessibleDescription(
			"Document Translation With Editable Tables",
		);
		const viewport = page.viewportSize();
		if (!viewport) throw new Error("Expected a gallery viewport");
		const caption = dialog.getByText("Document Translation With Editable Tables", {
			exact: true,
		});
		if (viewport.width < 760 || viewport.height <= 520) await expect(caption).toBeHidden();
		else await expect(caption).toBeVisible();
		await expect(dialog.getByRole("slider", { name: "Seek video" })).toBeVisible();
		const close = dialog.getByRole("button", { name: "Close expanded viewer" });
		await expect(close).toBeFocused();
		const bounds = await close.boundingBox();
		if (!bounds) throw new Error("Expected visible viewer controls");
		expect(bounds.width).toBeGreaterThanOrEqual(44);
		expect(bounds.height).toBeGreaterThanOrEqual(44);
		expect(bounds.x).toBeGreaterThanOrEqual(0);
		expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
		expect(await dialog.evaluate((node) => node.scrollWidth <= innerWidth)).toBe(true);
		await page.screenshot({ path: testInfo.outputPath(`case-study-viewer-${theme}.png`) });
		await close.click();
		await expect(dialog).toHaveCount(0);
		await expect(expand).toBeFocused();
		await expect(gallery.getByRole("button", { name: "Play 1:40 video" })).toBeVisible();
	});
}

test("case-study viewer honors reduced motion and keyboard dismissal", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openCaseStudy(page, "verto");
	const gallery = page.locator('[aria-roledescription="carousel"]').first();
	await gallery.focus();
	await gallery.press("Enter");
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-instant", "true");
	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	await expect(gallery).toBeFocused();
});

for (const { slug, count, title, theme } of [
	{ slug: "clearway-portal", count: 6, title: "Student portal walkthrough" },
	{ slug: "clearway-phoenix", count: 13, title: "University Program Matching — Walkthrough" },
].flatMap((project) => (["light", "dark"] as const).map((theme) => ({ ...project, theme })))) {
	test(`${slug} images and cover video form one gallery without moving the article in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.emulateMedia({ colorScheme: theme });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await openCaseStudy(page, slug);
		const opener = page
			.locator("article")
			.getByRole("button", { name: "Open slide 1 in expanded viewer" })
			.first();
		await opener.scrollIntoViewIfNeeded();
		const scrollY = await page.evaluate(() => window.scrollY);
		await opener.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAttribute("data-gallery-state", "open");
		const viewport = page.viewportSize();
		if (!viewport) throw new Error("Expected a gallery viewport");
		for (const region of [dialog, dialog.locator("header"), dialog.locator("footer")]) {
			const bounds = await region.boundingBox();
			if (!bounds) throw new Error("Expected full-width gallery regions");
			expect(Math.abs(bounds.x)).toBeLessThan(1);
			expect(Math.abs(bounds.width - viewport.width)).toBeLessThan(1);
		}
		await expect
			.poll(() =>
				dialog
					.locator(
						'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
					)
					.evaluate(
						(image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
					),
			)
			.toBe(true);
		const previews = dialog.getByRole("group", { name: "Gallery previews" });
		await expect(previews.getByRole("button")).toHaveCount(count);
		await expect(previews.getByRole("button").nth(1)).toHaveAttribute("aria-current", "true");
		await expect
			.poll(() =>
				previews
					.locator("img")
					.evaluateAll((images: HTMLImageElement[]) =>
						images.every((image) => image.complete && image.naturalWidth > 0),
					),
			)
			.toBe(true);
		await expect(dialog.locator('canvas[data-active="true"]')).toHaveCSS("opacity", "1");
		await page.screenshot({ path: testInfo.outputPath("page-wide-gallery.png") });
		if (slug === "clearway-phoenix") {
			for (const value of ["150%", "200%", "250%", "300%"]) {
				await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
				await expect(dialog.getByRole("button", { name: "Reset zoom to fit" })).toHaveText(
					value,
				);
			}
			await expect
				.poll(() =>
					dialog
						.getByRole("button", { name: "Reset zoom to fit" })
						.evaluate((button) =>
							button
								.getAnimations({ subtree: true })
								.some((animation) => animation.playState === "running"),
						),
				)
				.toBe(false);
			await page.screenshot({ path: testInfo.outputPath("page-wide-gallery-zoom.png") });
			await dialog.getByRole("button", { name: "Reset zoom to fit" }).click();
		}
		await dialog.getByRole("button", { name: "Previous slide", exact: true }).click();
		await expect(dialog).toHaveAccessibleName(title);
		await expect(dialog.getByRole("slider", { name: "Seek video" })).toBeVisible();
		await expect(
			dialog.getByRole("button", { name: "Previous slide", exact: true }),
		).toBeDisabled();
		await previews.getByRole("button").last().click();
		await expect(previews.getByRole("button").last()).toHaveAttribute("aria-current", "true");
		await expect(
			dialog.getByRole("button", { name: "Next slide", exact: true }),
		).toBeDisabled();
		await expect(dialog.getByRole("slider", { name: "Seek video" })).toHaveCount(0);
		const header = await dialog.locator("header").boundingBox();
		if (!header) throw new Error("Expected the gallery header");
		await page.mouse.click(header.width / 2, header.y + header.height + 4);
		await expect(dialog).toHaveCount(0);
		expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollY)).toBeLessThan(2);
		await expect(opener).toBeFocused();
		await expect(opener.locator("img")).toBeInViewport();
		await expect(page.locator("html")).not.toHaveAttribute("data-gallery-viewport-count");
	});
}

test("closing a zoomed image above the viewport midpoint keeps its source stable", async ({
	page,
}) => {
	await openCaseStudy(page, "clearway-portal");
	const opener = page
		.locator("article")
		.getByRole("button", { name: "Open slide 1 in expanded viewer" })
		.first();
	await opener.scrollIntoViewIfNeeded();
	await expect
		.poll(() => opener.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth))
		.toBeGreaterThan(0);
	for (const top of [-50, 40, 260]) {
		await opener.evaluate((node, target) => {
			window.scrollTo({
				top: window.scrollY + node.getBoundingClientRect().top - target,
				behavior: "instant",
			});
		}, top);
		const before = await opener.boundingBox();
		if (!before) throw new Error("Expected an article image");
		const scrollY = await page.evaluate(() => window.scrollY);
		const viewport = page.viewportSize();
		if (!viewport) throw new Error("Expected a viewport");
		await page.mouse.click(
			before.x + before.width / 2,
			Math.max(80, Math.min(before.y + before.height / 2, viewport.height - 100)),
		);
		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAttribute("data-gallery-state", "open");
		await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
		await expect(dialog.getByRole("button", { name: "Reset zoom to fit" })).toHaveText("150%");
		await dialog.getByRole("button", { name: "Close expanded viewer" }).click();
		await expect(dialog).toHaveCount(0);
		await expect(opener).toBeVisible();
		expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollY)).toBeLessThan(2);
		const after = await opener.boundingBox();
		if (!after) throw new Error("Expected the restored source image");
		expect(Math.abs(after.y - before.y)).toBeLessThan(2);
		expect(Math.abs(after.width - before.width)).toBeLessThan(2);
		await expect(page.locator(".pswp")).toHaveCount(0);
	}
});

test("leaving a case study with its viewer open restores the previous page", async ({ page }) => {
	await page.goto("/case-studies", { waitUntil: "domcontentloaded" });
	await expect(page.getByRole("button", { name: /Theme: Switch to/ })).toBeVisible();
	await page.locator('a[href="/case-studies/clearway-portal"]').first().click();
	await page.addStyleTag({ content: "nextjs-portal, agentation-toolbar { display: none; }" });
	await page
		.locator("article")
		.getByRole("button", { name: "Open slide 1 in expanded viewer" })
		.first()
		.click();
	await expect(page.getByRole("dialog")).toHaveAttribute("data-gallery-state", "open");
	await page.goBack();
	await expect(page).toHaveURL(/\/case-studies$/);
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(page.locator(".pswp")).toHaveCount(0);
	const project = page.locator('a[href="/case-studies/clearway-portal"]').first();
	await expect(project).toBeVisible();
	expect(await project.evaluate((node) => Boolean(node.closest("[inert]")))).toBe(false);
	await project.focus();
	await expect(project).toBeFocused();
});

for (const width of [390, 1600]) {
	test(`contents navigation focuses the selected section at ${width}px`, async ({
		page,
	}, testInfo) => {
		await page.setViewportSize({ width, height: 900 });
		await openCaseStudy(page, "clearway-portal");
		const section = page.locator("article h2[id]").nth(1);
		await section.scrollIntoViewIfNeeded();
		const id = await section.getAttribute("id");
		if (!id) throw new Error("Expected a section anchor");
		let navigation = page.getByRole("navigation", { name: "On this page", exact: true });
		if (width < 1536) {
			const trigger = page.getByRole("button", { name: "Open table of contents" });
			await expect(trigger).toBeVisible();
			await trigger.click();
			const dialog = page.getByRole("dialog", { name: "On this page", exact: true });
			await expect(dialog).toBeVisible();
			await expect(
				dialog.getByRole("button", { name: "Close table of contents" }),
			).toBeFocused();
			navigation = dialog.getByRole("navigation", { name: "Article sections" });
			await expect
				.poll(() =>
					dialog.evaluate(
						(node) =>
							node
								.getAnimations()
								.filter((animation) => animation.playState === "running").length,
					),
				)
				.toBe(0);
			await page.screenshot({ path: testInfo.outputPath("contents-sheet.png") });
		} else {
			await expect(navigation).toBeVisible();
			await expect(navigation).toHaveCSS("opacity", "1");
			await expect(page.getByRole("button", { name: "Open table of contents" })).toBeHidden();
			await page.screenshot({ path: testInfo.outputPath("contents-rail.png") });
		}
		const link = navigation.locator(`a[href="#${id}"]`);
		await link.focus();
		await link.press("Enter");
		await expect(page).toHaveURL(new RegExp(`#${id}$`));
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await expect(section).toBeFocused();
		await expect(section).toBeInViewport();
		if (width >= 1536) await expect(link).toHaveAttribute("aria-current", "location");
	});
}
