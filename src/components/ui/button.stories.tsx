import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "./button";

/**
 * Primary UI action element with physics-based hover/tap feedback.
 */
const meta: Meta<typeof Button> = {
	title: "Primitives/Button",
	component: Button,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A GPU-accelerated button with layered spring animations for scale, Y-translation, and shadow.",
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["solid", "soft", "outlined", "plain"],
			description: "Visual weight of the button.",
			table: { category: "Appearance" },
		},
		color: {
			control: "select",
			options: ["default", "primary", "accent", "success", "warning", "info", "destructive"],
			description: "Semantic color mapping.",
			table: { category: "Appearance" },
		},
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl", "icon", "icon-sm", "icon-lg"],
			description: "Physical dimensions.",
			table: { category: "Dimensions" },
		},
		shape: {
			control: "select",
			options: ["default", "none", "sm", "md", "lg", "xl", "full"],
			description: "Border radius override.",
			table: { category: "Dimensions" },
		},
		loading: {
			control: "boolean",
			description: "Shows spinner and disables interaction.",
			table: { category: "State" },
		},
		disabled: {
			control: "boolean",
			table: { category: "State" },
		},
		asChild: {
			table: { disable: true },
		},
		tooltipContent: {
			control: "text",
			description: "Tooltip text on hover.",
			table: { category: "Tooltip" },
		},
		tooltipSide: {
			control: "select",
			options: ["top", "right", "bottom", "left"],
			table: { category: "Tooltip" },
		},
	},
	args: {
		children: "Button",
		variant: "solid",
		color: "default",
		size: "md",
		loading: false,
		disabled: false,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
	args: { variant: "solid", color: "primary", children: "Primary Action" },
};

export const Accent: Story = {
	args: { variant: "solid", color: "accent", children: "Accent" },
};

export const Soft: Story = {
	args: { variant: "soft", color: "default", children: "Soft" },
};

export const Outlined: Story = {
	args: { variant: "outlined", color: "default", children: "Outlined" },
};

export const Plain: Story = {
	args: { variant: "plain", color: "default", children: "Plain" },
};

export const WithTooltip: Story = {
	args: {
		children: "Hover",
		tooltipContent: "Tooltip content",
		tooltipSide: "top",
	},
};

export const Loading: Story = {
	args: { loading: true, children: "Saving..." },
};

export const Destructive: Story = {
	args: {
		variant: "solid",
		color: "destructive",
		children: (
			<>
				<TrashIcon size={16} weight="bold" />
				Delete
			</>
		),
	},
};

export const IconOnly: Story = {
	args: {
		variant: "outlined",
		size: "icon",
		children: <PlusIcon size={20} weight="bold" />,
		tooltipContent: "Add item",
	},
};

export const HoverState: Story = {
	args: { ...Primary.args, children: "Hover" },
	parameters: { pseudo: { hover: true } },
};

export const ActiveState: Story = {
	args: { ...Primary.args, children: "Active" },
	parameters: { pseudo: { active: true } },
};

export const InteractionTest: Story = {
	args: { ...Primary.args, children: "Click" },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await userEvent.click(button);
		await expect(button).toBeInTheDocument();
	},
};
