import { RiAddLine as PlusIcon, RiDeleteBinLine as TrashIcon } from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { StateSwap } from "./state-swap";

/**
 * Shared action control with keyboard focus, loading state, and continuous content geometry.
 */
const meta: Meta<typeof Button> = {
	id: "primitives-button",
	title: "Components/Actions/Button",
	component: Button,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Yaschet's square controls with independent appearance and semantic color. A single glyph chamber replaces its icon with the spinner, or expands beside a text-only label. StateSwap can resize to its active text while crossfading. Pending actions retain focus and color while blocking repeat activation; keyboard and reduced-motion feedback is immediate.",
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
			options: [
				"xs",
				"sm",
				"md",
				"lg",
				"xl",
				"icon",
				"icon-xs",
				"icon-sm",
				"icon-lg",
				"icon-xl",
			],
			description:
				"Foundation geometry: 28 / 36 / 40 / 44 / 48px. The md alias means the default 40px control.",
			table: { category: "Dimensions" },
		},
		shape: { table: { disable: true } },
		loading: {
			control: "boolean",
			description:
				"Shows progress and blocks activation while preserving focus and contrast.",
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
				<TrashIcon size={16} />
				Delete
			</>
		),
	},
};

export const IconOnly: Story = {
	args: {
		variant: "outlined",
		size: "icon",
		children: <PlusIcon size={20} />,
		tooltipContent: "Add item",
		"aria-label": "Add item",
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
	args: { ...Primary.args, children: "Click", onClick: fn() },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledTimes(1);
		button.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onClick).toHaveBeenCalledTimes(2);
	},
};

/** Purposeful hierarchy and supported sizes, rather than every API permutation. */
export const Showcase: Story = {
	parameters: { layout: "fullscreen" },
	render: () => (
		<div className="portfolio-box-pad portfolio-stack-group max-w-4xl">
			<div className="portfolio-stack-related">
				<h2 className="portfolio-heading-sm">Action hierarchy</h2>
				<p className="portfolio-body-sm text-muted-foreground">
					One primary action. Quiet secondary controls. Color carries a specific meaning.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<Button>Send message</Button>
					<Button variant="soft">Save draft</Button>
					<Button variant="outlined">View project</Button>
					<Button variant="plain">Cancel</Button>
				</div>
			</div>
			<div className="portfolio-stack-related">
				<h2 className="portfolio-heading-sm">Foundation sizes</h2>
				<div className="flex flex-wrap items-center gap-3">
					<Button size="sm" variant="soft">
						Compact · 36px
					</Button>
					<Button size="md" variant="soft">
						Default · 40px
					</Button>
					<Button size="lg" variant="soft">
						Large · 44px
					</Button>
					<Button size="icon" variant="soft" aria-label="Add item">
						<PlusIcon />
					</Button>
				</div>
			</div>
			<div className="portfolio-stack-related">
				<h2 className="portfolio-heading-sm">States and intent</h2>
				<div className="flex flex-wrap items-center gap-3">
					<Button disabled>Unavailable</Button>
					<Button loading>Sending…</Button>
					<Button variant="soft" color="destructive">
						<TrashIcon />
						Delete draft
					</Button>
				</div>
			</div>
		</div>
	),
};

const actionLabels = {
	idle: "Save changes",
	pending: "Saving changes",
	complete: "Changes saved",
};

function PendingExample() {
	const [state, setState] = useState<keyof typeof actionLabels>("idle");
	const pending = state === "pending";
	return (
		<div className="portfolio-stack-group w-full max-w-2xl">
			<div className="portfolio-stack-related">
				<h2 className="portfolio-heading-sm">Continuous feedback, balanced spacing</h2>
				<p className="portfolio-body-sm text-muted-foreground">
					Start the local example, then complete it to compare the states. No request is
					sent.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<Button
						aria-label={actionLabels[state]}
						loading={pending}
						onClick={() => setState("pending")}
					>
						<StateSwap
							kind="text"
							sizing="content"
							value={state}
							items={actionLabels}
						/>
					</Button>
					<Button
						aria-label="Add item"
						loading={pending}
						onClick={() => setState("pending")}
						size="icon"
						variant="soft"
					>
						<PlusIcon aria-hidden="true" />
					</Button>
					<Button asChild loading={pending} variant="outline">
						<a href="#example-preview">View example</a>
					</Button>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<Button
					disabled={!pending}
					size="sm"
					variant="plain"
					onClick={() => setState("complete")}
				>
					Complete example
				</Button>
				<Button size="sm" variant="plain" onClick={() => setState("idle")}>
					Reset example
				</Button>
			</div>
		</div>
	);
}

export const PendingGeometry: Story = {
	name: "Interaction details",
	render: () => <PendingExample />,
};
