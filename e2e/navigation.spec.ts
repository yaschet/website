import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`prefetched routes preserve state, history and monochrome chrome in ${theme}`, async ({
		page,
	}, testInfo) => {
		const errors: string[] = [];
		const prefetched = new Set<string>();
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("response", async (response) => {
			const url = new URL(response.url());
			if (url.searchParams.has("_rsc") && response.ok()) {
				await response.finished();
				prefetched.add(url.pathname);
			}
		});
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.addInitScript(() => {
			const start = document.startViewTransition;
			if (start)
				document.startViewTransition = (update) => {
					const route = Boolean(document.documentElement.dataset.routeTransition);
					const transition = start.call(document, update);
					if (route)
						void transition.ready
							.then(() => {
								document.documentElement.dataset.pageTransitionCount = String(
									Number(
										document.documentElement.dataset.pageTransitionCount ?? 0,
									) + 1,
								);
							})
							.catch(() => {});
					return transition;
				};
		});

		await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		const header = page.locator("#header");
		const headerNode = await header.elementHandle();
		const navNode = await nav.elementHandle();
		const marquee = page.getByRole("button", { name: /^Highlights:/ });
		await marquee.click();
		await expect(marquee).toHaveAttribute("aria-pressed", "true");
		const track = marquee.locator(".portfolio-marquee-track");
		const position = await track.evaluate((node) => getComputedStyle(node).transform);
		await expect
			.poll(
				() =>
					["/about", "/case-studies", "/blog", "/contact"].every((path) =>
						prefetched.has(path),
					),
				{ timeout: 15000 },
			)
			.toBe(true);
		await nav.evaluate((node) => {
			new MutationObserver((records) => {
				document.documentElement.dataset.navigationLoadingFlashes = String(records.length);
			}).observe(node, {
				subtree: true,
				attributes: true,
				attributeFilter: ["data-loading"],
			});
		});
		// Once the shells are prefetched, primary destinations must render without another round trip.
		await page.route("**/*", (route) =>
			route.request().url().includes("_rsc") ? route.abort() : route.continue(),
		);
		for (const [name, path] of [
			["About", "/about"],
			["Case Studies", "/case-studies"],
			["Blog", "/blog"],
			["Contact", "/contact"],
		]) {
			await nav.getByRole("link", { name, exact: true }).click();
			await expect(page).toHaveURL(new RegExp(`${path}$`));
			await expect(
				page.locator("main:visible").getByRole("heading", { level: 1 }),
			).toBeVisible();
			await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
				"aria-current",
				"page",
			);
			await expect(marquee).toHaveAttribute("aria-pressed", "true");
			expect(await track.evaluate((node) => getComputedStyle(node).transform)).toBe(position);
			expect(
				await headerNode?.evaluate((node) => node === document.getElementById("header")),
			).toBe(true);
			expect(
				await navNode?.evaluate(
					(node) => node === document.querySelector('[aria-label="Main navigation"]'),
				),
			).toBe(true);
			await expect(page.getByRole("status", { name: "Loading page" })).toHaveCount(0);
		}
		await expect(page.locator("html")).not.toHaveAttribute("data-navigation-loading-flashes");
		await expect
			.poll(async () =>
				Number(await page.locator("html").getAttribute("data-page-transition-count")),
			)
			.toBeGreaterThan(0);
		await expect(page.locator("html")).not.toHaveAttribute("data-route-transition");
		await expect(nav).toHaveCSS("view-transition-name", "none");
		await expect(header).toHaveCSS("view-transition-name", "none");
		await page.goBack();
		await expect(page).toHaveURL(/\/blog$/);
		await page.goForward();
		await expect(page).toHaveURL(/\/contact$/);
		await nav.getByRole("link", { name: "About", exact: true }).focus();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/about$/);
		await expect(page.locator("html")).toHaveAttribute("data-navigation-input", "keyboard");
		const colors = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			const sample = document.createElement("span");
			sample.style.color = "var(--accent)";
			document.body.append(sample);
			const color = getComputedStyle(sample).color;
			sample.remove();
			return { color, native: style.accentColor, scheme: style.colorScheme };
		});
		expect(colors.native).toBe(colors.color);
		expect(colors.scheme).toBe(theme);
		expect(colors.color).not.toMatch(/145\)/);
		await page.screenshot({ path: testInfo.outputPath(`navigation-${theme}.png`) });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await nav.getByRole("link", { name: "Home", exact: true }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(marquee).toHaveAttribute("aria-pressed", "true");
		expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(
			1,
		);
		expect(errors).toEqual([]);
	});
}

test("a case study is prefetched with its content and back restores the listing", async ({
	page,
}) => {
	const prefetched = new Set<string>();
	page.on("response", async (response) => {
		const url = new URL(response.url());
		if (url.searchParams.has("_rsc") && response.ok()) {
			await response.finished();
			prefetched.add(url.pathname);
		}
	});
	await page.goto("/");
	await page.evaluate(() => document.fonts.ready);
	const card = page.getByRole("link", {
		name: "Document Translation With Editable Tables",
		exact: true,
	});
	await card.scrollIntoViewIfNeeded();
	await expect.poll(() => prefetched.has("/case-studies/verto"), { timeout: 15000 }).toBe(true);
	const scroll = await page.evaluate(() => window.scrollY);
	await page.route("**/*", (route) =>
		route.request().url().includes("_rsc") ? route.abort() : route.continue(),
	);
	await card.click();
	await expect(page).toHaveURL(/\/case-studies\/verto$/);
	await expect(
		page.locator("main:visible").getByRole("heading", {
			name: "Document Translation With Editable Tables",
			exact: true,
		}),
	).toBeVisible();
	await page.goBack();
	await expect(page).toHaveURL(/\/$/);
	await expect(card).toBeVisible();
	await expect
		.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - scroll))
		.toBeLessThan(2);
});
