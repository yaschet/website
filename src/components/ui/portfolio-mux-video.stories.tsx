import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { MediaVideo } from "../mdx/media-video";

const meta = {
	id: "components-media-video-player",
	title: "Components/Media/Video Player",
	component: MediaVideo,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"The article player waits for Play before mounting the playback engine. The failure stories inject a media error to exercise local retry, poster return and focus; they do not simulate a complete network transport or native Safari.",
			},
		},
	},
	args: {
		playbackId: "yiAwSuxIOVkCUZemf5jOzwfqwG01lH46A2GjtF8moZ8Q",
		poster: "/images/verto/verto-film-poster.jpg",
		duration: "1:40",
		caption: "Verto document review walkthrough. The case study explains the workflow in text.",
		muted: true,
		loop: false,
	},
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof MediaVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Control the public media boundary, not decoding or network performance. */
export const DelayedFirstFrame: Story = {
	beforeEach: async () => {
		await import("@mux/mux-video");
		const prototype = customElements.get("mux-video")?.prototype;
		if (!prototype) throw new Error("Mux element did not register.");
		let paused = true;
		const properties: PropertyDescriptorMap = {
			src: { get: () => "", set: () => {} },
			currentSrc: { get: () => "" },
			readyState: { get: () => 1 },
			paused: { get: () => paused },
			duration: { get: () => 100 },
			videoWidth: { get: () => 1280 },
			videoHeight: { get: () => 720 },
			load: { value: () => {} },
			unload: { value: () => {} },
			play: {
				value(this: HTMLElement) {
					paused = false;
					this.dispatchEvent(new Event("play"));
					return Promise.resolve();
				},
			},
			pause: {
				value(this: HTMLElement) {
					paused = true;
					this.dispatchEvent(new Event("pause"));
				},
			},
		};
		const originals = Object.fromEntries(
			Object.keys(properties).map((key) => [
				key,
				Object.getOwnPropertyDescriptor(prototype, key),
			]),
		);
		for (const [key, descriptor] of Object.entries(properties)) {
			Object.defineProperty(prototype, key, { ...descriptor, configurable: true });
		}
		return () => {
			for (const [key, descriptor] of Object.entries(originals)) {
				if (descriptor) Object.defineProperty(prototype, key, descriptor);
				else Reflect.deleteProperty(prototype, key);
			}
		};
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const play = canvas.getByRole("button", { name: "Play 1:40 video" });
		const idleHeight = play.getBoundingClientRect().height;
		await userEvent.click(play);
		await waitFor(() =>
			expect(
				canvasElement.querySelector("mux-video[data-player-initialized]"),
			).not.toBeNull(),
		);
		const media = canvasElement.querySelector("mux-video");
		if (!media) throw new Error("Media did not mount.");
		media.dispatchEvent(new Event("loadedmetadata"));
		await expect(play).toBeVisible();
		await expect(play).toHaveAttribute("aria-busy", "true");
		await expect(play.getBoundingClientRect().height).toBe(idleHeight);
		await expect(canvas.queryByRole("button", { name: "Pause video" })).toBeNull();

		Object.defineProperty(media, "readyState", { configurable: true, value: 4 });
		media.dispatchEvent(new Event("playing"));
		const pause = await canvas.findByRole("button", { name: "Pause video" });
		await expect(pause).toBeVisible();
		await expect(pause.getBoundingClientRect().height).toBe(idleHeight);
		await expect(pause.getBoundingClientRect().width).toBe(idleHeight);
		const player = canvasElement.querySelector<HTMLElement>("[data-portfolio-video]");
		const panel = player?.querySelector<HTMLElement>("[data-player-panel]");
		if (!player || !panel) throw new Error("Controls did not mount.");
		await userEvent.hover(player);
		await userEvent.unhover(player);
		await waitFor(() => expect(getComputedStyle(panel).visibility).toBe("hidden"));
		await expect(panel.inert).toBe(true);
	},
};

async function failInitializedMedia(canvasElement: HTMLElement) {
	const selector = "mux-video[data-player-initialized]";
	await waitFor(() => expect(canvasElement.querySelector(selector)).not.toBeNull());
	const media = canvasElement.querySelector(selector);
	if (!media) throw new Error("Player event wiring did not initialize.");
	media.dispatchEvent(new Event("error"));
}

export const PlaybackFailure: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Play 1:40 video" }));
		await failInitializedMedia(canvasElement);
		await expect(await canvas.findByRole("button", { name: "Try again" })).toBeVisible();
		await expect(canvas.getByRole("button", { name: "Return to poster" })).toBeVisible();
	},
};

export const RetryAndPosterReturn: Story = {
	play: async (context) => {
		await PlaybackFailure.play?.(context);
		const { canvas, canvasElement, userEvent } = context;
		await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
		await failInitializedMedia(canvasElement);
		await userEvent.click(await canvas.findByRole("button", { name: "Return to poster" }));
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Play 1:40 video" })).toHaveFocus(),
		);
		// Focus restoration must not expose an actionable control through a fading ancestor.
		for (
			let element: HTMLElement | null = canvas.getByRole("button", {
				name: "Play 1:40 video",
			});
			element && canvasElement.contains(element);
			element = element.parentElement
		) {
			await expect(getComputedStyle(element).opacity).toBe("1");
		}
		await expect(canvasElement.querySelector("mux-video")).toBeNull();
	},
};
