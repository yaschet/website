import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { SiteHeroField } from "@/src/components/layout/site-hero-field";
import { ButtonLink } from "@/src/components/ui/button-link";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { Reveal, revealSequence } from "@/src/components/ui/reveal";

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
							<ButtonLink
								href="/case-studies"
								variant="solid"
								icon={<ArrowRightIcon className="size-4" weight="bold" />}
							>
								Case studies
							</ButtonLink>
							<ButtonLink href="/contact" variant="outline">
								Email
							</ButtonLink>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
