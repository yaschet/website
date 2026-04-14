"use client";

import { PageContainer } from "@/src/components/layout/containers";
import { LocationBadge, MarqueeBadge, TimeBadge } from "@/src/components/ui/context-badges";

/**
 * SiteHeader
 *
 * The standard "System Status" header containing Context Badges.
 * Should be used on every page for consistent Swiss "System" feel.
 */
export function SiteHeader() {
	return (
		<section id="header" className="relative z-20 w-full">
			<div
				className="w-full"
				style={{ height: "var(--portfolio-header-height)" }}
				suppressHydrationWarning
			>
				<PageContainer className="flex h-full items-center justify-between gap-5">
					<LocationBadge className="flex w-40 max-w-full shrink-0" />

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

					<TimeBadge className="flex w-40 max-w-full shrink-0" />
				</PageContainer>
			</div>
		</section>
	);
}
