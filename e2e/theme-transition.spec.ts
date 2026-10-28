import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`theme uses one native material transition from ${theme}`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.addInitScript(() => {
			type ThemeSurface = HTMLElement & {
				startViewTransition?: Document["startViewTransition"];
			};
			const observe = (
				scope: Document | HTMLElement,
				start: Document["startViewTransition"],
				update: Parameters<Document["startViewTransition"]>[0],
			) => {
				const transition = start.call(
					scope,
					typeof update === "function"
						? async () => {
								await update();
								document.documentElement.dataset.themeCommitGuard = String(
									document.documentElement.dataset.themeUpdating === "true" &&
										getComputedStyle(document.body).transitionDuration === "0s",
								);
								const icon = document.querySelector(".theme-toggle .t-icon");
								if (icon)
									document.documentElement.dataset.themeIconMotion =
										getComputedStyle(icon).transitionProperty;
							}
						: update,
				);
				void transition.ready
					.then(() => {
						for (const animation of document.getAnimations()) {
							if (
								animation instanceof CSSAnimation &&
								animation.animationName === "theme-surface-in"
							) {
								animation.pause();
								animation.currentTime = 120;
							}
						}
						const root = document.documentElement;
						const source = scope instanceof Document ? root : scope;
						const next = getComputedStyle(source, "::view-transition-new(root)");
						const previous = getComputedStyle(source, "::view-transition-old(root)");
						const nav = document.querySelector('[aria-label="Main navigation"]');
						const interactive = [...(nav?.querySelectorAll("a,button") ?? [])].every(
							(node) => {
								const box = node.getBoundingClientRect();
								return node.contains(
									document.elementFromPoint(
										box.x + box.width / 2,
										box.y + box.height / 2,
									),
								);
							},
						);
						root.dataset.themeCapture = JSON.stringify({
							dark: root.classList.contains("dark"),
							animation: next.animationName,
							duration: next.animationDuration,
							previousAnimation: previous.animationName,
							previousOpacity: previous.opacity,
							blend: next.mixBlendMode,
							interactive,
							scope: scope instanceof Document ? "document" : "element",
						});
					})
					.catch(() => {});
				return transition;
			};
			const documentStart = document.startViewTransition;
			document.startViewTransition = (update) => observe(document, documentStart, update);
			const prototype = HTMLElement.prototype as ThemeSurface;
			const elementStart = prototype.startViewTransition;
			if (elementStart)
				prototype.startViewTransition = function (update) {
					return observe(this, elementStart, update);
				};
		});
		await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
		await page.goto("/");
		const root = page.locator("html");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await nav.getByRole("button", { name: /^Theme:/ }).click();
		await expect(root).toHaveAttribute("data-theme-capture");
		const capture = JSON.parse((await root.getAttribute("data-theme-capture")) ?? "{}");
		expect(capture).toEqual({
			dark: theme === "light",
			animation: "theme-surface-in",
			duration: "0.24s",
			previousAnimation: "none",
			previousOpacity: "1",
			blend: "normal",
			interactive: capture.scope === "element",
			scope: capture.scope,
		});
		await expect(root).toHaveAttribute("data-theme-commit-guard", "true");
		await expect(root).toHaveAttribute("data-theme-icon-motion", /opacity.*transform/);
		await page.screenshot({ path: test.info().outputPath("theme-midpoint.png") });
		await page.evaluate(() => {
			for (const animation of document.getAnimations())
				if (
					animation instanceof CSSAnimation &&
					animation.animationName === "theme-surface-in"
				)
					animation.finish();
		});
		await nav.getByRole("link", { name: "About", exact: true }).hover();
		await expect(page.getByRole("tooltip")).toHaveAccessibleName("About");
		await nav.getByRole("link", { name: "About", exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(root).not.toHaveAttribute("data-theme-transition");
		await expect(root).not.toHaveAttribute("data-theme-updating");
		expect(errors).toEqual([]);
	});

	test(`rapid native theme reversals retain the requested destination from ${theme}`, async ({
		page,
	}) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
		await page.goto("/");
		const toggle = page.getByRole("button", { name: /^Theme:/ });
		await expect(toggle).toBeVisible();
		// Both requests arrive before the browser runs its first snapshot callback.
		await toggle.evaluate((button) => {
			for (let index = 0; index < 2; index++)
				button.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
		});
		await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition");
		await expect(page.locator("html")).not.toHaveAttribute("data-theme-updating");
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(theme);
		await page.reload();
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		expect(errors).toEqual([]);
	});

	test(`a long case study changes theme at its current scroll position from ${theme}`, async ({
		page,
	}) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
		await page.goto("/case-studies/clearway-phoenix");
		const scroll = await page.evaluate(() => {
			type ThemeScope = {
				startViewTransition?: (update: () => void) => ViewTransition;
			};
			const surface = document.querySelector<HTMLElement>(".portfolio-theme-surface") as
				| (HTMLElement & ThemeScope)
				| null;
			const scope: ThemeScope = surface?.startViewTransition ? surface : document;
			const start = scope.startViewTransition;
			if (!start) throw new Error("Native capture is unavailable in this test browser");
			scope.startViewTransition = (update) => {
				const transition = start.call(scope, update);
				void transition.ready
					.then(() => {
						document.documentElement.dataset.articleThemeCapture = "ready";
					})
					.catch(() => {
						document.documentElement.dataset.articleThemeCapture = "failed";
					});
				return transition;
			};
			scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: "instant" });
			return scrollY;
		});
		expect(scroll).toBeGreaterThan(500);
		await page.getByRole("button", { name: /^Theme:/ }).click();
		await expect(page.locator("html")).toHaveAttribute("data-article-theme-capture", "ready");
		await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition");
		await expect(page.locator("html")).toHaveClass(
			new RegExp(`\\b${theme === "light" ? "dark" : "light"}\\b`),
		);
		expect(Math.abs((await page.evaluate(() => scrollY)) - scroll)).toBeLessThan(2);
		expect(errors).toEqual([]);
	});
}

