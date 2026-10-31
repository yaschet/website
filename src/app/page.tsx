import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase";
import { WorkingTogether } from "@/src/components/content/working-together";
import { ConfidentialWorkCallout } from "@/src/components/layout/confidential-work-callout";
import { PageContainer } from "@/src/components/layout/containers";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHero } from "@/src/components/layout/site-hero";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { SITE_BOOKING_URL } from "@/src/constants/site";
import { getListedPublicProjectSummaries } from "@/src/content/project-summaries";
import { getProjectTechnologyHighlights } from "@/src/content/project-technology-highlights";
import { getProjectCoverMedia } from "@/src/lib/gallery-media";

function HomeClosingCta() {
	return (
		<InstrumentActionBand fieldSpeed={0.28} fieldVariant="terrain" tone="inverted">
			<h2
				className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
			>
				Have a project in mind?
			</h2>
			<ArrowButtonLink
				href={SITE_BOOKING_URL}
				variant="solid"
				color="default"
				className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
				arrowDirection="up-right"
				target="_blank"
				rel="noopener noreferrer"
			>
				Book a call
			</ArrowButtonLink>
		</InstrumentActionBand>
	);
}

export default async function Home() {
	"use cache";

	const featuredProjects = await getListedPublicProjectSummaries();
	const hasFeaturedProjects = featuredProjects.length > 0;

	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				{/* Box 1: Profile + Hero — two rows, one shared border */}
				<PageContainer>
					<SwissGridBox className="portfolio-hero-frame">
						<SwissGridRow>
							<ProfileSection />
						</SwissGridRow>
						<SwissGridRow>
							<SiteHero />
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>

				{/* Box 2: Selected Work */}
				<PageContainer className="mt-10">
					<section
						id="work"
						className="scroll-mt-5"
						aria-labelledby={hasFeaturedProjects ? "selected-work-heading" : undefined}
					>
						{hasFeaturedProjects && (
							<h2 id="selected-work-heading" className="sr-only">
								Selected work
							</h2>
						)}
						<div className="portfolio-stack-section">
							{hasFeaturedProjects ? (
								featuredProjects.map((project, i) => {
									const card = (
										<div key={project.id} id={`project-${i + 1}`}>
											<ProjectCardGallery
												index={String(i + 1).padStart(2, "0")}
												title={project.title}
												description={project.description}
												overview={project.overview}
												role={project.role}
												status={project.status}
												href={project.urlPath}
												tags={project.tech ?? []}
												technologyHighlights={getProjectTechnologyHighlights(
													project.slug,
												)}
												items={getProjectCoverMedia(project)}
												prioritizeFirstImage={i === 0}
												isPrivate={project.cardState === "coming-soon"}
												date={
													project.date
														? new Date(project.date).toLocaleDateString(
																"en-US",
																{
																	month: "long",
																	year: "numeric",
																	timeZone: "UTC",
																},
															)
														: undefined
												}
												imageTreatment="disciplined"
												imageAspectRatio="16/9"
											/>
										</div>
									);
									return i === 0 ? (
										card
									) : (
										<ScrollReveal
											key={project.id}
											phase={3}
											delay={i * 0.05}
											className="w-full"
										>
											{card}
										</ScrollReveal>
									);
								})
							) : (
								<ScrollReveal phase={3} className="w-full">
									<EditorialEmptyState
										eyebrow="Selected work"
										icon={
											<Briefcase
												className="size-[var(--portfolio-icon-sm)] opacity-80"
												weight="regular"
											/>
										}
										title="No case studies listed."
										description="The public archive is currently unlisted."
									/>
								</ScrollReveal>
							)}
							<ScrollReveal phase={3} className="w-full">
								<ConfidentialWorkCallout />
							</ScrollReveal>
						</div>
					</section>
				</PageContainer>

				<WorkingTogether />

				{/* Closing CTA */}
				<PageContainer>
					<SwissGridBox className="mt-10">
						<SwissGridRow>
							<ScrollReveal phase={3} className="w-full">
								<section className="w-full">
									<HomeClosingCta />
								</section>
							</ScrollReveal>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>

				{/* Footer — not boxed */}
				<SiteFooter />

				{/* Bottom nav spacer */}
				<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
			</main>
		</div>
	);
}
