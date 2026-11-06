import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	for (const slug of ["clearway-phoenix", "verto", "clearway-portal", "clearway-erp"] as const) {
		test(`${slug} reading layout and contents in ${theme}`, async ({ page }, testInfo) => {
			if (slug === "clearway-portal" && testInfo.project.name === "chromium") {
				await page.setViewportSize({ width: 1630, height: 1351 });
			}
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.addInitScript((value) => {
				localStorage.setItem("theme", value);
				Object.defineProperty(navigator, "clipboard", {
					value: {
						writeText: async (text: string) => {
							document.documentElement.dataset.copiedCode = text;
						},
					},
					configurable: true,
				});
			}, theme);
			await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
			await page.goto(`/case-studies/${slug}`, { waitUntil: "domcontentloaded" });
			await expect(page.getByRole("button", { name: /Theme: Switch to/ })).toBeVisible();
			await page.addStyleTag({
				content: "nextjs-portal, agentation-toolbar { display: none; }",
			});
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			await expect(page.locator("article")).toHaveCount(1);
			if (slug === "clearway-phoenix") {
				await expect(page.locator('#project-main header time[datetime="2025"]')).toHaveText(
					"2025",
				);
				const year = page.locator(".portfolio-project-fact").filter({
					has: page.getByText("Year", { exact: true }),
				});
				await expect(year.locator("dd")).toHaveText("2025");
			}
			const stack = page.getByRole("region", { name: "Engine Stack" });
			await expect(stack).toBeVisible();
			const copy = page.getByRole("button", { name: "Copy Markdown", exact: true });
			await expect(copy).toBeEnabled();
			expect((await copy.boundingBox())?.height).toBe(40);
			const typography = await page.locator("article").evaluate((node) => {
				const elements = [node, ...node.querySelectorAll("h2, h3, p, figcaption")];
				return elements.every((element) => {
					const style = getComputedStyle(element);
					return (
						Number.isInteger(parseFloat(style.fontSize)) &&
						Number.isInteger(parseFloat(style.lineHeight))
					);
				});
			});
			expect(typography).toBe(true);
			await expect
				.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
				.toBe(true);
			const widths = await stack
				.locator(".portfolio-technology-cell:visible, .portfolio-technology-disclosure")
				.evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().width));
			expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5);
			const headerInsets = await page.locator("#project-main header").evaluate((node) => {
				const style = getComputedStyle(node);
				return [
					style.paddingTop,
					style.paddingRight,
					style.paddingBottom,
					style.paddingLeft,
				];
			});
			expect(new Set(headerInsets).size).toBe(1);
			if ((page.viewportSize()?.width ?? 0) >= 768) {
				const facts = page.locator(
					".portfolio-project-fact:not(.portfolio-project-fact-stack)",
				);
				const first = await facts.first().boundingBox();
				const last = await facts.last().boundingBox();
				const grid = await page.locator(".portfolio-project-facts").boundingBox();
				expect(first?.y).toBe(last?.y);
				expect((last?.x ?? 0) + (last?.width ?? 0)).toBeCloseTo(
					(grid?.x ?? 0) + (grid?.width ?? 0),
					0,
				);
			}
			await page.screenshot({ path: testInfo.outputPath(`${slug}-${theme}.png`) });
			const stackTrigger = stack.getByRole("button", { name: /^Stack: all / });
			const technologyCount = await stack
				.getByRole("list", { name: "Technologies" })
				.getByRole("listitem")
				.count();
			await stackTrigger.click();
			const stackDialog = page.getByRole("dialog", { name: /^Technology stack for / });
			await expect(stackDialog).toBeVisible();
			await expect(stackDialog.getByRole("listitem")).toHaveCount(technologyCount);
			await page.keyboard.press("Escape");
			await expect(stackTrigger).toBeFocused();
			await page.screenshot({ path: testInfo.outputPath(`${slug}-${theme}-facts.png`) });
			const firstHeading = page.locator("article h2[id]").first();
			await firstHeading.evaluate((heading) =>
				heading.scrollIntoView({ block: "start", behavior: "instant" }),
			);
			const viewport = page.viewportSize();
			const hasContentsRail =
				(viewport?.width ?? 0) >= 1536 && (viewport?.height ?? 0) >= 768;
			let contents = page.getByRole("navigation", { name: "On this page", exact: true });
			if (!hasContentsRail) {
				const trigger = page.getByRole("button", { name: "Open table of contents" });
				await expect(trigger).toBeVisible();
				await expect(trigger).toHaveAttribute("data-visible", "true");
				await expect(trigger).not.toHaveAttribute("inert");
				await trigger.click();
				contents = page.getByRole("dialog", { name: "On this page" });
				await expect(contents).toBeVisible();
				const close = contents.getByRole("button", {
					name: "Close table of contents",
					exact: true,
				});
				await expect
					.poll(async () => {
						const box = await close.boundingBox();
						return { width: box?.width, height: box?.height };
					})
					.toEqual({ width: 44, height: 44 });
				await page.keyboard.press("Escape");
				await expect(contents).not.toBeVisible();
				await expect(trigger).toBeFocused();
				await trigger.click();
			}
			await expect(contents).toBeVisible();
			const lastLink = contents.getByRole("link").last();
			const href = await lastLink.getAttribute("href");
			await lastLink.click();
			if (!hasContentsRail) await expect(contents).not.toBeVisible();
			await expect(page).toHaveURL(new RegExp(`${href}$`));
			await expect(page.locator(`article [id="${href?.slice(1)}"]`)).toBeFocused();

			if (slug === "clearway-phoenix") {
				const articleImage = page
					.locator("article figure")
					.filter({
						has: page.getByRole("img", {
							name: "A machine-learning search returning related university programs.",
							exact: true,
						}),
					})
					.first();
				const imageTrigger = articleImage.getByRole("button", {
					name: "Open slide 1 in expanded viewer",
				});
				await imageTrigger.click();
				const viewer = page.getByRole("dialog", {
					name: "A machine-learning search returning related university programs.",
					exact: true,
				});
				await expect(viewer).toBeVisible();
				await expect(
					viewer.getByRole("button", { name: "Close expanded viewer", exact: true }),
				).toBeFocused();
				if (testInfo.project.name === "mobile-chrome") {
					await page.screenshot({
						path: testInfo.outputPath(`phoenix-lightbox-${theme}.png`),
					});
				}
				await page.keyboard.press("Escape");
				await expect(viewer).not.toBeVisible();
				await expect(imageTrigger).toBeFocused();
			}
		});
	}
}

