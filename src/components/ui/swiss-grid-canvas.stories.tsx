import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonLink } from "./button-link";
import { SwissGridProvider, SwissGridSection } from "./swiss-grid-canvas";

/**
 * Canvas-based grid overlay for layout visualization.
 */
const meta = {
	id: "experiments-swissgridcanvas",
	title: "Lab/Swiss Grid Canvas",
	component: SwissGridProvider,
	tags: ["autodocs"],
	args: { children: null, dashSize: 9, gapSize: 7 },
	argTypes: {
		children: { control: false, table: { disable: true } },
		dashSize: { control: { type: "range", min: 3, max: 17, step: 2 } },
		gapSize: { control: { type: "range", min: 3, max: 17, step: 2 } },
	},
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A retained canvas-grid experiment with three registered sections on one centered content rail. Canvas coordinates belong to this example, including inside Docs. The public portfolio uses the server-rendered SwissGridBox instead.",
			},
		},
	},
} satisfies Meta<typeof SwissGridProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<div className="workshop-stage">
			<SwissGridProvider {...args}>
				<div className="workshop-grid-content">
					<SwissGridSection id="grid-hero">
						<div className="workshop-grid-column portfolio-box-pad portfolio-stack-related">
							<p className="portfolio-kicker">Portfolio layout</p>
							<h1 className="portfolio-case-study-title portfolio-capsize-case-title text-balance">
								Aligned by one grid.
							</h1>
							<p className="portfolio-reading-copy text-muted-foreground">
								Three content sections share the same outer edge and inner reading
								rail. The canvas registers their actual boundaries as the content
								reflows.
							</p>
						</div>
					</SwissGridSection>
					<SwissGridSection id="grid-content">
						<div className="workshop-grid-column portfolio-box-pad grid gap-5 sm:grid-cols-2">
							<div className="portfolio-stack-tight">
								<h2 className="portfolio-detail-title">A shared content rail.</h2>
								<p className="portfolio-body-sm text-muted-foreground">
									Headings, copy and actions start at the same inset in every
									section.
								</p>
							</div>
							<div className="portfolio-stack-tight">
								<h2 className="portfolio-detail-title">Content sets the height.</h2>
								<p className="portfolio-body-sm text-muted-foreground">
									Columns stack on phones. Their edges stay registered without
									fixed-height placeholders.
								</p>
							</div>
						</div>
					</SwissGridSection>
					<SwissGridSection id="grid-footer">
						<div className="workshop-grid-column portfolio-box-pad flex flex-wrap items-center justify-between gap-5">
							<p className="portfolio-body-sm text-muted-foreground">
								From structure to shipped work.
							</p>
							<ButtonLink href="/case-studies" variant="outline">
								Case studies <ArrowRightIcon weight="bold" />
							</ButtonLink>
						</div>
					</SwissGridSection>
				</div>
			</SwissGridProvider>
		</div>
	),
};
