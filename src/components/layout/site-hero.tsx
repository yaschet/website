"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeadingReveal } from "@/components/ui/heading-reveal";
import {
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_ORIGIN,
	INSTRUMENT_GRID_STEP,
} from "@/components/ui/instrument-field-metrics";
import { Reveal } from "@/components/ui/reveal";
import { InstrumentField } from "@/components/ui/topographic-dot-field";
import { cn } from "@/lib/utils";

const HERO_COLUMN_MAX_WIDTH = "calc(var(--portfolio-grid-step) * 50)";
const HERO_BODY_MAX_WIDTH = "48ch";

function HeroContent() {
	return (
		<div className="portfolio-box-pad relative z-10">
			<div
				className="portfolio-stack-related w-full"
				style={{ maxWidth: HERO_COLUMN_MAX_WIDTH }}
			>
				<HeadingReveal
					as="h1"
					phase={1}
					className="portfolio-heading-xl portfolio-capsize-heading-xl w-fit max-w-full text-surface-900 dark:text-surface-100"
					style={{ margin: 0 }}
				>
					Operational software, <br />
					clean interfaces.
				</HeadingReveal>
				<Reveal phase={2} delay={0.05}>
					<p
						className="portfolio-body-lg text-surface-900 dark:text-surface-100"
						style={{ maxWidth: HERO_BODY_MAX_WIDTH, margin: 0 }}
					>
						I build the systems small businesses run on: CRMs, billing systems, document
						automation, and AI pipelines that replace manual work. Some of it is
						internal, some of it is SaaS. I like when something complicated ends up
						feeling simple to use.
					</p>
				</Reveal>
				<Reveal phase={2} delay={0.1}>
					<div className="portfolio-control-row pointer-events-auto">
						<Button asChild size="md" variant="solid" color="primary">
							<Link href="/case-studies">
								Case Studies
								<ArrowRightIcon className="size-4" weight="bold" />
							</Link>
						</Button>
						<Button asChild size="md" variant="soft" color="default">
							<Link href="/contact">Email</Link>
						</Button>
					</div>
				</Reveal>
			</div>
		</div>
	);
}

function HeroInstrumentPlane({ className }: { className?: string }) {
	return (
		<div className={cn("absolute inset-0", className)} aria-hidden="true">
			<div
				className="pointer-events-none absolute inset-0"
				style={{ backgroundColor: "var(--instrument-field-bg-auto)" }}
			/>
			<InstrumentField
				interactive
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				origin={INSTRUMENT_GRID_ORIGIN}
				radius={INSTRUMENT_DOT_RADIUS}
				speed={0.58}
				surface="hero"
				variant="terrain"
			/>
		</div>
	);
}

export function SiteHero() {
	return (
		<section id="hero" className="relative isolate w-full overflow-hidden">
			<HeroInstrumentPlane className="opacity-100 dark:opacity-100" />
			<HeroContent />
		</section>
	);
}
