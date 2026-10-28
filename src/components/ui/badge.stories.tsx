import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

/**
 * Compact semantic indicator for categorization and status labeling.
 */
const meta: Meta<typeof Badge> = {
	id: "primitives-badge",
	title: "Components/Feedback/Badge",
	component: Badge,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Compact semantic labels: solid fills, soft tints, outlined keylines, or plain text. Portfolio chips use the lighter keyline treatment. No shadows or movement.",
			},
		},
	},
	argTypes: {
		variant: {
			control: "select",
			options: ["solid", "soft", "outlined", "plain"],
			description: "Solid fill, soft tint, outlined keylines, or plain text.",
			table: { category: "Appearance" },
		},
		color: {
			control: "select",
			options: [
				"default",
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
			options: ["default", "sm", "md", "full"],
			description: "Border radius override.",
			table: { category: "Dimensions" },
		},
		interactive: {
			control: "boolean",
			description:
				"Emphasizes keylines on hover or press. Styling only; callers own interaction semantics and keyboard access.",
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

const variants = ["solid", "soft", "outlined", "plain"] as const;
const colors = [
	"default",
	"primary",
	"secondary",
	"accent",
	"success",
	"warning",
	"info",
	"destructive",
] as const;

/** Shows every supported color against all four treatments in the active theme. */
export const ColorMatrix: Story = {
	render: () => (
		<div className="flex flex-col gap-5">
			{colors.map((color) => (
				<div key={color} className="flex flex-wrap items-center gap-3">
					<span className="w-24 font-mono text-xs">{color}</span>
					{variants.map((variant) => (
						<Badge key={variant} color={color} variant={variant}>
							{variant}
						</Badge>
					))}
				</div>
			))}
		</div>
	),
};
