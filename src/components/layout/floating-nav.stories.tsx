import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingNav } from "./floating-nav";

/**
 * ## FloatingNav
 *
 * The primary interaction dock.
 * Features:
 * - **Sliding Indicator**: Mechanical "slot" that follows hover and active state.
 * - **The Gravity Shutter**: Top-down theme transition.
 * - **Responsive Adaptation**: Handles viewport constraints with balanced padding.
 */
const meta: Meta<typeof FloatingNav> = {
	title: "Layout/FloatingNav",
	component: FloatingNav,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			appDirectory: true,
		},
	},
	decorators: [
		(Story) => (
			<div className="h-screen w-full bg-surface-50 p-20 dark:bg-surface-950">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof FloatingNav>;

export const Default: Story = {};