for (const theme of ["light", "dark"] as const) {
	test(`Markdown copy is lazy, focused while pending, recoverable and deduplicated in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.emulateMedia({ colorScheme: theme });
		await page.addInitScript((value) => {
			localStorage.setItem("theme", value);
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText: async () => {} },
				configurable: true,
			});
		}, theme);
		let requests = 0;
		let complete: (() => void) | undefined;
		await page.route("**/case-studies/clearway-phoenix.md", async (route) => {
			requests++;
			if (requests === 1) {
				await new Promise<void>((resolve) => {
					complete = resolve;
				});
				await route.fulfill({ status: 503, body: "Unavailable" });
			} else
				await route.fulfill({
					contentType: "text/markdown",
					body: "# Verification fixture",
				});
		});
		await page.goto("/case-studies/clearway-phoenix");
		const button = page.getByRole("button", { name: "Copy Markdown", exact: true });
		await expect(button).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		expect(requests).toBe(0);
		const height = await button.evaluate((node) => getComputedStyle(node).height);
		await button.click();
		const pending = page.getByRole("button", { name: "Copying", exact: true });
		await expect(pending).toBeDisabled();
		// Compare layout height while the pointer press transform is allowed to settle.
		await expect(pending).toHaveCSS("height", height);
		await expect(pending).toBeFocused();
		const spinner = pending.locator('[data-slot="spinner"]');
		await expect(spinner).toHaveCSS("width", "16px");
		await expect(spinner).toHaveCSS("height", "16px");
		await page.screenshot({ path: testInfo.outputPath(`markdown-copy-pending-${theme}.png`) });
		await page.keyboard.press("Enter");
		expect(requests).toBe(1);
		complete?.();
		const retry = page.getByRole("button", { name: "Retry copying", exact: true });
		await expect(retry).toBeEnabled();
		await expect(page.getByRole("status").filter({ hasText: "Could not copy" })).toHaveText(
			"Could not copy. Please try again.",
		);
		await retry.click();
		const copied = page.getByRole("button", { name: "Copied", exact: true });
		await expect(copied).toBeVisible();
		expect(requests).toBe(2);
		await expect(copied).toHaveCSS("height", height);
	});
}

for (const theme of ["light", "dark"] as const) {
	test(`compact metadata and wide contents rail in ${theme}`, async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.name !== "chromium",
			"Additional viewport stress check; phone projects cover the normal reading flow.",
		);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.setViewportSize({ width: 320, height: 844 });
		await page.goto("/case-studies/verto");
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Verto: AI Translation Platform",
			}),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Copy Markdown", exact: true }),
		).toBeEnabled();
		const stack = page.getByRole("region", { name: "Engine Stack" });
		await expect(stack).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true,
		);
		const widths = await stack
			.locator(".portfolio-technology-cell:visible, .portfolio-technology-disclosure")
			.evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().width));
		expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5);
		await page.setViewportSize({ width: 1600, height: 900 });
		await page.goto("/case-studies/clearway-phoenix");
		await expect(
			page.getByRole("button", { name: "Copy Markdown", exact: true }),
		).toBeEnabled();
		await page
			.locator("article h2[id]")
			.first()
			.evaluate((heading) => heading.scrollIntoView({ block: "start", behavior: "instant" }));
		const rail = page.getByRole("navigation", { name: "On this page", exact: true });
		await expect(rail).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Open table of contents" }),
		).not.toBeVisible();
		const railBox = await rail.boundingBox();
		const articleBox = await page.locator("article").boundingBox();
		expect(railBox?.x).toBeGreaterThanOrEqual(16);
		expect((railBox?.x ?? 0) + (railBox?.width ?? 0)).toBeLessThan(articleBox?.x ?? 0);
		const link = rail.getByRole("link", {
			name: "Keep Recommendations Connected To Applications",
			exact: true,
		});
		await link.click();
		await expect(
			page.locator('article [id="keep-recommendations-connected-to-applications"]'),
		).toBeFocused();
		await expect(link).toHaveAttribute("aria-current", "location");
	});
}
