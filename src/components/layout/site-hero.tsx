"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { MeshGradient, useMeshGradient } from "@/src/components/ui/mesh-gradient";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

/**
 * Hero content that adapts to the mesh gradient theme.
 * Uses the gradient context to determine text colors.
 */
function HeroContent() {
	const gradient = useMeshGradient();

	// Determine color scheme based on theme
	// Light text for dark mode, dark text for light mode
	const needsLightText = gradient?.needsLightText ?? false;

	// Dynamic color classes based on atmosphere
	const textPrimary = needsLightText ? "text-surface-100" : "text-surface-900";
	const textSecondary = needsLightText ? "text-surface-400" : "text-surface-600";

	return (
		<div className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:px-8">
			<Reveal phase={2}>
				<h1 className={cn("mb-6 text-heading-xl!", textPrimary)}>
					I build products for the web.
				</h1>
			</Reveal>
			<Reveal phase={2} delay={0.05}>
				<p className={cn("mb-8 max-w-xl text-body-lg", textSecondary)}>
					Web apps. SaaS platforms. Internal tools. From the first idea to the final
					deploy. Complex systems that feel effortless.
				</p>
			</Reveal>
			<Reveal phase={2} delay={0.1}>
				<div className="flex flex-wrap items-center gap-3">
					{/* Primary CTA - High contrast against gradient background */}
					<Button
						asChild
						size="lg"
						variant="solid"
						color="primary"
						className={cn(
							needsLightText
								? "bg-surface-50 text-surface-950 hover:bg-surface-200"
								: "bg-surface-950 text-surface-50 hover:bg-surface-800",
						)}
					>
						<Link href="/projects">
							Case Studies
							<ArrowRightIcon className="size-4" weight="bold" />
						</Link>
					</Button>
					{/* Secondary CTA - Outlined, adapts to theme */}
					<Button
						asChild
						size="lg"
						variant="outlined"
						color="default"
						className={cn(
							needsLightText
								? "border-surface-600 text-surface-100 hover:bg-surface-800/50"
								: "border-surface-400 text-surface-900 hover:bg-surface-100/50",
						)}
					>
						<Link href="/contact">Email</Link>
					</Button>
				</div>
			</Reveal>
		</div>
	);
}

export function SiteHero() {
	return (
		<SwissGridSection id="hero" className="relative w-full overflow-hidden">
			{/* Mesh Gradient — Canvas-based, pixel-perfect alignment with SwissGrid */}
			<MeshGradient className="pointer-events-none absolute inset-0 z-1">
				<HeroContent />
			</MeshGradient>
		</SwissGridSection>
	);
}
