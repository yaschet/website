"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { DotGrid } from "@/src/components/ui/dot-grid";
import { Reveal } from "@/src/components/ui/reveal";

const HERO_BASELINE = 10;
const HERO_GRID_STEP = HERO_BASELINE * 2;
const HERO_GRID_MIN_INSET = HERO_GRID_STEP;
const HERO_CONTENT_INSET = HERO_GRID_STEP * 2;
const HERO_SECTION_ROWS = 28;
const HERO_SECTION_HEIGHT = HERO_SECTION_ROWS * HERO_BASELINE;
const HERO_HEAD_LINE = HERO_BASELINE * 6;
const HERO_BODY_LINE = HERO_BASELINE * 3;
const HERO_TEXT_WIDTH = HERO_GRID_STEP * 34;
const HERO_BASELINE_ROWS = HERO_SECTION_ROWS;
const HERO_HEAD_START_ROW = 5;
const HERO_BODY_START_ROW = 11;
const HERO_CTA_START_ROW = 21;
const HERO_CTA_PRIMARY_WIDTH = HERO_GRID_STEP * 7;
const HERO_CTA_SECONDARY_WIDTH = HERO_GRID_STEP * 4;
const HERO_HEAD_OPTICAL_TRIM = -2;
const HERO_BODY_OPTICAL_TRIM = -1;

function HeroContent() {
	const contentStyle = useMemo(
		() => ({
			paddingInline: `${HERO_CONTENT_INSET}px`,
			minHeight: `${HERO_SECTION_HEIGHT}px`,
		}),
		[],
	);

	return (
		<div
			className="relative z-10 grid"
			style={{
				...contentStyle,
				gridTemplateRows: `repeat(${HERO_BASELINE_ROWS}, ${HERO_BASELINE}px)`,
			}}
		>
			<div style={{ gridRow: `${HERO_HEAD_START_ROW} / span 6` }}>
				<Reveal phase={2}>
					<h2
						className={cn(
							"max-w-none text-heading-xl! text-surface-900 dark:text-surface-100",
						)}
						style={{
							lineHeight: HERO_HEAD_LINE,
							margin: 0,
							transform: `translateY(${HERO_HEAD_OPTICAL_TRIM}px)`,
						}}
					>
						I build products for the web.
					</h2>
				</Reveal>
			</div>
			<div style={{ gridRow: `${HERO_BODY_START_ROW} / span 6` }}>
				<Reveal phase={2} delay={0.05}>
					<p
						className={cn(
							"max-w-none text-body-lg text-surface-900 dark:text-surface-100",
						)}
						style={{
							lineHeight: HERO_BODY_LINE,
							margin: 0,
							maxWidth: HERO_TEXT_WIDTH,
							transform: `translateY(${HERO_BODY_OPTICAL_TRIM}px)`,
						}}
					>
						Web apps. SaaS platforms. Internal tools. From the first idea to the final
						deploy. Complex systems that feel effortless.
					</p>
				</Reveal>
			</div>
			<div style={{ gridRow: `${HERO_CTA_START_ROW} / span 4` }}>
				<Reveal phase={2} delay={0.1} className="h-full">
					<div
						className="grid h-full"
						style={{
							columnGap: `${HERO_GRID_STEP}px`,
							gridTemplateColumns: `${HERO_CTA_PRIMARY_WIDTH}px ${HERO_CTA_SECONDARY_WIDTH}px`,
						}}
					>
						<Button
							asChild
							size="md"
							variant="solid"
							color="primary"
							className="h-full w-full justify-center px-0 py-0 leading-none"
						>
							<Link href="/projects">
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
	);
}

function HeroDataPlane() {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<div className="absolute inset-0 bg-white dark:bg-surface-900" />
			<DotGrid
				step={HERO_GRID_STEP}
				minInset={HERO_GRID_MIN_INSET}
				radius={1.15}
				className="text-[rgba(17,94,81,0.24)] dark:text-[rgba(51,255,234,0.54)]"
			/>
		</div>
	);
}

export function SiteHero() {
	return (
		<section
			id="hero"
			className="relative isolate w-full overflow-hidden"
			style={{ minHeight: `${HERO_SECTION_HEIGHT}px` }}
		>
			<HeroDataPlane />
			<HeroContent />
		</section>
	);
}
