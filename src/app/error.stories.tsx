import type { Meta, StoryObj } from "@storybook/react";
import AppError from "./error";

const meta: Meta<typeof AppError> = {
	title: "App Shell/Error",
	component: AppError,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Error state using the 'Swiss Sandwich' grid layout. Ensures full-height grid containment.",
			},
		},
	},
	argTypes: {
		reset: { action: "reset clicked" },
	},
};

export default meta;
type Story = StoryObj<typeof AppError>;

export const Default: Story = {
	args: {
		error: new Error("Simulated system failure"),
		// biome-ignore lint/suspicious/noConsole: Mock function
		reset: () => console.log("Reset function triggered"),
	},
};

export const WithDigest: Story = {
	args: {
		error: Object.assign(new Error("Database connection timeout"), {
			digest: "ERR_DB_TIMEOUT_500",
		}),
		// biome-ignore lint/suspicious/noConsole: Mock function
		reset: () => console.log("Reset function triggered"),
	},
};
