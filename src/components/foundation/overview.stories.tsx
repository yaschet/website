import {
	RiArrowRightUpLine as ArrowUpRight,
	RiCheckboxCircleLine as CheckCircle,
	RiInformationLine as Info,
	RiErrorWarningLine as WarningDiamond,
} from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { expect, waitFor } from "storybook/test";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Textarea } from "../ui/form/textarea";
import { SwissGridBox, SwissGridRow } from "../ui/swiss-grid";

const meta = {
	id: "foundation-overview",
	title: "Foundation/Brand Overview",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The portfolio's current foundation in one reading flow: type, tonal surfaces, actions, fields, status, and icon treatment. These are production exports, not a second set of workshop components. Dedicated pages document their states and interactions.",
			},
		},
	},
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Production primitives composed on the portfolio's actual structural rails. */
export const Portfolio: Story = {
	play: async ({ canvasElement, globals }) => {
		await waitFor(() =>
			expect(canvasElement.ownerDocument.documentElement).toHaveClass(globals.theme),
		);
	},
	render: () => <PortfolioSpecimen />,
};

function PortfolioSpecimen() {
	const id = useId();
	return (
		<div className="portfolio-box-pad mx-auto max-w-5xl">
			<SwissGridBox>
				<SwissGridRow>
					<div className="portfolio-box-pad portfolio-stack-related">
						<p className="portfolio-kicker">Yaschet Foundation</p>
						<h1 className="portfolio-heading-xl portfolio-capsize-heading-xl">
							Complex systems, clean interfaces.
						</h1>
						<p className="portfolio-body-lg">
							Space Grotesk for reading. Space Mono for technical metadata. Sharp
							geometry, tonal planes, and registered keylines.
						</p>
					</div>
				</SwissGridRow>
				<SwissGridRow>
					<div className="portfolio-box-pad portfolio-stack-related">
						<p className="portfolio-kicker">Actions</p>
						<h2 className="portfolio-heading-sm">A consistent control language</h2>
						<div className="portfolio-control-row">
							<Button>Primary action</Button>
							<Button variant="soft">Secondary action</Button>
							<Button variant="outlined">Outlined action</Button>
							<Button variant="plain">Plain action</Button>
						</div>
						<div className="portfolio-control-row">
							<Button variant="outlined" aria-label="Open example" size="icon">
								<ArrowUpRight size={20} aria-hidden />
							</Button>
							<Button loading>Sending</Button>
							<Button disabled>Unavailable</Button>
						</div>
						<p className="portfolio-body-md">
							Sharp corners, quiet depth, visible keyboard focus. Foundation controls
							use 28 / 36 / 40 / 44 / 48px geometry.
						</p>
					</div>
				</SwissGridRow>
				<SwissGridRow>
					<div className="portfolio-box-pad portfolio-stack-related">
						<p className="portfolio-kicker">Fields</p>
						<h2 className="portfolio-heading-sm">Clear labels and useful feedback</h2>
						<div className="portfolio-stack-related grid gap-5 md:grid-cols-2">
							<div className="portfolio-stack-tight">
								<Label htmlFor={`${id}-name`}>Name</Label>
								<Input id={`${id}-name`} size="sm" placeholder="Your name" />
							</div>
							<div className="portfolio-stack-tight">
								<Label htmlFor={`${id}-email`}>Email</Label>
								<Input
									id={`${id}-email`}
									aria-describedby={`${id}-email-error`}
									size="sm"
									type="email"
									hasError
								/>
								<p
									id={`${id}-email-error`}
									className="portfolio-caption text-destructive-600 dark:text-destructive-400"
								>
									Enter a valid email address.
								</p>
							</div>
						</div>
						<div className="portfolio-stack-tight">
							<Label htmlFor={`${id}-message`}>Message</Label>
							<Textarea
								id={`${id}-message`}
								placeholder="Tell me about your project"
							/>
						</div>
					</div>
				</SwissGridRow>
				<SwissGridRow>
					<div className="portfolio-box-pad portfolio-stack-related">
						<p className="portfolio-kicker">Status and iconography</p>
						<h2 className="portfolio-heading-sm">Color carries meaning</h2>
						<div className="portfolio-control-row">
							<Badge variant="outlined">TypeScript</Badge>
							<Badge variant="soft" color="success">
								<CheckCircle size={16} aria-hidden />
								Complete
							</Badge>
							<Badge variant="soft" color="warning">
								<WarningDiamond size={16} aria-hidden />
								Needs attention
							</Badge>
							<Badge variant="soft" color="info">
								<Info size={16} aria-hidden />
								Information
							</Badge>
						</div>
						<p className="portfolio-body-md">
							Neutral surfaces lead. Status colors support explicit text. Remix icons
							use the same glyphs as Foundation and follow the size of their control.
						</p>
					</div>
				</SwissGridRow>
				<SwissGridRow>
					<div className="portfolio-box-pad portfolio-stack-related">
						<p className="portfolio-kicker">Brand and scope</p>
						<h2 className="portfolio-heading-sm">One Yaschet identity</h2>
						<p className="portfolio-body-md">
							Typography, geometry, color roles, iconography, and motion should speak
							the same language across Yaschet. The portfolio uses editorial
							compositions; the private application uses denser workflows.
						</p>
						<p className="portfolio-body-sm">
							This workshop documents the public implementation. The retained
							component bank still needs a usage and API review before it can be
							called a mature, complete system.
						</p>
					</div>
				</SwissGridRow>
			</SwissGridBox>
		</div>
	);
}
