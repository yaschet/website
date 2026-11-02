import { expect, type Page, test } from "@playwright/test";

async function openArticle(page: Page, theme: "light" | "dark") {
	await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
	await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
	await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
	await page.goto("/case-studies/verto", { waitUntil: "domcontentloaded" });
	await expect(page.locator("article h2[id]").first()).toBeVisible();
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.addStyleTag({ content: "nextjs-portal, agentation-toolbar { display: none; }" });
}

async function readingGeometry(page: Page) {
	return page.locator("article").evaluate((article) => ({
		width: article.getBoundingClientRect().width,
		headingTops: Array.from(
			article.querySelectorAll("h2[id]"),
			(heading) => heading.getBoundingClientRect().top,
		),
	}));
}

for (const theme of ["light", "dark"] as const) {
	for (const viewport of [
		{ width: 320, height: 568 },
		{ width: 390, height: 844 },
		{ width: 834, height: 1112 },
		{ width: 844, height: 390 },
	]) {
		test(`article keeps the floating dock and contents control at ${viewport.width}x${viewport.height} in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize(viewport);
			await openArticle(page, theme);
			const nav = page.getByRole("navigation", { name: "Main navigation", exact: true });
			await expect(nav.locator("..")).toHaveCSS("position", "fixed");
			const outlet = page.locator("#portfolio-content");
			await expect(outlet.locator("article:visible")).toHaveCount(1);
			const articleSpacer = outlet.locator('[id="nav-spacer"]');
			await expect(articleSpacer).toHaveCount(1);
			await expect(articleSpacer).toBeVisible();
			for (const control of await nav.locator("a,button").all()) {
				const box = await control.boundingBox();
				expect(box?.width).toBeGreaterThanOrEqual(44);
				expect(box?.height).toBeGreaterThanOrEqual(44);
			}
			const section = page.locator("article h2[id]").nth(1);
			await section.scrollIntoViewIfNeeded();
			const trigger = page.getByRole("button", { name: "Open table of contents" });
			await expect(trigger).toHaveCSS("opacity", "1");
			const readingPosition = await page.evaluate(() => window.scrollY);
			const geometry = await readingGeometry(page);
			const triggerBox = await trigger.boundingBox();
			expect(triggerBox?.y).toBeGreaterThanOrEqual(0);
			expect(triggerBox?.y).toBeLessThanOrEqual(24);
			expect(triggerBox?.height).toBeGreaterThanOrEqual(44);
			expect(
				Math.abs((triggerBox?.x ?? 0) + (triggerBox?.width ?? 0) / 2 - viewport.width / 2),
			).toBeLessThanOrEqual(5);
			await trigger.click();
			const dialog = page.getByRole("dialog", { name: "On this page", exact: true });
			await expect(dialog).toBeVisible();
			// A reserved root gutter and the dialog's scroll lock must not compensate twice.
			await expect.poll(() => readingGeometry(page)).toEqual(geometry);
			await expect(
				dialog.getByRole("button", { name: "Close table of contents" }),
			).toBeFocused();
			const dialogBox = await dialog.boundingBox();
			expect(dialogBox?.y).toBeGreaterThanOrEqual(0);
			expect((dialogBox?.y ?? 0) + (dialogBox?.height ?? 0)).toBeLessThanOrEqual(
				viewport.height,
			);
			await page.keyboard.press("Escape");
			await expect(dialog).toHaveCount(0);
			await expect(trigger).toBeFocused();
			expect(await page.evaluate(() => window.scrollY)).toBe(readingPosition);
			await expect.poll(() => readingGeometry(page)).toEqual(geometry);
			await trigger.press("Enter");
			const id = await section.getAttribute("id");
			await dialog.locator(`a[href="#${id}"]`).focus();
			await page.keyboard.press("Enter");
			await expect(dialog).toHaveCount(0);
			await expect(section).toBeFocused();
			await expect(section).toBeInViewport();
			const focusedBox = await section.boundingBox();
			const remainingTriggerBox = await trigger.boundingBox();
			expect(focusedBox?.y).toBeGreaterThanOrEqual(
				(remainingTriggerBox?.y ?? 0) + (remainingTriggerBox?.height ?? 0) + 4,
			);
			const source = page.getByRole("link", { name: "Source", exact: true });
			await source.scrollIntoViewIfNeeded();
			await expect(source).toBeInViewport();
			expect(
				await source.evaluate((node) => {
					const box = node.getBoundingClientRect();
					const hit = document.elementFromPoint(
						box.left + box.width / 2,
						box.top + box.height / 2,
					);
					return hit === node || node.contains(hit);
				}),
			).toBe(true);
			await expect(source).toHaveAttribute("href", "https://github.com/yaschet/website");
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
		});
	}
}

test("reading controls fit enlarged text, adjusted spacing and short wide windows", async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 568 });
	await openArticle(page, "light");
	const paragraph = page.locator("article > p").first();
	const normalTextSize = await paragraph.evaluate((node) =>
		Number.parseFloat(getComputedStyle(node).fontSize),
	);
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "200%";
	});
	await expect
		.poll(() =>
			paragraph.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize)),
		)
		.toBe(normalTextSize * 2);
	await page.locator("article h2[id]").nth(1).scrollIntoViewIfNeeded();
	const trigger = page.getByRole("button", { name: "Open table of contents" });
	await expect(trigger).toHaveCSS("opacity", "1");
	const box = await trigger.boundingBox();
	expect(box?.x).toBeGreaterThanOrEqual(0);
	expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
	await trigger.click();
	const dialog = page.getByRole("dialog", { name: "On this page", exact: true });
	await expect(dialog).toBeVisible();
	expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
		true,
	);
	await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	const spacing = await page.addStyleTag({
		content: `
			* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
			p { margin-block-end: 2em !important; }
		`,
	});
	await page.locator("article h2[id]").nth(1).scrollIntoViewIfNeeded();
	await trigger.click();
	await expect(dialog).toBeVisible();
	expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
		true,
	);
	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();
	await spacing.evaluate((node) => node.parentNode?.removeChild(node));
	await page.setViewportSize({ width: 1600, height: 390 });
	await page.locator("article h2[id]").nth(1).scrollIntoViewIfNeeded();
	await expect(trigger).toBeVisible();
	await expect(page.getByRole("navigation", { name: "On this page", exact: true })).toBeHidden();
	await expect(
		page.getByRole("navigation", { name: "Main navigation", exact: true }).locator(".."),
	).toHaveCSS("position", "fixed");
});

test("the first keyboard link bypasses repeated chrome", async ({ page, browserName }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openArticle(page, "light");
	// WebKit follows macOS link navigation: Option-Tab includes links.
	await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
	const skip = page.getByRole("link", { name: "Skip to content", exact: true });
	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();
	await page.keyboard.press("Enter");
	await expect(page.locator("#portfolio-content")).toBeFocused();
	await expect(page).toHaveURL(/#portfolio-content$/);
});
