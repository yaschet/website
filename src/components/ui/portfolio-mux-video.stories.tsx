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
