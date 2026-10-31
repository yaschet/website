import { expect, type Page, test } from "@playwright/test";

/** Read the rendered bitmap: stable DOM rectangles do not prove a valid snapshot. */
async function readSnapshotMarkers(page: Page, path: string) {
	const screenshot = await page.screenshot({ path, scale: "css" });
	return page.evaluate(
		async (bytes) => {
			const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)]));
			const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
			const context = canvas.getContext("2d");
			if (!context) throw new Error("The pixel check requires a 2D canvas");
			context.drawImage(bitmap, 0, 0);
			const { data } = context.getImageData(0, 0, 100, bitmap.height);
			const markers: { x: number; y: number; width: number; height: number }[] = [];
			let previousRow = -2;
			for (let y = 0; y < bitmap.height; y++) {
				let left = 100;
				let right = -1;
				for (let x = 0; x < 100; x++) {
					const pixel = (y * 100 + x) * 4;
					if (data[pixel] > 240 && data[pixel + 1] < 15 && data[pixel + 2] > 240) {
						left = Math.min(left, x);
						right = Math.max(right, x);
					}
				}
				if (right < 0) continue;
				const previous = markers.at(-1);
				if (previous && previousRow === y - 1) previous.height++;
				else markers.push({ x: left, y, width: right - left + 1, height: 1 });
				previousRow = y;
			}
			bitmap.close();
			return markers;
		},
		[...screenshot],
	);
}

for (const theme of ["light", "dark"] as const) {
	for (const route of ["/", "/case-studies/clearway-phoenix"]) {
		test(`scrolled ${route} theme snapshot preserves all viewport edges from ${theme}`, async ({
			page,
			isMobile,
		}, testInfo) => {
			test.slow();
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			await page.addInitScript(() => {
				const start = document.startViewTransition.bind(document);
				document.startViewTransition = (update) => {
					const transition = start(update);
					void transition.ready.then(() => {
						for (const animation of document.getAnimations()) {
							if (
								animation instanceof CSSAnimation &&
								animation.animationName === "theme-surface-out"
							) {
								animation.pause();
								animation.currentTime = 0;
							}
						}
						document.documentElement.dataset.snapshotReady = "true";
					});
					return transition;
				};
			});
			await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
			for (const width of isMobile ? [393] : [1200, 600]) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(route);
				await expect(page.getByRole("button", { name: /^Theme: Switch/ })).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				// Establish the scrolled precondition after streaming and scroll restoration.
				await expect
					.poll(() =>
						page.evaluate(() => {
							scrollTo({
								top: document.documentElement.scrollHeight,
								behavior: "instant",
							});
							return scrollY;
						}),
					)
					.toBeGreaterThan(500);
				const expected = await page.evaluate(() => {
					const surface = document.querySelector(".portfolio-theme-surface");
					if (!surface) throw new Error("The portfolio surface is missing");
					const markers = [
						{ x: 8, y: 24, width: 80, height: 40 },
						{ x: 8, y: Math.floor(innerHeight / 2), width: 80, height: 40 },
						// Keep the bottom-edge probe clear of the local development toolbar.
						{ x: 8, y: innerHeight - 24, width: 8, height: 16 },
					];
					for (const box of markers) {
						const marker = document.createElement("div");
						marker.style.cssText = `position:absolute;z-index:100000;left:${box.x}px;top:${scrollY + box.y}px;width:${box.width}px;height:${box.height}px;background:#f0f`;
						surface.append(marker);
					}
					return markers;
				});
				const scroll = await page.evaluate(() => scrollY);
				expect(scroll).toBeGreaterThan(500);
				const footer = await page.locator("footer").boundingBox();
				expect(
					await readSnapshotMarkers(page, testInfo.outputPath(`${width}-before.png`)),
				).toEqual(expected);
				await page.getByRole("button", { name: /^Theme: Switch/ }).click();
				await expect(page.locator("html")).toHaveAttribute("data-snapshot-ready", "true");
				for (const time of [0, 120, 239]) {
					await page.evaluate((time) => {
						for (const animation of document.getAnimations())
							if (
								animation instanceof CSSAnimation &&
								animation.animationName === "theme-surface-out"
							)
								animation.currentTime = time;
					}, time);
					expect(
						await readSnapshotMarkers(
							page,
							testInfo.outputPath(`${width}-${time}ms.png`),
						),
						`${width}px ${route} at ${time}ms: captured pixels must not shift, scale or clip`,
					).toEqual(expected);
					expect(await page.locator("footer").boundingBox()).toEqual(footer);
					expect(await page.evaluate(() => scrollY)).toBe(scroll);
				}
				await page.evaluate(() => {
					for (const animation of document.getAnimations())
						if (
							animation instanceof CSSAnimation &&
							animation.animationName === "theme-surface-out"
						)
							animation.finish();
				});
				await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition");
				await expect(page.locator("html")).toHaveClass(
					new RegExp(`\\b${theme === "light" ? "dark" : "light"}\\b`),
				);
			}
			expect(errors).toEqual([]);
		});
	}
}

