import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { PageContainer } from "@/src/components/layout/containers";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { SiteHero } from "@/src/components/layout/site-hero";
import { Button } from "@/src/components/ui/button";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { getAllProjects } from "@/src/content/registry";

export default async function Home() {
	const allProjects = await getAllProjects();
	// Identify featured projects for the landing page
	const featuredSlugs = ["verto"];
	const featuredProjects = featuredSlugs
		.map((slug) => allProjects.find((p) => p.slug === slug))
		.filter((p): p is NonNullable<typeof p> => !!p);

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
				<PageContainer>
					<SwissGridBox className="mt-10">
						<SwissGridRow>
							<ScrollReveal phase={3} className="w-full">
								<section className="w-full">
									<div className="portfolio-box-pad">
										{/* Projects Grid */}
										<div className="space-y-5">
											{featuredProjects.map((project, i) => (
												<ScrollReveal
													key={project.id}
													phase={3}
													delay={i * 0.05}
												>
													<div id={`project-${i + 1}`}>
														<ProjectCardGallery
															index={`0${i + 1}`}
															title={project.title}
															description={project.description}
															href={project.urlPath}
															tags={project.tech ?? []}
															images={project.coverImages}
															date="January 2026"
															imageTreatment="disciplined"
															imageAspectRatio="1.92"
														/>
													</div>
												</ScrollReveal>
											))}
										</div>
									</div>
								</section>
							</ScrollReveal>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>

				{/* Box 3: NDA Disclaimer + CTA — two rows, one shared border */}
				<PageContainer>
					<SwissGridBox className="mt-10">
						<SwissGridRow>
							<ScrollReveal phase={3} className="w-full">
								<section className="w-full">
									<div className="portfolio-box-pad flex flex-col items-center justify-center text-center">
										<div className="mb-5 flex items-center justify-center gap-2.5">
											<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
												Confidential Work
											</p>
										</div>
										<p className="portfolio-body-sm max-w-md text-surface-600 dark:text-surface-400">
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
						</SwissGridRow>

						<SwissGridRow>
							<ScrollReveal phase={3} className="w-full">
								<section className="w-full">
									<div className="portfolio-box-pad">
										<div className="portfolio-action-band">
											<div>
												<HeadingReveal
													as="h2"
													phase={3}
													className="portfolio-heading-sm portfolio-capsize-heading-sm text-surface-900 dark:text-surface-100"
												>
													View selected work.
												</HeadingReveal>
											</div>
											<div className="portfolio-control-row">
												<Button
													asChild
													size="md"
													variant="outlined"
													color="default"
												>
													<Link href="/contact">Email</Link>
												</Button>
												<Button
													asChild
													size="md"
													variant="solid"
													color="primary"
												>
													<Link href="/case-studies">
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
