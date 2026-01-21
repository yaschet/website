import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { allProjects } from "contentlayer2/generated";
import { compareDesc } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export const metadata: Metadata = {
	title: "Projects | Yassine Chettouch",
	description: "Web apps, SaaS platforms, and internal tools. From idea to production.",
};

export default function ProjectsPage() {
	// Sort projects by date descending
	const projects = allProjects.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

	return (
		<SwissGridProvider>
			<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
				<main
					className="relative z-10 flex flex-1 flex-col"
					style={{ overflowAnchor: "none" }}
				>
					{/* Nav Row */}
					<SiteHeader />

					{/* Header */}
					<SwissGridSection id="projects-header" className="w-full">
						<Reveal phase={1} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<p className="mb-2 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
										Work
									</p>
									<h1 className="mb-4 text-heading-xl text-surface-900 dark:text-surface-100">
										Selected Projects
									</h1>
									<p className="max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
										Web apps, SaaS platforms, internal tools. Each one built
										from the first idea to the final deploy.
									</p>
								</div>
							</section>
						</Reveal>
					</SwissGridSection>

					{/* Projects Grid */}
					<SwissGridSection id="projects-list" className="w-full">
						<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
							<div className="space-y-10">
								{projects.map((project, i) => (
									<ScrollReveal
										key={project._id}
										phase={2}
										delay={i * 0.05}
										className="w-full"
									>
										<div className="space-y-4">
											<ProjectCardGallery
												index={String(i + 1).padStart(2, "0")}
												title={project.title}
												description={project.description}
												href={project.url_path}
												tags={project.tags ?? []}
												images={project.coverImages}
												isPrivate={!project.url && !project.github}
											/>
										</div>
									</ScrollReveal>
								))}
							</div>
						</div>
					</SwissGridSection>

					{/* Contact */}
					<SwissGridSection id="projects-contact" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
										<h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
											View engineering philosophy.
										</h2>
										<Button asChild size="lg" variant="solid" color="primary">
											<Link href="/about">
												About
												<ArrowRightIcon className="size-4" weight="bold" />
											</Link>
										</Button>
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
