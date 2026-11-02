import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { installMuxMediaFixture } from "./helpers/mux-media-fixture";

test("12 to 3 and 4 to 8 move both artwork planes on the same clock", async ({
	page,
}, testInfo) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(
		"/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story&globals=theme:dark",
	);
	await page
		.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	const previews = dialog.getByRole("group", { name: "Gallery previews" }).getByRole("button");
	for (const [from, to] of [
		[11, 2],
		[3, 7],
	]) {
		await previews.nth(from).click();
		await expect(previews.nth(from)).toHaveAttribute("aria-current", "true");
		await expect(dialog).not.toHaveAttribute("data-gallery-jump");
		const observation = await dialog.evaluate((root, destination) => {
			return new Promise<{
				states: string[];
				startTimes: (number | null)[];
				currentTimes: number[];
				durations: number[];
				travel: number[];
				frames: { incoming: number; outgoing: number; exposure: number }[];
			}>((resolve, reject) => {
				const timeout = setTimeout(() => {
					observer.disconnect();
					reject(new Error("The artwork transition was never painted"));
				}, 5000);
				const observer = new MutationObserver(() => {
					const outgoing = root.querySelector<HTMLElement>("[data-gallery-transition]");
					const incoming = root.querySelector<HTMLElement>(".pswp__scroll-wrap");
					const animations = [
						...(incoming?.getAnimations() ?? []),
						...(outgoing?.getAnimations() ?? []),
					];
					if (!incoming || !outgoing || animations.length !== 2) return;
					observer.disconnect();
					// Capture the production clocks before pausing. Sampling a running
					// animation can miss its late frames when a CI worker is busy.
					void Promise.all(animations.map((animation) => animation.ready))
						.then(() => {
							clearTimeout(timeout);
							const states = animations.map((animation) => animation.playState);
							const startTimes = animations.map((animation) =>
								typeof animation.startTime === "number"
									? animation.startTime
									: null,
							);
							const currentTimes = animations.map((animation) =>
								Number(animation.currentTime),
							);
							const durations = animations.map((animation) =>
								Number(animation.effect?.getTiming().duration),
							);
							const travel = animations.map((animation) => {
								const frames = (animation.effect as KeyframeEffect).getKeyframes();
								return (
									Number.parseFloat(String(frames.at(-1)?.translate)) -
									Number.parseFloat(String(frames[0].translate))
								);
							});
							for (const animation of animations) animation.pause();
							const frames = [0, 0.25, 0.5, 0.75, 0.9].map((progress) => {
								for (const animation of animations)
									animation.currentTime = durations[0] * progress;
								return {
									incoming: incoming.getBoundingClientRect().x,
									outgoing: outgoing.getBoundingClientRect().x,
									exposure: Number(
										root
											.querySelector(":scope > svg feGaussianBlur")
											?.getAttribute("stdDeviation")
											?.split(" ")[0] ?? 0,
									),
								};
							});
							for (const animation of animations) animation.play();
							resolve({
								states,
								startTimes,
								currentTimes,
								durations,
								travel,
								frames,
							});
						})
						.catch((error) => {
							clearTimeout(timeout);
							reject(error);
						});
				});
				observer.observe(root, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["data-gallery-jump"],
				});
				root.querySelector<HTMLButtonElement>(
					`[data-gallery-preview="${destination}"]`,
				)?.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
			});
		}, to);
		await writeFile(
			testInfo.outputPath(`travel-${from + 1}-${to + 1}.json`),
			JSON.stringify(observation),
		);
		expect(observation.states).toEqual(["running", "running"]);
		expect(observation.startTimes.every((time) => time !== null)).toBe(true);
		expect(observation.startTimes[0]).toBe(observation.startTimes[1]);
		expect(observation.currentTimes[0]).toBeCloseTo(observation.currentTimes[1], 1);
		expect(observation.durations[0]).toBeGreaterThan(0);
		expect(observation.durations[0]).toBe(observation.durations[1]);
		expect(observation.travel.map(Math.abs)).toEqual([1440, 1440]);
		expect(observation.travel[0]).toBe(observation.travel[1]);
		expect(observation.frames).toHaveLength(5);
		expect(
			Math.max(...observation.frames.map((frame) => Math.abs(frame.outgoing))),
		).toBeGreaterThan(720);
		for (const frame of observation.frames)
			expect(Math.abs(frame.incoming - frame.outgoing)).toBeCloseTo(1440, -1);
		await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	}
	await page.keyboard.press("Escape");
});

