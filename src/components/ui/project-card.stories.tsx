import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ProjectEntry } from "@/src/content/types";
import { ProjectCard } from "./project-card";

/**
 * Project showcase card for portfolio listings.
 */
const meta: Meta<typeof ProjectCard> = {
	id: "experiments-projectcard",
	title: "Lab/Alternative Project Card",
	component: ProjectCard,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Linked card displaying project metadata with tech stack pills and group-hover interactions.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="max-w-md bg-surface-50 p-6 dark:bg-surface-950">
				<Story />
			</div>
		),
	],
	argTypes: {
		project: {
			description: "Public project metadata.",
			table: { category: "Data" },
		},
		className: {
			control: "text",
			description: "Additional CSS classes.",
			table: { category: "Styling" },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockProject = {
	title: "Verto",
	description:
		"Architecture of a proprietary AI-powered translation engine designed for high-volume document pipelines.",
	date: "2026-01-26",
	tags: ["document translation"],
	urlPath: "/case-studies/verto",
	tech: ["Next.js 16", "TypeScript", "Supabase", "OpenAI", "PostgreSQL"],
	featured: true,
	hideCoverGallery: false,
	listed: true,
	cardState: "public",
	id: "project:verto",
	slug: "verto",
	readingTime: 6,
	Content: () => null,
} satisfies ProjectEntry;

export const Featured: Story = {
	args: {
		project: mockProject,
	},
};

export const Standard: Story = {
	args: {
		project: {
			...mockProject,
			featured: false,
			title: "Swiss Grid System",
			tech: ["Canvas API", "Physics", "React"],
		},
	},
};
