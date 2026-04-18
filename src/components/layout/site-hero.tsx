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
const HERO_BODY_MAX_WIDTH = "58ch";

function HeroContent() {
	return (
		<div className="portfolio-box-pad relative z-10">
			<div className="portfolio-stack-related w-full" style={{ maxWidth: HERO_COLUMN_MAX_WIDTH }}>
				<div className="portfolio-stack-related">
					<HeadingReveal
						as="h1"
						phase={1}
						className="portfolio-heading-xl portfolio-capsize-heading-xl w-fit max-w-full text-surface-800 dark:text-surface-100"
						style={{ margin: 0 }}
					>
						Complex systems, clean interfaces.
					</HeadingReveal>
					<Reveal phase={2} delay={0.05}>
						<p
							className="portfolio-body-lg text-surface-700 dark:text-surface-300"
							style={{ maxWidth: HERO_BODY_MAX_WIDTH, margin: 0 }}
						>
							I build CRMs, billing systems, document workflows, and{" "}
							<span className="whitespace-nowrap">AI pipelines</span> that replace manual
							work. Internal tools and SaaS for small businesses, made to feel simple to
							use.
						</p>
					</Reveal>
				</div>
				<Reveal phase={2} delay={0.1}>
					<div className="portfolio-control-row pointer-events-auto">
						<Button
							asChild
							size="md"
							variant="soft"
							color="default"
							className="bg-surface-900 text-surface-50 hover:bg-surface-800 focus-visible:bg-surface-800 dark:bg-surface-100 dark:text-surface-950 dark:hover:bg-surface-200 dark:focus-visible:bg-surface-200"
						>
							<Link href="/case-studies">
								Case Studies
								<ArrowRightIcon className="size-4" weight="bold" />
							</Link>
						</Button>
						<Button
							asChild
							size="md"
							variant="soft"
							color="default"
							className="bg-surface-100 text-surface-800 hover:bg-surface-200 focus-visible:bg-surface-200 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700 dark:focus-visible:bg-surface-700"
						>
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
				speed={0.44}
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
