import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "./logo";

const meta: Meta<typeof Logo> = {
	title: "UI/Logo",
	component: Logo,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
	args: {
		className: "h-12 w-12 text-surface-900 dark:text-surface-50",
	},
};

/**
 * "Defense Contractor" Scale
 */
export const SmallIcon: Story = {
	args: {
		className: "h-6 w-6 text-surface-900 dark:text-surface-50",
	},
};

/**
 * "Monolith" Scale
 */
export const Massive: Story = {
	args: {
		className: "h-64 w-64 text-surface-900 dark:text-surface-50",
	},
};

/**
 * "Swiss Red" - High aggression.
 */
export const Aggressive: Story = {
	args: {
		className: "h-24 w-24 text-red-600",
	},
};
