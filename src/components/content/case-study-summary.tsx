import { RiArrowLeftLine as ArrowLeft, RiTimeLine } from "@remixicon/react";
import { Badge } from "@/src/components/ui/badge";
import { ButtonLink } from "@/src/components/ui/button-link";
import { CopyResourceButton } from "@/src/components/ui/copy-resource-button";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { Reveal, revealSequence } from "@/src/components/ui/reveal";
import { formatDate } from "@/src/lib/format-date";

interface CaseStudyHeaderProps {
	title: string;
	description: string;
	date: string;
	readingTime: number;
	markdownHref: string;
}

/** The same measured introduction is rendered on the case-study page and in the workshop. */
export function CaseStudyHeader({
	title,
	description,
	date,
	readingTime,
	markdownHref,
}: CaseStudyHeaderProps) {
	return (
		<header className="portfolio-case-study-hero">
			<Reveal delay={revealSequence.backLink}>
				<ButtonLink
					href="/case-studies"
					variant="plain"
					color="secondary"
					icon={<ArrowLeft size={16} />}
					iconPosition="start"
				>
					Case studies
				</ButtonLink>
			</Reveal>
			<Reveal delay={revealSequence.kicker}>
				<p className="portfolio-kicker text-muted-foreground">
					Case study · <time dateTime={date}>{formatDate(date)}</time>
				</p>
			</Reveal>
			<HeadingReveal
				as="h1"
				delay={revealSequence.headingLate}
				className="portfolio-case-study-title portfolio-capsize-case-title text-foreground"
			>
				{title}
			</HeadingReveal>
			<Reveal delay={revealSequence.bodyLate}>
				<p className="portfolio-case-study-lede">{description}</p>
			</Reveal>
			<Reveal delay={revealSequence.meta}>
				<div className="portfolio-case-study-meta-row">
					<span className="portfolio-case-study-meta-item">
						<RiTimeLine aria-hidden="true" className="size-4 shrink-0" />
						{readingTime} min read
					</span>
					<CopyResourceButton
						href={markdownHref}
						label="Copy Markdown"
						copiedLabel="Copied Markdown"
					/>
				</div>
			</Reveal>
		</header>
	);
}

interface CaseStudyFactsProps {
	facts: { label: string; value: string }[];
	stack: string[];
	stackLabel: string;
}

/** Project context uses one outer inset and semantic, wrapping fact/value pairs. */
export function CaseStudyFacts({ facts, stack, stackLabel }: CaseStudyFactsProps) {
	return (
		<dl className="portfolio-project-facts" data-columns={Math.min(facts.length, 3)}>
			{facts.map(({ label, value }) => (
				<div key={label} className="portfolio-project-fact">
					<dt>{label}</dt>
					<dd>{value}</dd>
				</div>
			))}
			{stack.length > 0 && (
				<div className="portfolio-project-fact portfolio-project-fact-stack">
					<dt>{stackLabel}</dt>
					<dd>
						<ul className="portfolio-project-stack" aria-label={stackLabel}>
							{stack.map((item) => (
								<li key={item}>
									<Badge
										variant="outline"
										color="secondary"
										className="h-auto min-h-7 max-w-full whitespace-normal py-[5px] text-left [overflow-wrap:anywhere]"
									>
										{item}
									</Badge>
								</li>
							))}
						</ul>
					</dd>
				</div>
			)}
		</dl>
	);
}
