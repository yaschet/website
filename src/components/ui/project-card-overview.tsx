import { RiArrowRightUpLine } from "@remixicon/react";
import { Badge } from "@/src/components/ui/badge";
import { LinkFeedback } from "@/src/components/ui/link-feedback";
import { PortfolioLink } from "@/src/components/ui/portfolio-link";
import { ReelIcon } from "@/src/components/ui/reel";
import type { ProjectDelivery, ProjectOverview } from "@/src/content/types";

interface ProjectCardOverviewProps {
	title: string;
	headingLevel: 2 | 3;
	overview: ProjectOverview;
	role?: string;
	delivery?: ProjectDelivery;
	href: string;
	isPrivate: boolean;
}

/** Read-only project badges share the title's reading area and wrap as complete labels. */
export function ProjectCardOverview({
	title,
	headingLevel,
	overview,
	role,
	delivery,
	href,
	isPrivate,
}: ProjectCardOverviewProps) {
	const Heading = headingLevel === 2 ? "h2" : "h3";
	const productFacts = [
		{ term: "Product type", value: overview.context, slot: "project-context" },
		...(overview.capability
			? [{ term: "Capability", value: overview.capability, slot: "project-capability" }]
			: []),
	];
	const involvementFacts = [
		...(role ? [{ term: "Role", value: role, slot: "project-role" }] : []),
		...(delivery
			? [
					{
						term: delivery.label,
						value: delivery.duration
							? `Built in ${delivery.duration}`
							: delivery.period,
						slot: "project-timing",
					},
				]
			: []),
	];
	const heading = (
		<Heading className="portfolio-project-title portfolio-capsize-project-title">
			{title}
		</Heading>
	);
	return (
		<div data-slot="project-overview" data-authored="" className="portfolio-project-overview">
			<div className="portfolio-project-body">
				<div className="portfolio-project-header">
					{isPrivate ? (
						heading
					) : (
						<PortfolioLink
							href={href}
							prefetch={true}
							transitionTypes={["navigation"]}
							data-reel-trigger=""
							className="portfolio-project-heading portfolio-project-link"
						>
							{heading}
							<span data-project-action="" aria-hidden="true">
								<LinkFeedback
									iconOnly
									icon={
										<ReelIcon direction="up-right">
											<RiArrowRightUpLine className="size-4" />
										</ReelIcon>
									}
								/>
							</span>
						</PortfolioLink>
					)}
					<dl className="portfolio-project-facts-rail" data-slot="project-facts-rail">
						{[...productFacts, ...involvementFacts].map((fact) => (
							<div
								key={fact.slot}
								className="portfolio-project-meta-cell"
								data-involvement-start={
									fact.slot === involvementFacts[0]?.slot ? "" : undefined
								}
							>
								<dt className="sr-only">{fact.term}</dt>
								<dd className="portfolio-project-meta-value" data-slot={fact.slot}>
									<Badge
										variant="soft"
										color="secondary"
										className="border-0 px-2.5 font-mono font-normal text-muted-foreground uppercase tabular-nums tracking-normal"
									>
										{fact.value}
									</Badge>
								</dd>
							</div>
						))}
					</dl>
				</div>
				<div className="portfolio-project-narrative">
					<div className="portfolio-project-challenge">
						<p className="portfolio-project-story-label">The challenge</p>
						<p className="portfolio-project-lead" data-slot="project-challenge">
							{overview.challenge}
						</p>
					</div>
					<div className="portfolio-project-response">
						<p className="portfolio-project-story-label">What I built</p>
						<p className="portfolio-project-lead" data-slot="project-summary">
							{overview.summary}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
