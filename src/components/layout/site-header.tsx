import { PageContainer } from "@/src/components/layout/containers";
import { LocationBadge, MarqueeBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { ContextPanelGroup } from "@/src/components/ui/context-panel";
import type { ViewerTimeZoneSource } from "@/src/lib/time-zone";

const highlights = ["Internal tools", "Billing systems", "Document workflows", "AI integration"];

/** Persistent site context: one 40px rail with equal 20px gaps and page clearance. */
export function SiteHeader({
	viewerTimeZone = null,
	viewerTimeZoneSource = null,
}: {
	viewerTimeZone?: string | null;
	viewerTimeZoneSource?: ViewerTimeZoneSource | null;
}) {
	return (
		<header id="header" className="portfolio-site-header relative z-20 w-full">
			<ContextPanelGroup>
				<PageContainer className="portfolio-context-rail">
					<LocationBadge />
					<MarqueeBadge items={highlights} />
					<TimeBadge
						viewerTimeZone={viewerTimeZone}
						viewerTimeZoneSource={viewerTimeZoneSource}
					/>
				</PageContainer>
			</ContextPanelGroup>
		</header>
	);
}
