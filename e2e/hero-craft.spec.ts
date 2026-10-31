import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Verify interaction timing without software-rendering the decorative shader.
test.use({
	launchOptions: async ({ browserName }, use) => {
		await use(browserName === "chromium" ? { args: ["--disable-webgl"] } : {});
	},
});

type ReelFrame = {
	ms: number;
	x: number;
	aperture: number;
	first: number;
	last: number;
	width: number;
	height: number;
};
type ReelTiming = { delay: number; finish: number };
type MotionWindow = Window & {
	heroReelFrames?: ReelFrame[];
	heroReelDone?: boolean;
	heroReelError?: string;
	heroReelTiming?: { arrow: ReelTiming; first: ReelTiming; last: ReelTiming };
	heroReelReturnTiming?: { arrow: ReelTiming; first: ReelTiming; last: ReelTiming };
};

for (const theme of ["light", "dark"] as const) {
	test(`hero text and arrow share a bounded finish without resizing in ${theme}`, async ({
		page,
		isMobile,
	}, testInfo) => {
		test.skip(isMobile, "Touch uses the stable resting label instead of a hover reel.");
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		await page.mouse.move(0, 0);
		const action = page
			.locator("#hero")
			.getByRole("link", { name: "Book a call", exact: true });
		await expect(action).toBeVisible();
		await page.evaluate(() => {
			const capture = window as MotionWindow;
			capture.heroReelFrames = [];
			capture.heroReelDone = false;
			const layers = () => {
				const current = document.querySelector("#hero .portfolio-action-link");
				const arrow = current?.querySelector(".portfolio-action-reel-icon [data-reel-out]");
				const letters = current?.querySelectorAll(
					'.portfolio-action-reel-label [data-action-reel="out"] > span',
				);
				if (!current || !arrow || !letters?.length)
					throw new Error("Missing hero reel layers");
				return { current, arrow, letters };
			};
			const timing = (node: Element): ReelTiming => {
				const transition = node
					.getAnimations()
					.find(
						(animation) =>
							animation instanceof CSSTransition &&
							animation.transitionProperty === "transform",
					);
				if (!transition?.effect) throw new Error("Missing active reel transition");
				const computed = transition.effect.getComputedTiming();
				return { delay: computed.delay ?? 0, finish: Number(computed.endTime) };
			};
			const timeline = () => {
				const { arrow, letters } = layers();
				return {
					arrow: timing(arrow),
					first: timing(letters[0]),
					last: timing(letters[letters.length - 1]),
				};
			};
			document.addEventListener(
				"pointerleave",
				function captureReturn(event) {
					if (
						!(event.target instanceof Element) ||
						!event.target.matches("#hero .portfolio-action-link")
					)
						return;
					document.removeEventListener("pointerleave", captureReturn, true);
					capture.heroReelReturnTiming = timeline();
				},
				{ capture: true },
			);
			document.addEventListener(
				"pointerenter",
				function captureEntry(event) {
					if (
						!(event.target instanceof Element) ||
						!event.target.matches("#hero .portfolio-action-link")
					)
						return;
					document.removeEventListener("pointerenter", captureEntry, true);
					const start = performance.now();
					try {
						capture.heroReelTiming = timeline();
					} catch (error) {
						capture.heroReelError = String(error);
						capture.heroReelDone = true;
						return;
					}
					const sample = () => {
						const { current, arrow, letters } = layers();
						const rect = current.getBoundingClientRect();
						capture.heroReelFrames?.push({
							ms: performance.now() - start,
							x: new DOMMatrixReadOnly(getComputedStyle(arrow).transform).m41,
							aperture: arrow.getBoundingClientRect().width,
							first: new DOMMatrixReadOnly(getComputedStyle(letters[0]).transform)
								.m42,
							last: new DOMMatrixReadOnly(
								getComputedStyle(letters[letters.length - 1]).transform,
							).m42,
							width: rect.width,
							height: rect.height,
						});
						if (performance.now() - start < 800) requestAnimationFrame(sample);
						else capture.heroReelDone = true;
					};
					requestAnimationFrame(sample);
				},
				{ capture: true },
			);
		});
		await action.hover();
		await expect
			.poll(() => page.evaluate(() => (window as MotionWindow).heroReelDone))
			.toBe(true);
		expect(await page.evaluate(() => (window as MotionWindow).heroReelError)).toBeUndefined();
		const frames = await page.evaluate(() => (window as MotionWindow).heroReelFrames ?? []);
		const recording = testInfo.outputPath(`hero-reel-${theme}.json`);
		await writeFile(recording, JSON.stringify(frames, null, 2));
		await testInfo.attach(`hero-reel-${theme}`, {
			path: recording,
			contentType: "application/json",
		});
		// Native transition timelines verify coordination even when the host skips
		// sampled frames. The recording diagnoses geometry without claiming FPS.
		const timeline = await page.evaluate(() => (window as MotionWindow).heroReelTiming);
		if (!timeline) throw new Error("Missing native reel timeline");
		expect(timeline.first.delay).toBe(0);
		expect(timeline.last.delay).toBeGreaterThan(timeline.first.delay);
		expect(timeline.last.finish).toBeGreaterThan(timeline.first.finish);
		expect(timeline.last.finish).toBeCloseTo(timeline.arrow.finish, 1);
		await expect(
			action.locator('.portfolio-action-reel-label [data-action-reel="in"] > span').last(),
		).toHaveCSS("filter", "blur(0px)");
		const arrow = action.locator(".portfolio-action-reel-icon [data-reel-out]");
		await expect
			.poll(() =>
				arrow.evaluate((element) => {
					const x = new DOMMatrixReadOnly(getComputedStyle(element).transform).m41;
					return Math.abs(x - element.getBoundingClientRect().width * 0.8);
				}),
			)
			.toBeLessThan(0.05);
		expect(new Set(frames.map((frame) => `${frame.width}:${frame.height}`)).size).toBe(1);
		await page.mouse.move(0, 0);
		const returning = await page.evaluate(() => (window as MotionWindow).heroReelReturnTiming);
		if (!returning) throw new Error("Missing native return timeline");
		expect(returning.last.delay).toBe(timeline.first.delay);
		expect(returning.first.delay).toBe(timeline.last.delay);
		expect(returning.first.finish).toBeCloseTo(timeline.last.finish, 1);
		expect(returning.first.finish).toBeCloseTo(returning.arrow.finish, 1);
		await expect
			.poll(() =>
				arrow.evaluate(
					(node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41,
				),
			)
			.toBe(0);
	});

	test(`project arrow travels diagonally and returns cleanly in ${theme}`, async ({
		page,
		isMobile,
	}) => {
		test.skip(isMobile, "Touch does not animate decorative hover reels.");
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const caption = page.locator(".portfolio-project-link").first();
		await caption.scrollIntoViewIfNeeded();
		const before = await caption.boundingBox();
		const outgoing = caption.locator("[data-reel-out]");
		const travel = () =>
			outgoing.evaluate((node) => {
				const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
				return { x: matrix.m41, y: matrix.m42 };
			});
		await caption.hover();
		await expect(outgoing).toHaveCSS("filter", "blur(2px)");
		const diagonal = await travel();
		expect(diagonal.x).toBeGreaterThan(0);
		expect(diagonal.y).toBeLessThan(0);
		expect(diagonal.x).toBeCloseTo(-diagonal.y, 2);
		const aperture = await caption.locator(".portfolio-reel-icon").boundingBox();
		const chamber = await caption.locator("[data-project-action]").boundingBox();
		if (!aperture || !chamber) throw new Error("Missing project action aperture");
		// A glyph-sized aperture cut the diagonal arrow off through its center.
		expect(aperture.width).toBeCloseTo(chamber.width, 1);
		expect(aperture.height).toBeCloseTo(chamber.height, 1);
		expect(diagonal.x).toBeCloseTo(chamber.width * 0.8, 1);
		expect(await caption.boundingBox()).toEqual(before);
		await page.mouse.move(0, 0);
		await expect(outgoing).toHaveCSS("filter", "none");
		expect(await travel()).toEqual({ x: 0, y: 0 });
	});

	test(`hero booking retains its frame, name and keyboard behavior in ${theme}`, async ({
		page,
		isMobile,
	}) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		const heading = page.getByRole("heading", { level: 1 });
		// Decorative reveal layers must not duplicate text in route announcements or copying.
		expect(await heading.textContent()).toBe("Complex systems, clean interfaces.");
		const action = page
			.locator("#hero")
			.getByRole("link", { name: "Book a call", exact: true });
		await expect(action).toHaveAccessibleName("Book a call");
		await expect(action).toBeVisible();
		const before = await action.boundingBox();
		const label = action.locator(".portfolio-action-reel-label");
		const incomingLabel = label.locator('[data-action-reel="in"]');
		if (!isMobile) {
			await action.hover();
			await expect(incomingLabel.locator("[data-action-character]").last()).toHaveCSS(
				"filter",
				"blur(0px)",
			);
			expect(await action.boundingBox()).toEqual(before);
			// Fly across the control during a running leg. Every glyph must settle
			// into one readable layer without resizing or duplicating its name.
			await page.mouse.move(0, 0);
			if (!before) throw new Error("Missing primary navigation control");
			await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
			await page.mouse.move(0, 0);
			await expect
				.poll(() =>
					label.evaluate((node) =>
						[...node.querySelectorAll<HTMLElement>("[data-action-reel]")].map((layer) =>
							[...layer.children].every(
								(character) =>
									Math.abs(
										new DOMMatrixReadOnly(getComputedStyle(character).transform)
											.m42,
									) < 0.01,
							),
						),
					),
				)
				.toEqual([true, false]);
			expect(await action.boundingBox()).toEqual(before);
			await expect(action).toHaveAccessibleName("Book a call");
			await action.focus();
			await page.keyboard.press("Tab");
			await expect(
				page.getByRole("link", { name: "View my work", exact: true }),
			).toBeFocused();
			await page.keyboard.press("Shift+Tab");
			await expect(action).toBeFocused();
			await expect(label.locator("[data-action-rest]")).toHaveCSS("visibility", "visible");
			await expect(incomingLabel).toHaveCSS("visibility", "hidden");
		}
		await page.emulateMedia({ reducedMotion: "reduce" });
		if (!isMobile) await action.hover();
		await expect(incomingLabel).toHaveCSS("visibility", "hidden");
		await expect(label.locator("[data-action-rest]")).toHaveCSS("visibility", "visible");
		await expect(action).toHaveAttribute("href", "https://cal.com/yassinechettouch/15min");
		await expect(action).toHaveAttribute("target", "_blank");
		expect(await action.boundingBox()).toEqual(before);
		await page.getByRole("link", { name: "View my work", exact: true }).click();
		await expect(page).toHaveURL(/\/#work$/);
		await expect(heading).toHaveText("Complex systems, clean interfaces.");
		await expect(page.locator("[data-route-capture]")).toHaveCount(0);
	});
}
