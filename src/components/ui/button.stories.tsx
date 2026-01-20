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

/**
 * Complete Showcase: All variants, colors, and sizes in one comprehensive grid.
 * Useful for design review and documentation.
 */
export const Showcase: Story = {
	parameters: {
		layout: "fullscreen",
		docs: {
			disable: true,
		},
	},
	render: () => {
		const variants: Array<"solid" | "soft" | "outlined" | "plain"> = [
			"solid",
			"soft",
			"outlined",
			"plain",
		];
		const colors: Array<
			"default" | "primary" | "accent" | "success" | "warning" | "info" | "destructive"
		> = ["default", "primary", "accent", "success", "warning", "info", "destructive"];
		const sizes: Array<"xs" | "sm" | "md" | "lg" | "xl"> = ["xs", "sm", "md", "lg", "xl"];

		return (
			<div className="min-h-screen bg-surface-50 p-8 dark:bg-surface-950">
				<div className="mx-auto max-w-7xl">
					{/* Header */}
					<div className="mb-12">
						<h1 className="mb-2 font-bold text-4xl text-surface-900 dark:text-surface-50">
							Button Showcase
						</h1>
						<p className="text-lg text-surface-600 dark:text-surface-400">
							Complete reference of all button variants, colors, and sizes.
						</p>
					</div>

					{/* Variants */}
					{variants.map((variant) => (
						<div key={variant} className="mb-16">
							{/* Variant Header */}
							<div className="mb-8 border-surface-200 border-b pb-4 dark:border-surface-800">
								<h2 className="font-bold text-2xl text-surface-900 capitalize dark:text-surface-50">
									{variant}
								</h2>
							</div>

							{/* Colors Grid */}
							<div className="mb-12 space-y-8">
								{colors.map((color) => (
									<div key={color}>
										{/* Color Label */}
										<p className="mb-4 font-semibold text-sm text-surface-500 uppercase tracking-widest dark:text-surface-400">
											{color}
										</p>

										{/* Size Grid */}
										<div className="flex flex-wrap gap-4">
											{sizes.map((size) => (
												<div
													key={size}
													className="flex flex-col items-center gap-2"
												>
													<Button
														variant={variant}
														color={color}
														size={size}
													>
														Button
													</Button>
													<span className="text-surface-500 text-xs dark:text-surface-400">
														{size}
													</span>
												</div>
											))}

											{/* Icon Buttons */}
											<div className="flex flex-col items-center gap-2">
												<Button
													variant={variant}
													color={color}
													size="icon-sm"
												>
													<PlusIcon size={16} weight="bold" />
												</Button>
												<span className="text-surface-500 text-xs dark:text-surface-400">
													icon-sm
												</span>
											</div>

											<div className="flex flex-col items-center gap-2">
												<Button variant={variant} color={color} size="icon">
													<PlusIcon size={18} weight="bold" />
												</Button>
												<span className="text-surface-500 text-xs dark:text-surface-400">
													icon
												</span>
											</div>

											<div className="flex flex-col items-center gap-2">
												<Button
													variant={variant}
													color={color}
													size="icon-lg"
												>
													<PlusIcon size={20} weight="bold" />
												</Button>
												<span className="text-surface-500 text-xs dark:text-surface-400">
													icon-lg
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					{/* States Section */}
					<div className="mb-16">
						<div className="mb-8 border-surface-200 border-b pb-4 dark:border-surface-800">
							<h2 className="font-bold text-2xl text-surface-900 dark:text-surface-50">
								States
							</h2>
						</div>

						<div className="space-y-8">
							{/* Disabled */}
							<div>
								<p className="mb-4 font-semibold text-sm text-surface-500 uppercase tracking-widest dark:text-surface-400">
									Disabled
								</p>
								<div className="flex flex-wrap gap-4">
									<Button variant="solid" color="primary" disabled>
										Disabled
									</Button>
									<Button variant="soft" color="accent" disabled>
										Disabled
									</Button>
									<Button variant="outlined" color="success" disabled>
										Disabled
									</Button>
									<Button variant="plain" color="info" disabled>
										Disabled
									</Button>
								</div>
							</div>

							{/* Loading */}
							<div>
								<p className="mb-4 font-semibold text-sm text-surface-500 uppercase tracking-widest dark:text-surface-400">
									Loading
								</p>
								<div className="flex flex-wrap gap-4">
									<Button variant="solid" color="primary" loading>
										Saving
									</Button>
									<Button variant="soft" color="accent" loading>
										Processing
									</Button>
									<Button variant="outlined" color="success" loading>
										Uploading
									</Button>
									<Button variant="plain" color="info" loading>
										Loading
									</Button>
								</div>
							</div>

							{/* With Tooltip */}
							<div>
								<p className="mb-4 font-semibold text-sm text-surface-500 uppercase tracking-widest dark:text-surface-400">
									With Tooltip
								</p>
								<div className="flex flex-wrap gap-4">
									<Button
										variant="solid"
										color="primary"
										tooltipContent="This is a helpful tooltip"
									>
										Hover me
									</Button>
									<Button
										variant="outlined"
										color="success"
										size="icon"
										tooltipContent="Add new item"
									>
										<PlusIcon size={18} weight="bold" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
};
