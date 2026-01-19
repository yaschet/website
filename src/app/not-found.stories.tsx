import type { Meta, StoryObj } from "@storybook/react";
import NotFound from "./not-found";

const meta: Meta<typeof NotFound> = {
	title: "App Shell/Not Found",
	component: NotFound,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"404 state using the 'Swiss Sandwich' grid layout. Ensures full-height grid containment.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof NotFound>;

export const Default: Story = {};
