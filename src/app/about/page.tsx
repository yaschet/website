import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
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
		title: "Precision",
		description:
			"I treat code like a contract. If the API fails, the UI is a lie. I build systems that fail gracefully and recover automatically.",
	},
	{
		title: "Speed as a Feature",
		description:
			'Latency kills trust. I optimize for "perceived performance" using optimistic UI, skeletons, and edge caching. No one likes waiting.',
	},
	{
		title: "ROI-First",
		description:
			"I don't build features for fun. I build to move the needle. If a feature doesn't reduce churn or increase revenue, I cut it.",
	},
	{
		title: "End-to-End Responsibility",
		description:
			'I don\'t say "it works on my machine." I own the product from the first line of code to the final deployment logs.',
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
														I started in{" "}
														<strong className="font-medium text-surface-900 dark:text-surface-100">
															Graphic Design
														</strong>
														, obsessing over visual hierarchy and Swiss
														precision. In 2021, I realized design
														wasn&apos;t enough—I wanted the power to
														build, not just mock up.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.1}>
													<p>
														I pivoted to{" "}
														<strong className="font-medium text-surface-900 dark:text-surface-100">
															Backend and Systems Engineering
														</strong>
														. I don&apos;t just build interfaces; I
														architect full-stack engines. From database
														ledgers to AI pipelines, I bridge the gap
														between &quot;beautiful UI&quot; and
														&quot;heavy backend logic.&quot;
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.15}>
													<p>
														Today, I function as a{" "}
														<strong className="font-medium text-surface-900 dark:text-surface-100">
															Software Engineer
														</strong>
														. I solve expensive business problems using
														whatever stack is required, shipping
														production-grade software in short cycles.
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
														I architect for{" "}
														<strong className="font-medium text-surface-900 dark:text-surface-100">
															Malleability
														</strong>
														. Systems change. I use strict typing
														(TypeScript/Zod) and atomic design
														principles so that when the business pivots,
														the code doesn&apos;t break.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.1}>
													<p>
														Ship early. Ship often. I work in weekly
														cycles with working demos. You see
														architecture decisions in action, not in
														Figma files. Technical debt gets documented
														and prioritized, not hidden until
														deployment.
													</p>
												</ScrollReveal>
												<ScrollReveal phase={2} delay={0.15}>
													<p>
														I optimize for long-term outcomes. Fast code
														that nobody can maintain is slow code. Clean
														abstractions that enable the next engineer
														to ship faster are infrastructure
														investments.
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
