import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkshopPagePreview } from "../../.storybook/page-preview";
import AppError from "./error";

const meta = {
	title: "Pages/Error",
	component: AppError,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The current error route in a padded preview viewport. The route itself remains a work in progress.",
			},
		},
	},
	argTypes: {
		reset: { action: "reset clicked" },
	},
	decorators: [
		(Story) => (
			<WorkshopPagePreview routeState>
				<Story />
			</WorkshopPagePreview>
		),
	],
} satisfies Meta<typeof AppError>;

export default meta;
type Story = StoryObj<typeof meta>;

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
