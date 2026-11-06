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

async function readRootSnapshotStyles(page: Page) {
	return page.evaluate(() => ({
		scrollY,
		colorScheme: getComputedStyle(document.documentElement).colorScheme,
		parts: [
			"view-transition",
			"view-transition-group(root)",
			"view-transition-image-pair(root)",
			"view-transition-old(root)",
		].map((part) => {
			const style = getComputedStyle(document.documentElement, `::${part}`);
			return {
				part,
				width: style.width,
				height: style.height,
				top: style.top,
				left: style.left,
				position: style.position,
				transform: style.transform,
				opacity: style.opacity,
				display: style.display,
				visibility: style.visibility,
				objectFit: style.objectFit,
				objectPosition: style.objectPosition,
				animationPlayState: style.animationPlayState,
			};
		}),
	}));
}

let nativeBitmapCapture = true;

test.beforeAll(async ({ browser, browserName }, testInfo) => {
	if (browserName !== "firefox") return;
	// Playwright's Firefox backend uses drawSnapshot, which can omit active
	// View Transitions: https://bugzilla.mozilla.org/show_bug.cgi?id=2008417.
	// Probe a standalone document so an application regression cannot cause a skip.
	const probe = await browser.newPage({ viewport: { width: 800, height: 600 } });
	try {
		await probe.setContent(`<!doctype html><style>
			html { background: white; }
			::view-transition-group(root) { animation: none; }
			::view-transition-old(root) { animation: hold 1s linear infinite paused; }
			::view-transition-new(root) { display: none; }
			@keyframes hold { from { opacity: 1; } to { opacity: 1; } }
		</style><div id="probe" style="position:fixed;left:8px;top:24px;width:80px;height:40px;background:#f0f"></div>`);
		const expected = [{ x: 8, y: 24, width: 80, height: 40 }];
		expect(
			await readSnapshotMarkers(probe, testInfo.outputPath("capture-probe-before.png")),
		).toEqual(expected);
		await probe.evaluate(async () => {
			await document.startViewTransition(() => document.getElementById("probe")?.remove())
				.ready;
		});
		expect(await probe.locator("#probe").count()).toBe(0);
		expect(
			await probe.evaluate(() => {
				const old = getComputedStyle(
					document.documentElement,
					"::view-transition-old(root)",
				);
				const hold = document
					.getAnimations()
					.find(
						(animation) =>
							animation instanceof CSSAnimation && animation.animationName === "hold",
					);
				return {
					width: old.width,
					height: old.height,
					opacity: old.opacity,
					state: old.animationPlayState,
					active: hold?.playState === "paused" && hold.currentTime === 0,
				};
			}),
		).toEqual({ width: "800px", height: "600px", opacity: "1", state: "paused", active: true });
		const captured = await readSnapshotMarkers(
			probe,
			testInfo.outputPath("capture-probe-active.png"),
		);
		if (captured.length) expect(captured).toEqual(expected);
		nativeBitmapCapture = captured.length > 0;
		await testInfo.attach("firefox-native-bitmap-capability", {
			body: JSON.stringify({
				supported: nativeBitmapCapture,
				issue: "https://bugzilla.mozilla.org/show_bug.cgi?id=2008417",
			}),
			contentType: "application/json",
		});
	} finally {
		await probe.close();
	}
});

