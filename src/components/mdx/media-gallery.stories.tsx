/**
 * MediaGallery Storybook Stories.
 *
 * @remarks
 * Visual tests for the MediaGallery component.
 *
 * @public
 */

import type { Meta, StoryObj } from "@storybook/react";
import { PageGalleryScope } from "@/src/components/ui/page-gallery-scope";
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

/** Distant thumbnail jumps and a horizontally scrolling strip use the same bounded transition. */
export const LongSequence: Story = {
	args: {
		images: [
			"/images/clearway-phoenix/phase-1/01-programs-table.png",
			"/images/clearway-phoenix/phase-1/03-programs-modal-grade-requirements.png",
			"/images/clearway-phoenix/phase-1/05-universities-table.png",
			"/images/clearway-phoenix/phase-1/09-university-detail-overview.png",
			"/images/clearway-phoenix/phase-1/13-settings-scholarship-types-categories.png",
			"/images/clearway-phoenix/phase-2/p2-archive-dashboard-hero.png",
			"/images/clearway-phoenix/phase-2/p2-02-editorial-dashboard-angle.png",
			"/images/clearway-phoenix/phase-2/p2-03-editorial-signal-detail.png",
			"/images/clearway-phoenix/phase-3/p3-01-semantic-search-machine-learning.png",
			"/images/clearway-phoenix/phase-3/p3-02-match-score-positive-breakdown.png",
			"/images/clearway-phoenix/phase-3/p3-04-critical-score-breakdown.png",
			"/images/clearway-phoenix/phase-3/p3-06-assigned-programs-workflow.png",
		],
		captions: [
			"Programs",
			"Grade requirements",
			"Universities",
			"University details",
			"Scholarship categories",
			"Import dashboard",
			"Import status",
			"Import details",
			"Semantic search",
			"Match breakdown",
			"Critical conditions",
			"Assigned programs",
		],
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

/** Image inspection and video playback share one viewer and return to the same inline item. */
export const MixedMedia: Story = {
	args: {
		items: [
			{
				kind: "image",
				src: "/images/verto/dashboard-page.png",
				alt: "Verto dashboard",
				caption: "Translation activity and credit usage at a glance.",
			},
			{
				kind: "mux-video",
				playbackId: "WNddSfv9LgR1KV01uf3sL02o02Lc9COwBWyr8rp7dsnceI",
				poster: "/images/verto/dashboard-page.png",
				title: "Verto walkthrough",
				caption: "Explore the translation workflow.",
			},
			{
				kind: "image",
				src: "/images/verto/review-editor.png",
				alt: "Verto review editor",
				caption: "Review translated documents alongside their source.",
			},
			{
				kind: "image",
				src: "/images/verto/billing-page.png",
				alt: "Verto billing",
				caption: "Manage credits and billing details.",
			},
		],
	},
};

/** Separate article blocks join one fullscreen sequence, including the cover video. */
export const PageWideMedia: Story = {
	parameters: { layout: "padded" },
	render: () => (
		<PageGalleryScope>
			<div className="mx-auto grid max-w-3xl gap-12">
				<MediaGallery
					items={[
						{
							kind: "mux-video",
							playbackId: "WNddSfv9LgR1KV01uf3sL02o02Lc9COwBWyr8rp7dsnceI",
							poster: "/images/verto/dashboard-page.png",
							title: "Verto walkthrough",
						},
					]}
				/>
				<MediaGallery
					images={["/images/verto/review-editor.png"]}
					caption="Document review"
				/>
				<MediaGallery
					images={["/images/verto/billing-page.png"]}
					caption="Credits and billing"
				/>
			</div>
		</PageGalleryScope>
	),
};
