import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
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
		const articleMdx = mdx({
			include: [
				fileURLToPath(new URL("../content/projects/**/*.mdx", import.meta.url)),
				fileURLToPath(new URL("./fixtures/*.mdx", import.meta.url)),
			],
			remarkPlugins: [remarkGfm],
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, { properties: { className: ["anchor"] } }],
			],
		});
		return mergeConfig(config, {
			plugins: [
				{
					...articleMdx,
					transform(source: string, id: string) {
						// Separate article content from Docs MDX and Vite's raw-source imports.
						if (!/\.mdx\?content(?:&|$)/.test(id)) return;
						return articleMdx.transform(source, id);
					},
				},
			],
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
