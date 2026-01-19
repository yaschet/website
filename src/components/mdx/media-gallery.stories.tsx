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
	title: "MDX/MediaGallery",
	component: MediaGallery,
	parameters: {
		layout: "padded",
		backgrounds: {
			default: "light",
		},
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
			"/images/verto/hero-dashboard.jpg",
			"/images/verto/hero-editor.jpg",
			"/images/verto/hero-translation.jpg",
			"/images/verto/hero-billing.jpg",
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
			"/images/verto/architecture-overview.jpg",
			"/images/verto/document-pipeline.jpg",
			"/images/verto/credit-system.jpg",
		],
		captions: [
			"System Architecture Overview",
			"Document Processing Pipeline",
			"Credit-Based Billing System",
		],
	},
};

/**
 * Fixed aspect ratio (16/9).
 * Traditional gallery mode - container doesn't morph.
 */
export const FixedAspectRatio: Story = {
	args: {
		images: ["/images/verto/hero-dashboard.jpg", "/images/verto/hero-editor.jpg"],
		aspectRatio: "16/9",
		caption: "Fixed 16:9 aspect ratio",
	},
};

/**
 * Single image - no navigation needed.
 */
export const SingleImage: Story = {
	args: {
		images: ["/images/verto/hero-dashboard.jpg"],
		caption: "Single image - no arrows shown",
	},
};

/**
 * Square aspect ratio variant.
 */
export const SquareAspect: Story = {
	args: {
		images: ["/images/verto/hero-dashboard.jpg", "/images/verto/hero-editor.jpg"],
		aspectRatio: "1/1",
		caption: "Square aspect ratio gallery",
	},
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
	args: {
		images: [
			"/images/verto/hero-dashboard.jpg",
			"/images/verto/hero-editor.jpg",
			"/images/verto/hero-translation.jpg",
		],
		caption: "Dark mode gallery",
	},
	parameters: {
		backgrounds: {
			default: "dark",
		},
	},
	decorators: [
		(Story) => (
			<div className="dark bg-surface-950 p-8">
				<Story />
			</div>
		),
	],
};
