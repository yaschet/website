import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
	title: "Foundation/Typography",
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReadingHierarchy: Story = {
	render: () => (
		<div className="portfolio-box-pad portfolio-stack-section mx-auto max-w-5xl">
			<div className="portfolio-stack-related">
				<p className="portfolio-kicker">Space Grotesk and Space Mono</p>
				<h1 className="portfolio-heading-xl portfolio-capsize-heading-xl">
					Readable by design.
				</h1>
			</div>
			<div className="portfolio-stack-related">
				<h2 className="portfolio-heading-lg portfolio-capsize-heading-lg">
					Case-study section
				</h2>
				<h3 className="portfolio-heading-sm portfolio-capsize-heading-sm">
					Supporting heading
				</h3>
			</div>
			<p className="portfolio-body-lg">Large body: a concise introduction to the work.</p>
			<p className="portfolio-body-md">
				Body: editorial reading text with a responsive line height and comfortable measure.
			</p>
			<p className="portfolio-body-sm">
				Small body: supporting explanations that remain readable on narrow screens.
			</p>
			<p className="portfolio-body-xs">Extra-small body: secondary details.</p>
			<p className="portfolio-kicker">6 min read</p>
			<p className="portfolio-control-label">Control label</p>
			<code className="break-words font-mono text-sm">
				const result = await submitContactForm(input);
			</code>
		</div>
	),
};