test("theme captures and long-to-short routes keep the viewport geometry", async ({
	page,
	isMobile,
}) => {
	await page.addInitScript(() => localStorage.setItem("theme", "light"));
	await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "light" });
	for (const width of isMobile ? [393] : [1000, 1320]) {
		await page.setViewportSize({ width, height: 1041 });
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		await expect(nav.getByRole("button", { name: /^Theme: Switch/ })).toBeVisible();
		const header = await page.locator("#header").boundingBox();
		const contentWidth = await page.evaluate(() => document.documentElement.clientWidth);
		for (const link of ["Blog", "Home"]) {
			await nav.getByRole("link", { name: link, exact: true }).click();
			await expect(page).toHaveURL(link === "Blog" ? /\/blog$/ : /\/$/);
			await expect(page.locator("html")).not.toHaveAttribute("data-route-transition");
			expect(await page.locator("#header").boundingBox()).toEqual(header);
			expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(
				contentWidth,
			);
			for (const theme of ["dark", "light"]) {
				const movement = await page.evaluate(async () => {
					const selectors = [
						"#header",
						".portfolio-scene",
						"h1",
						".portfolio-project-card img",
					];
					const measure = () =>
						selectors.flatMap((selector) => {
							const box = document.querySelector(selector)?.getBoundingClientRect();
							return box ? [box.x, box.y, box.width, box.height] : [];
						});
					const initial = measure();
					const toggle = document.querySelector<HTMLButtonElement>(".theme-toggle");
					if (!toggle) throw new Error("Theme control is missing");
					toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
					const end = performance.now() + 400;
					let delta = 0;
					do {
						await new Promise<void>((resolve) =>
							requestAnimationFrame(() => resolve()),
						);
						delta = Math.max(
							delta,
							...measure().map((value, index) => Math.abs(value - initial[index])),
						);
					} while (performance.now() < end);
					return delta;
				});
				expect(
					movement,
					`${width}px ${link}: theme must not move or resize content`,
				).toBeLessThan(0.1);
				await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
			}
		}
	}
});

