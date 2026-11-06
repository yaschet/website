import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { EditorialSection } from "@/src/components/layout/editorial-section";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteHero } from "@/src/components/layout/site-hero";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_BODY_CLASS,
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { SITE_BOOKING_URL } from "@/src/constants/site";
import { AboutPrinciples } from "./about-principles";
import { WorkingTogether } from "./working-together";

export function AboutContent() {
	return (
		<>
			<section id="about-intro" aria-label="About Yassine" className="w-full">
				<PageContainer mobileBleed className="portfolio-section-top">
					<SwissGridBox className="portfolio-hero-frame">
						<SwissGridRow>
							<ProfileSection />
						</SwissGridRow>
						<SwissGridRow>
							<SiteHero
								id="about-hero"
								title="I’m Yassine."
								description="I’m a Product Engineer based in Rabat, Morocco. I came to software through graphic design, and I’ve been building applications for businesses since 2022."
								showActions={false}
							/>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</section>

			<EditorialSection id="story" title="I came to software through design">
				<ProseContainer className="portfolio-reading-copy">
					<p>
						Typography, spacing and the way an interface responds still matter to me.
						I’m particular about those details because they affect how easily someone
						can read, understand and use what’s in front of them.
					</p>
					<p>
						I’ve carried that attention into engineering. I think about how someone gets
						through a task, where they might make a mistake and how they can recover
						their work if something goes wrong.
					</p>
				</ProseContainer>
			</EditorialSection>

			<EditorialSection id="how-i-think" title="A result should come with an explanation">
				<AboutPrinciples />
			</EditorialSection>

			<EditorialSection id="working-with-me" title="I can start with a problem or a plan">
				<ProseContainer className="portfolio-reading-copy">
					<p>
						Sometimes a client brings a detailed specification. Sometimes they know what
						needs to work better and want help finding the right approach. I’m
						comfortable with both.
					</p>
					<p>
						I like understanding how things work, asking the questions that change the
						plan and then seeing it through to working software. That’s the part of the
						job I enjoy most.
					</p>
				</ProseContainer>
			</EditorialSection>

			<WorkingTogether className="mt-0" />

			<section
				id="about-contact"
				aria-labelledby="about-contact-heading"
				className="mt-[var(--portfolio-space-section)] w-full"
			>
				<PageContainer mobileBleed className="portfolio-section-top">
					<SwissGridBox>
						<InstrumentActionBand tone="inverted">
							<div className="portfolio-stack-related">
								<h2
									id="about-contact-heading"
									className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
								>
									Let’s talk about your project.
								</h2>
								<p
									className={`portfolio-body-md max-w-[48ch] ${INVERTED_ACTION_BAND_BODY_CLASS}`}
								>
									Tell me what you want to build or what needs to work better.
									We’ll work out a sensible next step.
								</p>
							</div>
							<ArrowButtonLink
								href={SITE_BOOKING_URL}
								variant="solid"
								arrowDirection="up-right"
								target="_blank"
								rel="noopener noreferrer"
								className={`shrink-0 ${INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}`}
							>
								Book a call
							</ArrowButtonLink>
						</InstrumentActionBand>
					</SwissGridBox>
				</PageContainer>
			</section>
		</>
	);
}
