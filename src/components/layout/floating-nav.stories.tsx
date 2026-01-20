import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FloatingNav } from "./floating-nav";

/**
 * Fixed-position navigation dock with animated active indicator.
 */
const meta: Meta<typeof FloatingNav> = {
	title: "Layout/FloatingNav",
	component: FloatingNav,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A glassmorphic navigation bar that floats above page content with GPU-accelerated spring animations and theme toggle support.",
			},
		},
		nextjs: {
			appDirectory: true,
		},
	},
	decorators: [
		(Story) => (
			<div className="flex h-screen w-full items-end justify-center bg-surface-50 pb-29.5 dark:bg-surface-950">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
