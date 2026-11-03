import { expect, test } from "@playwright/test";
import { computeGridAxis } from "../src/components/ui/dot-grid-metrics";

test("registered dots retain their origin through continuous resizing", () => {
	for (const size of [320, 321, 390, 391, 768, 834, 1024, 1440, 1920]) {
		const { count, offset } = computeGridAxis(size, 10, 10, "registered");
		expect(offset).toBe(10);
		expect(offset + (count - 1) * 10).toBeLessThanOrEqual(size - 10);
		expect(size - 10 - (offset + (count - 1) * 10)).toBeLessThan(10);
		// Both content insets share the same phase, independent of viewport remainder.
		expect((20 - offset) % 10).toBe(0);
		expect((40 - offset) % 10).toBe(0);
	}
});
