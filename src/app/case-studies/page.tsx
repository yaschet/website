import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { ConfidentialWorkCallout } from "@/src/components/layout/confidential-work-callout";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { getAllProjects } from "@/src/content/registry";

export const metadata: Metadata = {
	title: "Case Studies | Yassine Chettouch",
	description:
		"Selected case studies in product engineering, systems work, and shipped software.",
	alternates: {
		canonical: "/case-studies",
	},
	openGraph: {
		title: "Case Studies | Yassine Chettouch",
		description:
			"Selected case studies in product engineering, systems work, and shipped software.",
		url: "https://yaschet.dev/case-studies",
		type: "website",
	},
};

export default async function CaseStudiesPage() {
	const projects = await getAllProjects();

	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				<SiteHeader />

				<section id="projects-list" className="w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<Reveal phase={1} className="w-full">
									<div className="portfolio-box-pad">
										<PageIntro
											eyebrow="Work"
											title="Case Studies"
											description="Selected engineering case studies across product systems, internal tooling, and shipped software."
										/>
									</div>
								</Reveal>
							</SwissGridRow>
							<SwissGridRow>
								<div className="portfolio-box-pad">
									<div className="portfolio-stack-group">
										{projects.map((project, i) => (
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
													images={project.coverImages}
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
												/>
											</ScrollReveal>
										))}
									</div>
								</div>
							</SwissGridRow>
						</SwissGridBox>
					</PageContainer>
				</section>

				<section id="projects-nda" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<ConfidentialWorkCallout />
									</SwissGridRow>
									<SwissGridRow>
										<InstrumentActionBand
											fieldSpeed={0.58}
											fieldVariant="terrain"
											tone="inverted"
										>
											<h2
												className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
											>
												View engineering philosophy.
											</h2>
											<Button
												asChild
												size="md"
												variant="solid"
												color="default"
												className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
											>
												<Link href="/about">
													About
													<ArrowRightIcon
														className="size-4"
														weight="bold"
													/>
												</Link>
											</Button>
										</InstrumentActionBand>
									</SwissGridRow>
								</SwissGridBox>
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
