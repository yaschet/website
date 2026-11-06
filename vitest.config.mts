import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/** Runs the actual stories in Chromium; contact transport stays workshop-only. */
export default defineConfig({
	// Prebundle the article renderers and hero motion before the test iframe mounts.
	optimizeDeps: {
		include: [
			"@radix-ui/react-popover",
			"@phosphor-icons/react/dist/ssr/ArrowDown",
			"@phosphor-icons/react/dist/ssr/ArrowRight",
			"@phosphor-icons/react/dist/ssr/ArrowUpRight",
			"@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus",
			"mermaid",
			"sugar-high",
			"motion/react",
		],
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
