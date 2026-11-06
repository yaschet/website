import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SwissGridBox } from "@/src/components/ui/swiss-grid";
import { phoenix, portal, verto } from "../../../.storybook/project-fixtures";
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
		title: phoenix.title,
		description: phoenix.subtitle ?? phoenix.description,
		overview: phoenix.overview,
		date: phoenix.date,
		readingTime: phoenix.readingTime,
		markdownHref: "/case-studies/clearway-phoenix.md",
	},
} satisfies Meta<typeof CaseStudyHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { name: phoenix.title, level: 1 })).toBeVisible();
		await expect(canvas.getByRole("link", { name: "Case studies" })).toHaveAttribute(
			"href",
			"/case-studies",
		);
		await expect(canvas.getByRole("button", { name: "Copy Markdown" })).toBeEnabled();
		await expect(canvas.getByText("The problem", { exact: true })).toBeVisible();
		await expect(canvas.getByText("What I built", { exact: true })).toBeVisible();
	},
};

export const ShortIntroduction: Story = {
	args: {
		title: "Verto",
		description: verto.subtitle ?? verto.description,
		overview: verto.overview,
		date: verto.date,
		readingTime: verto.readingTime,
		markdownHref: "/case-studies/verto.md",
	},
};

export const StudentPortal: Story = {
	args: {
		title: portal.title,
		description: portal.subtitle ?? portal.description,
		overview: portal.overview,
		date: portal.date,
		readingTime: portal.readingTime,
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
					value: "Product Engineer",
				},
				{
					label: portal.delivery?.label ?? "Build",
					value: [portal.delivery?.period, portal.delivery?.duration]
						.filter(Boolean)
						.join(" · "),
				},
				{ label: "Status", value: "Delivered" },
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