for (const theme of ["light", "dark"] as const) {
	for (const route of ["/", "/case-studies/clearway-phoenix"]) {
		test(`theme changes preserve viewport pixels on ${route} from ${theme}`, async ({
			page,
			isMobile,
		}, testInfo) => {
			test.slow();
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			await page.addInitScript(() => {
				document.addEventListener(
					"DOMContentLoaded",
					() => {
						document.documentElement.dataset.themeSnapshotAttempts ??= "0";
					},
					{ once: true },
				);
				const start = document.startViewTransition.bind(document);
				document.startViewTransition = (update) => {
					const root = document.documentElement;
					root.dataset.themeSnapshotAttempts = String(
						Number(root.dataset.themeSnapshotAttempts ?? "0") + 1,
					);
					const transition = start(async () => {
						if (typeof update !== "function")
							throw new Error("Expected a theme update callback");
						await update();
						document.querySelector("[data-theme-snapshot-marker]")?.remove();
					});
					void transition.ready
						.then(() => {
							for (const animation of document.getAnimations()) {
								if (
									animation instanceof CSSAnimation &&
									animation.animationName === "theme-surface-out"
								) {
									animation.currentTime = 0;
								}
							}
							root.dataset.snapshotReady = "true";
						})
						.catch((error) => {
							root.dataset.snapshotError = String(error);
						});
					return transition;
				};
			});
			await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
			const placeMarkers = () =>
				page.evaluate(() => {
					if (!document.querySelector(".portfolio-theme-surface"))
						throw new Error("The portfolio surface is missing");
					// A fixed live layer preserves all viewport edges without changing the
					// article dock's in-flow geometry or extending the document's scroll range.
					const layer = document.createElement("div");
					layer.dataset.themeSnapshotMarker = "true";
					layer.style.cssText =
						"position:fixed;inset:0;z-index:100000;pointer-events:none";
					document.body.append(layer);
					const markers = [
						{ x: 8, y: 24, width: 80, height: 40 },
						{ x: 8, y: Math.floor(innerHeight / 2), width: 80, height: 40 },
						// Keep the bottom-edge probe clear of the local development toolbar.
						{ x: 8, y: innerHeight - 24, width: 8, height: 16 },
					];
					for (const box of markers) {
						const marker = document.createElement("div");
						marker.style.cssText = `position:absolute;left:${box.x}px;top:${box.y}px;width:${box.width}px;height:${box.height}px;background:#f0f`;
						layer.append(marker);
					}
					return markers;
				});
			const measureLayout = () =>
				page.evaluate(() => ({
					scrollX,
					scrollY,
					width: document.documentElement.clientWidth,
					height: document.documentElement.scrollHeight,
				}));
			for (const width of isMobile ? [393] : [1200, 600]) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(route);
				const toggle = page.getByRole("button", { name: /^Theme: Switch/ });
				await expect(toggle).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				// Establish the reading position after streaming and scroll restoration.
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
				// Compact article navigation is in flow; measure from its reachable position.
				await toggle.scrollIntoViewIfNeeded();
				const expected = await placeMarkers();
				const layout = await measureLayout();
				expect(layout.scrollY).toBeGreaterThan(500);
				const footer = await page.locator("footer").boundingBox();
				expect(
					await readSnapshotMarkers(page, testInfo.outputPath(`${width}-before.png`)),
				).toEqual(expected);
				await toggle.click();
				const root = page.locator("html");
				await expect(root).toHaveClass(
					new RegExp(`\\b${theme === "light" ? "dark" : "light"}\\b`),
				);
				await expect(root).not.toHaveAttribute("data-theme-updating");
				// Reading changes are live and atomic: native capture must never be attempted.
				for (const sample of [0, 1, 2]) {
					await expect(root).toHaveAttribute("data-theme-snapshot-attempts", "0");
					await expect(root).not.toHaveAttribute("data-snapshot-ready");
					await expect(root).not.toHaveAttribute("data-theme-transition");
					await expect(page.locator("[data-theme-snapshot-marker]")).toHaveCount(1);
					expect(
						await readSnapshotMarkers(
							page,
							testInfo.outputPath(`${width}-instant-${sample}.png`),
						),
						`${width}px ${route}: a live theme change must preserve every viewport marker`,
					).toEqual(expected);
					expect(await measureLayout()).toEqual(layout);
					expect(await page.locator("footer").boundingBox()).toEqual(footer);
				}
				await page.evaluate(() =>
					document.querySelector("[data-theme-snapshot-marker]")?.remove(),
				);
				if (route !== "/") continue;
				if (!nativeBitmapCapture) {
					testInfo.annotations.push({
						type: "native-opening-bitmap",
						description:
							"Not captured: the independent Firefox drawSnapshot probe omits active View Transitions (Mozilla 2008417). Scrolled live-theme geometry was verified.",
					});
					continue;
				}

				// The opening still uses a native fade. Extend only its real duration,
				// retaining changing opacity and strict outgoing bitmap geometry checks.
				await expect
					.poll(() =>
						page.evaluate(() => {
							scrollTo({ left: 0, top: 0, behavior: "instant" });
							return [scrollX, scrollY];
						}),
					)
					.toEqual([0, 0]);
				const geometryStyle = await page.addStyleTag({
					content:
						":root[data-theme-transition]::view-transition-old(root) { animation-duration: 600s !important; }",
				});
				const openingMarkers = await placeMarkers();
				const openingLayout = await measureLayout();
				const openingFooter = await page.locator("footer").boundingBox();
				expect(
					await readSnapshotMarkers(
						page,
						testInfo.outputPath(`${width}-opening-before.png`),
					),
				).toEqual(openingMarkers);
				await toggle.click();
				await expect(root).toHaveAttribute("data-theme-snapshot-attempts", "1");
				await expect(root).toHaveAttribute("data-snapshot-ready", "true");
				await expect(root).toHaveAttribute("data-theme-transition", "true");
				await expect(page.locator("[data-theme-snapshot-marker]")).toHaveCount(0);
				await expect
					.poll(() =>
						page.evaluate(() =>
							document
								.getAnimations()
								.some(
									(animation) =>
										animation instanceof CSSAnimation &&
										animation.animationName === "theme-surface-out" &&
										animation.playState === "running",
								),
						),
					)
					.toBe(true);
				for (const time of [0, 120, 239]) {
					await page.evaluate((time) => {
						for (const animation of document.getAnimations())
							if (
								animation instanceof CSSAnimation &&
								animation.animationName === "theme-surface-out"
							)
								animation.currentTime = time;
					}, time);
					await expect(root).toHaveAttribute("data-theme-transition", "true");
					await testInfo.attach(`${width}-opening-${time}ms-root-styles`, {
						body: JSON.stringify(await readRootSnapshotStyles(page), null, 2),
						contentType: "application/json",
					});
					expect(
						await readSnapshotMarkers(
							page,
							testInfo.outputPath(`${width}-opening-${time}ms.png`),
						),
						`${width}px Home opening at ${time}ms: captured pixels must not shift, scale or clip`,
					).toEqual(openingMarkers);
					expect(await measureLayout()).toEqual(openingLayout);
					expect(await page.locator("footer").boundingBox()).toEqual(openingFooter);
				}
				await page.evaluate(() => {
					for (const animation of document.getAnimations())
						if (
							animation instanceof CSSAnimation &&
							animation.animationName === "theme-surface-out"
						)
							animation.finish();
				});
				await expect(root).not.toHaveAttribute("data-theme-transition");
				await expect(root).toHaveClass(new RegExp(`\\b${theme}\\b`));
				await geometryStyle.evaluate((node) => node.parentNode?.removeChild(node));
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
			test.skip(
				!nativeBitmapCapture,
				"Standalone capture probe confirms drawSnapshot omits active View Transitions (Mozilla 2008417); Firefox lifecycle and DOM geometry remain covered.",
			);
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
			await page.setViewportSize({ width: isMobile ? 393 : 1200, height: 900 });
			await page.goto("/");
			const nav = page.getByRole("navigation", { name: "Main navigation" });
			await expect(nav).toBeVisible();
			test.skip(
				!(await page.evaluate(() => Boolean(document.startViewTransition))),
				"Native view transitions are unavailable",
			);
			await nav.getByRole("link", { name: "About", exact: true }).click();
			await expect(
				page.getByRole("heading", { name: "I’m Yassine.", exact: true }),
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
				// Isolate bitmap geometry from fade timing, as with theme captures.
				// The native captured pixels must still match all three live markers.
				const captureStyle = await page.addStyleTag({
					content:
						":root[data-route-transition]::view-transition-old(root) { opacity: 1 !important; animation-play-state: paused !important; }",
				});
				await page.emulateMedia({ reducedMotion: "no-preference" });
				const leave = nav.getByRole("link", { name: destination, exact: true });
				if (isMobile) {
					// Compact article navigation is intentionally in flow. Exercise its real
					// navigation handler without auto-scrolling away from the measured pixels;
					// physical reachability is covered by mobile-reading-navigation.spec.ts.
					await leave.evaluate((link) => (link as HTMLAnchorElement).click());
				} else await leave.click();
				await expect(page).toHaveURL(destination === "Home" ? /\/$/ : /\/about$/);
				await expect(page.locator("html")).toHaveAttribute(
					"data-route-snapshot-ready",
					"true",
				);
				await expect(page.locator("html")).toHaveAttribute("data-route-transition", "true");
				expect(await page.locator("[data-route-snapshot-marker]").count()).toBe(0);
				await testInfo.attach(`${position}-capture-styles`, {
					body: JSON.stringify(
						await page.evaluate(() =>
							["group", "image-pair", "old"].map((part) => {
								const style = getComputedStyle(
									document.documentElement,
									`::view-transition-${part}(root)`,
								);
								return {
									part,
									width: style.width,
									height: style.height,
									opacity: style.opacity,
									display: style.display,
									visibility: style.visibility,
									animationPlayState: style.animationPlayState,
								};
							}),
						),
						null,
						2,
					),
					contentType: "application/json",
				});
				expect(
					await readSnapshotMarkers(page, testInfo.outputPath(`${position}-capture.png`)),
					`${position}: outgoing pixels must keep their size and viewport position after Next resets scroll`,
				).toEqual(expected);
				expect(await page.evaluate(() => scrollY)).toBe(0);
				await captureStyle.evaluate((node) => node.parentNode?.removeChild(node));
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
