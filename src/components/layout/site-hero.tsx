"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import Dither from "@/src/components/ui/dither";
import { Reveal } from "@/src/components/ui/reveal";

function HeroContent() {
	return (
		<div className="relative z-10 p-6 sm:p-8">
			<Reveal phase={2}>
				<h2 className={cn("mb-6 text-heading-xl! text-surface-900 dark:text-surface-100")}>
					I build products for the web.
				</h2>
			</Reveal>
			<Reveal phase={2} delay={0.05}>
				<p
					className={cn(
						"mb-8 max-w-xl text-body-lg text-surface-900 dark:text-surface-100",
					)}
				>
					Web apps. SaaS platforms. Internal tools. From the first idea to the final
					deploy. Complex systems that feel effortless.
				</p>
			</Reveal>
			<Reveal phase={2} delay={0.1}>
				<div className="flex flex-wrap items-center gap-3">
					{/* Primary CTA - High contrast against gradient background */}
					<Button asChild size="lg" variant="solid" color="primary">
						<Link href="/projects">
							Case Studies
							<ArrowRightIcon className="size-4" weight="bold" />
						</Link>
					</Button>
					{/* Secondary CTA - Outlined, adapts to theme */}
					<Button asChild size="lg" variant="outlined" color="default">
						<Link href="/contact">Email</Link>
					</Button>
				</div>
			</Reveal>
		</div>
	);
}

export function SiteHero() {
	return (
		<section id="hero" className="relative isolate w-full overflow-hidden">
			<div className="pointer-events-none absolute inset-0">
				<Dither
					waveSpeed={0.018}
					waveFrequency={1.75}
					waveAmplitude={0.22}
					colorNum={3}
					pixelSize={6}
					mouseRadius={0.58}
					className="opacity-100 [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.72)_14%,black_30%,black_100%)]"
				/>
				<div className="absolute inset-0 bg-linear-to-r from-surface-50 via-42% via-surface-50/86 to-surface-50/34 dark:from-surface-900/88 dark:via-42% dark:via-surface-900/48 dark:to-surface-900/10" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_52%,transparent_0%,transparent_52%,rgba(255,255,255,0.42)_100%)] dark:bg-[radial-gradient(circle_at_72%_52%,transparent_0%,transparent_52%,rgba(9,9,11,0.26)_100%)]" />
			</div>
			<HeroContent />
		</section>
	);
}
