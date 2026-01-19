import { execSync } from "node:child_process";

/**
 * Audit Performance Script
 *
 * This script identifies all public routes and dynamic slugs,
 * then performs synthetic latency checks to establish a baseline.
 */

async function main() {
	// biome-ignore lint/suspicious/noConsoleLog: CLI tool requires output
	console.log("🚀 Starting Route Performance Audit (TTFB/Status)...");
	const baseUrl = "http://localhost:3000";

	// 1. Routes to Check
	const routes = ["/", "/about", "/projects", "/blog", "/contact"];

	// 2. Headless Check (Node.js Fetch)
	// CAPABILITY: This measures Time to First Byte (TTFB) and network reachability.
	// LIMITATION: Cannot measure LCP/CLS without a browser (Playwright/Puppeteer).

	console.log(`📊 Auditing ${routes.length} navigation targets on ${baseUrl}...`);
	console.warn("⚠️  Make sure 'pnpm start' is running on port 3000!");

	for (const route of routes) {
		const url = `${baseUrl}${route}`;
		const start = performance.now();
		try {
			console.log(`\n⏱  Checking: ${url}`);

			const response = await fetch(url);
			const duration = performance.now() - start;
			const ttfb = duration.toFixed(2);

			if (!response.ok) {
				console.error(`❌ STATUS: ${response.status} ${response.statusText}`);
				continue;
			}

			// Threshold: 200ms TTFB is "Excellent" for local, 600ms is "Warning"
			const status = duration > 600 ? "⚠️ SLOW TTFB" : "✅ FAST";
			const color = duration > 600 ? "\x1b[33m" : "\x1b[32m"; // Yellow vs Green
			const reset = "\x1b[0m";

			console.log(`${color}${status} | ${route} | TTFB: ${ttfb}ms ${reset}`);
			console.log(`   └─ Size: ${(await response.arrayBuffer()).byteLength / 1024} KB`);
		} catch (error) {
			console.error(`❌ FAILED To Connect: Is server running?`);
			console.error(error);
		}
	}

	console.log("\n✨ Audit Complete.");
	console.log("👉 For full LCP/CLS metrics, use the <WebVitals /> HUD in the browser.");
}

main().catch(console.error);
