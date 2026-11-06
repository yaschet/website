import { PageContainer } from "@/src/components/layout/containers";
import { LocationBadge, MarqueeBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { ContextPanelGroup } from "@/src/components/ui/context-panel";
import type { ViewerTimeZoneSource } from "@/src/lib/time-zone";
import styles from "./floating-nav.module.css";

const highlights = ["Internal tools", "Billing systems", "Document workflows", "AI integration"];

/** Persistent context with compact frames and shared internal and outer spacing. */
export function SiteHeader({
	viewerTimeZone = null,
	viewerTimeZoneSource = null,
}: {
	viewerTimeZone?: string | null;
	viewerTimeZoneSource?: ViewerTimeZoneSource | null;
}) {
	return (
		<header id="header" className="portfolio-site-header relative z-20 w-full">
			<a className={styles.skipLink} href="#portfolio-content">
				Skip to content
			</a>
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
