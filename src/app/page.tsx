import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { allProjects } from "contentlayer2/generated";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { SiteHero } from "@/src/components/layout/site-hero";
import { Button } from "@/src/components/ui/button";

const ProjectCardGallery = dynamic(() =>
	import("@/src/components/ui/project-card-gallery").then((mod) => mod.ProjectCardGallery),
);

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
														isPrivate={!project.url && !project.github}
													/>
												</div>
											</ScrollReveal>
										))}
									</div>
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
