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
	{ name: "Accent", prefix: "accent" },
	{ name: "Info", prefix: "info" },
	{ name: "Success", prefix: "success" },
	{ name: "Warning", prefix: "warning" },
	{ name: "Destructive", prefix: "destructive" },
];

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const Palette: Story = {
	render: () => (
		<div className="min-h-screen bg-surface-50 p-16 dark:bg-surface-950">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-24">
					<h1 className="mb-1 font-bold text-6xl text-surface-950 dark:text-surface-50">
						Colors
					</h1>
					<p className="text-sm text-surface-600 dark:text-surface-400">
						OKLCH color palette
					</p>
				</div>

				{/* Color Rows */}
				<div className="flex flex-col gap-20">
					{colors.map((color) => (
						<div key={color.prefix}>
							<h2 className="mb-6 font-bold text-lg text-surface-900 dark:text-surface-100">
								{color.name}
							</h2>
							<div
								className="grid gap-3"
								style={{
									gridTemplateColumns: `repeat(${shades.length}, minmax(0, 1fr))`,
								}}
							>
								{shades.map((shade) => (
									<div
										key={shade}
										className="flex flex-col"
										title={`${color.name} ${shade}`}
									>
										<div
											className="mb-2 aspect-square border border-surface-300 dark:border-surface-700"
											style={{
												backgroundColor: `var(--${color.prefix}-color-${shade})`,
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
