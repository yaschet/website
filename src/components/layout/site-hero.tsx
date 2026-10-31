import { SiteHeroField } from "@/src/components/layout/site-hero-field";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { Reveal, revealSequence } from "@/src/components/ui/reveal";
import { SITE_BOOKING_URL } from "@/src/constants/site";

const HERO_COLUMN_MAX_WIDTH = "calc(var(--portfolio-grid-step) * 50)";
const HERO_BODY_MAX_WIDTH = "58ch";

export function SiteHero() {
	return (
		<section
			id="hero"
			className="relative isolate w-full overflow-hidden"
			data-instrument-host=""
		>
			<SiteHeroField />
			<div className="portfolio-box-pad relative z-10">
				<div
					className="portfolio-stack-related w-full"
					style={{ maxWidth: HERO_COLUMN_MAX_WIDTH }}
				>
					<div className="portfolio-stack-related">
						<HeadingReveal
							as="h1"
							effect="resolve"
							delay={revealSequence.headingLate}
							className="portfolio-hero-title portfolio-capsize-hero w-fit max-w-full text-balance text-foreground"
							style={{ margin: 0 }}
						>
							Complex systems, clean interfaces.
						</HeadingReveal>
						<Reveal delay={revealSequence.body}>
							<p
								className="portfolio-body-lg text-muted-foreground"
								style={{ maxWidth: HERO_BODY_MAX_WIDTH, margin: 0 }}
							>
								I build CRMs, billing systems, document workflows, and{" "}
								<span className="whitespace-nowrap">AI pipelines</span> that replace
								manual work. Internal tools and SaaS for small businesses, made to
								feel simple to use.
							</p>
						</Reveal>
					</div>
					<Reveal delay={revealSequence.controls}>
						<div className="portfolio-control-row pointer-events-auto">
							<ArrowButtonLink
								href={SITE_BOOKING_URL}
								variant="solid"
								arrowDirection="up-right"
								target="_blank"
								rel="noopener noreferrer"
							>
								Book a call
							</ArrowButtonLink>
							<ArrowButtonLink href="#work" variant="outline" arrowDirection="down">
								View my work
							</ArrowButtonLink>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
