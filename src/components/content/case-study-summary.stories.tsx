import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { CaseStudyFacts, CaseStudyHeader } from "./case-study-summary";

const meta = {
	id: "layout-casestudysummary",
	title: "Components/Content/Case Study Header",
	component: CaseStudyHeader,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto max-w-5xl">
				<Story />
			</div>
		),
	],
	args: {
		title: "Program Matching Engine",
		description:
			"The original matching workflow broke in live advising calls. I rebuilt it into three connected systems: a normalized schema, a resumable AI import pipeline, and an explainable matching engine advisors could trust during real student calls.",
		date: "2025-06-01",
		readingTime: 10,
		markdownHref: "/case-studies/clearway-phoenix.md",
	},
} satisfies Meta<typeof CaseStudyHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("heading", { name: "Program Matching Engine", level: 1 }),
		).toBeVisible();
		await expect(canvas.getByRole("link", { name: "Case studies" })).toHaveAttribute(
			"href",
			"/case-studies",
		);
		await expect(canvas.getByRole("button", { name: "Copy Markdown" })).toBeEnabled();
	},
};

export const ShortIntroduction: Story = {
	args: {
		title: "Verto",
		description:
			"Architecture of a proprietary AI-powered translation engine designed for high-volume document pipelines.",
		date: "2026-01-26",
		markdownHref: "/case-studies/verto.md",
	},
};

export const ProjectFacts: Story = {
	render: () => (
		<CaseStudyFacts
			facts={[
				{
					label: "Role",
					value: "Sole Engineer (Architecture, Backend, Frontend, DevOps, QA)",
				},
				{ label: "Status", value: "Shipped / In Active Use" },
				{ label: "Domain", value: "Education Operations / Internal Tools" },
			]}
			stack={[
				"Next.js 16 (Server Actions)",
				"Trigger.dev (Durable Execution)",
				"Supabase (RLS & Realtime)",
				"PostgreSQL (Double-Entry Ledger)",
				"TypeScript",
			]}
			stackLabel="Engine Stack"
		/>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("list", { name: "Engine Stack" })).toBeVisible();
		await expect(
			canvas.getByText("PostgreSQL (Double-Entry Ledger)", { exact: true }),
		).toBeVisible();
	},
};
