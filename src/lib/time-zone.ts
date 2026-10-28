import timeZoneData from "./time-zone-data.json";

export const VERCEL_VIEWER_TIME_ZONE_HEADER = "x-vercel-ip-timezone";
export const TIME_ZONE_DATA_VERSION = timeZoneData.version;
export type ViewerTimeZoneSource = "device" | "request" | "override";
export type ResolvedViewerTimeZone = {
	timeZone: string | null;
	source: ViewerTimeZoneSource | null;
};
const zoneIndices: Record<string, number> = timeZoneData.zones;
const clockFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "UTC",
	hourCycle: "h23",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "UTC",
	day: "numeric",
	month: "short",
	year: "numeric",
});

export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
	return !!timeZone && Object.hasOwn(zoneIndices, timeZone);
}

/** Use a regional label for US Pacific time without implying the visitor is in Los Angeles. */
export function formatTimeZoneLabel(timeZone: string) {
	if (timeZone === "America/Los_Angeles" || timeZone === "US/Pacific") return "Pacific time";
	return timeZone.split("/").at(-1)?.replaceAll("_", " ") ?? timeZone;
}

/** Explicit previews win; the device is more useful than IP geolocation (VPNs, travel). */
export function resolveViewerTimeZone({
	overrideTimeZone,
	deviceTimeZone,
	requestTimeZone,
}: {
	overrideTimeZone?: string | null;
	deviceTimeZone?: string | null;
	requestTimeZone?: string | null;
}): ResolvedViewerTimeZone {
	if (isValidTimeZone(overrideTimeZone))
		return { timeZone: overrideTimeZone, source: "override" };
	if (isValidTimeZone(deviceTimeZone)) return { timeZone: deviceTimeZone, source: "device" };
	if (isValidTimeZone(requestTimeZone)) return { timeZone: requestTimeZone, source: "request" };
	return { timeZone: null, source: null };
}

/** East-positive offsets from the bundled IANA transitions, independent of host ICU. */
export function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number | null {
	const minute = date.getTime() / 60000;
	if (
		!isValidTimeZone(timeZone) ||
		!Number.isFinite(minute) ||
		minute < timeZoneData.start ||
		minute >= timeZoneData.end
	)
		return null;
	const record = timeZoneData.records[zoneIndices[timeZone]];
	let low = 0;
	let high = record.length / 2;
	while (low + 1 < high) {
		const middle = Math.floor((low + high) / 2);
		if (record[middle * 2] <= minute) low = middle;
		else high = middle;
	}
	return record[low * 2 + 1];
}

export function formatUtcOffset(offsetMinutes: number) {
	if (offsetMinutes === 0) return "UTC";
	const absolute = Math.abs(offsetMinutes);
	const minutes = absolute % 60;
	return `UTC${offsetMinutes > 0 ? "+" : "−"}${Math.floor(absolute / 60)}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

export function formatDeltaOffset(offsetMinutes: number) {
	if (offsetMinutes === 0) return "Same time as you";
	const absolute = Math.abs(offsetMinutes);
	const hours = Math.floor(absolute / 60);
	const minutes = absolute % 60;
	const duration = [
		hours ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
		minutes ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "",
	]
		.filter(Boolean)
		.join(" ");
	return `Rabat is ${duration} ${offsetMinutes > 0 ? "ahead" : "behind"}`;
}

function zonedClock(timeZone: string, date: Date) {
	const offset = getTimeZoneOffsetMinutes(timeZone, date);
	if (offset === null) return null;
	// Format the shifted instant in UTC: never apply the browser's stale zone rules twice.
	const shifted = new Date(date.getTime() + offset * 60000);
	return {
		time: clockFormatter.format(shifted),
		date: dateFormatter.format(shifted),
		dateKey: shifted.toISOString().slice(0, 10),
		offset,
		zoneOffset: formatUtcOffset(offset),
	};
}

export function createTimeZoneClockSnapshot({
	targetTimeZone,
	viewerTimeZone,
	date = new Date(),
}: {
	targetTimeZone: string;
	viewerTimeZone?: string | null;
	date?: Date;
}) {
	const target = zonedClock(targetTimeZone, date);
	const viewer = viewerTimeZone ? zonedClock(viewerTimeZone, date) : null;
	return {
		time: target?.time ?? null,
		target,
		viewer,
		relativeOffset: target && viewer ? formatDeltaOffset(target.offset - viewer.offset) : null,
	};
}
