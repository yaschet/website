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

const HERO_COPY_MAX_WIDTH = "calc(var(--portfolio-grid-step) * 24)";

function HeroContent() {
	return (
		<div className="portfolio-box-pad portfolio-stack-related relative z-10">
			<div
				className="portfolio-stack-related w-full"
				style={{ maxWidth: HERO_COPY_MAX_WIDTH }}
			>
				<HeadingReveal
					as="h1"
					phase={2}
					className="portfolio-heading-xl portfolio-capsize-heading-xl text-surface-900 dark:text-surface-100"
					style={{ margin: 0 }}
				>
					<span className="block">Complex systems, clean interfaces.</span>
				</HeadingReveal>
				<Reveal phase={2} delay={0.05}>
					<p
						className="portfolio-body-lg text-surface-900 dark:text-surface-100"
						style={{ margin: 0 }}
					>
						<span className="block">I build what most engineers won't —</span>
						<span className="block">
							translation pipelines, matching engines, financial ledgers.
						</span>
						<span className="block pt-[var(--portfolio-space-tight)]">
							Then make them feel effortless.
						</span>
					</p>
				</Reveal>
			</div>
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
	);
}

function HeroInstrumentPlane({ className }: { className?: string }) {
	return (
		<div className={cn("absolute inset-0", className)} aria-hidden="true">
			<div className="pointer-events-none absolute inset-0 bg-white dark:bg-surface-900" />
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
