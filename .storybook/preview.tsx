import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { RevealProvider } from "../src/components/providers/reveal-provider";
import "../src/app/globals.css";

const queryClient = new QueryClient();

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "dark",
			values: [
				{
					name: "light",
					value: "#F9FAFB", // gray-50
				},
				{
					name: "dark",
					value: "#030712", // gray-950 (Tailwind v4 default black is deep)
				},
				{
					name: "swiss-void",
					value: "#000000",
				},
				{
					name: "blueprint",
					value: "#0A0A0A",
				},
			],
		},
		docs: {
			toc: true, // Table of contents for the docs
		},
	},

	decorators: [
		(Story) => (
			<QueryClientProvider client={queryClient}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<RevealProvider>
						<div className="min-h-full p-8 text-surface-900 antialiased transition-colors duration-300 dark:text-surface-50">
							<Story />
						</div>
					</RevealProvider>
				</ThemeProvider>
			</QueryClientProvider>
		),
		withThemeByClassName({
			themes: {
				light: "light",
				dark: "dark",
			},
			defaultTheme: "dark",
		}),
	],
};

export default preview;
