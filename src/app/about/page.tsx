import type { Metadata } from "next";
import { AboutPrinciples } from "@/src/components/content/about-principles";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { EditorialSection } from "@/src/components/layout/editorial-section";
import { PageIntroPanel } from "@/src/components/layout/page-intro";
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
				<section id="about-intro" className="w-full">
					<section className="w-full">
						<PageContainer mobileBleed className="portfolio-section-top">
							<SwissGridBox>
								<SwissGridRow>
									<PageIntroPanel
										eyebrow="About"
										title="How I work."
										description="A Product Engineer connecting product design, application code and the systems behind it."
									/>
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
							Today I design and build web applications, from the interface to the
							data, integrations and deployment. The case studies here cover student
							onboarding, matching, billing and document workflows.
						</p>
						<p>
							I&apos;m most useful when a change crosses several parts of a product. I
							work through the requirements, make the tradeoffs explicit and follow
							the implementation through to a working release.
						</p>
					</ProseContainer>
				</EditorialSection>
				<EditorialSection id="how-i-think" title="How I think">
					<AboutPrinciples />
				</EditorialSection>
				<EditorialSection id="how-i-work" title="Engineering philosophy">
					<ProseContainer className="portfolio-reading-copy">
						<p>
							I use clear module boundaries, explicit data contracts and familiar
							tools so the product can change without losing track of its rules. A
							useful architecture makes the next change easier to understand.
						</p>
						<p>
							I review progress through running software and explain what is
							implemented, what has been verified and what still needs work. Technical
							limitations and handover decisions belong in the record.
						</p>
					</ProseContainer>
				</EditorialSection>
				<EditorialSection id="working-with-ai" title="Working with AI">
					<ProseContainer className="portfolio-reading-copy">
						<p>
							I use coding agents for scaffolding, refactoring, tests and reading
							codebases. I remain responsible for the architecture, business rules and
							the quality of the result.
						</p>
						<p>
							When a feature interprets documents or helps someone make a decision, I
							check its output against explicit rules and examples. Uncertainty and
							the points that need human review should stay visible.
						</p>
					</ProseContainer>
				</EditorialSection>

				{/* Contact */}
				<section id="about-contact" className="w-full">
					<ScrollReveal phase={3} className="w-full">
						<section className="w-full">
							<PageContainer mobileBleed className="portfolio-section-top">
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
												Have a product to build?
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
