import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-themes",
		"@storybook/addon-designs",
		"storybook-addon-pseudo-states",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	core: {
		disableTelemetry: true,
	},
	viteFinal: async (viteConfig) =>
		mergeConfig(viteConfig, {
			plugins: [tsconfigPaths()],
			// Polyfill process.env for Next.js components (next/link, next/image)
			define: {
				"process.env": JSON.stringify({}),
				"process.env.NODE_ENV": JSON.stringify("development"),
			},
			// Force Vite to re-bundle Next.js with the polyfill applied
			optimizeDeps: {
				esbuildOptions: {
					define: {
						"process.env": JSON.stringify({}),
						"process.env.NODE_ENV": JSON.stringify("development"),
					},
				},
			},
		}),
};

export default config;
