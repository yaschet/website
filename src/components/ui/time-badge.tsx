"use client";

import { RiTimeLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { ContextPanel } from "@/src/components/ui/context-panel";
import { RollingTime } from "@/src/components/ui/rolling-time";
import { cn } from "@/src/lib/index";
import {
	createTimeZoneClockSnapshot,
	formatTimeZoneLabel,
	type ResolvedViewerTimeZone,
	resolveViewerTimeZone,
	type ViewerTimeZoneSource,
} from "@/src/lib/time-zone";

const timeZone = "Africa/Casablanca";
type Snapshot = ReturnType<typeof createTimeZoneClockSnapshot>;

/** Hidden tabs stop ticking; hydration and resuming reveal the current value without rolling. */
export function TimeBadge({
	className,
	viewerTimeZone,
	viewerTimeZoneSource,
}: {
	className?: string;
	viewerTimeZone?: string | null;
	viewerTimeZoneSource?: ViewerTimeZoneSource | null;
}) {
	const [{ snapshot, instant, viewer }, setClock] = useState<{
		snapshot: Snapshot | null;
		instant: boolean;
		viewer: ResolvedViewerTimeZone;
	}>({ snapshot: null, instant: true, viewer: { timeZone: null, source: null } });
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		const update = (instant = false) => {
			let deviceTimeZone: string | undefined;
			try {
				deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			} catch {
				/* Request fallback remains explicitly estimated. */
			}
			const viewer = resolveViewerTimeZone({
				overrideTimeZone: viewerTimeZoneSource === "override" ? viewerTimeZone : null,
				deviceTimeZone,
				requestTimeZone: viewerTimeZone,
			});
			setClock({
				snapshot: createTimeZoneClockSnapshot({
					targetTimeZone: timeZone,
					viewerTimeZone: viewer.timeZone,
				}),
				instant,
				viewer,
			});
		};
		const syncVisibility = () => {
			clearInterval(interval);
			if (document.hidden) return;
			update(true);
			interval = setInterval(() => update(), 1000);
		};
		syncVisibility();
		document.addEventListener("visibilitychange", syncVisibility);
		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", syncVisibility);
		};
	}, [viewerTimeZone, viewerTimeZoneSource]);

	const time = snapshot?.time ?? null;
	const differentDate =
		snapshot?.target && snapshot.viewer && snapshot.target.dateKey !== snapshot.viewer.dateKey;
	const yourZone = viewer.timeZone ? formatTimeZoneLabel(viewer.timeZone) : null;
	return (
		<ContextPanel
			className={cn(
				"portfolio-context-badge portfolio-context-trigger portfolio-time",
				className,
			)}
			label={`${time ? `Current time ${time}` : "Time"} in Rabat, Morocco. Compare your time.`}
			title="Time difference"
			align="end"
			action="Discuss a project"
			rows={[
				{
					label: "My time",
					value: snapshot?.target
						? `${snapshot.target.time.slice(0, 5)} · ${snapshot.target.zoneOffset}`
						: "Time unavailable",
					detail: differentDate ? `Rabat · ${snapshot?.target?.date}` : "Rabat, Morocco",
				},
				{
					label: viewer.source === "request" ? "Estimated" : "Your time",
					value: snapshot?.viewer
						? `${snapshot.viewer.time.slice(0, 5)} · ${snapshot.viewer.zoneOffset}`
						: "Timezone unavailable",
					detail: snapshot?.viewer
						? `${yourZone}${differentDate ? ` · ${snapshot.viewer.date}` : ""}`
						: "Check your device timezone",
				},
				{ label: "Difference", value: snapshot?.relativeOffset ?? "Unavailable" },
			]}
		>
			<span className="portfolio-context-chamber" aria-hidden="true">
				<RiTimeLine className="size-4" />
			</span>
			<span
				className="portfolio-context-label"
				role="timer"
				aria-live="off"
				aria-label={
					time ? `Current time ${time} in Rabat, Morocco` : "Time in Rabat, Morocco"
				}
			>
				<RollingTime value={time} instant={instant} />
			</span>
		</ContextPanel>
	);
}
