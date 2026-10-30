import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase";
import type { Metadata } from "next";
import { ConfidentialWorkCallout } from "@/src/components/layout/confidential-work-callout";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { ButtonLink } from "@/src/components/ui/button-link";
import { CopyResourceButton } from "@/src/components/ui/copy-resource-button";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { SITE_URL } from "@/src/constants/site";
import { getListedPublicProjectSummaries } from "@/src/content/project-summaries";
import { getProjectCoverMedia } from "@/src/lib/gallery-media";

export const metadata: Metadata = {
	title: "Case Studies",
	description:
		"Selected case studies in product engineering, systems work, and shipped software.",
	alternates: {
		canonical: "/case-studies",
	},
	openGraph: {
		title: "Case Studies | Yassine Chettouch",
		description:
			"Selected case studies in product engineering, systems work, and shipped software.",
		url: `${SITE_URL}/case-studies`,
		type: "website",
	},
};

export default async function CaseStudiesPage() {
	"use cache";

	const projects = await getListedPublicProjectSummaries();
	const hasProjects = projects.length > 0;

	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				<section id="projects-list" className="w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<div className="portfolio-box-pad">
									<PageIntro
										eyebrow="Work"
										title="Case studies."
										description="Public write-ups of shipped systems work."
									/>
									<div className="portfolio-control-row mt-(--portfolio-space-group)">
										<CopyResourceButton
											href="/portfolio.md"
											label="Copy Portfolio"
											copiedLabel="Copied Portfolio"
										/>
										<CopyResourceButton
											href="/llms-full.txt"
											label="Copy Full Context"
											copiedLabel="Copied Context"
											className="min-w-[9.75rem]"
										/>
									</div>
								</div>
							</SwissGridRow>
							<SwissGridRow>
								{hasProjects ? (
									<div className="portfolio-box-pad">
										<div className="portfolio-stack-group">
											{projects.map((project, i) =>
												i === 0 ? (
													<div key={project.id} className="w-full">
														<ProjectCardGallery
															index={String(i + 1).padStart(2, "0")}
															title={project.title}
															description={project.description}
															href={project.urlPath}
															tags={project.tech ?? []}
															items={getProjectCoverMedia(project)}
															prioritizeFirstImage={true}
															isPrivate={
																project.cardState === "coming-soon"
															}
															date={
																project.date
																	? new Date(
																			project.date,
																		).toLocaleDateString(
																			"en-US",
																			{
																				month: "long",
																				year: "numeric",
																			},
																		)
																	: undefined
															}
														/>
													</div>
												) : (
													<ScrollReveal
														key={project.id}
														phase={2}
														delay={i * 0.05}
														className="w-full"
													>
														<ProjectCardGallery
															index={String(i + 1).padStart(2, "0")}
															title={project.title}
															description={project.description}
															href={project.urlPath}
															tags={project.tech ?? []}
															items={getProjectCoverMedia(project)}
															prioritizeFirstImage={false}
															isPrivate={
																project.cardState === "coming-soon"
															}
															date={
																project.date
																	? new Date(
																			project.date,
																		).toLocaleDateString(
																			"en-US",
																			{
																				month: "long",
																				year: "numeric",
																			},
																		)
																	: undefined
															}
														/>
													</ScrollReveal>
												),
											)}
										</div>
									</div>
								) : (
									<Reveal phase={2} className="w-full">
										<EditorialEmptyState
											eyebrow="Archive"
											icon={
												<Briefcase
													className="size-[var(--portfolio-icon-sm)] opacity-80"
													weight="regular"
												/>
											}
											title="No case studies listed."
											description="The public archive is currently unlisted."
										/>
									</Reveal>
								)}
							</SwissGridRow>
						</SwissGridBox>
					</PageContainer>
				</section>

				<section id="projects-nda" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<div className="portfolio-stack-section">
									{hasProjects && <ConfidentialWorkCallout headingLevel={2} />}
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
													View engineering philosophy.
												</h2>
												<ButtonLink
													href="/about"
													size="md"
													variant="solid"
													color="default"
													className={
														INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS
													}
													icon={
														<ArrowRightIcon
															className="size-4"
															weight="bold"
														/>
													}
												>
													About
												</ButtonLink>
											</InstrumentActionBand>
										</SwissGridRow>
									</SwissGridBox>
								</div>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
