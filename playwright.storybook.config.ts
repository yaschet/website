import { defineConfig } from "@playwright/test";

const baseURL = process.env.STORYBOOK_BASE_URL ?? "http://localhost:6007";
const port = new URL(baseURL).port || "6007";

export default defineConfig({
	testDir: "./tests/storybook",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : 2,
	outputDir: "test-results/storybook-layout",
	reporter: "list",
	use: { baseURL, browserName: "chromium", trace: "retain-on-failure" },
	webServer: {
		command: `pnpm exec vite preview --outDir storybook-static --port ${port} --strictPort`,
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
