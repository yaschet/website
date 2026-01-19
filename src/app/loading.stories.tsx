import type { Meta, StoryObj } from "@storybook/react";
import Loading from "./loading";

const meta: Meta<typeof Loading> = {
	title: "App Shell/Loading",
	component: Loading,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The 'Architect's Loop' loader. A minimalist, kinetic SVG stroke that draws a 20x20 square. Pure contrast, no atmospheric effects.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {};
