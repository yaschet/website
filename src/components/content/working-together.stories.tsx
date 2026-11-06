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
					"The shared project-enquiry overview on Home and About. A full-width header and accordion rows share the work cards' inner spacing. Booking stays in the separate page call to action.",
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
		await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(7);
	},
};
