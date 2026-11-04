/// <reference types="vite/client" />
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";
import { useGlobals } from "storybook/preview-api";
import { PortfolioTypeStyles } from "../src/components/layout/portfolio-type-styles";
import { WorkshopDocsContainer, WorkshopDocsPage } from "./workshop-docs";
import { WorkshopProviders } from "./workshop-providers";
import "@fontsource-variable/space-grotesk";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "../src/app/globals.css";
import "./workshop.css";

const defaultTheme = import.meta.env.VITE_STORYBOOK_THEME === "light" ? "light" : "dark";

const preview: Preview = {
	initialGlobals: { theme: defaultTheme, readingMode: "normal" },
	globalTypes: {
		readingMode: {
			description: "Reading stress checks; these do not emulate browser zoom.",
			toolbar: {
				title: "Text",
				dynamicTitle: true,
				items: [
					{ value: "normal", title: "Normal text" },
					{ value: "enlarged", title: "200% root text" },
					{ value: "spacing", title: "Adjusted text spacing" },
				],
			},
		},
	},
	parameters: {
		nextjs: { appDirectory: true },
		controls: { matchers: { color: /(background|color)$/i } },
		backgrounds: { disable: true },
		a11y: { test: "error" },
		docs: {
			toc: true,
			container: WorkshopDocsContainer,
			page: WorkshopDocsPage,
			story: { inline: true },
		},
		options: {
			storySort: {
				order: [
					"Overview",
					"Foundation",
					["Brand Overview", "Colors", "Typography", "Spacing", "Motion"],
					"Components",
					["Actions", "Feedback", "Forms", "Overlays", "Navigation", "Media", "Content"],
					"Pages",
					[
						"Home",
						"About",
						"Case Studies",
						"Case Study",
						"Blog",
						"Blog Post",
						"Contact",
						"Route States",
					],
					"Lab",
				],
			},
		},
	},
	decorators: [
		(Story, context) => {
			const [, updateGlobals] = useGlobals();
			return (
				<WorkshopProviders
					key={context.id}
					storyId={context.id}
					theme={context.globals.theme}
					onThemeChange={(theme) => updateGlobals({ theme })}
				>
					<div className="workshop-canvas">
						{context.globals.readingMode === "enlarged" && (
							<style>{":root { font-size: 200% !important; }"}</style>
						)}
						{context.globals.readingMode === "spacing" && (
							<style>{`
								@layer theme {
								:root body * {
									line-height: 1.5 !important;
									letter-spacing: 0.12em !important;
									word-spacing: 0.16em !important;
								}
								:root body p { margin-block-end: 2em !important; }
								}
							`}</style>
						)}
						<PortfolioTypeStyles />
						<Story />
					</div>
				</WorkshopProviders>
			);
		},
		withThemeByClassName({ themes: { light: "light", dark: "dark" }, defaultTheme }),
	],
};
export default preview;
