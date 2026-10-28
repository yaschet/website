import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkshopPagePreview } from "../../.storybook/page-preview";
import NotFound from "./not-found";

const meta = {
	title: "Pages/Not Found",
	component: NotFound,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The current 404 route in a padded preview viewport. The route itself remains a work in progress.",
			},
		},
	},
	decorators: [
		(Story) => (
			<WorkshopPagePreview routeState>
				<Story />
			</WorkshopPagePreview>
		),
	],
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
