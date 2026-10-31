import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`Foundation materials, rail geometry and route persistence in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.route("https://stream.mux.com/**", (route) => route.abort());
		await page.goto("/");
		const header = page.locator("#header");
		await expect(header.getByRole("timer")).toHaveAccessibleName(/^Current time/);
		await expect(page.locator("main .portfolio-grid-frame").first()).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		const geometry = await header.evaluate((node) => {
			const badges = [...node.querySelectorAll(".portfolio-context-badge")].map((item) =>
				item.getBoundingClientRect(),
			);
			const chambers = [...node.querySelectorAll(".portfolio-context-chamber")].map((item) =>
				item.getBoundingClientRect(),
			);
			const row = node.querySelector(".portfolio-context-rail");
			const columnGap = row ? getComputedStyle(row).columnGap : "";
			const rowGap = row ? getComputedStyle(row).rowGap : "";
			const card = document
				.querySelector("main .portfolio-grid-frame")
				?.getBoundingClientRect();
			return {
				heights: badges.map((item) => item.height),
				chambers: chambers.map((item) => [item.width, item.height]),
				columnGap,
				rowGap,
				topClearance:
					Math.min(...badges.map((item) => item.top)) - node.getBoundingClientRect().top,
				clearance: card ? card.top - Math.max(...badges.map((item) => item.bottom)) : null,
				widths: [badges[0]?.width, badges[2]?.width],
			};
		});
		expect(geometry.heights).toEqual([28, 28, 28]);
		expect(geometry.chambers).toEqual([
			[28, 28],
			[28, 28],
		]);
		expect(geometry.widths[0]).toBe(geometry.widths[1]);
		expect(geometry.columnGap).toBe("20px");
		expect(geometry.rowGap).toBe("20px");
		expect(geometry.topClearance).toBeCloseTo(20, 1);
		expect(geometry.clearance).toBeCloseTo(20, 1);
		expect(Number.parseFloat(geometry.columnGap)).toBeCloseTo(geometry.topClearance, 1);
		expect(Number.parseFloat(geometry.rowGap)).toBeCloseTo(geometry.clearance ?? -1, 1);
		const badges = header.locator(".portfolio-context-badge");
		for (const badge of await badges.all()) {
			await expect(badge).toHaveCSS("font-size", "12px");
			await expect(badge).toHaveCSS("line-height", "16px");
			const hitArea = await badge.evaluate((node) => {
				const style = getComputedStyle(node, "::before");
				return node.getBoundingClientRect().height - Number.parseFloat(style.top) * 2;
			});
			expect(hitArea).toBe(44);
		}
		await expect(header.locator(".portfolio-marquee")).toHaveCSS("text-transform", "uppercase");

		const materials = await page.locator("html").evaluate((root) => {
			const style = getComputedStyle(root);
			return {
				canvas: style.getPropertyValue("--portfolio-canvas").trim(),
				app: style.getPropertyValue("--app-background").trim(),
				shader: style.getPropertyValue("--instrument-field-bg-boxed").trim(),
				card: style.getPropertyValue("--portfolio-panel").trim(),
				line: style.getPropertyValue("--border").trim(),
				chrome: style.getPropertyValue("--portfolio-chrome-hairline").trim(),
				frames: [...document.querySelectorAll(".portfolio-grid-frame")].map(
					(node) => getComputedStyle(node, "::after").backgroundImage,
				),
			};
		});
		expect(materials.app).toBe(materials.canvas);
		expect(materials.shader).toBe(materials.card);
		expect(materials.chrome).toBe(materials.line);
		expect(materials.frames.every((value) => value === "none")).toBe(true);
		const contrast = await page.locator("#header").evaluate((node) => {
			const context = document.createElement("canvas").getContext("2d");
			if (!context) throw new Error("Missing color test context");
			const luminance = (color: string) => {
				context.fillStyle = color;
				context.fillRect(0, 0, 1, 1);
				const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((byte) => {
					const value = byte / 255;
					return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
				});
				return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
			};
			const badge = node.querySelector(".portfolio-context-badge");
			const panel = document.querySelector("main .portfolio-grid-frame");
			if (!badge || !panel) throw new Error("Missing material owner");
			const style = getComputedStyle(badge);
			const text = luminance(style.color);
			const surface = luminance(style.backgroundColor);
			return {
				text: (Math.max(text, surface) + 0.05) / (Math.min(text, surface) + 0.05),
				canvas: luminance(getComputedStyle(document.body).backgroundColor),
				panel: luminance(getComputedStyle(panel).backgroundColor),
				html: getComputedStyle(document.documentElement).backgroundColor,
				body: getComputedStyle(document.body).backgroundColor,
			};
		});
		expect(contrast.text).toBeGreaterThanOrEqual(4.5);
		expect(contrast.html).toBe(contrast.body);
		if (theme === "light") expect(contrast.panel).toBeGreaterThan(contrast.canvas);
		else expect(contrast.panel).toBeLessThan(contrast.canvas);

		await page.evaluate(() => document.fonts.ready);
		await page.screenshot({ path: testInfo.outputPath(`homepage-${theme}.png`) });
		const originalHeader = await header.elementHandle();
		const originalTrack = await page.locator(".portfolio-marquee-track").elementHandle();
		const highlights = header.getByRole("button", { name: /^Highlights:/ });
		await expect
			.poll(() => originalTrack?.evaluate((node) => node.getAnimations().length))
			.toBe(1);
		const originalAnimation = await originalTrack?.evaluateHandle(
			(node) => node.getAnimations()[0],
		);
		await page
			.getByRole("navigation", { name: "Main navigation" })
			.getByRole("link", { name: "Blog", exact: true })
			.click();
		await expect(page.getByRole("heading", { name: "No posts published." })).toBeVisible();
		expect(
			await originalHeader?.evaluate((node) => node === document.querySelector("#header")),
		).toBe(true);
		expect(
			await originalTrack?.evaluate(
				(node) => node === document.querySelector(".portfolio-marquee-track"),
			),
		).toBe(true);
		expect(
			await originalAnimation?.evaluate(
				(animation) =>
					animation ===
					document.querySelector(".portfolio-marquee-track")?.getAnimations()[0],
			),
		).toBe(true);
		await highlights.click();
		await expect(highlights).toHaveAttribute("aria-pressed", "true");
		await expect
			.poll(() => originalTrack?.evaluate((node) => node.getAnimations()[0]?.playState))
			.toBe("paused");
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect
			.poll(() => originalTrack?.evaluate((node) => node.getAnimations().length))
			.toBe(0);
		await expect(page.locator(".portfolio-clock-digit > span").first()).toHaveCSS(
			"animation-name",
			"none",
		);
		await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
		await originalHeader?.dispose();
		await originalTrack?.dispose();
		await originalAnimation?.dispose();

		if (testInfo.project.name === "chromium") {
			await page.setViewportSize({ width: 320, height: 780 });
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
			await expect(header.getByRole("timer")).toBeVisible();
		}
	});

	test(`Copy Markdown resizes smoothly and uses Foundation feedback in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.addInitScript(() =>
			Object.defineProperty(navigator, "clipboard", {
				configurable: true,
				value: { writeText: () => Promise.resolve() },
			}),
		);
		// Resource content and HTTP delivery have separate coverage; keep motion checks deterministic.
		await page.route("**/case-study-markdown/clearway-phoenix", (route) =>
			route.fulfill({ contentType: "text/markdown", body: "# Copy feedback verification\n" }),
		);
		await page.goto("/case-studies/clearway-phoenix");
		const copy = page.getByRole("button", { name: "Copy Markdown", exact: true });
		await page.evaluate(() => document.fonts.ready);
		const label = page
			.getByRole("button", {
				name: /^(Copy Markdown|Copying|Copied Markdown|Retry copying)$/,
			})
			.locator('.t-state-label[data-sizing="content"]');
		await expect(label).toHaveAttribute("data-measured", "true");
		await expect(label).toHaveCSS("transition-property", "width");
		expect(
			await label.evaluate((node) =>
				Number.parseFloat(getComputedStyle(node).transitionDuration),
			),
		).toBeGreaterThan(0);
		const before = await copy.boundingBox();
		await expect(page.getByText(/^\d+ min read$/).locator("..")).toHaveCSS("height", "40px");
		await copy.click();
		const copied = page.getByRole("button", { name: "Copied Markdown", exact: true });
		await expect(copied).toBeVisible();
		expect((await copied.boundingBox())?.height).toBe(before?.height);
		const activeLabel = copied.locator('.t-state-label > [data-active="true"]');
		await expect(activeLabel).toHaveText("Copied Markdown");
		await expect
			.poll(async () =>
				Math.abs(
					((await label.boundingBox())?.width ?? 0) -
						((await activeLabel.boundingBox())?.width ?? 0),
				),
			)
			.toBeLessThan(1);
		const insets = await copied.evaluate((node) => {
			const outer = node.getBoundingClientRect();
			const inner = node.querySelector(".foundation-button-pending")?.getBoundingClientRect();
			return inner ? [inner.left - outer.left, outer.right - inner.right] : [];
		});
		expect(insets).toHaveLength(2);
		expect(insets[0]).toBeCloseTo(insets[1], 0);
		const stateIcon = copied.locator(".foundation-button-icon .t-icon-swap");
		await expect(stateIcon.locator(':scope > .t-icon[data-active="true"]')).toHaveCount(1);
		await expect
			.poll(() =>
				stateIcon
					.locator(':scope > .t-icon[data-active="true"]')
					.evaluate((node) => getComputedStyle(node).opacity),
			)
			.toBe("1");
		await expect(stateIcon.locator(':scope > .t-icon[data-active="false"]').first()).toHaveCSS(
			"opacity",
			"0",
		);
		await expect(
			page.getByRole("status").filter({ hasText: "Copied to clipboard." }),
		).toBeVisible();
		await page.screenshot({ path: testInfo.outputPath(`case-study-${theme}.png`) });
		await page.reload();
		await copy.focus();
		await copy.press("Enter");
		await expect(copied).toBeVisible();
		await expect(copied).toHaveAttribute("data-motion-input", "keyboard");
		await expect(stateIcon.locator(':scope > .t-icon[data-active="true"]')).toHaveCSS(
			"transition-duration",
			"0s",
		);
		await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
	});
}

// Exercise the real provider and transition owner, including interrupted pointer requests.
test("Theme changes settle coherently and keyboard changes are immediate", async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem("theme", "light"));
	await page.goto("/");
	const root = page.locator("html");
	const toggle = page.locator(".theme-toggle");
	await expect(toggle).toHaveAccessibleName("Theme: Switch to dark mode");
	await toggle.focus();
	await toggle.press("Enter");
	await expect(root).toHaveClass(/dark/);
	await expect(root).toHaveAttribute("data-theme-input", "keyboard");
	await expect(toggle.locator(".t-icon").first()).toHaveCSS("transition-duration", "0s");
	await expect(root).not.toHaveAttribute("data-theme-transition");
	await toggle.click();
	await toggle.click();
	await toggle.click();
	await expect(root).not.toHaveClass(/dark/);
	await expect(toggle).toHaveAccessibleName("Theme: Switch to dark mode");
	await expect(root).not.toHaveAttribute("data-theme-transition");
	await page.reload();
	await expect(root).not.toHaveClass(/dark/);
	await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
});
