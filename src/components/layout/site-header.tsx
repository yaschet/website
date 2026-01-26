"use client";

import { LocationBadge, MarqueeBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

/**
 * SiteHeader
 *
 * The standard "System Status" header containing Context Badges.
 * Should be used on every page for consistent Swiss "System" feel.
 */
export function SiteHeader() {
	return (
		<SwissGridSection id="header" className="relative z-20 w-full">
			<div className="h-29.5 w-full" suppressHydrationWarning>
				<div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-3 px-6 sm:px-8">
					<LocationBadge className="flex w-40 max-w-full shrink-0" />

					<MarqueeBadge
						className="hidden flex-1 sm:flex"
						// Swiss Design: Ticker style, uppercase, consistent separator
						items={[
							"PRODUCT ENGINEERING",
							"DESIGN SYSTEMS",
							"HIGH-PERFORMANCE INTERFACES",
							"AI INTEGRATION",
							"FULL-STACK TYPESCRIPT",
						]}
					/>

					<TimeBadge className="flex w-40 max-w-full shrink-0" />
				</div>
			</div>
		</SwissGridSection>
	);
}
