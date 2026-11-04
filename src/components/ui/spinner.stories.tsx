import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

const meta: Meta<typeof Spinner> = {
	id: "primitives-spinner",
	title: "Components/Feedback/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"The same Remix loader used by Yaschet Foundation. Keep visible loading text alongside decorative button spinners.",
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
			<div className="portfolio-box-pad bg-surface-50 dark:bg-surface-950">
				<div className="mx-auto max-w-5xl space-y-12">
					<div>
						<h1 className="portfolio-heading-lg mb-5 text-surface-900 dark:text-surface-50">
							Spinner Showcase
						</h1>
						<p className="portfolio-body-md text-surface-600 dark:text-surface-400">
							All sizes and semantic color mappings.
						</p>
					</div>

					{colors.map((color) => (
						<div key={color} className="space-y-4">
							<h2 className="font-mono text-sm text-surface-600 uppercase tracking-wider dark:text-surface-400">
								{color}
							</h2>
							<div className="flex flex-wrap items-center gap-5 border-surface-200 border-b pb-5 dark:border-surface-800">
								{sizes.map((size) => (
									<div key={size} className="flex flex-col items-center gap-3">
										<Spinner size={size} color={color} />
										<span className="font-mono text-surface-600 text-xs dark:text-surface-400">
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
