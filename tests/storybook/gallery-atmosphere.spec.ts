import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
	test(`one stationary light field survives adjacent, distant and interrupted selections at ${width}px`, async ({
		page,
	}, testInfo) => {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(
			"/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story&globals=theme:dark",
		);
		await page
			.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
			.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toHaveAttribute("data-gallery-state", "open");
		const light = dialog.locator(".pswp__bg [data-gallery-ambience]");
		await expect(light).toHaveCount(1);
		await expect(light).toHaveCSS("filter", "none");
		const box = await light.boundingBox();
		const durations: number[] = [];
		for (const destination of [1, 5, 11, 2]) {
			const result = await dialog.evaluate(async (root, destination) => {
				const field = root.querySelector("[data-gallery-ambience]");
				const canvas = field?.querySelector("canvas");
				if (!field || !canvas) throw new Error("Expected the stationary atmosphere");
				return new Promise<{
					duration: number;
					samples: { x: number; y: number; same: boolean; background: string }[];
				}>((resolve, reject) => {
					const samples: { x: number; y: number; same: boolean; background: string }[] =
						[];
					const started = performance.now();
					let duration = 0;
					const sample = () => {
						const stage = root.querySelector<HTMLElement>(".pswp__scroll-wrap");
						const animation = stage?.getAnimations()[0];
						if (animation) {
							duration = Number(animation.effect?.getTiming().duration);
							const bounds = field.getBoundingClientRect();
							samples.push({
								x: bounds.x,
								y: bounds.y,
								same:
									root.querySelector("[data-gallery-ambience] canvas") === canvas,
								background: stage ? getComputedStyle(stage).backgroundColor : "",
							});
							if (root.querySelector("[data-gallery-transition] canvas[data-active]"))
								reject(
									new Error("Atmosphere was attached to the traveling artwork"),
								);
						} else if (samples.length) {
							resolve({ duration, samples });
							return;
						}
						if (performance.now() - started > 5000) {
							reject(new Error("The gallery never completed its transition"));
							return;
						}
						requestAnimationFrame(sample);
					};
					requestAnimationFrame(sample);
					root.querySelector<HTMLButtonElement>(
						`[data-gallery-preview="${destination}"]`,
					)?.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
				});
			}, destination);
			durations.push(result.duration);
			expect(result.samples.length).toBeGreaterThan(1);
			for (const sample of result.samples) {
				expect(sample.same).toBe(true);
				expect(sample.x).toBeCloseTo(box?.x ?? 0, 1);
				expect(sample.y).toBeCloseTo(box?.y ?? 0, 1);
				expect(sample.background).toBe("rgba(0, 0, 0, 0)");
			}
		}
		expect(new Set(durations).size).toBe(1);
		expect(durations[0]).toBeGreaterThanOrEqual(220);
		expect(durations[0]).toBeLessThanOrEqual(280);
		await dialog.locator('[data-gallery-preview="7"]').dispatchEvent("click", { detail: 1 });
		await expect(dialog).toHaveAttribute("data-gallery-jump", "animating");
		await dialog.locator('[data-gallery-preview="4"]').dispatchEvent("click", { detail: 1 });
		await expect(dialog).not.toHaveAttribute("data-gallery-jump");
		await expect(dialog.locator('[data-gallery-preview="4"]')).toHaveAttribute(
			"aria-current",
			"true",
		);
		await expect(dialog.locator("[data-gallery-ambience]")).toHaveCount(1);
		await expect(light).toHaveCSS("translate", "none");
		await page.screenshot({ path: testInfo.outputPath(`stationary-light-${width}.png`) });
		await page.keyboard.press("Escape");
	});
}

test("reversing a moving selection carries momentum before braking toward the new target", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story");
	await page
		.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	await dialog.evaluate(
		(root) =>
			new Promise<void>((resolve) => {
				const observer = new MutationObserver(() => {
					const stage = root.querySelector(".pswp__scroll-wrap");
					const retiring = root.querySelector("[data-gallery-transition]");
					if (!stage?.getAnimations().length || !retiring?.getAnimations().length) return;
					observer.disconnect();
					for (const element of [stage, retiring])
						for (const animation of element.getAnimations()) {
							animation.pause();
							animation.currentTime = 110;
						}
					resolve();
				});
				observer.observe(root, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["data-gallery-jump"],
				});
				root.querySelector<HTMLButtonElement>('[data-gallery-preview="11"]')?.dispatchEvent(
					new MouseEvent("click", { bubbles: true, detail: 1 }),
				);
			}),
	);
	const movement = await dialog.evaluate(
		(root) =>
			new Promise<number[]>((resolve) => {
				const previous = root.querySelector("[data-gallery-transition]");
				const observer = new MutationObserver(() => {
					const outgoing = root.querySelector("[data-gallery-transition]");
					const animation = outgoing?.getAnimations()[0];
					if (!outgoing || outgoing === previous || !animation) return;
					observer.disconnect();
					resolve(
						(animation.effect as KeyframeEffect)
							.getKeyframes()
							.map((frame) => Number.parseFloat(String(frame.translate))),
					);
				});
				observer.observe(root, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["data-gallery-jump"],
				});
				root.querySelector<HTMLButtonElement>('[data-gallery-preview="2"]')?.dispatchEvent(
					new MouseEvent("click", { bubbles: true, detail: 1 }),
				);
			}),
	);
	// The old artwork was moving left. It must brake before moving right, not snap direction.
	expect(movement[1] - movement[0]).toBeLessThan(-10);
	expect(movement.at(-1)).toBe(1440);
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	await expect(dialog.locator('[data-gallery-preview="2"]')).toHaveAttribute(
		"aria-current",
		"true",
	);
	await page.keyboard.press("Escape");
});

test("grabbing arriving artwork transfers its visible position to the gesture engine", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story");
	await page
		.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	await dialog.evaluate(
		(root) =>
			new Promise<void>((resolve) => {
				const observer = new MutationObserver(() => {
					const stage = root.querySelector(".pswp__scroll-wrap");
					const retiring = root.querySelector("[data-gallery-transition]");
					if (!stage?.getAnimations().length || !retiring?.getAnimations().length) return;
					observer.disconnect();
					for (const element of [stage, retiring])
						for (const animation of element.getAnimations()) {
							animation.pause();
							animation.currentTime = 140;
						}
					resolve();
				});
				observer.observe(root, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["data-gallery-jump"],
				});
				root.querySelector<HTMLButtonElement>('[data-gallery-preview="11"]')?.dispatchEvent(
					new MouseEvent("click", { bubbles: true, detail: 1 }),
				);
			}),
	);
	const artwork = dialog.locator(
		'.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
	);
	const before = await artwork.boundingBox();
	if (!before) throw new Error("Expected a visible arriving artwork");
	const x = Math.min(1300, before.x + before.width * 0.25);
	const y = before.y + before.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	const grabbed = await artwork.boundingBox();
	expect(Math.abs((grabbed?.x ?? 0) - before.x)).toBeLessThan(1);
	await page.mouse.move(x - 110, y, { steps: 6 });
	await page.mouse.up();
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	await expect.poll(async () => (await artwork.boundingBox())?.x ?? Infinity).toBeLessThan(200);
	await page.keyboard.press("Escape");
});
