import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export const metadata: Metadata = {
	title: "About | Yassine Chettouch",
	description: "Software Engineer based in Rabat, Morocco.",
	alternates: {
		canonical: "/about",
	},
};

const PRINCIPLES = [
	{
		title: "Boring infrastructure over demo architecture.",
		description:
			"I prefer Postgres over five new databases, standard TypeScript over clever abstractions, and proven libraries over the framework launched last week. Novel stacks create debt. Boring stacks ship and survive pivots. If your engineer is excited about the stack more than the problem, that's a warning sign.",
	},
	{
		title: "Verified AI, not vibe coding.",
		description:
			"I use Claude Code, Cursor, and Codex daily to accelerate scaffolding, refactors, tests, and codebase exploration. I do not ship unverified AI output into high-stakes workflows. Every path that touches money, eligibility, or user-visible correctness is validated through tests, evals, and failure-case review before it ships.",
	},
	{
		title: "One owner per decision.",
		description:
			"I'm at my best when one founder or CTO owns decisions end-to-end. Committee-driven scoping produces committee-quality software. If a project has four stakeholders each able to override architecture, I'm probably not the right engineer.",
	},
	{
		title: "End-to-end responsibility.",
		description:
			'I don\'t say "it works on my machine." I own the product from the first line of code to the final deployment logs. If something breaks in production at 2 AM, I\'m the one reading the stack trace.',
	},
] as const;

export default function AboutPage() {
	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* Nav Row */}
				<SiteHeader />

				{/* Profile */}
				<section id="profile" className="relative w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<ProfileSection />
							</SwissGridRow>
						</SwissGridBox>
					</PageContainer>
				</section>

				<section id="about-intro" className="w-full">
					<ScrollReveal phase={1} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<PageIntro
												eyebrow="ABOUT"
												title="How I work."
												description="Engineering principles and the path that produced them."
											/>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* 01 · The Short Version */}
				<section id="story" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ScrollReveal phase={2}>
												<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
													01 · The Short Version
												</p>
											</ScrollReveal>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<ScrollReveal phase={2} delay={0.05}>
													<p>
														I started in graphic design. Obsessed with
														Swiss precision, visual hierarchy, and
														typographic rhythm.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.1}>
													<p>
														In 2021, I realized design without
														build-power is just decoration. I pivoted to
														engineering and never looked back.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.15}>
													<p>
														Today, I architect full-stack systems
														end-to-end. From database ledgers to AI
														pipelines, I bridge the gap most teams leave
														open: the layer between beautiful UI and
														heavy backend logic. That layer is where
														products either succeed or quietly fail.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.2}>
													<p>
														I solve expensive business problems using
														whatever stack is required. I ship
														production software in weekly cycles. I own
														outcomes, not tickets.
													</p>
												</ScrollReveal>
											</ProseContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* 02 · How I Think */}
				<section id="how-i-think" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ScrollReveal phase={2}>
												<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
													02 · How I Think
												</p>
											</ScrollReveal>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<div className="grid gap-[var(--portfolio-space-section)] sm:grid-cols-2">
												{PRINCIPLES.map((principle, index) => (
													<ScrollReveal
														key={principle.title}
														phase={2}
														delay={0.05 + index * 0.05}
													>
														<div className="portfolio-surface-card">
															<div className="portfolio-card-copy">
																<h3 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-50">
																	{principle.title}
																</h3>
																<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
																	{principle.description}
																</p>
															</div>
														</div>
													</ScrollReveal>
												))}
											</div>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* 03 · How I Work */}
				<section id="how-i-work" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ScrollReveal phase={2}>
												<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
													03 · Engineering Philosophy
												</p>
											</ScrollReveal>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<ScrollReveal phase={2} delay={0.05}>
													<p>
														I architect for malleability. Systems
														change. Business models pivot. I use strict
														typing (TypeScript + Zod), atomic design
														principles, and clear module boundaries so
														that when the business shifts direction, the
														code adapts instead of breaking. Rigid
														systems are easy to build and expensive to
														maintain. Malleable systems are hard to
														build and cheap to live with.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.1}>
													<p>
														Ship early. Ship often. I work in weekly
														cycles with working demos, not Figma files.
														You see architecture decisions in motion, in
														production, not in slides. Technical debt
														gets documented and prioritized openly, not
														hidden until deployment, not discovered
														during the next engineer&apos;s onboarding.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.15}>
													<p>
														I optimize for long-term outcomes. Fast code
														that nobody can maintain is slow code. Clean
														abstractions that let the next engineer ship
														faster are infrastructure investments. My
														job isn&apos;t to write code. It&apos;s to
														make sure the codebase, six months from now,
														is still a place your team wants to work in.
													</p>
												</ScrollReveal>
											</ProseContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				<section id="working-with-ai" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ScrollReveal phase={2}>
												<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
													04 · Working with AI
												</p>
											</ScrollReveal>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<ScrollReveal phase={2} delay={0.05}>
													<p>AI is my compiler, not my architect.</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.1}>
													<p>
														I use coding agents (Claude Code, Cursor,
														Codex) for scaffolding, refactors, test
														generation, and codebase exploration. They
														accelerate the parts of the work that deserve
														acceleration. They do not decide
														architecture, validate business logic, or own
														the final quality. Those stay human.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.15}>
													<p>
														Every path that touches money, eligibility,
														user-visible correctness, or external
														compliance is verified through tests, evals,
														and manual boundary review before it ships. I
														document where AI accelerated a decision and
														where a human overrode one. That trail makes
														audits tractable six months later when
														something goes wrong and the root cause has
														to be found fast.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.2}>
													<p>
														If the question is &quot;can I ship faster with
														AI?&quot; yes, substantially. If the question
														is &quot;will I ship AI output you can&apos;t
														explain?&quot; no.
													</p>
												</ScrollReveal>
											</ProseContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* Contact */}
				<section id="about-contact" className="w-full">
					<ScrollReveal phase={3} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<InstrumentActionBand
											fieldSpeed={0.58}
											fieldVariant="terrain"
											tone="inverted"
										>
											<h2
												className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
											>
												Work with these principles?
											</h2>
											<Button
												asChild
												size="md"
												variant="solid"
												color="default"
												className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
											>
												<Link href="/contact">
													Email
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
