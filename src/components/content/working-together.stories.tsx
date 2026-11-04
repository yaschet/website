import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { WorkingTogether } from "./working-together";

const meta = {
	id: "content-working-together",
	title: "Components/Content/Working Together",
	component: WorkingTogether,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The homepage's project-enquiry overview. Practical answers stay visible in a single framed section, with two columns on larger screens and one column on phones.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="pb-[var(--portfolio-space-section)]">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof WorkingTogether>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		const section = canvas.getByRole("region", { name: "Working together" });
		await expect(section).toBeVisible();
		await expect(
			canvas.getByRole("heading", { level: 3, name: "How do pricing and timing work?" }),
		).toBeVisible();
		await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(4);
	},
};
