import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import Link from "next/link";
import { ModuleContainer, PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { ReadingBracket } from "@/src/components/ui/article-toc";
import { Button } from "@/src/components/ui/button";
import { CopyResourceButton } from "@/src/components/ui/copy-resource-button";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { MediaGallery } from "@/src/components/ui/media-gallery";
import { Reveal, revealSequence, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import type { ProjectEntry } from "@/src/content/types";
import { formatDate } from "@/src/lib/format-date";
import { getProjectCoverMedia } from "@/src/lib/gallery-media";

interface ProjectContentProps {
	project: ProjectEntry;
}

function ProjectMasthead({
	project,
	galleryItems,
}: {
	project: ProjectEntry;
	galleryItems: ReturnType<typeof getProjectCoverMedia>;
}) {
	const projectLede = project.subtitle ?? project.description;

	return (
		<div className="w-full">
			<div className="portfolio-stack-group items-stretch">
				<Reveal delay={revealSequence.backLink}>
					<Link href="/case-studies" className="portfolio-back-link portfolio-kicker">
						<ArrowLeft size={14} weight="bold" />
						<span>Back to Case Studies</span>
					</Link>
				</Reveal>

				<div className="portfolio-case-study-hero">
					<Reveal delay={revealSequence.kicker}>
						<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
							Case study · {formatDate(project.date)}
						</p>
					</Reveal>

					<div className="flex flex-col items-center">
						<HeadingReveal
							as="h1"
							delay={revealSequence.headingLate}
							className="portfolio-masthead-title text-foreground"
						>
							{project.title}
						</HeadingReveal>

						<Reveal delay={revealSequence.bodyLate}>
							<ProseContainer className="portfolio-case-study-lede">
								<p className="m-0">{projectLede}</p>
							</ProseContainer>
						</Reveal>
					</div>

					<Reveal delay={revealSequence.meta}>
						<div className="portfolio-inline-meta justify-center">
							<span className="portfolio-badge-label flex h-[var(--portfolio-badge-height)] items-center gap-[var(--portfolio-control-gap)] border border-transparent px-[var(--portfolio-badge-inset)] text-muted-foreground">
								<Clock size={12} weight="bold" />
								{project.readingTime} min read
							</span>
							{project.featured && (
								<span className="portfolio-chip border-primary text-primary">
									Featured
								</span>
							)}
							<CopyResourceButton
								href={`/case-studies/${project.slug}.md`}
								label="Copy Markdown"
								copiedLabel="Copied Markdown"
								variant="badge"
							/>
						</div>
					</Reveal>
				</div>
			</div>

			{galleryItems.length > 0 && !project.hideCoverGallery && (
				<div className="mt-[var(--portfolio-space-4)]">
					<MediaGallery
						items={galleryItems}
						altPrefix={project.title}
						aspectRatio="16/9"
						showArrows={galleryItems.length > 1}
						showProgress={galleryItems.length > 1}
						showCounter={galleryItems.length > 1}
						expandable
					/>
				</div>
			)}
		</div>
	);
}

/**
 * Renders the case study shell and MDX content.
 *
 * @param props - Project entry data for the case study page.
 * @returns The composed case study page content.
 */
export function ProjectContentRSC({ project }: ProjectContentProps) {
	const galleryItems = getProjectCoverMedia(project);
	const projectFacts = [
		project.role ? { label: "Role", value: project.role } : null,
		project.status ? { label: "Status", value: project.status } : null,
		project.domain ? { label: "Domain", value: project.domain } : null,
	].filter((fact): fact is { label: string; value: string } => fact !== null);
	const projectStack = project.stack?.length ? project.stack : (project.tech ?? []);
	const projectStackLabel = project.stack?.length ? "Engine Stack" : "Technologies";

	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				<SiteHeader />

				<section id="project-main" className="w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<div className="portfolio-box-pad">
									<ModuleContainer className="portfolio-stack-group">
										<ProjectMasthead
											project={project}
											galleryItems={galleryItems}
										/>
									</ModuleContainer>
								</div>
							</SwissGridRow>
							<SwissGridRow>
								<Reveal phase={2} delay={0.04} className="w-full">
									<div className="portfolio-box-pad">
										<ModuleContainer className="portfolio-stack-related">
											<div className="portfolio-project-facts">
												{projectFacts.map((fact) => (
													<div
														key={fact.label}
														className="portfolio-project-fact"
													>
														<span className="portfolio-meta-label text-muted-foreground">
															{fact.label}
														</span>
														<span className="portfolio-meta-value text-foreground">
															{fact.value}
														</span>
													</div>
												))}
												{projectStack.length > 0 && (
													<div className="portfolio-project-fact portfolio-project-fact-stack">
														<span className="portfolio-meta-label text-muted-foreground">
															{projectStackLabel}
														</span>
														<div className="flex flex-wrap gap-(--portfolio-space-tight)">
															{projectStack.map((item) => (
																<span
																	key={item}
																	className="portfolio-chip"
																>
																	{item}
																</span>
															))}
														</div>
													</div>
												)}
											</div>

											{(project.url || project.github) && (
												<div className="portfolio-control-row">
													{project.url && (
														<Button
															asChild
															size="md"
															variant="outlined"
															color="default"
														>
															<a
																href={project.url}
																target="_blank"
																rel="noopener noreferrer"
															>
																Visit Site
															</a>
														</Button>
													)}
													{project.github && (
														<Button
															asChild
															size="md"
															variant="outlined"
															color="default"
														>
															<a
																href={project.github}
																target="_blank"
																rel="noopener noreferrer"
															>
																View Code
															</a>
														</Button>
													)}
												</div>
											)}
										</ModuleContainer>
									</div>
								</Reveal>
							</SwissGridRow>
							<SwissGridRow>
								<ScrollReveal phase={2} className="w-full">
									<div className="portfolio-box-pad">
										<ModuleContainer>
											<article className="portfolio-article">
												<project.Content components={mdxComponents} />
											</article>
										</ModuleContainer>
									</div>
								</ScrollReveal>
							</SwissGridRow>
						</SwissGridBox>
					</PageContainer>
				</section>

				<section id="project-cta" className="w-full">
					<ScrollReveal phase={3} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<InstrumentActionBand
											fieldSpeed={0.28}
											fieldVariant="terrain"
											tone="inverted"
										>
											<h2
												className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
											>
												Building something similar?
											</h2>
											<Button
												asChild
												size="md"
												variant="solid"
												color="default"
												className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
											>
												<Link href="/contact">
													Email
													<ArrowRight className="size-4" weight="bold" />
												</Link>
											</Button>
										</InstrumentActionBand>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				<ReadingBracket />
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
