import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { EditorialSection } from "@/src/components/layout/editorial-section";
import { AboutPrinciples } from "./about-principles";

const meta = {
	id: "content-aboutprinciples",
	title: "Components/Content/About Principles",
	component: AboutPrinciples,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<EditorialSection id="principles" title="How I think">
				<Story />
			</EditorialSection>
		),
	],
} satisfies Meta<typeof AboutPrinciples>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { level: 2, name: "How I think" })).toBeVisible();
		await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(4);
	},
};
