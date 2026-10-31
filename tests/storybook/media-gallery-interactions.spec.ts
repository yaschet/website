import { expect, type Locator, type Page, test } from "@playwright/test";

async function drag(page: Page, surface: Locator, dx: number, dy = 0) {
	const box = await surface.boundingBox();
	if (!box) throw new Error("Expected a visible gallery surface");
	const width = page.viewportSize()?.width ?? box.x + box.width;
	const left = Math.max(0, box.x);
	const right = Math.min(width, box.x + box.width);
	const x = left + (right - left) * (Math.abs(dx) > box.width / 2 ? 0.8 : 0.5);
	const y = box.y + box.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(x + dx, y + dy, { steps: 12 });
	await page.mouse.up();
}

async function openGallery(page: Page, theme = "light") {
	await page.goto(
		`/iframe.html?id=components-media-mediagallery--with-per-image-captions&viewMode=story&globals=theme%3A${theme}`,
	);
	await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
	const opener = page.getByRole("button", { name: "Open slide 1 in expanded viewer" });
	await expect(opener.locator("img")).toHaveJSProperty("complete", true);
	await opener.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeVisible();
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	await expect
		.poll(() =>
			dialog
				.locator('.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)')
				.evaluate((node) => (node as HTMLImageElement).naturalWidth),
		)
		.toBeGreaterThan(0);
	return dialog;
}

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`inline dragging settles without opening the viewer at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=components-media-mediagallery--default&viewMode=story&globals=theme:${theme}`,
			);
			const gallery = page.locator('[aria-roledescription="carousel"]').first();
			await expect(gallery.getByText("Slide 1 of 4", { exact: true })).toBeAttached();
			await drag(page, gallery.locator("[data-gallery-slide]").first(), -width * 0.3);
			await expect(gallery.getByText("Slide 2 of 4", { exact: true })).toBeAttached();
			await expect(page.getByRole("dialog")).toHaveCount(0);
			await expect
				.poll(() =>
					gallery
						.locator("[data-gallery-slide]")
						.nth(1)
						.evaluate((node) =>
							Math.abs(
								node.getBoundingClientRect().left -
									(node.parentElement?.getBoundingClientRect().left ?? 0),
							),
						),
				)
				.toBeLessThan(1);
			await gallery.focus();
			await gallery.press("ArrowLeft");
			await expect(gallery.getByText("Slide 1 of 4", { exact: true })).toBeAttached();
		});

		test(`viewer swipes, zooms, pans and returns to its selected image at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			const dialog = await openGallery(page, theme);
			await expect(dialog).toHaveAccessibleName("Dashboard overview");
			const surface = dialog.locator(
				'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
			);
			await drag(page, surface, -width * 0.6);
			await expect(dialog).toHaveAccessibleName("Document Processing Pipeline");
			await expect(dialog.locator('[data-gallery-preview="1"]')).toHaveAttribute(
				"aria-current",
				"true",
			);
			const fitWidth = (await surface.boundingBox())?.width ?? 0;
			await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
			await expect(dialog.getByRole("button", { name: "Reset zoom to fit" })).toHaveText(
				"150%",
			);
			await expect
				.poll(async () => (await surface.boundingBox())?.width ?? 0)
				.toBeGreaterThan(fitWidth * 1.49);
			const beforePan = await surface.boundingBox();
			if (!beforePan) throw new Error("Expected the zoomed image");
			await drag(page, surface, -60);
			await expect(dialog).toHaveAccessibleName("Document Processing Pipeline");
			await expect
				.poll(async () => (await surface.boundingBox())?.x ?? 0)
				.toBeLessThan(beforePan.x - 10);
			await dialog.getByRole("button", { name: "Reset zoom to fit" }).click();
			await expect(dialog.getByRole("button", { name: "Reset zoom to fit" })).toHaveText(
				"Fit",
			);
			await dialog.getByRole("button", { name: "View slide 3: Billing overview" }).click();
			await expect(dialog).toHaveAccessibleName("Billing overview");
			expect(await dialog.evaluate((node) => node.scrollWidth <= innerWidth)).toBe(true);
			await page.screenshot({ path: testInfo.outputPath(`viewer-${width}-${theme}.png`) });
			await dialog.getByRole("button", { name: "Close expanded viewer" }).click();
			await expect(dialog).toHaveCount(0);
			const gallery = page.locator('[aria-roledescription="carousel"]').first();
			await expect(gallery).toBeFocused();
			await expect(gallery.getByText("Slide 3 of 3", { exact: true })).toBeAttached();
			await expect
				.poll(() =>
					gallery
						.locator('[data-gallery-slide="2"]')
						.evaluate((node) =>
							Math.abs(
								node.getBoundingClientRect().left -
									(node.parentElement?.getBoundingClientRect().left ?? 0),
							),
						),
				)
				.toBeLessThan(1);
			await gallery.press("Enter");
			await expect(page.getByRole("dialog")).toHaveAccessibleName("Billing overview");
			await page.keyboard.press("Escape");
			await expect(gallery).toBeFocused();
		});
	}
}

test("directional reels travel through full chambers and close retains centered feedback", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	const dialog = await openGallery(page, "dark");
	const next = dialog.getByRole("button", { name: "Next slide", exact: true });
	const chamber = await next.boundingBox();
	const aperture = await next.locator(".portfolio-reel-icon").boundingBox();
	if (!chamber || !aperture) throw new Error("Expected the complete arrow chamber");
	expect(aperture.width).toBeCloseTo(chamber.width, 1);
	expect(aperture.height).toBeCloseTo(chamber.height, 1);
	await next.hover();
	const outgoing = next.locator("[data-reel-out]");
	await expect(outgoing).toHaveCSS("filter", "blur(2px)");
	const glyph = await outgoing.locator("svg").boundingBox();
	if (!glyph) throw new Error("Expected the outgoing arrow");
	// At rest after the exchange, the old glyph is completely outside the aperture.
	expect(glyph.x).toBeGreaterThan(chamber.x + chamber.width);
	await page.mouse.move(0, 0);
	await expect(outgoing).toHaveCSS("transform", "none");
	const close = dialog.getByRole("button", { name: "Close expanded viewer" });
	const idle = await close.evaluate((node) => getComputedStyle(node).backgroundColor);
	const glyphBefore = await close.locator('svg:not([data-slot="spinner"])').boundingBox();
	await close.hover();
	await expect
		.poll(() => close.evaluate((node) => getComputedStyle(node).backgroundColor))
		.not.toBe(idle);
	expect(await close.locator('svg:not([data-slot="spinner"])').boundingBox()).toEqual(
		glyphBefore,
	);
	await expect(close.locator("[data-reel-out]")).toHaveCount(0);
	await close.click();
	await expect(dialog).toHaveCount(0);
});

test("rapid inline navigation keeps the selected destination while scrolling", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/iframe.html?id=components-media-mediagallery--default&viewMode=story");
	const gallery = page.locator('[aria-roledescription="carousel"]');
	await gallery.hover();
	const next = gallery.getByRole("button", { name: "Next slide", exact: true });
	await next.click();
	await next.click();
	await expect(gallery.getByText("Slide 3 of 4", { exact: true })).toBeAttached();
	await expect
		.poll(() =>
			gallery
				.locator('[data-gallery-slide="2"]')
				.evaluate((node) =>
					Math.abs(
						node.getBoundingClientRect().left -
							(node.parentElement?.getBoundingClientRect().left ?? 0),
					),
				),
		)
		.toBeLessThan(1);
});

test("image and video thumbnails keep player controls isolated", async ({ page }, testInfo) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
	await page.goto("/iframe.html?id=components-media-mediagallery--mixed-media&viewMode=story");
	await page.getByRole("button", { name: "Open slide 1 in expanded viewer" }).click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	await expect(
		dialog.getByText("Translation activity and credit usage at a glance."),
	).toBeVisible();
	await page.screenshot({ path: testInfo.outputPath("mixed-media-viewer.png") });
	await dialog.getByRole("button", { name: "View slide 2: Verto walkthrough" }).click();
	await expect(dialog).toHaveAccessibleName("Verto walkthrough");
	await expect(dialog.getByRole("group", { name: "Image zoom" })).toHaveCount(0);
	const slider = dialog.getByRole("slider", { name: "Seek video" });
	await slider.focus();
	await slider.press("ArrowRight");
	await expect(dialog).toHaveAccessibleName("Verto walkthrough");
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	await drag(
		page,
		dialog.locator('.pswp__item[aria-hidden="false"] [data-portfolio-video]'),
		-760,
	);
	await expect(dialog).toHaveAccessibleName("Verto review editor");
	await expect(dialog.getByRole("button", { name: "Zoom in", exact: true })).toBeEnabled();
	await expect(dialog.getByRole("slider", { name: "Seek video" })).toHaveCount(0);
	await dialog.getByRole("button", { name: "Close expanded viewer" }).click();
	await expect(page.locator('[data-gallery-slide="2"]')).toBeInViewport();
});

test("Escape interrupts opening and leaves the source usable on the next open", async ({
	page,
}) => {
	await page.goto("/iframe.html?id=components-media-mediagallery--default&viewMode=story");
	const opener = page.getByRole("button", { name: "Open slide 1 in expanded viewer" });
	await opener.click();
	await expect(page.getByRole("dialog")).toBeAttached();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await opener.click();
	await expect(page.getByRole("dialog")).toHaveAttribute("data-gallery-state", "open");
	await page.getByRole("button", { name: "Close expanded viewer" }).click();
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(opener).toBeEnabled();
	expect(await opener.evaluate((node) => Boolean(node.closest("[inert]")))).toBe(false);
});

for (const width of [390, 1280]) {
	test(`video posters open the shared viewer directly at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
		await page.goto(
			"/iframe.html?id=components-media-mediagallery--video-and-image&viewMode=story",
		);
		const gallery = page.locator('[aria-roledescription="carousel"]');
		await gallery.hover();
		await page.getByRole("button", { name: "Open expanded viewer", exact: true }).click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAccessibleName("Verto walkthrough");
		await expect(dialog.getByRole("slider", { name: "Seek video" })).toBeVisible();
		await dialog.getByRole("button", { name: "Next slide", exact: true }).click();
		await expect(dialog).toHaveAccessibleName("Verto review editor");
		await dialog.getByRole("button", { name: "Close expanded viewer" }).click();
		await expect(dialog).toHaveCount(0);
		await expect(gallery).toBeFocused();
		await expect(gallery.getByText("Slide 2 of 2", { exact: true })).toBeAttached();
	});
}

