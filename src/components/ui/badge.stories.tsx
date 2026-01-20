import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

/**
 * Compact semantic indicator for categorization and status labeling.
 */
const meta: Meta<typeof Badge> = {
	title: "Primitives/Badge",
	component: Badge,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"An architectural label primitive with 4 visual treatments and 7 semantic color mappings.",
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["solid", "soft", "outlined", "plain"],
			description: "Visual weight of the badge.",
			table: { category: "Appearance" },
		},
		color: {
			control: "select",
			options: [
				"default", // Changed from primary to default as explicit option
				"primary",
				"secondary",
				"accent",
				"success",
				"warning",
				"info",
				"destructive",
			],
			description: "Semantic color mapping.",
			table: { category: "Appearance" },
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Physical dimensions.",
			table: { category: "Dimensions" },
		},
		shape: {
			control: "select",
			options: ["default", "sm", "md", "full"], // Simplified shapes based on new component
			description: "Border radius override.",
			table: { category: "Dimensions" },
		},
		interactive: {
			control: "boolean",
			description: "Enables hover/active physics.",
			table: { category: "Behavior" },
		},
	},
	args: {
		children: "Badge",
		variant: "solid",
		color: "default",
		size: "md",
		shape: "default",
		interactive: false,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SolidPrimary: Story = {
	args: {
		variant: "solid",
		color: "primary",
		children: "Primary Status",
	},
};

export const SoftSuccess: Story = {
	args: {
		variant: "soft",
		color: "success",
		children: "Success Label",
	},
};

export const OutlinedWarning: Story = {
	args: {
		variant: "outlined",
		color: "warning",
		children: "Warning Required",
	},
};

export const Destructive: Story = {
	args: {
		variant: "solid",
		color: "destructive",
		children: "Critical Error",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		children: "Large Badge",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		children: "Compact",
	},
};
