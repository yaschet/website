import { existsSync } from "node:fs";
import { defineConfig, devices, webkit } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const port = new URL(baseURL).port || "3000";
const includeWebKit = process.env.CI || existsSync(webkit.executablePath());

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 5"] },
		},
		...(includeWebKit
			? [
					{
						name: "mobile-safari",
						use: { ...devices["iPhone 12"] },
					},
				]
			: []),
	],
	/* Run your local dev server before starting the tests */
	webServer: {
		command: `pnpm exec next start -p ${port}`,
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
