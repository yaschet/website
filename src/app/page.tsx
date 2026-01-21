import { Avatar, AvatarFallback } from "@components/ui/avatar";
import {
	ArrowRightIcon,
	GithubLogoIcon,
	LinkedinLogoIcon,
	XLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { allProjects } from "contentlayer2/generated";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "@/public/images/avatar.jpeg";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";

const ProjectCardGallery = dynamic(() =>
	import("@/src/components/ui/project-card-gallery").then((mod) => mod.ProjectCardGallery),
);

import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";
import { HeroGradient } from "../components/ui/hero-gradient";

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

					{/* Profile Section */}
					<SwissGridSection id="profile" className="relative w-full">
						<Reveal phase={1} className="relative z-10 w-full">
							<header className="w-full">
								<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 py-12 sm:px-8">
									<div className="flex items-center gap-4">
										<Avatar className="relative size-14 overflow-hidden rounded-(--radius) border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900">
											<Image
												src={avatarImage}
												alt="Yassine Chettouch"
												className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
												placeholder="blur"
												fill
												sizes="56px"
											/>
											<AvatarFallback className="flex h-full w-full items-center justify-center bg-surface-100 font-medium text-sm text-surface-400 dark:bg-surface-900 dark:text-surface-500">
												YC
											</AvatarFallback>
										</Avatar>
										<div>
											<h1 className="font-semibold text-body-lg text-surface-900 dark:text-surface-100">
												Yassine Chettouch
											</h1>
											<p className="text-body-sm text-surface-500 dark:text-surface-400">
												Product Engineer
											</p>
										</div>
									</div>

									<div className="flex items-center gap-0.5">
										<Link
											href="https://linkedin.com/in/yaschet"
											target="_blank"
											aria-label="LinkedIn"
											className="inline-flex size-10 items-center justify-center text-surface-500 transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-accent-400"
										>
											<LinkedinLogoIcon className="size-5" weight="regular" />
										</Link>
										<Link
											href="https://github.com/yaschet"
											target="_blank"
											aria-label="GitHub"
											className="inline-flex size-10 items-center justify-center text-surface-500 transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-accent-400"
										>
											<GithubLogoIcon className="size-5" weight="regular" />
										</Link>
										<Link
											href="https://x.com/yaschet"
											target="_blank"
											aria-label="X"
											className="inline-flex size-10 items-center justify-center text-surface-500 transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-accent-400"
										>
											<XLogoIcon className="size-5" weight="regular" />
										</Link>
									</div>
								</div>
							</header>
						</Reveal>
					</SwissGridSection>

					{/* Hero */}
					<SwissGridSection id="hero" className="relative w-full">
						{/* Atmospheric Gradient — Contained Design Blob */}
						<HeroGradient className="pointer-events-none absolute inset-x-0 top-0 z-0 h-96 w-full" />

						<Reveal phase={2} className="relative z-10 w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<Reveal phase={2}>
										<h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
											I build products for the web.
										</h1>
									</Reveal>
									<Reveal phase={2} delay={0.05}>
										<p className="mb-8 max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
											Web apps. SaaS platforms. Internal tools. From the first
											idea to the final deploy. Complex systems that feel
											effortless.
										</p>
									</Reveal>
									<Reveal phase={2} delay={0.1}>
										<div className="flex flex-wrap items-center gap-3">
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
											<Button
												asChild
												size="lg"
												variant="outlined"
												color="default"
											>
												<Link href="/contact">Email</Link>
											</Button>
										</div>
									</Reveal>
								</div>
							</section>
						</Reveal>
					</SwissGridSection>

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
