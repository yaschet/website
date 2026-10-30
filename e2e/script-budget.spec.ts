import { expect, test } from "@playwright/test";

for (const route of ["/", "/case-studies"]) {
	test(`${route} keeps prefetching inside the JavaScript budget`, async ({ page }) => {
		const streams: string[] = [];
		page.on("request", (request) => {
			if (new URL(request.url()).hostname === "stream.mux.com") streams.push(request.url());
		});
		await page.goto(route);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
		// Include idle enhancements and automatic route prefetches, not just initial HTML scripts.
		await expect(page.locator('[data-slot="reading-progress"]')).toHaveCount(1);
		await page.waitForLoadState("networkidle");
		const scripts = await page.evaluate(() => {
			const resources = performance.getEntriesByType(
				"resource",
			) as PerformanceResourceTiming[];
			const scripts = resources.filter((resource) => {
				const url = new URL(resource.name);
				return url.origin === location.origin && url.pathname.endsWith(".js");
			});
			return {
				count: scripts.length,
				encoded: scripts.reduce((sum, script) => sum + script.encodedBodySize, 0),
				decoded: scripts.reduce((sum, script) => sum + script.decodedBodySize, 0),
			};
		});
		expect(scripts.count).toBeGreaterThan(0);
		expect(scripts.encoded, "JavaScript transfers must be measurable").toBeGreaterThan(0);
		expect(scripts.encoded, "Compressed JavaScript, including prefetching").toBeLessThan(
			550 * 1024,
		);
		expect(scripts.decoded, "Decoded JavaScript, including prefetching").toBeLessThan(
			1.7 * 1024 * 1024,
		);
		expect(streams, "Video streams must wait for playback intent").toEqual([]);
		expect(
			await page.evaluate(() => Boolean(customElements.get("mux-video"))),
			"The playback engine must not register during route prefetching",
		).toBe(false);
	});
}
