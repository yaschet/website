import { expect, test } from "@playwright/test";

test.describe("Sitemap route and lab performance checks", () => {
	const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

	test("public routes render within lab performance budgets", async ({
		page,
		request,
		browserName,
	}) => {
		test.setTimeout(180_000);
		test.skip(process.env.VERCEL_ENV === "preview", "Preview deployments omit the sitemap.");
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

		expect(urls.length, "Sitemap must contain public routes").toBeGreaterThan(0);

		// biome-ignore lint/suspicious/noConsole: Test output
		console.log(`📊 Found ${urls.length} routes in sitemap.`);

		// 3. Iterate & Test Each Route
		for (const url of urls) {
			// Convert absolute production URL back to local relative path
			// e.g. https://www.yaschet.com/about -> /about
			const relativePath = new URL(url).pathname;

			if (/\.[a-z0-9]+$/i.test(relativePath) && !relativePath.endsWith(".html")) {
				// biome-ignore lint/suspicious/noConsole: Test output
				console.log(`\n⏭️  Skipping non-HTML asset: ${relativePath}`);
				continue;
			}

			// biome-ignore lint/suspicious/noConsole: Test output
			console.log(`\n🔎 Testing Route: ${relativePath}`);

			try {
				const response = await page.goto(relativePath);
				expect(
					response?.ok(),
					`${relativePath} must return a successful response`,
				).toBeTruthy();
				await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

				// Measure LCP
				const lcp = await page.evaluate(async () => {
					if (
						!PerformanceObserver.supportedEntryTypes.includes(
							"largest-contentful-paint",
						)
					)
						return null;
					return new Promise<number | null>((resolve) => {
						let latest: number | null = null;
						const observer = new PerformanceObserver((list) => {
							const entries = list.getEntries();
							const lastEntry = entries.at(-1);
							if (lastEntry) latest = lastEntry.startTime;
						});
						observer.observe({ type: "largest-contentful-paint", buffered: true });
						setTimeout(() => {
							observer.disconnect();
							resolve(latest);
						}, 4000);
					});
				});

				// Measure CLS
				const cls = await page.evaluate(async () => {
					if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift"))
						return null;
					return new Promise<number>((resolve) => {
						let value = 0;
						const observer = new PerformanceObserver((list) => {
							for (const entry of list.getEntries()) {
								if (
									"hadRecentInput" in entry &&
									entry.hadRecentInput === false &&
									"value" in entry &&
									typeof entry.value === "number"
								)
									value += entry.value;
							}
						});
						observer.observe({ type: "layout-shift", buffered: true });
						setTimeout(() => {
							observer.disconnect();
							resolve(value);
						}, 1000);
					});
				});

				// biome-ignore lint/suspicious/noConsole: Test output
				console.log(
					`   LCP: ${lcp ?? "unavailable"}ms | Lab layout shift: ${cls ?? "unavailable"}`,
				);

				// Hard Gates
				if (browserName === "chromium" || lcp !== null) {
					expect(lcp, `Missing LCP measurement on ${relativePath}`).not.toBeNull();
					expect(lcp, `LCP must be measured on ${relativePath}`).toBeGreaterThan(0);
					expect(lcp, `LCP too high on ${relativePath}`).toBeLessThan(2500);
				} else {
					test.info().annotations.push({
						type: "unsupported-metric",
						description: `${relativePath}: browser does not expose LCP; route rendering is checked.`,
					});
				}
				if (browserName === "chromium" || cls !== null) {
					expect(
						cls,
						`Missing layout-shift measurement on ${relativePath}`,
					).not.toBeNull();
					expect(cls, `Layout shift too high on ${relativePath}`).toBeLessThan(0.1);
				}
			} catch (error) {
				// biome-ignore lint/suspicious/noConsole: Error reporting
				console.error(`❌ FAILED on ${relativePath}`);
				throw error;
			}
		}
	});
});
