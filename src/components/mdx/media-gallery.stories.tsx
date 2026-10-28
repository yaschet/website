/**
 * MediaGallery Storybook Stories.
 *
 * @remarks
 * Visual tests for the MediaGallery component.
 *
 * @public
 */

import type { Meta, StoryObj } from "@storybook/react";
import { MediaGallery } from "./media-gallery";

const meta: Meta<typeof MediaGallery> = {
	id: "components-media-mediagallery",
	title: "Components/Media/Media Gallery",
	component: MediaGallery,
	parameters: {
		layout: "padded",
	},
	argTypes: {
		images: {
			control: "object",
			description: "Array of image source paths",
		},
		captions: {
			control: "object",
			description: "Optional array of captions for each image",
		},
		caption: {
			control: "text",
			description: "Fallback caption for all images",
		},
		aspectRatio: {
			control: "text",
			description: "Aspect ratio (e.g., 16/9, 4/3, 1/1, or 'auto' for adaptive)",
		},
	},
};

export default meta;
type Story = StoryObj<typeof MediaGallery>;

/**
 * Default gallery with multiple images.
 * Uses 'auto' aspect ratio - container morphs to each image's native ratio.
 */
export const Default: Story = {
	args: {
		images: [
			"/images/verto/dashboard-page.png",
			"/images/verto/review-editor.png",
			"/images/verto/new-translation-page.png",
			"/images/verto/billing-page.png",
		],
		caption: "Verto Platform Overview",
	},
};

/**
 * Gallery with per-image captions.
 * Caption updates as you navigate.
 */
export const WithPerImageCaptions: Story = {
	args: {
		images: [
			"/images/verto/dashboard-page.png",
			"/images/verto/pipeline-processing.png",
			"/images/verto/billing-page.png",
		],
		captions: ["Dashboard overview", "Document Processing Pipeline", "Billing overview"],
	},
};

/**
 * Fixed aspect ratio (16/9).
 * Traditional gallery mode - container doesn't morph.
 */
export const FixedAspectRatio: Story = {
	args: {
		images: ["/images/verto/dashboard-page.png", "/images/verto/review-editor.png"],
		aspectRatio: "16/9",
		caption: "Fixed 16:9 aspect ratio",
	},
};

/**
 * Single image - no navigation needed.
 */
export const SingleImage: Story = {
	args: {
		images: ["/images/verto/dashboard-page.png"],
		caption: "Single image - no arrows shown",
	},
};

/**
 * Square aspect ratio variant.
 */
export const SquareAspect: Story = {
	args: {
		images: ["/images/verto/dashboard-page.png", "/images/verto/review-editor.png"],
		aspectRatio: "1/1",
		caption: "Square aspect ratio gallery",
	},
};

/** The same inline player and image navigation used in case studies. */
export const VideoAndImage: Story = {
	args: {
		items: [
			{
				kind: "mux-video",
				playbackId: "WNddSfv9LgR1KV01uf3sL02o02Lc9COwBWyr8rp7dsnceI",
				poster: "/images/verto/dashboard-page.png",
				title: "Verto walkthrough",
			},
			{
				kind: "image",
				src: "/images/verto/review-editor.png",
				alt: "Verto review editor",
			},
		],
		caption: "Verto walkthrough and review editor",
	},
};
