import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { allProjects } from "contentlayer2/generated";
import type { Metadata } from "next";
import Link from "next/link";
import AssetPhoenix from "@/public/images/placeholders/asset-2.jpg";
import AssetOnboardFlow from "@/public/images/placeholders/asset-12.jpg";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { SiteHero } from "@/src/components/layout/site-hero";
import { Button } from "@/src/components/ui/button";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";

import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export const metadata: Metadata = {
	title: "Yassine Chettouch | Product Engineer",
	description:
		"Product Engineer. Web apps, SaaS platforms, and internal tools. From design to production.",
};

export default function Home() {
	// Identify featured projects for the landing page
	const featuredSlugs = ["verto", "phoenix", "onboard-flow"];
	const featuredProjects = featuredSlugs
		.map((slug) => allProjects.find((p) => p.slug === slug))
		.filter((p): p is NonNullable<typeof p> => !!p);

	return (
		<SwissGridProvider>
			<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
				<main
					className="relative z-10 flex flex-1 flex-col"
					style={{ overflowAnchor: "none" }}
				>
					{/* Nav Row */}
					<SiteHeader />

					{/* Profile Section - Separated from Hero */}
					<ProfileSection />

					{/* Hero — Headline only */}
					<SiteHero />

					{/* Selected Work — Unified Container */}
					<SwissGridSection id="work" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 pt-10 pb-16 sm:px-8">
									{/* Section Header */}
									<ScrollReveal phase={3}>
										<div className="mb-4">
											<h2 className="font-mono text-sm text-surface-500 uppercase tracking-[0.18em] dark:text-surface-300">
												Selected Work
											</h2>
										</div>
									</ScrollReveal>

									{/* Projects Grid */}
									<div className="space-y-6">
										{featuredProjects.map((project, i) => (
											<ScrollReveal
												key={project._id}
												phase={3}
												delay={i * 0.05}
											>
												<div id={`project-${i + 1}`}>
													<ProjectCardGallery
														index={`0${i + 1}`}
														title={project.title}
														description={project.description}
														href={project.url_path}
														tags={project.tech ?? []}
														images={project.coverImages}
													/>
												</div>
											</ScrollReveal>
										))}

										{/* Project Phoenix - Locked */}
										<ScrollReveal phase={3} delay={0.2} className="w-full">
											<div id="project-phoenix">
												<ProjectCardGallery
													index={`0${featuredProjects.length + 1}`}
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
												/>
											</div>
										</ScrollReveal>

										{/* Onboard Flow - Locked */}
										<ScrollReveal phase={3} delay={0.25} className="w-full">
											<div id="project-onboard">
												<ProjectCardGallery
													index={`0${featuredProjects.length + 2}`}
													title="Onboard Flow"
													description="Intelligent customer portal with step-by-step onboarding, document scanning, and dynamic form logic."
													href="#"
													tags={["React", "Node.js", "PostgreSQL", "OCR"]}
													images={[AssetOnboardFlow]}
													isPrivate
													challenge="Replace a complex static form with a high-conversion step-by-step experience."
													solution="Typeform-style portal with OCR scanning and dynamic form logic. Delivered in 6 weeks."
												/>
											</div>
										</ScrollReveal>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* NDA Disclaimer */}
					<SwissGridSection id="home-nda" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
									<div className="mb-4 flex items-center justify-center gap-2">
										<p className="font-mono text-surface-400 text-xs uppercase tracking-[0.2em] dark:text-surface-500">
											Confidential Work
										</p>
									</div>
									<p className="max-w-md text-sm text-surface-600 leading-relaxed dark:text-surface-400">
										Due to strict NDAs and client privacy, most commercial
										enterprise work cannot be publicly displayed.{" "}
										<Link
											href="/contact"
											className="font-medium text-surface-900 underline decoration-surface-300 underline-offset-4 transition-colors hover:decoration-surface-900 dark:text-surface-100 dark:decoration-surface-700 dark:hover:decoration-surface-100"
										>
											Contact me
										</Link>{" "}
										directly to discuss enterprise experience.
									</p>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* CTA */}
					<SwissGridSection id="cta" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
												View selected work.
											</h2>
										</div>
										<div className="flex items-center gap-3">
											<Button
												asChild
												size="lg"
												variant="outlined"
												color="default"
											>
												<Link href="/contact">Email</Link>
											</Button>
											<Button
												asChild
												size="lg"
												variant="solid"
												color="primary"
											>
												<Link href="/projects">
													Case Studies
													<ArrowRightIcon
														className="size-4"
														weight="bold"
													/>
												</Link>
											</Button>
										</div>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>
				</main>
				<SiteFooter />
				<SwissGridSection id="nav-spacer" className="h-29.5 w-full" />
			</div>
		</SwissGridProvider>
	);
}
