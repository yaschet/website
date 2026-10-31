import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SwissGridBox } from "@/src/components/ui/swiss-grid";
import { CaseStudyFacts, CaseStudyHeader } from "./case-study-summary";

const meta = {
	id: "layout-casestudysummary",
	title: "Components/Content/Case Study Header",
	component: CaseStudyHeader,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<SwissGridBox className="mx-auto max-w-5xl">
				<Story />
			</SwissGridBox>
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

export const StudentPortal: Story = {
	args: {
		title: "Student Applications & Document Collection",
		description:
			"Replace WhatsApp document collection with guided student applications that feed the advisor’s existing records.",
		date: "2026-10-01",
		readingTime: 4,
		markdownHref: "/case-studies/clearway-portal.md",
	},
};

export const ProjectFacts: Story = {
	render: () => (
		<CaseStudyFacts
			projectTitle="Student Applications & Document Collection"
			facts={[
				{
					label: "Role",
					value: "Sole engineer",
				},
				{ label: "Status", value: "Delivered · August–October 2025" },
				{ label: "Domain", value: "Student onboarding" },
			]}
			stack={[
				"Next.js",
				"React",
				"TypeScript",
				"Laravel",
				"PHP",
				"AWS Textract",
				"OpenAI",
				"S3",
				"next-intl",
				"TanStack Query",
			]}
			stackHighlights={["Next.js", "Laravel", "AWS Textract"]}
			stackLabel="Engine Stack"
		/>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("region", { name: "Engine Stack" })).toBeVisible();
		await expect(
			canvas.getByRole("button", {
				name: "Stack: all 10 technologies for Student Applications & Document Collection",
			}),
		).toBeEnabled();
	},
};
