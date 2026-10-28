import { expect, type Page, test } from "@playwright/test";

/** Hold the first native callback so interruption happens before router dispatch. */
async function deferRouteCapture(page: Page) {
	await page.addInitScript(() => {
		type Surface = HTMLElement & {
			startViewTransition?: (update: () => void | Promise<void>) => ViewTransition;
		};
		const prototype = HTMLElement.prototype as Surface;
		const start = prototype.startViewTransition;
		let held = false;
		if (!start) return;
		prototype.startViewTransition = function (update) {
			if (held || !this.classList.contains("portfolio-scene"))
				return start.call(this, update);
			held = true;
			return start.call(this, async () => {
				document.documentElement.dataset.routeUpdateHeld = "true";
				await new Promise<void>((resolve) => {
					document.addEventListener("release-route-update", () => resolve(), {
						once: true,
					});
				});
				await update();
				document.documentElement.dataset.routeUpdateReleased = "true";
			});
		};
	});
}

for (const theme of ["light", "dark"] as const) {
	test(`outgoing and incoming pages share a scoped handoff in ${theme}`, async ({
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
			type Surface = HTMLElement & { startViewTransition?: Document["startViewTransition"] };
			const prototype = HTMLElement.prototype as Surface;
			const start = prototype.startViewTransition;
			if (!start) return;
			prototype.startViewTransition = function (update) {
				// Next retains inactive Activity trees; sample the visible route only.
				const activeHeading = () =>
					[...this.querySelectorAll("h1")].find((node) => node.getClientRects().length)
						?.textContent;
				const previous = activeHeading();
				const transition = start.call(this, update);
				if (!this.classList.contains("portfolio-scene")) return transition;
				void transition.ready
					.then(() => {
						for (const animation of document.getAnimations()) {
							if (
								animation instanceof CSSAnimation &&
								/^portfolio-(route|title|copy)-/.test(animation.animationName)
							) {
								animation.pause();
								animation.currentTime = 60;
							}
						}
						const old = getComputedStyle(this, "::view-transition-old(root)");
						const next = getComputedStyle(this, "::view-transition-new(root)");
						document.documentElement.dataset.routeCapture = JSON.stringify({
							previous,
							current: activeHeading(),
							exit: old.animationName,
							enter: next.animationName,
							exitDuration: old.animationDuration,
							enterDuration: next.animationDuration,
							blend: next.mixBlendMode,
							titleDelays: document
								.getAnimations()
								.filter(
									(animation) =>
										animation instanceof CSSAnimation &&
										animation.animationName === "portfolio-title-in",
								)
								.map((animation) => animation.effect?.getTiming().delay)
								.sort((a, b) => Number(a) - Number(b)),
						});
					})
					.catch((error) => {
						document.documentElement.dataset.routeCapture = JSON.stringify({
							error: error instanceof Error ? error.message : String(error),
						});
					});
				return transition;
			};
		});
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		const scene = page.locator(".portfolio-scene");
		test.skip(
			!(await scene.evaluate((node) => "startViewTransition" in node)),
			"Element-scoped capture is unavailable; fallback navigation is covered separately.",
		);
		await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
		await expect.poll(() => prefetched.has("/about"), { timeout: 15000 }).toBe(true);
		const dock = await nav.elementHandle();
		const header = await page.locator("#header").elementHandle();
		// Prime both destinations, then observe the real warm navigation.
		await nav.getByRole("link", { name: "About", exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(page.getByRole("heading", { name: "How I work.", exact: true })).toBeVisible();
		await nav.getByRole("link", { name: "Home", exact: true }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(
			page.getByRole("heading", { name: "Complex systems, clean interfaces.", exact: true }),
		).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		await expect(scene).not.toHaveAttribute("data-route-transition");
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.evaluate(() => {
			delete document.documentElement.dataset.routeCapture;
			return new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
			});
		});
		await nav.getByRole("link", { name: "About", exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(page.locator("html")).toHaveAttribute("data-route-capture");
		const capture = JSON.parse(
			(await page.locator("html").getAttribute("data-route-capture")) ?? "{}",
		);
		expect(capture).toEqual({
			previous: "Complex systems, clean interfaces.",
			current: "How I work.",
			exit: "portfolio-route-out",
			enter: "portfolio-route-in",
			exitDuration: "0.15s",
			enterDuration: "0.25s",
			blend: "normal",
			titleDelays: [0, 20, 40],
		});
		expect(
			await dock?.evaluate(
				(node) => node === document.querySelector('[aria-label="Main navigation"]'),
			),
		).toBe(true);
		expect(await header?.evaluate((node) => node === document.getElementById("header"))).toBe(
			true,
		);
		await page.screenshot({ path: testInfo.outputPath(`route-handoff-${theme}.png`) });
		// Interrupt the paused native transition with a real hover and another click.
		await nav.getByRole("link", { name: "Contact", exact: true }).hover();
		if (!testInfo.project.name.includes("mobile"))
			await expect(page.getByRole("tooltip")).toHaveAccessibleName("Contact");
		await nav.getByRole("link", { name: "Contact", exact: true }).click();
		await expect(page).toHaveURL(/\/contact$/);
		await nav.getByRole("button", { name: /^Theme:/ }).click();
		await expect(scene).not.toHaveAttribute("data-route-transition");
		await page.goBack();
		await expect(page).toHaveURL(/\/about$/);
		expect(errors).toEqual([]);
	});

	test(`a theme change preserves a link awaiting capture in ${theme}`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await deferRouteCapture(page);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const scene = page.locator(".portfolio-scene");
		test.skip(
			!(await scene.evaluate((node) => "startViewTransition" in node)),
			"Element-scoped capture is unavailable; fallback navigation is covered separately.",
		);
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
		await nav.getByRole("link", { name: "About", exact: true }).click();
		await expect(page.locator("html")).toHaveAttribute("data-route-update-held", "true");
		await nav.getByRole("button", { name: /^Theme:/ }).click();
		await page.evaluate(() => document.dispatchEvent(new Event("release-route-update")));
		await expect(page.locator("html")).toHaveAttribute("data-route-update-released", "true");
		await expect(page).toHaveURL(/\/about$/);
		await expect(scene).not.toHaveAttribute("data-route-transition");
		expect(errors).toEqual([]);
	});
}

for (const interruption of ["newer link", "history navigation"] as const) {
	test(`a ${interruption} supersedes a link awaiting capture`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await deferRouteCapture(page);
		await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
		await page.goto("/");
		const scene = page.locator(".portfolio-scene");
		test.skip(
			!(await scene.evaluate((node) => "startViewTransition" in node)),
			"Element-scoped capture is unavailable; fallback navigation is covered separately.",
		);
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
		if (interruption === "history navigation") {
			await nav.getByRole("link", { name: "About", exact: true }).click();
			await expect(page).toHaveURL(/\/about$/);
			await expect(page.locator("main:visible h1")).toBeVisible();
		}
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await nav.getByRole("link", { name: "Contact", exact: true }).click();
		await expect(page.locator("html")).toHaveAttribute("data-route-update-held", "true");
		if (interruption === "newer link")
			await nav.getByRole("link", { name: "About", exact: true }).click();
		else await page.goBack();
		await page.evaluate(() => document.dispatchEvent(new Event("release-route-update")));
		await expect(page.locator("html")).toHaveAttribute("data-route-update-released", "true");
		await expect(page).toHaveURL(interruption === "newer link" ? /\/about$/ : /\/$/);
		await expect(scene).not.toHaveAttribute("data-route-transition");
		expect(errors).toEqual([]);
	});
}

for (const failure of ["unsupported", "throw", "reject"] as const) {
	test(`route navigation survives ${failure} scoped capture`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.addInitScript((mode) => {
			type Surface = HTMLElement & { startViewTransition?: Document["startViewTransition"] };
			const prototype = HTMLElement.prototype as Surface;
			if (mode === "unsupported") {
				prototype.startViewTransition = undefined;
				return;
			}
			const original = prototype.startViewTransition;
			prototype.startViewTransition = function (update) {
				if (mode === "throw")
					throw new DOMException("Snapshot capture failed", "InvalidStateError");
				if (!original) throw new Error("Missing scoped API");
				const transition = original.call(this, update);
				transition.skipTransition();
				return transition;
			};
		}, failure);
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await nav.getByRole("link", { name: "About", exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(page.getByRole("heading", { name: "How I work.", exact: true })).toBeVisible();
		await nav.getByRole("link", { name: "Contact", exact: true }).click();
		await expect(page).toHaveURL(/\/contact$/);
		await expect(page.locator(".portfolio-scene")).not.toHaveAttribute("data-route-transition");
		expect(errors).toEqual([]);
	});
}
