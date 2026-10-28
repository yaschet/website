import { defineConfig } from "@playwright/test";

/** Reuse the installed test runner; policy tests require no browser or server. */
export default defineConfig({
	testDir: "./tests",
	testIgnore: "**/storybook/**",
	fullyParallel: true,
	workers: process.env.CI ? 1 : 2,
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: "list",
});
