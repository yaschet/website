/**
 * MediaImage Storybook Stories.
 *
 * @remarks
 * Visual tests for the MediaImage component.
 *
 * @public
 */

import type { Meta, StoryObj } from "@storybook/react";
import { MediaImage } from "./media-image";

const meta: Meta<typeof MediaImage> = {
	id: "components-media-mediaimage",
	title: "Components/Media/Image",
	component: MediaImage,
	parameters: {
		layout: "padded",
	},
	argTypes: {
		src: {
			control: "text",
			description: "Image source path",
		},
		alt: {
			control: "text",
			description: "Alt text for accessibility",
		},
		caption: {
			control: "text",
			description: "Optional caption below image",
		},
		priority: {
			control: "boolean",
			description: "Load image with priority (above-the-fold)",
		},
	},
};

export default meta;
type Story = StoryObj<typeof MediaImage>;

/**
 * Default image with a standard landscape aspect ratio.
 * Static import enables blur placeholder.
 */
export const Default: Story = {
	args: {
		src: "/images/verto/dashboard-page.png",
		alt: "Verto Dashboard Interface",
		caption: "The main dashboard showing translation analytics",
	},
};

/**
 * Image without caption - just alt text shown.
 */
export const WithoutCaption: Story = {
	args: {
		src: "/images/verto/review-editor.png",
		alt: "Translation Editor",
	},
};

/**
 * Priority loading for above-the-fold images.
 */
export const PriorityLoading: Story = {
	args: {
		src: "/images/verto/new-translation-page.png",
		alt: "Translation Flow",
		caption: "Priority loaded image (check Network tab)",
		priority: true,
	},
};

/**
 * Multiple images to test hover interaction.
 */
export const Gallery: Story = {
	render: () => (
		<div className="space-y-8">
			<MediaImage
				src="/images/verto/dashboard-page.png"
				alt="Dashboard"
				caption="First image - hover to see zoom hint"
			/>
			<MediaImage
				src="/images/verto/dashboard-page.png"
				alt="Architecture"
				caption="Second image - click to open lightbox"
			/>
			<MediaImage
				src="/images/verto/pipeline-processing.png"
				alt="Pipeline"
				caption="Third image - test ESC to close"
			/>
		</div>
	),
};
