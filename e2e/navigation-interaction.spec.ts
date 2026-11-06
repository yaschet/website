import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	for (const capture of ["native", "cancelled"] as const) {
		test(`navigation and theme changes accept hover with ${capture} capture in ${theme}`, async ({
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
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			await page.addInitScript((capture) => {
				const sample = (surface: HTMLElement) => {
					document.documentElement.dataset.liveTransitionOpaque = String(
						getComputedStyle(surface).opacity === "1" &&
							document.documentElement.dataset.liveTransitionOpaque !== "false",
					);
					const nav = document.querySelector('[aria-label="Main navigation"]');
					const targets = nav?.querySelectorAll("a,button") ?? [];
					const interactive =
						targets.length > 0 &&
						[...targets].every((node) => {
							const box = node.getBoundingClientRect();
							return node.contains(
								document.elementFromPoint(
									box.x + box.width / 2,
									box.y + box.height / 2,
								),
							);
						});
					document.documentElement.dataset.liveTransitionHits = String(
						interactive &&
							document.documentElement.dataset.liveTransitionHits !== "false",
					);
					document.documentElement.dataset.liveTransitionSamples = String(
						Number(document.documentElement.dataset.liveTransitionSamples ?? 0) + 1,
					);
				};
				const start = document.startViewTransition;
				if (start)
					document.startViewTransition = (update) => {
						const route = Boolean(document.documentElement.dataset.routeTransition);
						const transition = start.call(document, update);
						const surface = document.querySelector<HTMLElement>(".portfolio-scene");
						if (route && surface)
							void transition.ready.then(
								() => {
									document.documentElement.dataset.liveTransitionMode =
										"captured";
									sample(surface);
								},
								async () => {
									// Capture can be cancelled by the pending deadline or viewport changes.
									// Verify the live fallback after its update completes as well.
									await transition.finished.catch(() => {});
									document.documentElement.dataset.liveTransitionMode =
										"fallback";
									sample(surface);
								},
							);
						if (route && capture === "cancelled") transition.skipTransition();
						return transition;
					};
			}, capture);
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
			await page.goto("/");
			const nav = page.getByRole("navigation", { name: "Main navigation" });
			await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
			const about = nav.getByRole("link", { name: "About", exact: true });
			const contact = nav.getByRole("link", { name: "Contact", exact: true });
			const home = nav.getByRole("link", { name: "Home", exact: true });
			// Prefetch the destination, while allowing the native capture to fall back
			// on a busy runner. Both paths must leave the navigation interactive.
			await expect.poll(() => prefetched.has("/about"), { timeout: 15000 }).toBe(true);
			await about.click();
			await expect(page).toHaveURL(/\/about$/);
			await expect(page.locator("html")).toHaveAttribute(
				"data-live-transition-mode",
				capture === "cancelled" ? "fallback" : /^(captured|fallback)$/,
			);
			await expect(page.locator("html")).toHaveAttribute("data-live-transition-hits", "true");
			await expect(page.locator("html")).toHaveAttribute(
				"data-live-transition-opaque",
				"true",
			);
			await contact.hover();
			await expect(page.getByRole("tooltip")).toHaveAccessibleName("Contact");
			await nav.getByRole("button", { name: /^Theme:/ }).click();
			await expect(page.locator("html")).toHaveAttribute("data-live-transition-hits", "true");
			await home.hover();
			await expect(page.getByRole("tooltip")).toHaveAccessibleName("Home");
			await home.click();
			await expect(page).toHaveURL(/\/$/);
			await about.hover();
			await expect(page.getByRole("tooltip")).toHaveAccessibleName("About");
			await expect(about).not.toHaveAttribute("aria-current");
			await expect(page.locator("html")).toHaveAttribute("data-live-transition-hits", "true");
			await expect(page.locator("html")).toHaveAttribute(
				"data-live-transition-opaque",
				"true",
			);
		});
	}

	test(`rapid navigation and theme changes stay usable when snapshot capture fails in ${theme}`, async ({
		page,
	}) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (
				message.type() === "error" &&
				/InvalidStateError|Snapshot capture failed/.test(message.text())
			)
				errors.push(message.text());
		});
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.addInitScript(() => {
			// Reproduce an unavailable native capture path instead of requiring a flaky GPU failure.
			document.startViewTransition = () => {
				throw new DOMException("Snapshot capture failed", "InvalidStateError");
			};
		});
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
		const dockNode = await nav.elementHandle();
		const boxes = await nav.locator("a,button").evaluateAll((nodes) =>
			nodes.map((node) => {
				const box = node.getBoundingClientRect();
				return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
			}),
		);
		for (const index of [1, 4, 5, 3, 0, 2, 5, 1, 4, 0, 3, 5, 2, 1, 0, 4]) {
			await page.mouse.click(boxes[index].x, boxes[index].y);
			// Intentionally interrupt the 250ms arrival before it finishes.
			await page.waitForTimeout(35);
		}
		await expect(page).toHaveURL(/\/contact$/);
		await nav.getByRole("link", { name: "Home", exact: true }).hover();
		await expect(page.getByRole("tooltip")).toHaveAccessibleName("Home");
		await expect(nav.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			await dockNode?.evaluate(
				(node) => node === document.querySelector('[aria-label="Main navigation"]'),
			),
		).toBe(true);
		expect(errors).toEqual([]);
	});
}
