import type { Metadata } from "next";
import { AboutPrinciples } from "@/src/components/content/about-principles";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { EditorialSection } from "@/src/components/layout/editorial-section";
import { PageIntro } from "@/src/components/layout/page-intro";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { SITE_DESCRIPTION } from "@/src/constants/site";

export const metadata: Metadata = {
	title: "About",
	description: `${SITE_DESCRIPTION} Based in Rabat, Morocco.`,
	alternates: {
		canonical: "/about",
	},
};

export default function AboutPage() {
	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* Profile */}
				<section aria-label="Profile" className="relative w-full">
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
											eyebrow="About"
											title="How I work."
											description="Engineering principles and the path that produced them."
										/>
									</div>
								</SwissGridRow>
							</SwissGridBox>
						</PageContainer>
					</section>
				</section>

				<EditorialSection id="story" title="The short version">
					<ProseContainer className="portfolio-reading-copy">
						<p>
							I started in graphic design, caring mostly about type and visual
							hierarchy. Around 2021 I realized design without code was half the job,
							so I moved into engineering.
						</p>
						<p>
							Today I build full-stack systems end to end. Frontend, backend, data,
							AI, payments, deployment. I&apos;m comfortable across the whole surface.
						</p>
						<p>
							I&apos;m most useful when the problem cuts across parts of a product and
							someone has to hold the whole thing in their head until it works.
							I&apos;d rather ship a working version in a week than a perfect spec in
							a month.
						</p>
					</ProseContainer>
				</EditorialSection>
				<EditorialSection id="how-i-think" title="How I think">
					<AboutPrinciples />
				</EditorialSection>
				<EditorialSection id="how-i-work" title="Engineering philosophy">
					<ProseContainer className="portfolio-reading-copy">
						<p>
							I try to build things that bend when the business changes direction,
							because the business always does. That means strict typing, clear module
							boundaries, and not being clever when boring would work. Rigid systems
							are fast to write and painful to keep. Bendy systems cost more up front
							and a lot less to live with.
						</p>
						<p>
							I work in short cycles with running demos, not Figma files. Architecture
							decisions show up in production so we can see whether they hold.
							Technical debt gets written down out loud, not hidden for the next
							engineer to find.
						</p>
						<p>
							The job isn&apos;t to ship code. It&apos;s to make sure the codebase six
							months from now is still somewhere the next engineer wants to work.
						</p>
					</ProseContainer>
				</EditorialSection>
				<EditorialSection id="working-with-ai" title="Working with AI">
					<ProseContainer className="portfolio-reading-copy">
						<p>AI is my compiler, not my architect.</p>
						<p>
							I use coding agents for scaffolding, refactors, test generation, and
							reading new codebases. They&apos;re fast where fast is useful. They
							don&apos;t pick the architecture, validate business logic, or sign off
							on quality. Those stay with me.
						</p>
						<p>
							Anything that touches money, eligibility, user-visible correctness, or
							compliance gets tests, evals, and a manual review before it ships. I
							keep a trail of where AI helped and where I overrode it. That makes
							things much easier to debug six months later when something goes
							sideways and someone needs to find the root cause fast.
						</p>
						<p>
							Yes, I ship faster with AI. No, I don&apos;t ship AI output I can&apos;t
							explain.
						</p>
					</ProseContainer>
				</EditorialSection>

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
											tone="inverted"
										>
											<h2
												className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
											>
												Work with these principles?
											</h2>
											<ArrowButtonLink
												href="/contact"
												variant="solid"
												color="default"
												className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
											>
												Discuss a project
											</ArrowButtonLink>
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