test("older engines retain the native document crossfade", async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem("theme", "light");
		Object.defineProperty(HTMLElement.prototype, "startViewTransition", {
			value: undefined,
			configurable: true,
		});
		const start = document.startViewTransition.bind(document);
		document.startViewTransition = (update) => {
			const transition = start(update);
			void transition.ready
				.then(() => {
					document.documentElement.dataset.documentThemeAnimation = getComputedStyle(
						document.documentElement,
						"::view-transition-new(root)",
					).animationName;
				})
				.catch(() => {});
			return transition;
		};
	});
	await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "light" });
	await page.goto("/");
	await page.getByRole("button", { name: /^Theme:/ }).click();
	await expect(page.locator("html")).toHaveAttribute(
		"data-document-theme-animation",
		"theme-surface-in",
	);
	await expect(page.locator("html")).toHaveClass(/\bdark\b/);
	await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition");
});

for (const fallback of ["keyboard", "reduced", "unavailable", "dialog", "rejected"] as const) {
	test(`theme remains atomic and usable with ${fallback} capture`, async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.addInitScript((mode) => {
			localStorage.setItem("theme", "light");
			// Exercise the document fallback, including its asynchronous capture rejection.
			Object.defineProperty(HTMLElement.prototype, "startViewTransition", {
				value: undefined,
				configurable: true,
			});
			document.startViewTransition = (update) => {
				document.documentElement.dataset.snapshotAttempted = "true";
				if (mode !== "rejected") throw new Error("This interaction must not capture");
				// A real transition with duplicate names rejects its ready promise asynchronously.
				for (let index = 0; index < 2; index++) {
					const duplicate = document.createElement("div");
					duplicate.style.cssText = "view-transition-name:duplicate;width:1px;height:1px";
					document.body.append(duplicate);
				}
				return nativeStart(update);
			};
			const nativeStart = Document.prototype.startViewTransition.bind(document);
			if (mode === "unavailable")
				Object.defineProperty(document, "startViewTransition", { value: undefined });
		}, fallback);
		await page.emulateMedia({
			reducedMotion: fallback === "reduced" ? "reduce" : "no-preference",
			colorScheme: "light",
		});
		await page.goto("/");
		if (fallback === "dialog")
			await page.evaluate(() => {
				const dialog = document.createElement("div");
				dialog.setAttribute("role", "dialog");
				document.body.append(dialog);
			});
		const toggle = page.getByRole("button", { name: /^Theme:/ });
		if (fallback === "keyboard") {
			await toggle.focus();
			await page.keyboard.press("Enter");
		} else await toggle.click();
		await expect(page.locator("html")).toHaveClass(/\bdark\b/);
		await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition");
		await expect(page.locator("html")).not.toHaveAttribute("data-theme-updating");
		if (fallback !== "rejected")
			await expect(page.locator("html")).not.toHaveAttribute("data-snapshot-attempted");
		expect(errors).toEqual([]);
	});
}
