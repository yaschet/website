import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "../ui/button";

const meta = {
	title: "Foundation/Spacing",
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const spaces = ["tight", "related", "group", "section", "major"] as const;

export const Rhythm: Story = {
	render: () => (
		<div className="portfolio-box-pad portfolio-stack-section mx-auto max-w-5xl">
			<h1 className="portfolio-heading-lg">10px portfolio rhythm</h1>
			<p className="portfolio-body-md">
				10 / 20 / 30 / 40 / 80px roles. Hairlines and optical clearances are separate
				measurements.
			</p>
			{spaces.map((name) => (
				<div key={name} className="portfolio-stack-tight">
					<code>--portfolio-space-{name}</code>
					<div
						aria-hidden="true"
						className="h-4 bg-surface-900 dark:bg-surface-100"
						style={{ width: `var(--portfolio-space-${name})` }}
					/>
				</div>
			))}
			<div className="portfolio-control-row">
				<Button size="sm">Compact / 36px</Button>
				<Button size="md">Default / 40px</Button>
				<Button size="lg">Prominent / 44px</Button>
			</div>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("button", { name: "Compact / 36px" })).toHaveStyle({
			height: "36px",
		});
		await expect(canvas.getByRole("button", { name: "Default / 40px" })).toHaveStyle({
			height: "40px",
		});
		await expect(canvas.getByRole("button", { name: "Prominent / 44px" })).toHaveStyle({
			height: "44px",
		});
	},
};
