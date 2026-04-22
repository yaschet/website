import { headers } from "next/headers";
import { Suspense } from "react";
import { SiteHeader } from "@/src/components/layout/site-header";
import {
	createTimeZoneClockSnapshot,
	resolveViewerTimeZone,
	VERCEL_VIEWER_TIME_ZONE_HEADER,
} from "@/src/lib/time-zone";

const TARGET_TIME_ZONE = "Africa/Casablanca";

async function ResolvedSiteHeader() {
	const requestHeaders = await headers();
	const requestViewerTimeZone = requestHeaders.get(VERCEL_VIEWER_TIME_ZONE_HEADER);
	const developmentViewerTimeZoneOverride =
		process.env.NODE_ENV === "development" ? process.env.VIEWER_TIME_ZONE_OVERRIDE : null;
	const viewerContext = resolveViewerTimeZone({
		overrideTimeZone: developmentViewerTimeZoneOverride,
		requestTimeZone: requestViewerTimeZone,
	});
	const timeSnapshot = createTimeZoneClockSnapshot({
		targetTimeZone: TARGET_TIME_ZONE,
		viewerTimeZone: viewerContext.timeZone,
	});

	return (
		<SiteHeader
			initialRelativeOffset={timeSnapshot.relativeOffset}
			initialTime={timeSnapshot.time}
			initialZoneOffset={timeSnapshot.zoneOffset}
			viewerTimeZone={viewerContext.timeZone}
			viewerTimeZoneSource={viewerContext.source}
		/>
	);
}

export function RequestAwareSiteHeader() {
	return (
		<Suspense fallback={<SiteHeader />}>
			<ResolvedSiteHeader />
		</Suspense>
	);
}
