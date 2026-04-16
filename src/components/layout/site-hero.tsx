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

const HERO_GRID_STEP = "var(--portfolio-grid-step)";
const HERO_CONTENT_INSET = "var(--portfolio-space-4)";
const HERO_CONTENT_INSET_MOBILE = "var(--portfolio-box-pad-mobile)";
const HERO_STACK_GAP_MOBILE = "var(--portfolio-space-1)";
const HERO_SECTION_HEIGHT_MOBILE = "calc(var(--portfolio-rhythm) * 31)";
const HERO_HEAD_LINE = "var(--portfolio-space-6)";
const HERO_BODY_LINE = "var(--portfolio-space-3)";
const HERO_CONTENT_GAP = "var(--portfolio-space-2)";
const HERO_BODY_CTA_GAP = "var(--portfolio-space-1)";
const HERO_BODY_EMPHASIS_GAP = "var(--portfolio-space-1)";
const HERO_CTA_HEIGHT = "calc(var(--portfolio-grid-step) * 2.1)";
const HERO_BOTTOM_EXTRA = "calc(var(--portfolio-grid-step) * 2)";
const HERO_SECTION_HEIGHT = `calc((${HERO_CONTENT_INSET} * 2) + (${HERO_HEAD_LINE} * 2) + ${HERO_CONTENT_GAP} + (${HERO_BODY_LINE} * 3) + ${HERO_BODY_EMPHASIS_GAP} + ${HERO_BODY_CTA_GAP} + ${HERO_CTA_HEIGHT} - (${HERO_GRID_STEP} * 3) + ${HERO_BOTTOM_EXTRA})`;
const HERO_CTA_PRIMARY_WIDTH = "calc(var(--portfolio-grid-step) * 7)";
const HERO_CTA_SECONDARY_WIDTH = "calc(var(--portfolio-grid-step) * 4)";

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
						className="max-w-[11ch] text-balance font-medium text-[clamp(2.5rem,12vw,3.2rem)] text-surface-900 leading-[0.92] tracking-[var(--tracking-tighter)] dark:text-surface-100"
						style={{ margin: 0 }}
					>
						<span className="block">Complex systems,</span>
						<span className="block">clean interfaces.</span>
					</HeadingReveal>
					<Reveal phase={2} delay={0.05}>
						<p
							className="max-w-[26ch] text-[1rem] text-surface-900 leading-[1.5] tracking-[var(--tracking-normal)] dark:text-surface-100"
							style={{ margin: 0 }}
						>
							<span className="block">I build what most engineers won't —</span>
							<span className="block">
								translation pipelines, matching engines, financial ledgers.
							</span>
							<span className="block" style={{ paddingTop: HERO_BODY_EMPHASIS_GAP }}>
								Then make them feel effortless.
							</span>
						</p>
					</Reveal>
				</div>
				<Reveal phase={2} delay={0.1}>
					<div
						className="pointer-events-auto flex flex-wrap"
						style={{
							gap: HERO_BODY_CTA_GAP,
						}}
					>
						<Button
							asChild
							size="md"
							variant="solid"
							color="primary"
							className="h-[calc(var(--portfolio-grid-step)*2.1)] min-w-0"
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
							className="h-[calc(var(--portfolio-grid-step)*2.1)] min-w-0"
						>
							<Link href="/contact">Email</Link>
						</Button>
					</div>
				</Reveal>
			</div>
			<div
				className="pointer-events-none relative z-10 hidden md:flex md:flex-col"
				style={{
					gap: HERO_BODY_CTA_GAP,
					height: "100%",
					padding: HERO_CONTENT_INSET,
				}}
			>
				<div
					className="flex flex-col"
					style={{
						gap: HERO_CONTENT_GAP,
					}}
				>
					<HeadingReveal
						as="h1"
						phase={2}
						className={cn(
							"max-w-[calc(var(--portfolio-grid-step)*22)] text-balance text-heading-xl! text-surface-900 dark:text-surface-100",
						)}
						style={{
							lineHeight: HERO_HEAD_LINE,
							margin: 0,
						}}
					>
						<span className="block">Complex systems,</span>
						<span className="block">clean interfaces.</span>
					</HeadingReveal>
					<Reveal phase={2} delay={0.05}>
						<p
							className={cn(
								"max-w-[calc(var(--portfolio-grid-step)*24)] text-body-lg text-surface-900 dark:text-surface-100",
							)}
							style={{
								lineHeight: HERO_BODY_LINE,
								margin: 0,
							}}
						>
							<span className="block">I build what most engineers won't —</span>
							<span className="block">
								translation pipelines, matching engines, financial ledgers.
							</span>
							<span className="block" style={{ paddingTop: HERO_BODY_EMPHASIS_GAP }}>
								Then make them feel effortless.
							</span>
						</p>
					</Reveal>
				</div>
				<Reveal phase={2} delay={0.1}>
					<div
						className="pointer-events-auto grid"
						style={{
							columnGap: HERO_GRID_STEP,
							height: HERO_CTA_HEIGHT,
							gridTemplateColumns: `${HERO_CTA_PRIMARY_WIDTH} ${HERO_CTA_SECONDARY_WIDTH}`,
						}}
					>
						<Button
							asChild
							size="xs"
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
							size="xs"
							variant="soft"
							color="default"
							className="h-full w-full justify-center px-0 py-0 leading-none"
						>
							<Link href="/contact">Email</Link>
						</Button>
					</div>
				</Reveal>
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
			className="relative isolate min-h-[var(--hero-mobile-min-height)] w-full overflow-hidden md:h-[var(--hero-desktop-height)] md:min-h-0"
			style={{
				["--hero-desktop-height" as string]: HERO_SECTION_HEIGHT,
				["--hero-mobile-min-height" as string]: HERO_SECTION_HEIGHT_MOBILE,
			}}
		>
			<HeroInstrumentPlane className="opacity-100 dark:opacity-100" />
			<HeroContent />
		</section>
	);
}
