import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
	title: "Foundation/Colors",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const colors = [
	{ name: "Surface", prefix: "surface" },
	{ name: "Primary", prefix: "primary" },
	{ name: "Secondary", prefix: "secondary" },
	{ name: "Accent", prefix: "accent" },
	{ name: "Info", prefix: "info" },
	{ name: "Success", prefix: "success" },
	{ name: "Warning", prefix: "warning" },
	{ name: "Destructive", prefix: "destructive" },
];

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const Palette: Story = {
	render: () => (
		<div className="portfolio-box-pad bg-surface-50 dark:bg-surface-950">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="portfolio-stack-related mb-10">
					<h1 className="portfolio-heading-xl portfolio-capsize-heading-xl text-surface-950 dark:text-surface-50">
						Colors
					</h1>
					<p className="portfolio-body-md text-surface-600 dark:text-surface-400">
						OKLCH color palette
					</p>
				</div>

				{/* Color Rows */}
				<div className="portfolio-stack-section">
					{colors.map((color) => (
						<div key={color.prefix}>
							<h2 className="portfolio-heading-sm mb-5 text-surface-900 dark:text-surface-100">
								{color.name}
							</h2>
							<div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 lg:grid-cols-11">
								{shades.map((shade) => (
									<div
										key={shade}
										className="flex flex-col"
										title={`${color.name} ${shade}`}
									>
										<div
											className="mb-2 aspect-square border border-surface-300 dark:border-surface-700"
											style={{
												backgroundColor: `var(--${color.prefix}-${shade})`,
											}}
										/>
										<p className="text-center font-mono font-semibold text-surface-700 text-xs dark:text-surface-300">
											{shade}
										</p>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	),
};
