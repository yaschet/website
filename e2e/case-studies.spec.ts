import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	for (const slug of ["clearway-phoenix", "verto"] as const) {
		test(`${slug} reading layout and contents in ${theme}`, async ({ page }, testInfo) => {
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
			await page.goto(`/case-studies/${slug}`);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			await expect(page.locator("article")).toHaveCount(1);
			await expect(page.getByRole("list", { name: "Engine Stack" })).toBeVisible();
			const copy = page.getByRole("button", { name: "Copy Markdown", exact: true });
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
			const chipsFit = await page
				.locator(".portfolio-project-stack")
				.evaluate((list) =>
					[...list.querySelectorAll("li")].every(
						(item) => item.scrollWidth <= item.clientWidth + 1,
					),
				);
			expect(chipsFit).toBe(true);
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
			const code = page.locator("article .code-block-pre").first();
			await code.scrollIntoViewIfNeeded();
			const rawCode = await code.textContent();
			const codeLayout = await code.evaluate((node) => ({
				overflow: getComputedStyle(node).overflowX,
				fits: node.getBoundingClientRect().right <= innerWidth,
				fontSize: getComputedStyle(node).fontSize,
				lineHeight: getComputedStyle(node).lineHeight,
			}));
			expect(codeLayout).toEqual({
				overflow: "auto",
				fits: true,
				fontSize: "13px",
				lineHeight: "20px",
			});
			const syntaxContrast = await code.evaluate((node) => {
				const context = document.createElement("canvas").getContext("2d");
				if (!context) throw new Error("Color sampling is unavailable");
				const luminance = (color: string) => {
					context.fillStyle = color;
					context.fillRect(0, 0, 1, 1);
					const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
					const linear = [r, g, b].map((channel) => {
						const value = channel / 255;
						return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
					});
					return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
				};
				// The pre is transparent; its enclosing code frame owns the opaque surface.
				if (!node.parentElement) throw new Error("Code frame is missing");
				const background = luminance(getComputedStyle(node.parentElement).backgroundColor);
				return [...node.querySelectorAll("code span")]
					.filter((span) => span.textContent?.trim())
					.map((span) => {
						const foreground = luminance(getComputedStyle(span).color);
						return {
							token: span.className,
							color: getComputedStyle(span).color,
							ratio:
								(Math.max(foreground, background) + 0.05) /
								(Math.min(foreground, background) + 0.05),
						};
					});
			});
			expect(syntaxContrast.length).toBeGreaterThan(0);
			expect(syntaxContrast.filter((token) => token.ratio < 4.5)).toEqual([]);
			const copyCode = code
				.locator("..")
				.getByRole("button", { name: "Copy code", exact: true });
			expect((await copyCode.boundingBox())?.height).toBe(40);
			if (testInfo.project.name === "mobile-chrome") {
				await page.screenshot({ path: testInfo.outputPath(`${slug}-code-${theme}.png`) });
			}
			await copyCode.click();
			await expect(code.locator("..").getByRole("status")).toHaveText(
				"Code copied to clipboard.",
			);
			await expect(page.locator("html")).toHaveAttribute("data-copied-code", rawCode ?? "");
			await expect
				.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
				.toBe(true);

			const firstHeading = page.locator("article h2[id]").first();
			await firstHeading.scrollIntoViewIfNeeded();
			const trigger = page.getByRole("button", { name: "Open table of contents" });
			await expect(trigger).toBeVisible();
			await trigger.click();
			const contents = page.getByRole("dialog", { name: "On this page" });
			await expect(contents).toBeVisible();
			const close = contents.getByRole("button", { name: "Close", exact: true });
			await expect
				.poll(async () => {
					const box = await close.boundingBox();
					return { width: box?.width, height: box?.height };
				})
				.toEqual({ width: 40, height: 40 });
			await page.keyboard.press("Escape");
			await expect(contents).not.toBeVisible();
			await expect(trigger).toBeFocused();
			await trigger.click();
			const lastLink = contents.getByRole("link").last();
			const href = await lastLink.getAttribute("href");
			await lastLink.click();
			await expect(contents).not.toBeVisible();
			await expect(page).toHaveURL(new RegExp(`${href}$`));
			await expect(page.locator(`article [id="${href?.slice(1)}"]`)).toBeFocused();

			if (slug === "clearway-phoenix") {
				const table = page.locator("article table").first();
				await table.scrollIntoViewIfNeeded();
				const insets = await table.locator("th, td").evaluateAll((cells) =>
					cells.map((cell) => {
						const style = getComputedStyle(cell);
						return [
							style.paddingTop,
							style.paddingRight,
							style.paddingBottom,
							style.paddingLeft,
						];
					}),
				);
				expect(insets.every((values) => values.every((value) => value === "16px"))).toBe(
					true,
				);
				const articleImage = page
					.locator("article figure")
					.filter({
						has: page.getByRole("img", {
							name: "Programs table backed by the normalized program schema.",
							exact: true,
						}),
					})
					.first();
				const imageTrigger = articleImage.getByRole("button", {
					name: "Open slide 1 in expanded viewer",
				});
				await imageTrigger.click();
				const viewer = page.getByRole("dialog", {
					name: "Programs table backed by the normalized program schema.",
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
	}) => {
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
		const before = await button.boundingBox();
		await button.click();
		const pending = page.getByRole("button", { name: "Copying", exact: true });
		await expect(pending).toBeDisabled();
		expect((await pending.boundingBox())?.height).toBe(before?.height);
		await expect(pending).toBeFocused();
		await page.keyboard.press("Enter");
		expect(requests).toBe(1);
		complete?.();
		const retry = page.getByRole("button", { name: "Retry copying", exact: true });
		await expect(retry).toBeEnabled();
		await expect(page.getByRole("status").filter({ hasText: "Could not copy" })).toHaveText(
			"Could not copy. Please try again.",
		);
		await retry.click();
		const copied = page.getByRole("button", { name: "Copied Markdown", exact: true });
		await expect(copied).toBeVisible();
		expect(requests).toBe(2);
		expect((await copied.boundingBox())?.height).toBe(before?.height);
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
		await expect(page.getByRole("heading", { level: 1, name: "Verto" })).toBeVisible();
		await expect(page.getByRole("list", { name: "Engine Stack" })).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true,
		);
		expect(
			await page
				.locator(".portfolio-project-stack")
				.evaluate((el) =>
					[...el.querySelectorAll("li")].every(
						(item) => item.scrollWidth <= item.clientWidth + 1,
					),
				),
		).toBe(true);
		await page.setViewportSize({ width: 1600, height: 900 });
		await page.goto("/case-studies/clearway-phoenix");
		await page.locator("article h2[id]").first().scrollIntoViewIfNeeded();
		const rail = page.getByRole("navigation", { name: "On this page", exact: true });
		await expect(rail).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Open table of contents" }),
		).not.toBeVisible();
		const railBox = await rail.boundingBox();
		const articleBox = await page.locator("article").boundingBox();
		expect(railBox?.x).toBeGreaterThanOrEqual(16);
		expect((railBox?.x ?? 0) + (railBox?.width ?? 0)).toBeLessThan(articleBox?.x ?? 0);
		const link = rail.getByRole("link", { name: "Results", exact: true });
		await link.click();
		await expect(page.locator('article [id="results"]')).toBeFocused();
		await expect(link).toHaveAttribute("aria-current", "location");
	});
}
