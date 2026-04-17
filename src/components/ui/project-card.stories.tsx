import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ProjectEntry } from "@/src/content/types";
import { ProjectCard } from "./project-card";

/**
 * Project showcase card for portfolio listings.
 */
const meta: Meta<typeof ProjectCard> = {
	title: "Components/ProjectCard",
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
			description: "Contentlayer Project document.",
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
	title: "Verto — Financial OS",
	description:
		"A high-performance trading platform built for institutional grade execution. Focusing on latency reduction and geometric clarity.",
	date: "2024-05-15",
	tags: ["fintech"],
	urlPath: "/case-studies/verto",
	tech: ["Next.js", "TypeScript", "Tailwind v4", "Framer Motion", "Rust"],
	featured: true,
	hideCoverGallery: false,
	cardState: "public" as const,
	id: "project:verto",
	slug: "verto",
	readingTime: 6,
	Content: () => null,
};

export const Featured: Story = {
	args: {
		project: mockProject as ProjectEntry,
	},
};

export const Standard: Story = {
	args: {
		project: {
			...mockProject,
			featured: false,
			title: "Swiss Grid System",
			tech: ["Canvas API", "Physics", "React"],
		} as ProjectEntry,
	},
};
