import { RiArrowLeftLine as ArrowLeft, RiTimeLine } from "@remixicon/react";
import { ButtonLink } from "@/src/components/ui/button-link";
import { CopyResourceButton } from "@/src/components/ui/copy-resource-button";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { ProjectTechnologyRail } from "@/src/components/ui/project-technology-rail";
import { ReelIcon } from "@/src/components/ui/reel";
import { Reveal, revealSequence } from "@/src/components/ui/reveal";
import { formatDate } from "@/src/lib/format-date";
import styles from "./case-study-summary.module.css";

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
		<header className={styles.header}>
			<Reveal delay={revealSequence.backLink} className={styles.toolbar}>
				<ButtonLink
					href="/case-studies"
					variant="outlined"
					color="secondary"
					className="portfolio-action-link"
					data-reel-trigger=""
					icon={
						<ReelIcon direction="left" blur className="portfolio-action-reel-icon">
							<ArrowLeft size={16} />
						</ReelIcon>
					}
					iconPosition="start"
				>
					Case studies
				</ButtonLink>
				<div className={styles.publication}>
					<span>Case study</span>
					<time dateTime={date}>{formatDate(date)}</time>
				</div>
			</Reveal>
			<div className={styles.introduction}>
				<HeadingReveal
					as="h1"
					delay={revealSequence.heading}
					className={`${styles.title} portfolio-capsize-hero`}
				>
					{title}
				</HeadingReveal>
				<Reveal delay={revealSequence.body}>
					<p className={styles.lede}>{description}</p>
				</Reveal>
			</div>
			<Reveal delay={revealSequence.meta} className={styles.metaRow}>
				<span className={styles.metaItem}>
					<span className={styles.metaIcon}>
						<RiTimeLine aria-hidden="true" className="size-4" />
					</span>
					<span className={styles.metaLabel}>{readingTime} min read</span>
				</span>
				<CopyResourceButton
					href={markdownHref}
					label="Copy Markdown"
					copiedLabel="Copied Markdown"
					className={`portfolio-action-link ${styles.copyAction}`}
				/>
			</Reveal>
		</header>
	);
}

interface CaseStudyFactsProps {
	facts: { label: string; value: string }[];
	stack: string[];
	stackLabel: string;
	projectTitle: string;
	stackHighlights?: readonly string[];
}

/** Equal fact cells and the card's production technology rail share one full-width summary. */
export function CaseStudyFacts({
	facts,
	stack,
	stackLabel,
	projectTitle,
	stackHighlights,
}: CaseStudyFactsProps) {
	return (
		<section className={styles.summary} aria-label="Project details">
			{facts.length > 0 && (
				<dl
					className={`portfolio-project-facts ${styles.facts}`}
					data-columns={Math.min(facts.length, 3)}
				>
					{facts.map(({ label, value }) => (
						<div key={label} className={`portfolio-project-fact ${styles.fact}`}>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</div>
					))}
				</dl>
			)}
			{stack.length > 0 && (
				<section aria-label={stackLabel}>
					<ProjectTechnologyRail
						technologies={stack}
						highlights={stackHighlights}
						projectTitle={projectTitle}
					/>
				</section>
			)}
		</section>
	);
}
