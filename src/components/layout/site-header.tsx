"use client";

import { LocationBadge, TimeBadge } from "@/src/components/ui/context-badges";
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
			<div className="h-[118px] w-full" suppressHydrationWarning>
				<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 sm:px-8">
					<div className="hidden sm:block">
						<LocationBadge />
					</div>

					{/* Spacer for potential center content (Logo?) */}
					<div className="flex-1" />

					<div className="hidden sm:block">
						<TimeBadge />
					</div>
				</div>
			</div>
		</SwissGridSection>
	);
}
