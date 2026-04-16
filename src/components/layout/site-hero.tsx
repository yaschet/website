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

const HERO_BASELINE = "var(--portfolio-rhythm)";
const HERO_GRID_STEP = "var(--portfolio-grid-step)";
const HERO_CONTENT_INSET = "var(--portfolio-space-4)";
const HERO_CONTENT_INSET_MOBILE = "var(--portfolio-box-pad-mobile)";
const HERO_STACK_GAP_MOBILE = "var(--portfolio-space-3)";
const HERO_SECTION_ROWS = 36;
const HERO_SECTION_HEIGHT = "calc(var(--portfolio-rhythm) * 36)";
const HERO_SECTION_HEIGHT_MOBILE = "calc(var(--portfolio-rhythm) * 32)";
const HERO_HEAD_LINE = "var(--portfolio-space-6)";
const HERO_BODY_LINE = "var(--portfolio-space-3)";
const HERO_TEXT_WIDTH = "calc(var(--portfolio-grid-step) * 38)";
const HERO_BASELINE_ROWS = HERO_SECTION_ROWS;
const HERO_HEAD_START_ROW = 5;
const HERO_HEAD_SPAN = 12;
const HERO_BODY_START_ROW = 17;
const HERO_BODY_SPAN = 9;
const HERO_CTA_START_ROW = 29;
const HERO_CTA_SPAN = 4;
const HERO_CTA_PRIMARY_WIDTH = "calc(var(--portfolio-grid-step) * 7)";
const HERO_CTA_SECONDARY_WIDTH = "calc(var(--portfolio-grid-step) * 4)";
const HERO_HEAD_OPTICAL_TRIM = -2;
const HERO_BODY_OPTICAL_TRIM = -1;

function HeroContent() {
	return (
		<>
			<div
				className="pointer-events-none relative z-10 flex flex-col md:hidden"
				style={{
					gap: HERO_STACK_GAP_MOBILE,
					padding: HERO_CONTENT_INSET_MOBILE,
				}}
			>
				<div
					className="flex flex-col"
					style={{
						gap: "var(--portfolio-space-2)",
					}}
				>
					<HeadingReveal
						as="h1"
						phase={2}
						className="max-w-[14ch] font-medium text-[clamp(2.25rem,11vw,3rem)] text-surface-900 leading-[0.94] tracking-[var(--tracking-tighter)] dark:text-surface-100"
						style={{ margin: 0 }}
					>
						Product engineering for complex systems.
					</HeadingReveal>
					<Reveal phase={2} delay={0.05}>
						<p
							className="max-w-[36ch] text-[1rem] text-surface-900 leading-7 tracking-[var(--tracking-normal)] dark:text-surface-100"
							style={{ margin: 0 }}
						>
							I design and build the infrastructure behind the product - translation
							pipelines that process thousands of documents, matching engines that
							navigate complex eligibility rules, and financial systems with
							double-entry accuracy. The architecture no one sees, until it breaks.
						</p>
					</Reveal>
				</div>
				<Reveal phase={2} delay={0.1}>
					<div
						className="pointer-events-auto flex flex-wrap"
						style={{
							gap: "var(--portfolio-space-1)",
						}}
					>
						<Button
							asChild
							size="md"
							variant="solid"
							color="primary"
							className="min-w-0"
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
							className="min-w-0"
						>
							<Link href="/contact">Email</Link>
						</Button>
					</div>
				</Reveal>
			</div>
			<div
				className="pointer-events-none relative z-10 hidden md:grid"
				style={{
					paddingInline: HERO_CONTENT_INSET,
					minHeight: HERO_SECTION_HEIGHT,
					gridTemplateRows: `repeat(${HERO_BASELINE_ROWS}, ${HERO_BASELINE})`,
				}}
			>
				<div style={{ gridRow: `${HERO_HEAD_START_ROW} / span ${HERO_HEAD_SPAN}` }}>
					<HeadingReveal
						as="h1"
						phase={2}
						className={cn(
							"max-w-none text-heading-xl! text-surface-900 dark:text-surface-100",
						)}
						style={{
							lineHeight: HERO_HEAD_LINE,
							margin: 0,
							transform: `translateY(${HERO_HEAD_OPTICAL_TRIM}px)`,
						}}
					>
						Product engineering for complex systems.
					</HeadingReveal>
				</div>
				<div style={{ gridRow: `${HERO_BODY_START_ROW} / span ${HERO_BODY_SPAN}` }}>
					<Reveal phase={2} delay={0.05}>
						<p
							className={cn(
								"max-w-none text-body-lg text-surface-900 dark:text-surface-100",
							)}
							style={{
								lineHeight: HERO_BODY_LINE,
								margin: 0,
								maxWidth: `min(100%, ${HERO_TEXT_WIDTH})`,
								transform: `translateY(${HERO_BODY_OPTICAL_TRIM}px)`,
							}}
						>
							I design and build the infrastructure behind the product - translation
							pipelines that process thousands of documents, matching engines that
							navigate complex eligibility rules, and financial systems with
							double-entry accuracy. The architecture no one sees, until it breaks.
						</p>
					</Reveal>
				</div>
				<div style={{ gridRow: `${HERO_CTA_START_ROW} / span ${HERO_CTA_SPAN}` }}>
					<Reveal phase={2} delay={0.1} className="h-full">
						<div
							className="pointer-events-auto grid h-full"
							style={{
								columnGap: HERO_GRID_STEP,
								gridTemplateColumns: `${HERO_CTA_PRIMARY_WIDTH} ${HERO_CTA_SECONDARY_WIDTH}`,
							}}
						>
							<Button
								asChild
								size="md"
								variant="solid"
								color="primary"
								className="h-full w-full justify-center px-0 py-0 leading-none"
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
								className="h-full w-full justify-center px-0 py-0 leading-none"
							>
								<Link href="/contact">Email</Link>
							</Button>
						</div>
					</Reveal>
				</div>
			</div>
		</>
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
		<section
			id="hero"
			className="relative isolate min-h-[var(--hero-mobile-min-height)] w-full overflow-hidden md:min-h-[calc(var(--portfolio-rhythm)*36)]"
			style={{
				["--hero-mobile-min-height" as string]: HERO_SECTION_HEIGHT_MOBILE,
			}}
		>
			<HeroInstrumentPlane className="opacity-100 dark:opacity-100" />
			<HeroContent />
		</section>
	);
}
