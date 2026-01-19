import { expect, test } from "@playwright/test";

test.describe("Elite Performance Guardrails (Dynamic Sitemap Coverage)", () => {
	const BASE_URL = "http://localhost:3000";

	test("Global Route Performance (100% Coverage)", async ({ page, request }) => {
		// 1. Fetch Sitemap
		// biome-ignore lint/suspicious/noConsole: Test output
		console.log(`🗺️  Fetching sitemap from ${BASE_URL}/sitemap.xml ...`);
		const sitemapResponse = await request.get(`${BASE_URL}/sitemap.xml`);
		expect(sitemapResponse.ok()).toBeTruthy();

		const sitemapXml = await sitemapResponse.text();

		// 2. Parse URLs (Simple Regex for robustness)
		const urls =
			sitemapXml.match(/<loc>(.*?)<\/loc>/g)?.map((loc) => {
				return loc.replace("<loc>", "").replace("</loc>", "");
			}) || [];

		if (urls.length === 0) {
			// biome-ignore lint/suspicious/noConsole: Test warning
			console.warn("⚠️ No URLs found in sitemap.xml");
			return;
		}

		// biome-ignore lint/suspicious/noConsole: Test output
		console.log(`📊 Found ${urls.length} routes in sitemap.`);

		// 3. Iterate & Test Each Route
		for (const url of urls) {
			// Convert absolute production URL back to local relative path
			// e.g. https://www.yaschet.dev/about -> /about
			const relativePath = new URL(url).pathname;

			// biome-ignore lint/suspicious/noConsole: Test output
			console.log(`\n🔎 Testing Route: ${relativePath}`);

			try {
				await page.goto(relativePath);

				// Measure LCP
				const lcp = await page.evaluate(async () => {
					return new Promise<number>((resolve) => {
						new PerformanceObserver((list) => {
							const entries = list.getEntries();
							const lastEntry = entries[entries.length - 1];
							resolve(lastEntry.startTime);
						}).observe({ type: "largest-contentful-paint", buffered: true });
						setTimeout(() => resolve(0), 4000); // 4s timeout
					});
				});

				// Measure CLS
				const cls = await page.evaluate(async () => {
					return new Promise<number>((resolve) => {
						let value = 0;
						new PerformanceObserver((list) => {
							// biome-ignore lint/suspicious/noExplicitAny: LayoutShift type missing
							for (const entry of list.getEntries() as any[]) {
								if (!entry.hadRecentInput) value += entry.value;
							}
						}).observe({ type: "layout-shift", buffered: true });
						setTimeout(() => resolve(value), 1000);
					});
				});

				// biome-ignore lint/suspicious/noConsole: Test output
				console.log(`   ⏱️  LCP: ${lcp.toFixed(2)}ms | 📐 CLS: ${cls.toFixed(4)}`);

				// Hard Gates
				expect(lcp, `LCP too high on ${relativePath}`).toBeLessThan(2500);
				expect(cls, `CLS too high on ${relativePath}`).toBeLessThan(0.1);
			} catch (error) {
				// biome-ignore lint/suspicious/noConsole: Error reporting
				console.error(`❌ FAILED on ${relativePath}`);
				throw error;
			}
		}
	});
});
