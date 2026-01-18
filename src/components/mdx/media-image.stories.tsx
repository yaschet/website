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
	title: "MDX/MediaImage",
	component: MediaImage,
	parameters: {
		layout: "padded",
		backgrounds: {
			default: "light",
		},
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
		src: "/images/verto/hero-dashboard.jpg",
		alt: "Verto Dashboard Interface",
		caption: "The main dashboard showing translation analytics",
	},
};

/**
 * Image without caption - just alt text shown.
 */
export const WithoutCaption: Story = {
	args: {
		src: "/images/verto/hero-editor.jpg",
		alt: "Translation Editor",
	},
};

/**
 * Priority loading for above-the-fold images.
 */
export const PriorityLoading: Story = {
	args: {
		src: "/images/verto/hero-translation.jpg",
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
				src="/images/verto/hero-dashboard.jpg"
				alt="Dashboard"
				caption="First image - hover to see zoom hint"
			/>
			<MediaImage
				src="/images/verto/architecture-overview.jpg"
				alt="Architecture"
				caption="Second image - click to open lightbox"
			/>
			<MediaImage
				src="/images/verto/document-pipeline.jpg"
				alt="Pipeline"
				caption="Third image - test ESC to close"
			/>
		</div>
	),
};

/**
 * Dark mode variant.
 */
export const DarkMode: Story = {
	args: {
		src: "/images/verto/hero-billing.jpg",
		alt: "Billing Interface",
		caption: "Dark mode appearance",
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
