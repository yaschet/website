import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { allProjects } from "contentlayer2/generated";
import { compareDesc } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import AssetPhoenix from "@/public/images/placeholders/asset-2.jpg";
import AssetOnboardFlow from "@/public/images/placeholders/asset-12.jpg";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
export const metadata: Metadata = {
	title: "Projects | Yassine Chettouch",
	description: "Web apps, SaaS platforms, and internal tools. From idea to production.",
	alternates: {
		canonical: "/projects",
	},
	openGraph: {
		title: "Projects | Yassine Chettouch",
		description: "Web apps, SaaS platforms, and internal tools. From idea to production.",
		url: "https://yaschet.dev/projects",
		type: "website",
	},
};

export default function ProjectsPage() {
	// Sort projects by date descending
	const projects = allProjects.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				{/* Nav Row */}
				<SiteHeader />

				{/* Header */}
				<section id="projects-header" className="w-full">
					<Reveal phase={1} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top-loose">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<p className="portfolio-kicker mb-2 text-surface-400 dark:text-surface-500">
												Work
											</p>
											<h1 className="portfolio-heading-xl portfolio-capsize-heading-xl mb-4 text-surface-900 dark:text-surface-100">
												Selected Projects
											</h1>
											<ProseContainer>
												<p className="portfolio-body-lg text-surface-600 dark:text-surface-400">
													Web apps, SaaS platforms, internal tools. Each
													one built from the first idea to the final
													deploy.
												</p>
											</ProseContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</Reveal>
				</section>

				{/* Projects Grid */}
				<section id="projects-list" className="w-full">
					<PageContainer className="portfolio-section">
						<SwissGridBox>
							<SwissGridRow>
								<div className="portfolio-box-pad">
									<div className="space-y-10">
										{projects.map((project, i) => (
											<ScrollReveal
												key={project._id}
												phase={2}
												delay={i * 0.05}
												className="w-full"
											>
												<ProjectCardGallery
													index={String(i + 1).padStart(2, "0")}
													title={project.title}
													description={project.description}
													href={project.url_path}
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

										<ScrollReveal
											phase={2}
											delay={projects.length * 0.05}
											className="w-full"
										>
											<ProjectCardGallery
												index={String(projects.length + 1).padStart(2, "0")}
												title="Project Phoenix"
												description="Large-scale data matching engine with AI-driven cleansing, semantic search, and resumable processing pipelines."
												href="#"
												tags={[
													"Meilisearch",
													"OpenAI",
													"PostgreSQL",
													"Data Pipelines",
												]}
												images={[AssetPhoenix]}
												isPrivate
												challenge="Match thousands of university programs to student profiles with high accuracy."
												solution="3-phase system using Meilisearch, OpenAI embeddings, and resumable data pipelines."
												date="June 2025"
											/>
										</ScrollReveal>

										<ScrollReveal
											phase={2}
											delay={projects.length * 0.05 + 0.1}
											className="w-full"
										>
											<ProjectCardGallery
												index={String(projects.length + 2).padStart(2, "0")}
												title="Onboard Flow"
												description="Intelligent customer portal with step-by-step onboarding, document scanning, and dynamic form logic."
												href="#"
												tags={["React", "Node.js", "PostgreSQL", "OCR"]}
												images={[AssetOnboardFlow]}
												isPrivate
												challenge="Replace a complex static form with a high-conversion step-by-step experience."
												solution="Typeform-style portal with OCR scanning and dynamic form logic. Delivered in 6 weeks."
												date="October 2025"
											/>
										</ScrollReveal>
									</div>
								</div>
							</SwissGridRow>
						</SwissGridBox>
					</PageContainer>
				</section>

				{/* NDA Disclaimer - Separated into its own grid section */}
				<section id="projects-nda" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad flex flex-col items-center justify-center text-center">
											<div className="mb-4 flex items-center justify-center gap-2">
												<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
													Confidential Work
												</p>
											</div>
											<p className="portfolio-body-sm max-w-md text-surface-600 dark:text-surface-400">
												Due to strict NDAs and client privacy, most
												commercial enterprise work cannot be publicly
												displayed.{" "}
												<Link
													href="/contact"
													className="font-medium text-surface-900 underline decoration-surface-300 underline-offset-4 transition-colors hover:decoration-surface-900 dark:text-surface-100 dark:decoration-surface-700 dark:hover:decoration-surface-100"
												>
													Contact me
												</Link>{" "}
												directly to discuss enterprise experience.
											</p>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<div className="portfolio-action-band">
												<h2 className="portfolio-heading-lg portfolio-capsize-heading-lg text-surface-900 dark:text-surface-100">
													View engineering philosophy.
												</h2>
												<Button
													asChild
													size="lg"
													variant="solid"
													color="primary"
												>
													<Link href="/about">
														About
														<ArrowRightIcon
															className="size-4"
															weight="bold"
														/>
													</Link>
												</Button>
											</div>
										</div>
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
