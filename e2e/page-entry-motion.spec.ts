import { expect, test } from "@playwright/test";

interface EntrySample {
	id: string;
	delay: number;
	duration: number;
	properties: string[];
}

declare global {
	interface Window {
		portfolioEntrySamples: EntrySample[];
		freezePortfolioEntry: boolean;
	}
}

for (const theme of ["light", "dark"] as const) {
	test(`fallback entry coordinates titles and copy without fading frames in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.addInitScript(() => {
			window.portfolioEntrySamples = [];
			window.freezePortfolioEntry = false;
			// Exercise the live-DOM fallback independently of native viewport handoffs.
			Object.defineProperty(document, "startViewTransition", {
				value: undefined,
				configurable: true,
			});
			const animate = Element.prototype.animate;
			Element.prototype.animate = function (keyframes, options) {
				const animation = animate.call(this, keyframes, options);
				void animation.ready
					.then(() => {
						if (!animation.id.startsWith("portfolio-entry-")) return;
						const effect = animation.effect;
						if (!(effect instanceof KeyframeEffect)) return;
						const timing = effect.getTiming();
						window.portfolioEntrySamples.push({
							id: animation.id,
							delay: timing.delay ?? 0,
							duration: Number(timing.duration),
							properties: Object.keys(effect.getKeyframes()[0]),
						});
						if (window.freezePortfolioEntry) {
							animation.pause();
							animation.currentTime = 110;
						}
					})
					.catch(() => {});
				return animation;
			};
		});
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await expect(nav).toBeVisible();
		expect(await page.evaluate(() => window.portfolioEntrySamples)).toEqual([]);
		await expect(page.locator("h1 [data-heading-word]").first()).toHaveCSS("opacity", "1");
		const header = await page.locator("#header").elementHandle();
		const dock = await nav.elementHandle();
		await page.evaluate(() => {
			window.freezePortfolioEntry = true;
		});
		await nav.getByRole("link", { name: "About", exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
		const heading = page.getByRole("heading", { name: "How I work.", exact: true });
		await expect(heading).toBeVisible();
		await expect
			.poll(() =>
				page.evaluate(() => ({
					headings: window.portfolioEntrySamples.filter(
						(sample) => sample.id === "portfolio-entry-heading",
					).length,
					copy: window.portfolioEntrySamples.some(
						(sample) => sample.id === "portfolio-entry-copy",
					),
				})),
			)
			.toEqual({ headings: 3, copy: true });
		const samples = await page.evaluate(() => window.portfolioEntrySamples);
		const words = samples.filter((sample) => sample.id === "portfolio-entry-heading");
		expect(words[1].delay).toBeGreaterThan(words[0].delay);
		expect(words[2].delay).toBeGreaterThan(words[1].delay);
		expect(words.every((sample) => sample.properties.includes("filter"))).toBe(true);
		expect(samples.every((sample) => sample.duration + sample.delay <= 370)).toBe(true);
		expect(samples.some((sample) => sample.id === "portfolio-entry-copy")).toBe(true);
		expect(samples.some((sample) => sample.id === "portfolio-entry-frame")).toBe(false);
		await expect(page.locator(".portfolio-scene")).toHaveCSS("transform", "none");
		await expect(page.locator(".portfolio-scene")).toHaveCSS("opacity", "1");
		await expect(page.locator(".portfolio-theme-surface")).toHaveCSS("opacity", "1");
		const during = await heading.boundingBox();
		expect(
			await nav.evaluate((node) =>
				[...node.querySelectorAll("a,button")].every((item) => {
					const box = item.getBoundingClientRect();
					return item.contains(
						document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
					);
				}),
			),
		).toBe(true);
		await page.screenshot({ path: testInfo.outputPath(`page-entry-${theme}.png`) });
		await page.evaluate(() => {
			window.freezePortfolioEntry = false;
			for (const animation of document.getAnimations()) {
				if (animation.id.startsWith("portfolio-entry-")) animation.finish();
			}
		});
		const after = await heading.boundingBox();
		expect(after?.width).toBe(during?.width);
		expect(after?.height).toBe(during?.height);
		await expect(heading.locator("[data-heading-word]").first()).toHaveCSS("filter", "none");
		expect(await header?.evaluate((node) => node === document.getElementById("header"))).toBe(
			true,
		);
		expect(
			await dock?.evaluate(
				(node) => node === document.querySelector('[aria-label="Main navigation"]'),
			),
		).toBe(true);
		// Returning to the initial URL must animate too, with the same accessible title.
		await page.evaluate(() => {
			window.portfolioEntrySamples = [];
			window.freezePortfolioEntry = true;
		});
		await nav.getByRole("link", { name: "Home", exact: true }).click();
		await expect(page).toHaveURL(/\/$/);
		const homeHeading = page.getByRole("heading", {
			name: "Complex systems, clean interfaces.",
			exact: true,
		});
		await expect(homeHeading).toBeVisible();
		const homeWordCount = await homeHeading.locator("[data-heading-word]").count();
		await expect
			.poll(() =>
				page.evaluate(
					() =>
						window.portfolioEntrySamples.filter(
							(sample) => sample.id === "portfolio-entry-heading",
						).length,
				),
			)
			.toBe(homeWordCount * 2);
		const homeWords = await page.evaluate(() =>
			window.portfolioEntrySamples.filter(
				(sample) => sample.id === "portfolio-entry-heading",
			),
		);
		expect(homeWords[2].delay).toBeGreaterThan(homeWords[0].delay);
		expect(homeWords.every((sample) => sample.properties.includes("maskPosition"))).toBe(true);
		expect(homeWords.every((sample) => !sample.properties.includes("transform"))).toBe(true);
		const homeFrame = await homeHeading.boundingBox();
		for (const time of [350, 850]) {
			await page.evaluate((time) => {
				for (const animation of document.getAnimations())
					if (animation.id === "portfolio-entry-heading") animation.currentTime = time;
			}, time);
			await page.screenshot({
				path: testInfo.outputPath(`hero-reveal-${theme}-${time}ms.png`),
			});
			expect(await homeHeading.boundingBox()).toEqual(homeFrame);
		}
		await page.evaluate(() => {
			for (const animation of document.getAnimations())
				if (animation.id.startsWith("portfolio-entry-")) animation.finish();
		});
		await expect(homeHeading.locator("[data-resolve-sharp]").last()).toHaveCSS(
			"mask-position",
			/^(?:0%|0px) (?:0%|0px)$/,
		);
		expect(await homeHeading.boundingBox()).toEqual(homeFrame);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true,
		);
		expect(errors).toEqual([]);
	});
}

test("keyboard and reduced motion cancel entry without hiding text", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await page.goto("/");
	const nav = page.getByRole("navigation", { name: "Main navigation" });
	await expect(nav.getByRole("button", { name: /^Theme: Switch/ })).toBeVisible();
	await nav.getByRole("link", { name: "About", exact: true }).focus();
	await page.keyboard.press("Enter");
	await expect(page).toHaveURL(/\/about$/);
	await expect(page.locator("main:visible h1")).toHaveAttribute("data-entry-kind", "heading");
	const entryCount = () =>
		page.evaluate(
			() =>
				document
					.getAnimations()
					.filter((animation) => animation.id.startsWith("portfolio-entry-")).length,
		);
	expect(await entryCount()).toBe(0);
	await page.emulateMedia({ reducedMotion: "reduce" });
	await nav.getByRole("link", { name: "Contact", exact: true }).click();
	await expect(page).toHaveURL(/\/contact$/);
	const contactHeading = page.locator("main:visible h1");
	// A committed URL can precede hydration of streamed copy. Exercise the
	// current page's entry hook before changing the motion preference.
	await expect(contactHeading).toHaveAttribute("data-entry-kind", "heading");
	expect(await entryCount()).toBe(0);
	await expect(contactHeading.locator("[data-heading-word]").first()).toHaveCSS("opacity", "1");
	await expect(contactHeading.locator("[data-heading-word]").first()).toHaveCSS("filter", "none");
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
			}),
	);
	// Restoring a preference should affect future navigation, not replay Contact.
	expect(await entryCount()).toBe(0);
	await nav.getByRole("link", { name: "About", exact: true }).click();
	await expect(page).toHaveURL(/\/about$/);
	await page.emulateMedia({ reducedMotion: "reduce" });
	await expect.poll(entryCount).toBe(0);
});
