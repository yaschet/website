import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CaseStudyFacts, CaseStudyHeader } from "@/src/components/content/case-study-summary";
import { ModuleContainer, PageContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
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
import type { ProjectEntry } from "@/src/content/types";
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
	return (
		<div className="w-full">
			<CaseStudyHeader
				title={project.title}
				description={project.subtitle ?? project.description}
				date={project.date}
				readingTime={project.readingTime}
				markdownHref={`/case-studies/${project.slug}.md`}
			/>

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
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
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
											<CaseStudyFacts
												facts={projectFacts}
												stack={projectStack}
												stackLabel={projectStackLabel}
											/>

											{(project.url || project.github) && (
												<div className="portfolio-control-row">
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
											<ButtonLink
												size="md"
												variant="solid"
												color="default"
												className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
												href="/contact"
												icon={
													<ArrowRight className="size-4" weight="bold" />
												}
											>
												Email
											</ButtonLink>
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
