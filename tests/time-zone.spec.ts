import { expect, test } from "@playwright/test";
import {
	createTimeZoneClockSnapshot,
	formatUtcOffset,
	getTimeZoneOffsetMinutes,
	resolveViewerTimeZone,
} from "../src/lib/time-zone";

const offset = (zone: string, instant: string) => getTimeZoneOffsetMinutes(zone, new Date(instant));

test("Morocco follows IANA transitions rather than stale host ICU", () => {
	expect(offset("Africa/Casablanca", "2026-09-20T00:59:59Z")).toBe(60);
	expect(offset("Africa/Casablanca", "2026-09-20T01:00:00Z")).toBe(0);
	expect(offset("Africa/Casablanca", "2026-10-21T12:00:00Z")).toBe(0);
	expect(offset("Africa/Casablanca", "2025-02-23T01:59:59Z")).toBe(60);
	expect(offset("Africa/Casablanca", "2025-02-23T02:00:00Z")).toBe(0);
	expect(offset("Africa/Casablanca", "2025-04-06T02:00:00Z")).toBe(60);
});

test("US and European DST transitions use the same instant", () => {
	expect(offset("America/New_York", "2026-03-08T06:59:59Z")).toBe(-300);
	expect(offset("America/New_York", "2026-03-08T07:00:00Z")).toBe(-240);
	expect(offset("Europe/London", "2026-03-29T00:59:59Z")).toBe(0);
	expect(offset("Europe/London", "2026-03-29T01:00:00Z")).toBe(60);
	expect(offset("Europe/Paris", "2026-10-25T01:00:00Z")).toBe(60);
});

test("midnight uses 00, preserves day rollover and fractional differences", () => {
	const snapshot = createTimeZoneClockSnapshot({
		targetTimeZone: "Africa/Casablanca",
		viewerTimeZone: "America/New_York",
		date: new Date("2026-10-21T00:00:00.999Z"),
	});
	expect(snapshot.time).toBe("00:00:00");
	expect(snapshot.target?.dateKey).toBe("2026-10-21");
	expect(snapshot.viewer?.dateKey).toBe("2026-10-20");
	expect(snapshot.relativeOffset).toBe("Rabat is 4 hours ahead");
	const fractional = createTimeZoneClockSnapshot({
		targetTimeZone: "Africa/Casablanca",
		viewerTimeZone: "Asia/Kathmandu",
		date: new Date("2026-10-21T12:00:00Z"),
	});
	expect(fractional.relativeOffset).toBe("Rabat is 5 hours 45 minutes behind");
	expect(formatUtcOffset(345)).toBe("UTC+5:45");
	expect(formatUtcOffset(-210)).toBe("UTC−3:30");
});

test("unknown zones and expired data never invent a comparison", () => {
	for (const viewerTimeZone of [undefined, "Invalid/Zone"]) {
		expect(
			createTimeZoneClockSnapshot({
				targetTimeZone: "Africa/Casablanca",
				viewerTimeZone,
				date: new Date("2026-10-21T12:00:00Z"),
			}).relativeOffset,
		).toBeNull();
	}
	expect(offset("UTC", "2036-01-01T00:00:00Z")).toBeNull();
	expect(getTimeZoneOffsetMinutes("UTC", new Date("invalid"))).toBeNull();
	expect(
		resolveViewerTimeZone({
			deviceTimeZone: "Europe/London",
			requestTimeZone: "America/New_York",
		}).source,
	).toBe("device");
	expect(
		resolveViewerTimeZone({ overrideTimeZone: "Asia/Tokyo", deviceTimeZone: "Europe/London" })
			.timeZone,
	).toBe("Asia/Tokyo");
	expect(
		resolveViewerTimeZone({ deviceTimeZone: "Invalid/Zone", requestTimeZone: "Europe/Paris" })
			.source,
	).toBe("request");
});
