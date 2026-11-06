import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { ButtonLink } from "./button-link";
import { MeshGradient } from "./mesh-gradient";
import { SwissGridProvider, SwissGridSection } from "./swiss-grid-canvas";

const meta = {
	id: "experiments-meshgradient",
	title: "Lab/Mesh Gradient",
	component: MeshGradient,
	parameters: {
		layout: "fullscreen",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"The January 2026 boxed-hero composition, using the current profile, typography and actions. The mesh stays behind the same content rail as the grid. This retained experiment is separate from the public portfolio's SiteHeroField.",
			},
		},
	},
} satisfies Meta<typeof MeshGradient>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="workshop-stage">
			<SwissGridProvider>
				<div className="workshop-grid-content">
					<SwissGridSection id="mesh-hero" className="relative isolate w-full">
						<MeshGradient>
							<div className="workshop-grid-column">
								<ProfileSection />
								<div className="portfolio-box-pad portfolio-stack-related relative z-10">
									<h1 className="portfolio-hero-title portfolio-capsize-hero text-balance">
										I build products for the web.
									</h1>
									<p className="portfolio-body-lg max-w-[48ch] text-muted-foreground">
										Web apps. SaaS platforms. Internal tools. From the first
										idea to the final deploy. Complex systems that feel
										effortless.
									</p>
									<div className="portfolio-control-row">
										<ButtonLink href="/case-studies" variant="solid">
											Case studies <ArrowRightIcon weight="bold" />
										</ButtonLink>
										<ButtonLink href="/contact" variant="outline">
											Email
										</ButtonLink>
									</div>
								</div>
							</div>
						</MeshGradient>
					</SwissGridSection>
					<SwissGridSection id="mesh-work" className="relative w-full">
						<div className="workshop-grid-column">
							<div className="portfolio-box-pad flex flex-wrap items-center justify-between gap-5">
								<h2 className="portfolio-section-heading">View selected work.</h2>
								<ButtonLink href="/case-studies" variant="outline">
									Case studies <ArrowRightIcon weight="bold" />
								</ButtonLink>
							</div>
						</div>
					</SwissGridSection>
				</div>
			</SwissGridProvider>
		</div>
	),
};
