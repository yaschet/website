import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/** Runs the actual stories in Chromium; contact transport stays workshop-only. */
export default defineConfig({
	// The full article story imports MDX renderers; prebundle them before the test iframe mounts.
	optimizeDeps: {
		include: ["@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus", "mermaid", "sugar-high"],
	},
	plugins: [
		storybookTest({ configDir: fileURLToPath(new URL("./.storybook", import.meta.url)) }),
	],
	test: {
		name: "storybook",
		maxWorkers: process.env.CI ? 1 : 2,
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
		},
	},
});
