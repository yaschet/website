import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";
import { ConfidentialWorkCallout } from "../layout/confidential-work-callout";
import { ProjectCardGallery } from "./project-card-gallery";

const publicImages = ["/images/verto/review-editor.png", "/images/verto/dashboard-page.png"];

const meta = {
	id: "components-projectcardgallery",
	title: "Components/Content/Project Card",
	component: ProjectCardGallery,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The production project card: a title, square navigation chamber and explanation share an evenly padded content panel. A quieter full-width surface groups index, date and technologies below it. Both panels use aligned text rails and one structural hairline at each boundary. The native title link extends across the caption; media controls remain separate. Long metadata checks wrapping with a real public preview.",
			},
		},
	},
	argTypes: { date: { control: "text", description: "Display label, formatted by the caller." } },
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto max-w-5xl">
				<Story />
			</div>
		),
	],
	args: {
		title: "Verto",
		description:
			"Architecture of a proprietary AI-powered translation engine designed for high-volume document pipelines.",
		href: "/case-studies/verto",
		index: "02",
		date: "January 2026",
		imageTreatment: "disciplined",
		tags: ["Next.js 16", "TypeScript", "OpenAI"],
	},
} satisfies Meta<typeof ProjectCardGallery>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Public: Story = {
	args: { images: publicImages },
	play: async ({ canvas }) => {
		const image = canvas.getByRole("img", { name: "Verto" });
		await expect(image).toBeVisible();
		await waitFor(() => expect(image).toHaveProperty("complete", true), { timeout: 5000 });
		await expect(image).not.toHaveProperty("naturalWidth", 0);
	},
};
export const WithoutPreview: Story = {
	parameters: {
		docs: { description: { story: "Fallback when no reviewed public media is available." } },
	},
};
export const Confidential: Story = {
	args: {
		title: "Confidential work",
		description: "Private work is discussed directly with prospective clients.",
		isPrivate: true,
	},
};
export const LongMetadata: Story = {
	args: {
		images: publicImages,
		title: "A long case-study heading across narrow screens",
		description:
			"Solo-built operational rebuild for a study-abroad consultancy: schema redesign, AI-powered ETL, and explainable ranking across 33,612 spreadsheet rows.",
		tags: [
			"Next.js 16",
			"TypeScript",
			"PostgreSQL",
			"Durable execution",
			"Document reconstruction",
			"Observability",
			"OpenTelemetryInstrumentation",
		],
	},
};

export const InContext: Story = {
	args: {
		images: publicImages,
		tags: [
			"Next.js 16",
			"OpenAI",
			"Trigger.dev",
			"Stripe",
			"Supabase",
			"Google Cloud",
			"Tiptap",
			"TypeScript",
		],
	},
	parameters: {
		docs: {
			description: {
				story: "The homepage work list at full content width. Each project and the vertical confidential-work card own the same surface, hairline and equal caption insets. A 40px canvas gap separates the cards; no connecting frame or extra listing inset surrounds them.",
			},
		},
	},
	render: (args) => (
		<div className="portfolio-stack-section">
			<ProjectCardGallery {...args} />
			<ConfidentialWorkCallout />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: /^Verto$/ })).toHaveAttribute(
			"href",
			"/case-studies/verto",
		);
		const note = canvas.getByRole("heading", { name: "Confidential work" });
		await expect(note).toBeVisible();
		const continuation = note.parentElement;
		if (!continuation) throw new Error("Missing private-work continuation");
		await expect(within(continuation).getByRole("link", { name: "in a call" })).toHaveAttribute(
			"href",
			"/contact",
		);
		await expect(within(continuation).queryByRole("button")).toBeNull();
	},
};
