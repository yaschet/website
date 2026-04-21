import { ArrowRightIcon, Briefcase } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ConfidentialWorkCallout } from "@/src/components/layout/confidential-work-callout";
import { PageContainer } from "@/src/components/layout/containers";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { RequestAwareSiteHeader as SiteHeader } from "@/src/components/layout/site-header-rsc";
import { SiteHero } from "@/src/components/layout/site-hero";
import { Button } from "@/src/components/ui/button";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { getListedPublicProjects } from "@/src/content/registry";
import { getProjectCoverMedia } from "@/src/lib/gallery-media";

function HomeClosingCta() {
	return (
		<InstrumentActionBand fieldSpeed={0.28} fieldVariant="terrain" tone="inverted">
			<h2
				className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
			>
				View selected work.
			</h2>
			<Button
				asChild
				size="md"
				variant="solid"
				color="default"
				className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
			>
				<Link href="/case-studies">
					Case Studies
					<ArrowRightIcon className="size-4" weight="bold" />
				</Link>
			</Button>
		</InstrumentActionBand>
	);
}

export default async function Home() {
	const featuredProjects = await getListedPublicProjects();
	const hasFeaturedProjects = featuredProjects.length > 0;

	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				{/* Nav Row — not boxed */}
				<SiteHeader />

				{/* Box 1: Profile + Hero — two rows, one shared border */}
				<PageContainer>
					<SwissGridBox>
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
					<SwissGridBox className="!bg-surface-50 dark:!bg-surface-900/80">
						<SwissGridRow>
							{hasFeaturedProjects ? (
								<div className="portfolio-box-pad">
									<div className="portfolio-stack-group">
										{featuredProjects.map((project, i) => (
											<ScrollReveal
												key={project.id}
												phase={3}
												delay={i * 0.05}
												className="w-full"
											>
												<div id={`project-${i + 1}`}>
													<ProjectCardGallery
														index={`0${i + 1}`}
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
																	).toLocaleDateString("en-US", {
																		month: "long",
																		year: "numeric",
																	})
																: undefined
														}
														imageTreatment="disciplined"
														imageAspectRatio="16/9"
													/>
												</div>
											</ScrollReveal>
										))}
									</div>
								</div>
							) : (
								<ScrollReveal phase={3} className="w-full">
									<EditorialEmptyState
										eyebrow="Selected Work"
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
						</SwissGridRow>

						<SwissGridRow>
							<ScrollReveal phase={3} className="w-full">
								<ConfidentialWorkCallout />
							</ScrollReveal>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>

				{/* Box 4: Closing CTA */}
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
