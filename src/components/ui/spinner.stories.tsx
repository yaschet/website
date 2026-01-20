import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

const meta: Meta<typeof Spinner> = {
	title: "Primitives/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A system-consistent SVG spinner with 'draw-square' animation. Used for loading states.",
			},
		},
	},
	argTypes: {
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"],
			description: "Physical dimensions.",
			table: { category: "Appearance" },
		},
		color: {
			control: "select",
			options: [
				"default",
				"primary",
				"secondary",
				"accent",
				"info",
				"success",
				"warning",
				"destructive",
				"white",
			],
			description: "Semantic color mapping.",
			table: { category: "Appearance" },
		},
	},
	args: {
		size: "md",
		color: "default",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
	args: { color: "primary" },
};

export const Accent: Story = {
	args: { color: "accent" },
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-end gap-4">
			<Spinner size="xs" />
			<Spinner size="sm" />
			<Spinner size="md" />
			<Spinner size="lg" />
			<Spinner size="xl" />
		</div>
	),
};

export const Showcase: Story = {
	parameters: {
		layout: "fullscreen",
	},
	render: () => {
		const sizes: Array<"xs" | "sm" | "md" | "lg" | "xl"> = ["xs", "sm", "md", "lg", "xl"];
		const colors: Array<
			| "default"
			| "primary"
			| "secondary"
			| "accent"
			| "info"
			| "success"
			| "warning"
			| "destructive"
		> = [
			"default",
			"primary",
			"secondary",
			"accent",
			"info",
			"success",
			"warning",
			"destructive",
		];

		return (
			<div className="min-h-screen bg-surface-50 p-12 dark:bg-surface-950">
				<div className="mx-auto max-w-5xl space-y-12">
					<div>
						<h1 className="mb-2 font-bold text-4xl text-surface-900 dark:text-surface-50">
							Spinner Showcase
						</h1>
						<p className="text-surface-600 dark:text-surface-400">
							All sizes and semantic color mappings.
						</p>
					</div>

					{colors.map((color) => (
						<div key={color} className="space-y-4">
							<h3 className="font-mono text-sm text-surface-500 uppercase tracking-wider">
								{color}
							</h3>
							<div className="flex items-center gap-8 border-surface-200 border-b pb-8 dark:border-surface-800">
								{sizes.map((size) => (
									<div key={size} className="flex flex-col items-center gap-3">
										<Spinner size={size} color={color} />
										<span className="font-mono text-surface-400 text-xs">
											{size}
										</span>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	},
};
