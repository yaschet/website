"use client";

import { PageContainer } from "@/src/components/layout/containers";
import { LocationBadge, MarqueeBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { ShellReveal } from "@/src/components/ui/reveal";
import type { ViewerTimeZoneSource } from "@/src/lib/time-zone";

/**
 * SiteHeader
 *
 * The standard "System Status" header containing Context Badges.
 * Should be used on every page for consistent Swiss "System" feel.
 */
export function SiteHeader({
	viewerTimeZone = null,
	viewerTimeZoneSource = null,
}: {
	viewerTimeZone?: string | null;
	viewerTimeZoneSource?: ViewerTimeZoneSource | null;
}) {
	const badgeClassName =
		"flex min-w-0 max-w-[calc(50%-(var(--portfolio-space-1)/2))] flex-1 sm:w-[var(--portfolio-badge-width)] sm:max-w-full sm:flex-none sm:shrink-0";

	return (
		<ShellReveal phase={1} className="w-full">
			<section id="header" className="relative z-20 w-full">
				<div
					className="w-full"
					style={{ height: "var(--portfolio-header-height)" }}
					suppressHydrationWarning
				>
					<PageContainer className="flex h-full items-center justify-between gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
						<LocationBadge className={badgeClassName} />

						<MarqueeBadge
							className="hidden flex-1 sm:flex"
							items={[
								"PRODUCT ENGINEERING",
								"DESIGN SYSTEMS",
								"HIGH-PERFORMANCE INTERFACES",
								"AI INTEGRATION",
								"FULL-STACK TYPESCRIPT",
							]}
						/>

						<TimeBadge
							className={badgeClassName}
							viewerTimeZone={viewerTimeZone}
							viewerTimeZoneSource={viewerTimeZoneSource}
						/>
					</PageContainer>
				</div>
			</section>
		</ShellReveal>
	);
}
