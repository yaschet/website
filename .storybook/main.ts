import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook Configuration
 *
 * @remarks
 * Uses `@storybook/nextjs-vite` for native Next.js 16 compatibility.
 * This framework handles `next/link`, `next/image`, and `next/router` polyfills automatically.
 */
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
		name: "@storybook/nextjs-vite",
		options: {},
	},
	core: {
		disableTelemetry: true,
	},
};

export default config;