test("touch supports native inline swipe, pinch inspection and vertical dismissal", async ({
	browser,
	baseURL,
}) => {
	const context = await browser.newContext({
		baseURL,
		viewport: { width: 390, height: 844 },
		hasTouch: true,
		isMobile: true,
	});
	const page = await context.newPage();
	const touch = await context.newCDPSession(page);
	async function gesture(from: { x: number; y: number }[], to: { x: number; y: number }[]) {
		const points = (positions: { x: number; y: number }[]) =>
			positions.map((point, id) => ({ ...point, id, radiusX: 5, radiusY: 5, force: 1 }));
		await touch.send("Input.dispatchTouchEvent", {
			type: "touchStart",
			touchPoints: points(from),
		});
		for (let step = 1; step <= 12; step++) {
			await touch.send("Input.dispatchTouchEvent", {
				type: "touchMove",
				touchPoints: points(
					from.map((point, index) => ({
						x: point.x + ((to[index].x - point.x) * step) / 12,
						y: point.y + ((to[index].y - point.y) * step) / 12,
					})),
				),
			});
		}
		await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
	}
	async function tap(target: Locator) {
		await expect(target).toBeVisible();
		await expect(target).toBeEnabled();
		const frame = await target.boundingBox();
		if (!frame) throw new Error("Expected a visible touch target");
		// Keep taps and gestures on one input session with sequential contact start/end.
		await touch.send("Input.dispatchTouchEvent", {
			type: "touchStart",
			touchPoints: [{ x: frame.x + frame.width / 2, y: frame.y + frame.height / 2, id: 0 }],
		});
		await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
	}
	try {
		await page.goto(
			"/iframe.html?id=components-media-mediagallery--with-per-image-captions&viewMode=story",
		);
		const gallery = page.locator('[aria-roledescription="carousel"]');
		const frame = await gallery.boundingBox();
		if (!frame) throw new Error("Expected the inline gallery");
		await gesture(
			[{ x: 300, y: frame.y + frame.height / 2 }],
			[{ x: 80, y: frame.y + frame.height / 2 }],
		);
		await expect(gallery.getByText("Slide 2 of 3", { exact: true })).toBeAttached();
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await tap(page.getByRole("button", { name: "Open slide 2 in expanded viewer" }));
		const dialog = page.getByRole("dialog");
		const surface = dialog.locator(
			'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
		);
		await expect(surface).toBeVisible();
		await expect(dialog).toHaveAttribute("data-gallery-state", "open");
		await gesture(
			[
				{ x: 155, y: 390 },
				{ x: 235, y: 390 },
			],
			[
				{ x: 95, y: 390 },
				{ x: 295, y: 390 },
			],
		);
		await expect
			.poll(async () =>
				Number.parseInt(
					await dialog.getByRole("button", { name: "Reset zoom to fit" }).innerText(),
					10,
				),
			)
			.toBeGreaterThan(190);
		await gesture([{ x: 220, y: 390 }], [{ x: 100, y: 390 }]);
		await expect(dialog).toHaveAccessibleName("Document Processing Pipeline");
		const fit = dialog.getByRole("button", { name: "Reset zoom to fit" });
		expect(
			await fit.evaluate((button) => {
				const frame = button.getBoundingClientRect();
				return (
					document.elementFromPoint(
						frame.x + frame.width / 2,
						frame.y + frame.height / 2,
					) === button
				);
			}),
		).toBe(true);
		await tap(fit);
		await expect(fit).toHaveText("Fit");
		await gesture([{ x: 195, y: 390 }], [{ x: 195, y: 740 }]);
		await expect(dialog).toHaveCount(0);
		await expect(gallery).toBeFocused();
	} finally {
		await context.close();
	}
});

