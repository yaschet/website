import { writeFileSync } from "node:fs";
import moment from "moment-timezone";

// Ship offsets, not Moment or the host's potentially stale ICU data. IANA data
// is public domain. Update the pinned development dependency before regenerating.
const start = Date.UTC(2024, 0, 1) / 60_000;
const end = Date.UTC(2036, 0, 1) / 60_000;
const records = [];
const signatures = new Map();
const zones = {};
for (const name of moment.tz.names()) {
	const zone = moment.tz.zone(name);
	if (!zone) throw new Error(`Missing timezone ${name}`);
	const record = [start, -zone.utcOffset(start * 60_000)];
	for (const until of zone.untils) {
		const minute = until / 60_000;
		if (minute <= start || minute >= end) continue;
		const offset = -zone.utcOffset(until);
		if (offset !== record.at(-1)) record.push(minute, offset);
	}
	const signature = JSON.stringify(record);
	let index = signatures.get(signature);
	if (index === undefined) {
		index = records.length;
		signatures.set(signature, index);
		records.push(record);
	}
	zones[name] = index;
}
const output = { version: moment.tz.dataVersion, start, end, zones, records };
writeFileSync(
	new URL("../src/lib/time-zone-data.json", import.meta.url),
	`${JSON.stringify(output)}\n`,
);
