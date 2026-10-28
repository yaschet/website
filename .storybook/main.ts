import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from "vite";

/**
 * Storybook Configuration
 *
 * @remarks
 * Uses the official Next.js Vite framework and its supported browser mocks.
 * This framework handles `next/link`, `next/image`, and `next/router` polyfills automatically.
 */
const config: StorybookConfig = {
	staticDirs: ["../public"],
	stories: ["./overview.mdx", "../src/**/*.stories.@(ts|tsx)"],
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
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
	async viteFinal(config) {
		return mergeConfig(config, {
			// Prebundle Docs and the production date formatter before browser tests start.
			optimizeDeps: {
				include: ["@storybook/addon-docs/blocks", "storybook/theming/create", "date-fns"],
			},
			// Storybook and its test addon serve staticDirs; Vite bundles imported images.
			publicDir: false,
			...(process.env.VITEST
				? {
						cacheDir: fileURLToPath(
							new URL("../node_modules/.cache/portfolio-vitest", import.meta.url),
						),
					}
				: {}),
			resolve: {
				alias: {
					"@/src/app/actions/contact": fileURLToPath(
						new URL("./mocks/contact-action.ts", import.meta.url),
					),
				},
			},
		});
	},
};

export default config;
