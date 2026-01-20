import { Avatar, AvatarFallback } from "@components/ui/avatar";
import {
	ArrowRightIcon,
	GithubLogoIcon,
	LinkedinLogoIcon,
	XLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "@/public/images/avatar.jpeg";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { Button } from "@/src/components/ui/button";
import { LocationBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export const metadata: Metadata = {
	title: "About | Yassine Chettouch",
	description: "Product Engineer based in Rabat, Morocco.",
};

export default function AboutPage() {
	return (
		<SwissGridProvider>
			<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
				<main className="relative z-10 flex flex-1 flex-col">
					{/* Nav Row */}
					<SwissGridSection id="nav" className="relative z-20 w-full">
						<Reveal phase={1} className="w-full">
							<div className="h-[118px] w-full">
								<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 sm:px-8">
									<div className="hidden sm:block">
										<LocationBadge />
									</div>
									<div className="flex-1" />
									<div className="hidden sm:block">
										<TimeBadge />
									</div>
								</div>
							</div>
						</Reveal>
					</SwissGridSection>

					{/* Profile */}
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
											className="inline-flex size-8 items-center justify-center text-surface-500 transition-colors hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-surface-50"
										>
											<LinkedinLogoIcon className="size-5" weight="regular" />
										</Link>
										<Link
											href="https://github.com/yaschet"
											target="_blank"
											aria-label="GitHub"
											className="inline-flex size-8 items-center justify-center text-surface-500 transition-colors hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-surface-50"
										>
											<GithubLogoIcon className="size-5" weight="regular" />
										</Link>
										<Link
											href="https://x.com/yaschet"
											target="_blank"
											aria-label="X"
											className="inline-flex size-8 items-center justify-center text-surface-500 transition-colors hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-surface-50"
										>
											<XLogoIcon className="size-5" weight="regular" />
										</Link>
									</div>
								</div>
							</header>
						</Reveal>
					</SwissGridSection>

					{/* 01 · The Short Version */}
					<SwissGridSection id="story" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<ScrollReveal phase={2}>
										<p className="mb-8 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
											01 · The Short Version
										</p>
									</ScrollReveal>
									<div className="space-y-6 text-body-md text-surface-600 dark:text-surface-400">
										<ScrollReveal phase={2} delay={0.05}>
											<p>
												I started as a graphic designer. Logos, book covers,
												product mockups. Adobe Illustrator was my first real
												tool. That background stuck with me: I still think
												in terms of visual hierarchy, spacing, and how
												something feels before I think about how it works.
											</p>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.1}>
											<p>
												In 2021, I switched to code. Web development let me
												build complete products. Not just static designs,
												but things people could actually use. I've been
												doing that ever since.
											</p>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.15}>
											<p>
												Today I work directly with founders and CEOs. They
												give me a problem, I return a working product.
												Database schemas, APIs, interfaces, deployment.
												Whether I'm the only engineer or part of a team, I
												focus on one thing: shipping.
											</p>
										</ScrollReveal>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* 02 · How I Think */}
					<SwissGridSection id="how-i-think" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<ScrollReveal phase={2}>
										<p className="mb-8 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
											02 · How I Think
										</p>
									</ScrollReveal>
									<div className="grid gap-8 sm:grid-cols-2">
										<ScrollReveal phase={2} delay={0.05}>
											<div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
												<h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
													Craftsmanship
												</h3>
												<p className="text-sm text-surface-600 dark:text-surface-400">
													I care about the details. Error states, loading
													feedback, micro-interactions. The things most
													people skip.
												</p>
											</div>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.1}>
											<div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
												<h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
													User Empathy
												</h3>
												<p className="text-sm text-surface-600 dark:text-surface-400">
													I think about how someone will feel when they
													hit an edge case. Frustration is a design
													failure.
												</p>
											</div>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.15}>
											<div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
												<h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
													Business Focus
												</h3>
												<p className="text-sm text-surface-600 dark:text-surface-400">
													I don't like building features nobody uses. If
													it doesn't solve a real problem, I'll ask why.
												</p>
											</div>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.2}>
											<div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
												<h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
													Ownership
												</h3>
												<p className="text-sm text-surface-600 dark:text-surface-400">
													I work best when I understand the bigger
													picture. Give me context and I'll make better
													decisions on the details.
												</p>
											</div>
										</ScrollReveal>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* 03 · How I Work */}
					<SwissGridSection id="how-i-work" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<ScrollReveal phase={2}>
										<p className="mb-8 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
											03 · Engineering Philosophy
										</p>
									</ScrollReveal>
									<div className="space-y-6 text-body-md text-surface-600 dark:text-surface-400">
										<ScrollReveal phase={2} delay={0.05}>
											<p>
												I architect systems that scale. Not just in traffic,
												but in team velocity and maintenance cost. If a
												solution creates more problems than it solves, it's
												not a solution.
											</p>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.1}>
											<p>
												Ship early. Ship often. I work in weekly cycles with
												working demos. You see architecture decisions in
												action, not in Figma files. Technical debt gets
												documented and prioritized—not hidden until
												deployment.
											</p>
										</ScrollReveal>
										<ScrollReveal phase={2} delay={0.15}>
											<p>
												I optimize for long-term outcomes. Fast code that
												nobody can maintain is slow code. Clean abstractions
												that enable the next engineer to ship faster are
												infrastructure investments.
											</p>
										</ScrollReveal>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* Contact */}
					<SwissGridSection id="about-contact" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
										<h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
											Work with these principles?
										</h2>
										<Button asChild size="lg" variant="solid" color="primary">
											<Link href="/contact">
												Email
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
			</div>
		</SwissGridProvider>
	);
}
