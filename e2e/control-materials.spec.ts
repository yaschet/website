import { expect, type Locator, test } from "@playwright/test";

async function material(control: Locator) {
	return control.evaluate((node) => {
		const context = document.createElement("canvas").getContext("2d");
		if (!context) throw new Error("Missing color test context");
		const bytes = (color: string) => {
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = color;
			context.fillRect(0, 0, 1, 1);
			return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
		};
		const luminance = (rgb: number[]) =>
			rgb
				.map((byte) => {
					const value = byte / 255;
					return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
				})
				.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
		const style = getComputedStyle(node);
		const ink = bytes(style.color);
		const fill = bytes(style.backgroundColor);
		const values = [luminance(ink), luminance(fill)].sort((a, b) => b - a);
		return { contrast: (values[0] + 0.05) / (values[1] + 0.05), ink, fill };
	});
}

for (const theme of ["light", "dark"] as const) {
	test(`CTA and media materials retain readable hover and press states in ${theme}`, async ({
		page,
	}, info) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const actions = [
			page.getByRole("link", { name: "Case studies", exact: true }).first(),
			page.getByRole("link", { name: "Email", exact: true }).first(),
			page.getByRole("button", { name: "Play 1:40 video", exact: true }),
			page.locator(".portfolio-inverse-button").first(),
		];
		for (const action of actions) {
			// Hover retries if the poster upgrades to its deferred gallery during the scroll.
			await action.hover();
			await page.mouse.move(0, 0);
			await expect
				.poll(async () => (await material(action)).contrast)
				.toBeGreaterThanOrEqual(4.5);
			await action.hover();
			await expect
				.poll(async () => (await material(action)).contrast)
				.toBeGreaterThanOrEqual(4.5);
			await page.mouse.down();
			await expect
				.poll(async () => (await material(action)).contrast)
				.toBeGreaterThanOrEqual(4.5);
			await page.mouse.move(0, 0);
			await page.mouse.up();
		}
		await page.screenshot({ path: info.outputPath(`cta-${theme}.png`) });
		const progress = page.locator('[data-slot="reading-progress"]');
		await expect(progress).toHaveCount(1);
		const progressColor = await progress.evaluate(
			(node) => getComputedStyle(node).backgroundColor,
		);
		expect(progressColor).toBe(
			await page.locator("body").evaluate((node) => getComputedStyle(node).color),
		);
		await expect
			.poll(() =>
				progress.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).a),
			)
			.toBeGreaterThan(0);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
			"content",
			"https://yaschet.com",
		);
		await page.evaluate(() => scrollTo(0, 0));
		await page.screenshot({ path: info.outputPath(`hero-${theme}.png`) });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true,
		);
	});

	test(`a slow real link uses the shared spinner without losing balanced padding in ${theme}`, async ({
		page,
	}) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		let release = () => {};
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		await page.route("**/*", async (route) => {
			const url = new URL(route.request().url());
			if (url.pathname !== "/contact" || !url.searchParams.has("_rsc"))
				return route.continue();
			if (route.request().headers()["next-router-prefetch"]) return route.abort();
			await gate;
			await route.continue();
		});
		await page.goto("/");
		const link = page.getByRole("link", { name: "Email", exact: true }).first();
		const initial = await link.boundingBox();
		try {
			await link.click();
			await expect(link.locator("[data-loading]")).toHaveCount(1);
			await expect(link.locator('[aria-busy="true"]')).toHaveCount(1);
			await expect
				.poll(async () => (await link.boundingBox())?.width ?? 0)
				.toBeGreaterThan(initial?.width ?? 0);
			const spacing = await link.evaluate((node) => {
				const outer = node.getBoundingClientRect();
				const inner = node
					.querySelector(".foundation-button-pending")
					?.getBoundingClientRect();
				return inner ? [inner.left - outer.left, outer.right - inner.right] : [];
			});
			expect(spacing).toHaveLength(2);
			expect(spacing[0]).toBeCloseTo(spacing[1], 0);
			await expect(link).toHaveAccessibleName("Email");
		} finally {
			release();
		}
		await expect(page).toHaveURL(/\/contact$/);
		await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeVisible();
	});
}
