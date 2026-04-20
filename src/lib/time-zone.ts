export const VERCEL_VIEWER_TIME_ZONE_HEADER = "x-vercel-ip-timezone";

export type ViewerTimeZoneSource = "request" | "override";

export type ResolvedViewerTimeZone = {
	timeZone: string | null;
	source: ViewerTimeZoneSource | null;
};

export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
	if (!timeZone) {
		return false;
	}

	try {
		new Intl.DateTimeFormat("en-GB", { timeZone }).format(new Date());
		return true;
	} catch {
		return false;
	}
}

export function resolveViewerTimeZone({
	overrideTimeZone,
	requestTimeZone,
}: {
	overrideTimeZone?: string | null;
	requestTimeZone?: string | null;
}): ResolvedViewerTimeZone {
	if (isValidTimeZone(overrideTimeZone)) {
		return {
			timeZone: overrideTimeZone,
			source: "override",
		};
	}

	if (isValidTimeZone(requestTimeZone)) {
		return {
			timeZone: requestTimeZone,
			source: "request",
		};
	}

	return {
		timeZone: null,
		source: null,
	};
}

export function getTimeZoneOffsetMinutes(timeZone: string, date: Date) {
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	const parts = Object.fromEntries(
		formatter
			.formatToParts(date)
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value]),
	);

	const asUtcTimestamp = Date.UTC(
		Number(parts.year),
		Number(parts.month) - 1,
		Number(parts.day),
		Number(parts.hour),
		Number(parts.minute),
		Number(parts.second),
	);

	return Math.round((asUtcTimestamp - date.getTime()) / 60000);
}