test("reduced motion opens, navigates and closes without animated presence", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	const dialog = await openGallery(page);
	await expect(page.locator("[data-gallery-morph]")).toHaveCount(0);
	await expect(dialog).toHaveAttribute("data-instant", "true");
	await dialog.getByRole("button", { name: "Next slide", exact: true }).click();
	await expect(dialog).toHaveAccessibleName("Document Processing Pipeline");
	await expect
		.poll(() =>
			dialog.evaluate((node) =>
				node
					.getAnimations({ subtree: true })
					.filter((animation) => animation.playState === "running")
					.map((animation) => ({
						name:
							animation instanceof CSSAnimation
								? animation.animationName
								: "transition",
						target: (animation.effect as KeyframeEffect | null)?.target?.nodeName,
					})),
			),
		)
		.toEqual([]);
	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	await expect(page.locator('[aria-roledescription="carousel"]')).toBeFocused();
});

for (const width of [390, 1280]) {
	test(`video metadata preserves its native ratio without replacing the player at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.route(/https:\/\/[^/]*mux\.(com|dev)\//, (route) => route.abort());
		await page.goto(
			"/iframe.html?id=components-media-mediagallery--video-and-image&viewMode=story",
		);
		await page.locator('[aria-roledescription="carousel"]').hover();
		await page.getByRole("button", { name: "Open expanded viewer", exact: true }).click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAttribute("data-gallery-state", "open");
		const host = dialog.locator('.pswp__item[aria-hidden="false"] mux-video');
		await expect(host).toBeAttached();
		// Supply transport metadata for a portrait film whose poster is landscape.
		await host.evaluate((media) => {
			Object.defineProperties(media, {
				videoWidth: { configurable: true, value: 720 },
				videoHeight: { configurable: true, value: 1280 },
			});
			media.setAttribute("data-native-aspect-fixture", "retained");
			media.dispatchEvent(new Event("loadedmetadata"));
		});
		const player = dialog.locator('.pswp__item[aria-hidden="false"] [data-portfolio-video]');
		await expect
			.poll(async () => {
				const bounds = await player.boundingBox();
				return bounds ? Math.abs(bounds.width / bounds.height - 720 / 1280) : 1;
			})
			.toBeLessThan(0.002);
		await expect(host).toHaveAttribute("data-native-aspect-fixture", "retained");
		await page.setViewportSize({ width: width === 390 ? 844 : 1000, height: 600 });
		await expect
			.poll(async () => {
				const bounds = await player.boundingBox();
				return bounds ? Math.abs(bounds.width / bounds.height - 720 / 1280) : 1;
			})
			.toBeLessThan(0.002);
		await expect(host).toHaveAttribute("data-native-aspect-fixture", "retained");
		await dialog.getByRole("button", { name: "Next slide", exact: true }).click();
		await expect(dialog).toHaveAccessibleName("Verto review editor");
	});
}

for (const theme of ["light", "dark"]) {
	for (const viewport of [
		{ width: 320, height: 740 },
		{ width: 812, height: 375 },
		{ width: 1440, height: 1000 },
	]) {
		test(`viewer controls stay legible and clear of the media at ${viewport.width}x${viewport.height} in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize(viewport);
			const dialog = await openGallery(page, theme);
			const controls = dialog.locator('[data-slot="button"]');
			for (const control of await controls.all()) {
				await expect(control).toBeInViewport();
				const bounds = await control.boundingBox();
				if (!bounds) throw new Error("Expected a visible viewer control");
				expect(Math.round(bounds.width * 100) / 100).toBeGreaterThanOrEqual(48);
				expect(Math.round(bounds.height * 100) / 100).toBeGreaterThanOrEqual(48);
			}
			const evidence = await dialog.evaluate((root) => {
				const header = root.querySelector("header");
				const footer = root.querySelector("footer");
				const image = root.querySelector(
					'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
				);
				if (!header || !footer || !image)
					throw new Error("Expected complete viewer chrome");
				const media = image.getBoundingClientRect();
				const panel = footer.getBoundingClientRect();
				const top = header.getBoundingClientRect();
				const zoom = root.querySelector('[aria-label="Image zoom"]');
				const zoomBounds = zoom?.getBoundingClientRect();
				const previous = root
					.querySelector('[aria-label="Previous slide"]')
					?.getBoundingClientRect();
				const next = root
					.querySelector('[aria-label="Next slide"]')
					?.getBoundingClientRect();
				if (!zoom || !zoomBounds || !previous || !next)
					throw new Error("Expected viewer controls");
				return {
					topGap: media.top - top.bottom,
					bottomGap: zoomBounds.top - media.bottom,
					zoomToFooterGap: panel.top - zoomBounds.bottom,
					zoomOutsideFooter: !footer.contains(zoom),
					attachedEdges: [
						top.left,
						top.top,
						panel.left,
						innerWidth - top.right,
						innerWidth - panel.right,
						innerHeight - panel.bottom,
					],
					zoomCenter: zoomBounds.left + zoomBounds.width / 2 - innerWidth / 2,
					navigationSymmetry: previous.left - (innerWidth - next.right),
					navigationCenter: [previous, next].map(
						(button) => button.top + button.height / 2 - (media.top + media.bottom) / 2,
					),
					sideClearance: [media.left - previous.right, next.left - media.right],
					padding: [header, footer].map((element) => {
						const style = getComputedStyle(element);
						return [
							style.paddingTop,
							style.paddingRight,
							style.paddingBottom,
							style.paddingLeft,
						].map(Number.parseFloat);
					}),
					corners: [header, footer, ...root.querySelectorAll("button")].map(
						(element) => getComputedStyle(element).borderRadius,
					),
				};
			});
			expect(evidence.topGap).toBeGreaterThanOrEqual(9);
			expect(evidence.bottomGap).toBeGreaterThanOrEqual(9);
			expect(evidence.zoomToFooterGap).toBeGreaterThanOrEqual(9);
			expect(evidence.zoomOutsideFooter).toBe(true);
			for (const edge of evidence.attachedEdges) expect(Math.abs(edge)).toBeLessThan(1);
			expect(Math.abs(evidence.zoomCenter)).toBeLessThan(1);
			expect(Math.abs(evidence.navigationSymmetry)).toBeLessThan(1);
			for (const center of evidence.navigationCenter)
				expect(Math.abs(center)).toBeLessThan(1);
			if (viewport.width >= 760)
				for (const gap of evidence.sideClearance) expect(gap).toBeGreaterThanOrEqual(24);
			for (const padding of evidence.padding)
				expect(Math.max(...padding) - Math.min(...padding)).toBeLessThan(1);
			for (const radius of evidence.corners) expect(radius).toBe("0px");
			await expectProtectedContrast(dialog);
			await page.screenshot({
				path: testInfo.outputPath(`viewer-cinematic-${viewport.width}-${theme}.png`),
			});
			for (let step = 0; step < 6; step++)
				await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
			await expect(dialog.getByRole("button", { name: "Reset zoom to fit" })).toHaveText(
				"400%",
			);
			await expect
				.poll(async () => {
					const bounds = await dialog
						.locator(
							'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
						)
						.boundingBox();
					return bounds?.width ?? 0;
				})
				.toBeGreaterThan(viewport.width);
			await expectProtectedContrast(dialog);
			await dialog.getByRole("button", { name: "Next slide", exact: true }).focus();
			await expect(
				dialog.getByRole("button", { name: "Next slide", exact: true }),
			).toBeFocused();
			if (viewport.width === 1440)
				await page.screenshot({
					path: testInfo.outputPath(`viewer-zoom-contrast-${theme}.png`),
				});
		});
	}
}

