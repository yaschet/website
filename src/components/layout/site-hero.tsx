"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { DotGrid } from "@/src/components/ui/dot-grid";
import { Reveal } from "@/src/components/ui/reveal";

const HERO_BASELINE = 10;
const HERO_GRID_STEP = HERO_BASELINE * 2;
const HERO_GRID_MIN_INSET = HERO_GRID_STEP;
const HERO_VERTICAL_INSET = HERO_GRID_STEP * 2;
const HERO_STACK_GAP = HERO_GRID_STEP;
const HERO_HEAD_LINE = HERO_BASELINE * 6;
const HERO_BODY_LINE = HERO_BASELINE * 3;
const HERO_BUTTON_HEIGHT = HERO_BASELINE * 4;
const HERO_TEXT_WIDTH = HERO_GRID_STEP * 36;

function HeroContent({ insetX }: { insetX: number }) {
	const contentStyle = useMemo(
		() => ({
			paddingBlock: `${HERO_VERTICAL_INSET}px`,
			paddingInline: `${insetX}px`,
		}),
		[insetX],
	);

	return (
		<div className="relative z-10" style={contentStyle}>
			<div
				className="grid"
				style={{
					rowGap: `${HERO_STACK_GAP}px`,
				}}
			>
				<Reveal phase={2}>
					<h2
						className={cn(
							"max-w-none text-heading-xl! text-surface-900 dark:text-surface-100",
						)}
						style={{
							lineHeight: `${HERO_HEAD_LINE}px`,
							margin: 0,
						}}
					>
						I build products for the web.
					</h2>
				</Reveal>
				<Reveal phase={2} delay={0.05}>
					<p
						className={cn(
							"max-w-none text-body-lg text-surface-900 dark:text-surface-100",
						)}
						style={{
							lineHeight: `${HERO_BODY_LINE}px`,
							margin: 0,
							maxWidth: `${HERO_TEXT_WIDTH}px`,
						}}
					>
						Web apps. SaaS platforms. Internal tools. From the first idea to the final
						deploy. Complex systems that feel effortless.
					</p>
				</Reveal>
				<Reveal phase={2} delay={0.1}>
					<div
						className="flex flex-wrap items-center"
						style={{
							columnGap: `${HERO_GRID_STEP}px`,
							rowGap: `${HERO_BASELINE}px`,
						}}
					>
						<Button
							asChild
							size="md"
							variant="solid"
							color="primary"
							className="px-5"
							style={{ height: `${HERO_BUTTON_HEIGHT}px` }}
						>
							<Link href="/projects">
								Case Studies
								<ArrowRightIcon className="size-4" weight="bold" />
							</Link>
						</Button>
						<Button
							asChild
							size="md"
							variant="outlined"
							color="default"
							className="px-5"
							style={{ height: `${HERO_BUTTON_HEIGHT}px` }}
						>
							<Link href="/contact">Email</Link>
						</Button>
					</div>
				</Reveal>
			</div>
		</div>
	);
}

function HeroDataPlane({ onMetricsChange }: { onMetricsChange: (offsetX: number) => void }) {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<div className="absolute inset-0 bg-white dark:bg-surface-900" />
			<DotGrid
				step={HERO_GRID_STEP}
				minInset={HERO_GRID_MIN_INSET}
				radius={1.15}
				onMetricsChange={({ offsetX }) => onMetricsChange(offsetX + HERO_GRID_STEP)}
				className="text-[rgba(17,94,81,0.24)] dark:text-[rgba(51,255,234,0.54)]"
			/>
		</div>
	);
}

export function SiteHero() {
	const [contentInsetX, setContentInsetX] = useState(HERO_GRID_STEP * 2);
	const handleMetricsChange = useCallback((nextInsetX: number) => {
		setContentInsetX((current) => (Math.abs(current - nextInsetX) < 1 ? current : nextInsetX));
	}, []);

	return (
		<section id="hero" className="relative isolate w-full overflow-hidden">
			<HeroDataPlane onMetricsChange={handleMetricsChange} />
			<HeroContent insetX={contentInsetX} />
		</section>
	);
}
