import { CaseStudyFacts, CaseStudyHeader } from "@/src/components/content/case-study-summary";
import { ModuleContainer, PageContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { ReadingBracket } from "@/src/components/ui/article-toc";
import { ButtonLink } from "@/src/components/ui/button-link";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { MediaGallery } from "@/src/components/ui/media-gallery";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { getProjectTechnologyHighlights } from "@/src/content/project-technology-highlights";
import type { ProjectEntry } from "@/src/content/types";
import { getProjectCoverMedia } from "@/src/lib/gallery-media";
import styles from "./case-study-summary.module.css";

interface ProjectContentProps {
	project: ProjectEntry;
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
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				<section id="project-main" className="w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox className={styles.frame}>
							<SwissGridRow>
								<CaseStudyHeader
									title={project.title}
									description={project.subtitle ?? project.description}
									date={project.date}
									readingTime={project.readingTime}
									markdownHref={`/case-studies/${project.slug}.md`}
								/>
							</SwissGridRow>
							{galleryItems.length > 0 && !project.hideCoverGallery && (
								<SwissGridRow>
									<MediaGallery
										items={galleryItems}
										altPrefix={project.title}
										aspectRatio="16/9"
										sizes="(min-width: 1024px) 984px, calc(100vw - 40px)"
										showArrows={galleryItems.length > 1}
										showProgress={galleryItems.length > 1}
										showCounter={galleryItems.length > 1}
										expandable
									/>
								</SwissGridRow>
							)}
							<SwissGridRow>
								<Reveal phase={2} delay={0.04} className="w-full">
									<CaseStudyFacts
										facts={projectFacts}
										stack={projectStack}
										stackLabel={projectStackLabel}
										projectTitle={project.title}
										stackHighlights={getProjectTechnologyHighlights(
											project.slug,
										)}
									/>

									{(project.url || project.github) && (
										<div className={styles.resources}>
											{project.url && (
												<ButtonLink
													size="md"
													variant="outlined"
													color="default"
													href={project.url}
													target="_blank"
													rel="noopener noreferrer"
												>
													Visit Site
												</ButtonLink>
											)}
											{project.github && (
												<ButtonLink
													size="md"
													variant="outlined"
													color="default"
													href={project.github}
													target="_blank"
													rel="noopener noreferrer"
												>
													View Code
												</ButtonLink>
											)}
										</div>
									)}
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
											<ArrowButtonLink
												variant="solid"
												color="default"
												className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
												href="/contact"
											>
												Discuss a project
											</ArrowButtonLink>
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
