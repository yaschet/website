import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
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
		title: "Boring infrastructure over new toys.",
		description:
			"I'd rather use Postgres than five new databases, standard TypeScript than clever abstractions, and proven libraries than whatever launched last week. Novel stacks create debt. Boring stacks ship and keep shipping through pivots.",
	},
	{
		title: "Verified AI, not vibe coding.",
		description:
			"I use Claude Code, Cursor, and Codex every day for scaffolding, refactors, tests, and reading new codebases. I don't ship unverified AI output into anything that touches money, eligibility, or user-visible correctness. Those paths get tests, evals, and a manual pass before they go live.",
	},
	{
		title: "One owner per decision.",
		description:
			"I work best when one person owns decisions end to end. Committee scoping tends to produce committee software. If a project has four stakeholders who can each override the architecture, I'm probably not the right fit.",
	},
	{
		title: "End to end.",
		description:
			"I don't hand off at the edge of my tickets. I follow the work from first commit to the deployment logs. If something breaks at 2am, I'm the one reading the stack trace.",
	},
] as const;

export default function AboutPage() {
	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col">
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
				</section>

				{/* 01 · The Short Version */}
				<section id="story" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
												01 · The Short Version
											</p>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<p>
													I started in graphic design, caring mostly about
													type and visual hierarchy. Around 2021 I
													realized design without code was half the job,
													so I moved into engineering.
												</p>
												<p>
													Today I build full-stack systems end to end.
													Frontend, backend, data, AI, payments,
													deployment. I&apos;m comfortable across the
													whole surface.
												</p>
												<p>
													I&apos;m most useful when the problem cuts
													across parts of a product and someone has to
													hold the whole thing in their head until it
													works. I&apos;d rather ship a working version in
													a week than a perfect spec in a month.
												</p>
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
											<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
												02 · How I Think
											</p>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<div className="grid gap-[var(--portfolio-space-section)] sm:grid-cols-2">
												{PRINCIPLES.map((principle) => (
													<div
														key={principle.title}
														className="portfolio-surface-card"
													>
														<div className="portfolio-card-copy">
															<h3 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-50">
																{principle.title}
															</h3>
															<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
																{principle.description}
															</p>
														</div>
													</div>
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
											<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
												03 · Engineering Philosophy
											</p>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<p>
													I try to build things that bend when the
													business changes direction, because the business
													always does. That means strict typing, clear
													module boundaries, and not being clever when
													boring would work. Rigid systems are fast to
													write and painful to keep. Bendy systems cost
													more up front and a lot less to live with.
												</p>
												<p>
													I work in short cycles with running demos, not
													Figma files. Architecture decisions show up in
													production so we can see whether they hold.
													Technical debt gets written down out loud, not
													hidden for the next engineer to find.
												</p>
												<p>
													The job isn&apos;t to ship code. It&apos;s to
													make sure the codebase six months from now is
													still somewhere the next engineer wants to work.
												</p>
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
											<p className="portfolio-kicker text-surface-400 dark:text-surface-500">
												04 · Working with AI
											</p>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<p>AI is my compiler, not my architect.</p>
												<p>
													I use coding agents for scaffolding, refactors,
													test generation, and reading new codebases.
													They&apos;re fast where fast is useful. They
													don&apos;t pick the architecture, validate
													business logic, or sign off on quality. Those
													stay with me.
												</p>
												<p>
													Anything that touches money, eligibility,
													user-visible correctness, or compliance gets
													tests, evals, and a manual review before it
													ships. I keep a trail of where AI helped and
													where I overrode it. That makes things much
													easier to debug six months later when something
													goes sideways and someone needs to find the root
													cause fast.
												</p>
												<p>
													Yes, I ship faster with AI. No, I don&apos;t
													ship AI output I can&apos;t explain.
												</p>
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
											fieldSpeed={0.28}
											fieldVariant="terrain"
											tone="dark"
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