/** Verify the actual glass tint against both extreme media values beneath it. */
async function expectProtectedContrast(dialog: Locator) {
	const contrasts = await dialog.evaluate((root) => {
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) throw new Error("Expected a color conversion context");
		const luminance = () => {
			const values = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => {
				const channel = value / 255;
				return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
			});
			return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
		};
		return [...root.querySelectorAll('h2, header p, [data-slot="button"]:not(:disabled)')]
			.filter((element) => element.getBoundingClientRect().height > 0)
			.flatMap((element) =>
				["#000", "#fff"].map((backdrop) => {
					const surfaces: { color: string; exposure: number }[] = [];
					for (
						let node: Element | null = element;
						node && node !== root;
						node = node.parentElement
					) {
						const style = getComputedStyle(node);
						const brightness = style.backdropFilter.match(/brightness\(([\d.]+)\)/);
						surfaces.unshift({
							color: style.backgroundColor,
							exposure: brightness ? Number(brightness[1]) : 1,
						});
						const material = getComputedStyle(node, "::before");
						if (material.content !== "none" && material.backdropFilter !== "none") {
							const brightness =
								material.backdropFilter.match(/brightness\(([\d.]+)\)/);
							surfaces.unshift({
								color: material.backgroundColor,
								exposure: brightness ? Number(brightness[1]) : 1,
							});
						}
					}
					context.fillStyle = backdrop;
					context.fillRect(0, 0, 1, 1);
					for (const surface of surfaces) {
						// Blur/saturation preserve the black/white extremes; exposure scales them.
						const backdrop = context.getImageData(0, 0, 1, 1);
						for (let channel = 0; channel < 3; channel++)
							backdrop.data[channel] *= surface.exposure;
						context.putImageData(backdrop, 0, 0);
						context.fillStyle = surface.color;
						context.fillRect(0, 0, 1, 1);
					}
					const surface = luminance();
					context.fillStyle = getComputedStyle(element).color;
					context.fillRect(0, 0, 1, 1);
					const ink = luminance();
					return (Math.max(ink, surface) + 0.05) / (Math.min(ink, surface) + 0.05);
				}),
			);
	});
	for (const ratio of contrasts) expect(ratio).toBeGreaterThanOrEqual(7);
}
