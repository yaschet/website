"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";

/**
 * Hero content that adapts to the mesh gradient theme.
 * Uses the gradient context to determine text colors.
 */
function HeroContent() {
	return (
		<div className="p-6 sm:p-8">
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
		<section id="hero" className="relative w-full overflow-hidden">
			<HeroContent />
		</section>
	);
}