test("artwork exposure is visible during travel while chrome stays sharp", async ({
	page,
}, testInfo) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(
		"/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story&globals=theme:dark",
	);
	await page
		.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	const previews = dialog.getByRole("group", { name: "Gallery previews" }).getByRole("button");
	await previews.nth(11).click();
	await expect(previews.nth(11)).toHaveAttribute("aria-current", "true");
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	const before = await dialog.locator("header").boundingBox();
	await dialog.evaluate(
		(root) =>
			new Promise<void>((resolve) => {
				const observer = new MutationObserver(() => {
					const old = root.querySelector("[data-gallery-transition]");
					const stage = root.querySelector(".pswp__scroll-wrap");
					const animations = [
						...(old?.getAnimations() ?? []),
						...(stage?.getAnimations() ?? []),
					];
					if (animations.length !== 2) return;
					observer.disconnect();
					for (const animation of animations) {
						animation.pause();
						animation.currentTime = 55;
					}
					resolve();
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
	await expect
		.poll(() =>
			dialog.evaluate((root) =>
				Number(
					root
						.querySelector(":scope > svg feGaussianBlur")
						?.getAttribute("stdDeviation")
						?.split(" ")[0] ?? 0,
				),
			),
		)
		.toBeGreaterThan(5);
	expect(await dialog.locator("header").boundingBox()).toEqual(before);
	await expect(dialog.locator("header")).toHaveCSS("filter", "none");
	await expect(dialog.locator("footer")).toHaveCSS("filter", "none");
	await expect(dialog.locator(".pswp__scroll-wrap")).toHaveCSS("filter", "none");
	await page.screenshot({ path: testInfo.outputPath("gallery-in-motion.png") });
	await dialog.evaluate((root) => {
		for (const element of root.querySelectorAll(
			"[data-gallery-transition], .pswp__scroll-wrap",
		))
			for (const animation of element.getAnimations()) animation.play();
	});
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	await expect(dialog.locator("[data-gallery-preview='2']")).toHaveAttribute(
		"aria-current",
		"true",
	);
	await page.screenshot({ path: testInfo.outputPath("gallery-settled.png") });
	await page.keyboard.press("Escape");
});

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1440]) {
		test(`distant jumps retain a painted frame and accept a new destination at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(
				`/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story&globals=theme:${theme}`,
			);
			await page
				.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
				.click();
			const dialog = page.getByRole("dialog");
			await expect(dialog).toHaveAttribute("data-gallery-state", "open");
			const surface = dialog.locator(
				'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
			);
			await expect
				.poll(() =>
					surface.evaluate(
						(image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
					),
				)
				.toBe(true);
			await dialog.evaluate((root) => {
				const monitor = root as HTMLElement & { frames?: number[] };
				monitor.frames = [];
				monitor.dataset.monitorFrames = "true";
				const sample = () => {
					if (!root.isConnected || !monitor.dataset.monitorFrames) return;
					const stage = root.querySelector(".pswp__scroll-wrap");
					const image = root.querySelector<HTMLImageElement>(
						'.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)',
					);
					const retained = root.querySelector<HTMLElement>("[data-gallery-transition]");
					const frames = [
						...(retained?.querySelectorAll<HTMLImageElement | HTMLCanvasElement>(
							"[data-gallery-frame]",
						) ?? []),
					];
					const bounds = image?.getBoundingClientRect();
					const onScreen = bounds && bounds.right > 0 && bounds.left < innerWidth;
					const current =
						stage && image?.complete && image.naturalWidth && onScreen
							? Number(getComputedStyle(stage).opacity)
							: 0;
					const outgoing =
						retained &&
						frames.some((frame) => {
							const bounds = frame.getBoundingClientRect();
							return (
								bounds.right > 0 &&
								bounds.left < innerWidth &&
								(frame instanceof HTMLCanvasElement
									? frame.width > 0
									: frame.complete && frame.naturalWidth > 0)
							);
						})
							? Number(getComputedStyle(retained).opacity)
							: 0;
					monitor.frames?.push(Math.max(current, outgoing));
					requestAnimationFrame(sample);
				};
				requestAnimationFrame(sample);
			});
			const previews = dialog
				.getByRole("group", { name: "Gallery previews" })
				.getByRole("button");
			for (const destination of [11, 4, 0, 11]) {
				await previews.nth(destination).click();
				await expect(previews.nth(destination)).toHaveAttribute("aria-current", "true");
				await expect(dialog).not.toHaveAttribute("data-gallery-jump");
				await expect(surface).toBeVisible();
			}
			// Dispatch without actionability waits so the second request interrupts a moving frame.
			await previews.nth(4).dispatchEvent("click", { detail: 1 });
			await previews.nth(9).dispatchEvent("click", { detail: 1 });
			await expect(dialog).toHaveAccessibleName("Match breakdown");
			await expect(dialog).not.toHaveAttribute("data-gallery-jump");
			const frames = await dialog.evaluate((root) => {
				const monitor = root as HTMLElement & { frames?: number[] };
				delete monitor.dataset.monitorFrames;
				return monitor.frames ?? [];
			});
			expect(frames.length).toBeGreaterThan(10);
			expect(Math.min(...frames)).toBeGreaterThanOrEqual(0.45);
			await expect(dialog.locator("[data-gallery-transition]")).toHaveCount(0);
			await page.screenshot({
				path: testInfo.outputPath(`gallery-jumps-${theme}-${width}.png`),
			});
			await page.keyboard.press("Home");
			await expect(dialog).toHaveAccessibleName("Programs");
			await expect(dialog).toHaveAttribute("data-instant", "true");
			await expect(dialog.locator("[data-gallery-transition]")).toHaveCount(0);
			await page.keyboard.press("Escape");
			await expect(dialog).toHaveCount(0);
		});
	}
}

test("zoom reels keep their places through rapid changes and settle on the latest value", async ({
	page,
}) => {
	await page.goto("/iframe.html?id=components-media-mediagallery--default&viewMode=story");
	await page
		.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	const readout = dialog.getByRole("button", { name: "Reset zoom to fit" });
	await readout.evaluate((button) => {
		(button as HTMLElement & { reels?: Element[] }).reels = [
			...button.querySelectorAll("[data-digit='0']"),
		]
			.map((digit) => digit.parentElement)
			.filter((reel): reel is HTMLElement => Boolean(reel));
	});
	await dialog.getByRole("button", { name: "Zoom in", exact: true }).click({ clickCount: 2 });
	await dialog.getByRole("button", { name: "Zoom out", exact: true }).click();
	await expect(readout).toHaveText("150%");
	expect(
		await readout.evaluate((button) =>
			(button as HTMLElement & { reels?: Element[] }).reels?.every((reel) =>
				button.contains(reel),
			),
		),
	).toBe(true);
	await expect
		.poll(() =>
			readout.evaluate(
				(button) =>
					button
						.getAnimations({ subtree: true })
						.filter((animation) => animation.playState === "running").length,
			),
		)
		.toBe(0);
	await readout.focus();
	await readout.press("Enter");
	await expect(readout).toHaveText("Fit");
	await expect(dialog).toHaveAttribute("data-instant", "true");
	await page.keyboard.press("Escape");
});

test("video ambience follows presented color changes and stops with playback", async ({ page }) => {
	// Keep the transport alive while the native video presents our synthetic frames.
	// Deliberately failed delivery now correctly replaces the player with its fallback.
	await installMuxMediaFixture(page);
	await page.goto(
		"/iframe.html?id=components-media-mediagallery--video-and-image&viewMode=story&globals=theme:dark",
	);
	await page.locator('[aria-roledescription="carousel"]').hover();
	await page.getByRole("button", { name: "Open expanded viewer", exact: true }).click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	const host = dialog.locator('.pswp__item[aria-hidden="false"] mux-video');
	await expect(host).toHaveAttribute("data-player-initialized", "");
	const player = dialog.locator('.pswp__item[aria-hidden="false"] [data-portfolio-video]');
	const playback = player.getByRole("button", { name: /^(Play|Pause) video$/ });
	await expect(playback).toBeVisible();
	// Enter playback through the real control before replacing native frames.
	// The inactive/poster guard must still reject unsolicited native play events.
	if ((await playback.getAttribute("aria-label")) === "Pause video") {
		await playback.click();
		await expect(playback).toHaveAccessibleName("Play video");
	}
	await playback.click();
	await expect(playback).toHaveAccessibleName("Pause video");
	await expect
		.poll(() =>
			host.evaluate((media) =>
				Boolean(!media.closest("[inert]") && !(media as HTMLMediaElement).paused),
			),
		)
		.toBe(true);
	const evidence = await host.evaluate(async (element) => {
		const video = element.shadowRoot?.querySelector("video");
		const root = element.closest(".pswp");
		if (!video || !root) throw new Error("Expected the native video and its ambient layer");
		const source = document.createElement("canvas");
		source.width = 96;
		source.height = 54;
		const context = source.getContext("2d");
		if (!context) throw new Error("Expected a synthetic frame context");
		const stream = source.captureStream(0);
		const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
		const nextFrame = () =>
			new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		const read = () => {
			const canvas = root.querySelector<HTMLCanvasElement>("canvas[data-active='true']");
			return [...(canvas?.getContext("2d")?.getImageData(48, 27, 1, 1).data ?? [])];
		};
		try {
			context.fillStyle = "#f00";
			context.fillRect(0, 0, 96, 54);
			video.srcObject = stream;
			video.muted = true;
			const playing = video.play();
			track.requestFrame();
			await playing;
			const samples: number[][] = [];
			for (const color of ["#f00", "#0f0", "#00f", "#f00"]) {
				const presented = new Promise<void>((resolve) =>
					video.requestVideoFrameCallback(() => resolve()),
				);
				track.requestFrame();
				context.fillStyle = color;
				context.fillRect(0, 0, 96, 54);
				await Promise.race([
					presented,
					new Promise<never>((_, reject) =>
						setTimeout(
							() => reject(new Error(`Synthetic ${color} frame was not presented`)),
							2000,
						),
					),
				]);
				await nextFrame();
				await nextFrame();
				samples.push(read());
			}
			video.pause();
			await nextFrame();
			const paused = read();
			track.requestFrame();
			context.fillStyle = "#0f0";
			context.fillRect(0, 0, 96, 54);
			await nextFrame();
			await nextFrame();
			return { samples, paused, still: read(), crossOrigin: video.crossOrigin };
		} finally {
			video.pause();
			video.srcObject = null;
			for (const mediaTrack of stream.getTracks()) mediaTrack.stop();
		}
	});
	for (const [index, channel] of [0, 1, 2, 0].entries()) {
		expect(evidence.samples[index][channel]).toBeGreaterThan(240);
		expect(evidence.samples[index][3]).toBeGreaterThan(240);
	}
	expect(evidence.crossOrigin).toBe("anonymous");
	expect(evidence.still).toEqual(evidence.paused);
	await dialog.getByRole("button", { name: "Close expanded viewer" }).click();
	await expect(dialog).toHaveCount(0);
});
