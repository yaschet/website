import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

/**
 * ## Button - Swiss Precision Edition
 *
 * A high-performance, precision-engineered button component.
 * Features coordinated physics for hover and tap states,
 * subsurface lighting effects, and integrated Radix UI tooltips.
 */
const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["solid", "soft", "outlined", "plain"],
			description: "The visual style of the button.",
		},
		color: {
			control: "select",
			options: ["default", "primary", "accent", "success", "warning", "info", "destructive"],
			description: "The semantic color scheme.",
		},
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl", "icon", "icon-sm", "icon-lg"],
			description: "The physical size of the button.",
		},
		shape: {
			control: "select",
			options: ["default", "none", "sm", "md", "lg", "xl", "full"],
			description: "Override for the border radius.",
		},
		loading: {
			control: "boolean",
			description: "Displays a loading spinner and disables interaction.",
		},
		asChild: {
			table: {
				disable: true,
			},
		},
	},
	args: {
		children: "Precision Button",
		variant: "solid",
		color: "default",
		size: "md",
		loading: false,
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

/**
 * The core brand identity.
 * High contrast, sharp edges (0px radius by default).
 */
export const SolidPrimary: Story = {
	args: {
		variant: "solid",
		color: "primary",
		children: "Solid Primary",
	},
};

/**
 * Accessible accent color for specific UI call-to-actions.
 */
export const SolidAccent: Story = {
	args: {
		variant: "solid",
		color: "accent",
		children: "Solid Accent",
	},
};

/**
 * Low-emphasis background with subtle text contrast.
 */
export const Soft: Story = {
	args: {
		variant: "soft",
		color: "default",
		children: "Soft Button",
	},
};

/**
 * Architectural refinement using fine-line borders.
 */
export const Outlined: Story = {
	args: {
		variant: "outlined",
		color: "default",
		children: "Outlined Button",
	},
};

/**
 * Minimalist ghost button for secondary actions.
 */
export const Plain: Story = {
	args: {
		variant: "plain",
		color: "default",
		children: "Plain Button",
	},
};

/**
 * Integrated Radix UI Tooltip with engineering-grade timing (700ms default).
 */
export const WithTooltip: Story = {
	args: {
		children: "Hover me",
		tooltipContent: "Precision-timed engineering tooltip",
		tooltipSide: "top",
	},
};

/**
 * Coordinated spinner transition that maintains button width.
 */
export const Loading: Story = {
	args: {
		loading: true,
		children: "Saving changes...",
	},
};

/**
 * Destructive action with immediate visual urgency.
 */
export const Destructive: Story = {
	args: {
		variant: "solid",
		color: "destructive",
		children: (
			<>
				<TrashIcon size={16} weight="bold" />
				Delete Content
			</>
		),
	},
};

/**
 * Icon-only variants for compact UI real estate.
 */
export const Icon: Story = {
	args: {
		variant: "outlined",
		size: "icon",
		children: <PlusIcon size={20} weight="bold" />,
		tooltipContent: "Add New Item",
	},
};

/**
 * Forced pseudo-states for documentation purposes.
 * Enabled via `storybook-addon-pseudo-states`.
 */
export const HoverState: Story = {
	args: {
		...SolidPrimary.args,
		children: "Forced Hover",
	},
	parameters: {
		pseudo: { hover: true },
	},
};

export const ActiveState: Story = {
	args: {
		...SolidPrimary.args,
		children: "Forced Active",
	},
	parameters: {
		pseudo: { active: true },
	},
};

/**
 * 2026 Standard: Interaction Testing
 * Using the 'play' function to simulate user behavior.
 */
import { expect, userEvent, within } from "storybook/test";

export const InteractionTest: Story = {
	args: {
		...SolidPrimary.args,
		children: "Click Test",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await userEvent.click(button);
		// In a real test, you'd assert on some outcome
		await expect(button).toBeInTheDocument();
	},
};