for (const theme of ["light", "dark"] as const) {
	for (const destination of ["Home", "About"] as const) {
		test(`case-study snapshots retain viewport pixels when leaving for ${destination} in ${theme}`, async ({
			page,
			isMobile,
		}, testInfo) => {
			test.slow();
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			await page.addInitScript(() => {
				type Capture = (update: () => void | Promise<void>) => ViewTransition;
				const observe = (
					scope: Document | HTMLElement,
					start: Capture,
					update: () => void | Promise<void>,
				) => {
					const transition = start.call(scope, async () => {
						await update();
						// The markers must exist only in the outgoing bitmap, never in the live destination.
						for (const node of document.querySelectorAll(
							"[data-route-snapshot-marker]",
						))
							node.remove();
					});
					void transition.ready
						.then(() => {
							for (const animation of document.getAnimations()) {
								if (
									animation instanceof CSSAnimation &&
									/^portfolio-(route|title|copy)-/.test(animation.animationName)
								) {
									animation.pause();
									animation.currentTime = 0;
								}
							}
							document.documentElement.dataset.routeSnapshotReady = "true";
						})
						.catch((error) => {
							document.documentElement.dataset.routeSnapshotError = String(error);
						});
					return transition;
				};
				if (document.startViewTransition) {
					const start = document.startViewTransition;
					document.startViewTransition = (update) =>
						observe(document, start as Capture, update as () => void | Promise<void>);
				}
				// Also observe the previous element-scoped implementation so this regression fails before the fix.
				const prototype = HTMLElement.prototype as HTMLElement & {
					startViewTransition?: Capture;
				};
				const elementStart = prototype.startViewTransition;
				if (elementStart)
					prototype.startViewTransition = function (update) {
						return observe(this, elementStart, update);
					};
			});
			await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
			await page.setViewportSize({ width: isMobile ? 393 : 1000, height: 900 });
			await page.goto("/");
			const nav = page.getByRole("navigation", { name: "Main navigation" });
			await expect(nav).toBeVisible();
			test.skip(
				!(await page.evaluate(() => Boolean(document.startViewTransition))),
				"Native view transitions are unavailable",
			);
			await nav.getByRole("link", { name: "About", exact: true }).click();
			await expect(
				page.getByRole("heading", { name: "How I work.", exact: true }),
			).toBeVisible();
			for (const position of ["top", "middle", "footer"] as const) {
				await page.emulateMedia({ reducedMotion: "reduce" });
				await nav.getByRole("link", { name: "Home", exact: true }).click();
				await expect(page).toHaveURL(/\/$/);
				await page
					.getByRole("link", { name: "University Program Matching", exact: true })
					.click();
				await expect(page).toHaveURL(/\/case-studies\/clearway-phoenix$/);
				await expect(
					page.getByRole("heading", {
						name: "University Program Matching",
						exact: true,
						level: 1,
					}),
				).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				const expected = await page.evaluate((position) => {
					const surface = document.querySelector<HTMLElement>(".portfolio-scene");
					if (!surface) throw new Error("The route surface is missing");
					const top =
						position === "top"
							? 0
							: document.documentElement.scrollHeight *
								(position === "middle" ? 0.5 : 1);
					scrollTo({ top, behavior: "instant" });
					delete document.documentElement.dataset.routeSnapshotReady;
					delete document.documentElement.dataset.routeSnapshotError;
					const markers = [
						{ x: 8, y: 128, width: 40, height: 20 },
						{ x: 8, y: 432, width: 24, height: 12 },
						{ x: 8, y: 720, width: 12, height: 24 },
					];
					const origin = surface.getBoundingClientRect();
					for (const box of markers) {
						const marker = document.createElement("div");
						marker.dataset.routeSnapshotMarker = "true";
						marker.style.cssText = `position:absolute;z-index:100000;left:${box.x - origin.left}px;top:${box.y - origin.top}px;width:${box.width}px;height:${box.height}px;background:#f0f`;
						surface.append(marker);
					}
					return markers;
				}, position);
				expect(
					await readSnapshotMarkers(page, testInfo.outputPath(`${position}-before.png`)),
				).toEqual(expected);
				await page.emulateMedia({ reducedMotion: "no-preference" });
				await nav.getByRole("link", { name: destination, exact: true }).click();
				await expect(page).toHaveURL(destination === "Home" ? /\/$/ : /\/about$/);
				await expect(page.locator("html")).toHaveAttribute(
					"data-route-snapshot-ready",
					"true",
				);
				expect(await page.locator("[data-route-snapshot-marker]").count()).toBe(0);
				expect(
					await readSnapshotMarkers(page, testInfo.outputPath(`${position}-capture.png`)),
					`${position}: outgoing pixels must keep their size and viewport position after Next resets scroll`,
				).toEqual(expected);
				expect(await page.evaluate(() => scrollY)).toBe(0);
				await page.evaluate(() => {
					for (const animation of document.getAnimations())
						if (
							animation instanceof CSSAnimation &&
							/^portfolio-(route|title|copy)-/.test(animation.animationName)
						)
							animation.finish();
				});
				await expect(page.locator("html")).not.toHaveAttribute("data-route-transition");
				await expect(page.locator(".portfolio-scene")).not.toHaveAttribute(
					"data-route-transition",
				);
			}
			expect(errors).toEqual([]);
		});
	}
}
