import { expect, test } from "@playwright/test";

test.describe("Elite Performance Guardrails", () => {
	test("Homepage Performance (LCP < 2.5s)", async ({ page }) => {
		// 1. Navigate to home
		await page.goto("/");

		// 2. Measure LCP via PerformanceObserver
		const lcp = await page.evaluate(async () => {
			return new Promise<number>((resolve) => {
				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1];
					resolve(lastEntry.startTime);
				}).observe({ type: "largest-contentful-paint", buffered: true });

				// Fallback if no LCP event fires in 5s
				setTimeout(() => resolve(0), 5000);
			});
		});

		// biome-ignore lint/suspicious/noConsoleLog: Test output
		console.log(`⏱️  Homepage LCP: ${lcp.toFixed(2)}ms`);

		// 3. Assert Thresholds (Stripe Standard: < 2.5s is P75 Good)
		// We use 2500ms as a hard fail.
		expect(lcp).toBeLessThan(2500);
	});

	test("Projects Page Performance (LCP < 2.5s)", async ({ page }) => {
		await page.goto("/projects");

		const lcp = await page.evaluate(async () => {
			return new Promise<number>((resolve) => {
				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1];
					resolve(lastEntry.startTime);
				}).observe({ type: "largest-contentful-paint", buffered: true });

				setTimeout(() => resolve(0), 5000);
			});
		});

		// biome-ignore lint/suspicious/noConsoleLog: Test output
		console.log(`⏱️  Projects LCP: ${lcp.toFixed(2)}ms`);
		expect(lcp).toBeLessThan(2500);
	});

	test("CLS (Cumulative Layout Shift) < 0.1", async ({ page }) => {
		await page.goto("/");

		const cls = await page.evaluate(async () => {
			return new Promise<number>((resolve) => {
				let value = 0;
				new PerformanceObserver((list) => {
					// biome-ignore lint/suspicious/noExplicitAny: LayoutShift type missing in standard lib
					for (const entry of list.getEntries() as any[]) {
						if (!entry.hadRecentInput) {
							value += entry.value;
						}
					}
				}).observe({ type: "layout-shift", buffered: true });

				// Wait for page to settle
				setTimeout(() => resolve(value), 1000);
			});
		});

		// biome-ignore lint/suspicious/noConsoleLog: Test output
		console.log(`📐 Homepage CLS: ${cls.toFixed(4)}`);
		expect(cls).toBeLessThan(0.1);
	});
});
