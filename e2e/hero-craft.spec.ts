import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

type ReelFrame = {
	ms: number;
	x: number;
	aperture: number;
	first: number;
	last: number;
	width: number;
	height: number;
};
type MotionWindow = Window & { heroReelFrames?: ReelFrame[]; heroReelDone?: boolean };

for (const theme of ["light", "dark"] as const) {
	test(`hero reel preserves its frame throughout the spring stagger in ${theme}`, async ({
		page,
		isMobile,
	}, testInfo) => {
		test.skip(isMobile, "Touch uses the stable resting label instead of a hover reel.");
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		await page.mouse.move(0, 0);
		const action = page.locator(".portfolio-action-link");
		await expect(action).toBeVisible();
		await expect(action).toHaveAttribute("data-action-ready", "true");
		await action.evaluate((element) => {
			const capture = window as MotionWindow;
			capture.heroReelFrames = [];
			capture.heroReelDone = false;
			element.addEventListener(
				"pointerenter",
				() => {
					const start = performance.now();
					const arrow = element.querySelector(
						'.portfolio-action-reel-icon [data-action-reel="out"]',
					);
					const letters = element.querySelectorAll(
						'.portfolio-action-reel-label [data-action-reel="out"] > span',
					);
					if (!arrow || !letters.length) throw new Error("Missing hero reel layers");
					const sample = () => {
						const rect = element.getBoundingClientRect();
						capture.heroReelFrames?.push({
							ms: performance.now() - start,
							x: new DOMMatrixReadOnly(getComputedStyle(arrow).transform).m41,
							aperture: arrow.getBoundingClientRect().width,
							first: Number(getComputedStyle(letters[0]).opacity),
							last: Number(getComputedStyle(letters[letters.length - 1]).opacity),
							width: rect.width,
							height: rect.height,
						});
						if (performance.now() - start < 1500) requestAnimationFrame(sample);
						else capture.heroReelDone = true;
					};
					requestAnimationFrame(sample);
				},
				{ once: true },
			);
		});
		await action.hover();
		await expect
			.poll(() => page.evaluate(() => (window as MotionWindow).heroReelDone))
			.toBe(true);
		const frames = await page.evaluate(() => (window as MotionWindow).heroReelFrames ?? []);
		const recording = testInfo.outputPath(`hero-reel-${theme}.json`);
		await writeFile(recording, JSON.stringify(frames, null, 2));
		await testInfo.attach(`hero-reel-${theme}`, {
			path: recording,
			contentType: "application/json",
		});
		// These samples diagnose timing; frame count depends on the host, not just
		// the component. Verify stagger order and geometry without claiming FPS.
		expect(frames.some((frame) => frame.x > 0)).toBe(true);
		expect(frames.some((frame) => frame.last - frame.first > 0.4)).toBe(true);
		await expect(
			action.locator('.portfolio-action-reel-label [data-action-reel="out"] > span').last(),
		).toHaveCSS("opacity", "0");
		const arrow = action.locator('.portfolio-action-reel-icon [data-action-reel="out"]');
		await expect
			.poll(() =>
				arrow.evaluate((element) => {
					const x = new DOMMatrixReadOnly(getComputedStyle(element).transform).m41;
					return Math.abs(x - element.getBoundingClientRect().width * 0.8);
				}),
			)
			.toBeLessThan(0.05);
		expect(new Set(frames.map((frame) => `${frame.width}:${frame.height}`)).size).toBe(1);
	});

	test(`hero action retains its frame, name and centered pending glyph in ${theme}`, async ({
		page,
		isMobile,
	}) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		let release = () => {};
		const held = new Promise<void>((resolve) => {
			release = resolve;
		});
		await page.route(/\/case-studies(?:\?|$)/, async (route) => {
			await held;
			await route.continue();
		});
		try {
			await page.goto("/");
			await page.evaluate(() => document.fonts.ready);
			const heading = page.getByRole("heading", { level: 1 });
			// Decorative reveal layers must not duplicate text in route announcements or copying.
			expect(await heading.textContent()).toBe("Complex systems, clean interfaces.");
			const action = page.locator(".portfolio-action-link");
			await expect(action).toHaveAccessibleName("Case studies");
			await expect(action).toBeVisible();
			await expect(action).toHaveAttribute("data-action-ready", "true");
			const before = await action.boundingBox();
			const label = action.locator(".portfolio-action-reel-label");
			const incomingLabel = label.locator('[data-action-reel="in"]');
			if (!isMobile) {
				await action.hover();
				await expect(incomingLabel.locator("[data-action-character]").last()).toHaveCSS(
					"opacity",
					"1",
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
							[...node.querySelectorAll<HTMLElement>("[data-action-reel]")].map(
								(layer) =>
									[...layer.children].every(
										(character) => getComputedStyle(character).opacity === "1",
									),
							),
						),
					)
					.toEqual([true, false]);
				expect(await action.boundingBox()).toEqual(before);
				await expect(action).toHaveAccessibleName("Case studies");
				await action.focus();
				await page.keyboard.press("Tab");
				await expect(page.getByRole("link", { name: "Email", exact: true })).toBeFocused();
				await page.keyboard.press("Shift+Tab");
				await expect(action).toBeFocused();
				await expect(label.locator("[data-action-rest]")).toHaveCSS(
					"visibility",
					"visible",
				);
				await expect(incomingLabel).toHaveCSS("visibility", "hidden");
			}
			await page.emulateMedia({ reducedMotion: "reduce" });
			if (!isMobile) await action.hover();
			await expect(incomingLabel).toHaveCSS("visibility", "hidden");
			await expect(label.locator("[data-action-rest]")).toHaveCSS("visibility", "visible");
			await action.click();
			const feedback = action.locator('[data-slot="link-feedback"][data-loading]');
			await expect(feedback).toBeVisible();
			await expect(action).toHaveAccessibleName("Case studies");
			expect(await action.boundingBox()).toEqual(before);
			const chamber = await action.locator(".foundation-button-icon-space").boundingBox();
			const spinner = await feedback.locator('[data-slot="spinner"]').boundingBox();
			if (!chamber || !spinner) throw new Error("Missing primary navigation feedback");
			expect(chamber.width).toBeCloseTo(chamber.height, 1);
			expect(spinner.width).toBe(16);
			expect(spinner.height).toBe(16);
			expect(Math.abs(chamber.x + chamber.width / 2 - spinner.x - 8)).toBeLessThan(0.5);
			expect(Math.abs(chamber.y + chamber.height / 2 - spinner.y - 8)).toBeLessThan(0.5);
		} finally {
			release();
		}
		await expect(page.getByRole("heading", { level: 1, name: "Case studies." })).toBeVisible();
	});
}
