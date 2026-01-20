import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { allProjects } from "contentlayer2/generated";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "@/public/images/avatar.jpeg";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { ProjectCardGallery } from "@/src/components/ui/project-card-gallery";
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
										<Avatar className="relative size-14 overflow-hidden rounded-[var(--radius)] border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900">
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

									<div className="flex items-center gap-1">
										<Button
											asChild
											variant="solid"
											size="icon"
											shape="default"
											tooltipContent="X (Twitter)"
										>
											<Link
												href="https://x.com/yaschet"
												target="_blank"
												aria-label="X"
											>
												<svg
													aria-hidden="true"
													fill="currentColor"
													viewBox="0 0 24 24"
													className="size-5"
												>
													<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
												</svg>
											</Link>
										</Button>
										<Button
											asChild
											variant="solid"
											size="icon"
											shape="default"
											tooltipContent="GitHub"
										>
											<Link
												href="https://github.com/yaschet"
												target="_blank"
												aria-label="GitHub"
											>
												<GithubLogo className="size-5" weight="duotone" />
											</Link>
										</Button>
										<Button
											asChild
											variant="solid"
											size="icon"
											shape="default"
											tooltipContent="LinkedIn"
										>
											<Link
												href="https://linkedin.com/in/yaschet"
												target="_blank"
												aria-label="LinkedIn"
											>
												<LinkedinLogo className="size-5" weight="duotone" />
											</Link>
										</Button>
									</div>
								</div>
							</header>
						</Reveal>
					</SwissGridSection>

					{/* Hero */}
					<SwissGridSection id="hero" className="relative w-full overflow-hidden">
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
											idea to the final deploy. Complex systems, built to feel
											effortless.
										</p>
									</Reveal>
									<Reveal phase={2} delay={0.1}>
										<div className="flex flex-wrap items-center gap-3">
											<Button
												asChild
												size="lg"
												variant="solid"
												color="accent"
											>
												<Link href="/about">
													About me
													<ArrowRight className="size-4" weight="bold" />
												</Link>
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
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									{/* Section Header */}
									<ScrollReveal phase={3}>
										<div className="mb-12">
											<p className="font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
												Selected Work
											</p>
											<p className="mt-3 text-body-sm text-surface-600 dark:text-surface-400">
												A selection of products I've built end-to-end. Each
												represents a complete cycle from problem to
												solution.
											</p>
										</div>
									</ScrollReveal>

									{/* Projects Grid */}
									<div className="space-y-16">
										{featuredProjects.map((project, i) => (
											<ScrollReveal
												key={project._id}
												phase={3}
												delay={i * 0.05}
											>
												<div id={`project-${i + 1}`}>
													<p className="mb-6 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
														0{i + 1} · {project.title}
													</p>
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
												Want to talk?
											</h2>
											<p className="mt-1 text-body-md text-surface-600 dark:text-surface-400">
												I'd love to hear from you.
											</p>
										</div>
										<Button asChild size="lg" variant="solid" color="primary">
											<Link href="/contact">
												Get in touch
												<ArrowRight className="size-4" weight="bold" />
											</Link>
										</Button>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>
				</main>
				<SiteFooter />
			</div>
		</SwissGridProvider>
	);
}
