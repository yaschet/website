import {
	Controls,
	Description,
	DocsContainer,
	type DocsContainerProps,
	DocsContext,
	Primary,
	Stories,
	Title,
} from "@storybook/addon-docs/blocks";
import type { PropsWithChildren } from "react";
import { useContext, useEffect, useSyncExternalStore } from "react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { create } from "storybook/theming/create";

const fonts = {
	fontBase: '"Space Grotesk Variable", sans-serif',
	fontCode: '"Space Mono", monospace',
	appBorderRadius: 0,
	inputBorderRadius: 0,
};
const themes = {
	light: create({ base: "light", ...fonts, appContentBg: "#fafafa", textColor: "#171717" }),
	dark: create({ base: "dark", ...fonts, appContentBg: "#030303", textColor: "#fafafa" }),
};

/** Keep the documentation chrome and rendered examples on the same toolbar theme. */
export function WorkshopDocsContainer({
	children,
	context,
}: PropsWithChildren<DocsContainerProps>) {
	const theme = useSyncExternalStore(
		(notify) => {
			context.channel.on(GLOBALS_UPDATED, notify);
			return () => context.channel.off(GLOBALS_UPDATED, notify);
		},
		() => {
			const primary = context.componentStories()[0];
			if (primary) return context.getStoryContext(primary).globals.theme;
			// Standalone MDX has no primary story; use the channel's latest global state.
			const latest: [{ globals: { theme?: string } }] | undefined =
				context.channel.last(GLOBALS_UPDATED);
			return latest?.[0]?.globals.theme ?? context.projectAnnotations.initialGlobals?.theme;
		},
	);
	useEffect(() => {
		if (context.componentStories().length > 0) return;
		const root = document.documentElement;
		root.classList.add("yaschet");
		root.classList.toggle("light", theme === "light");
		root.classList.toggle("dark", theme !== "light");
		root.dataset.theme = theme === "light" ? "light" : "dark";
	}, [context, theme]);
	return (
		<DocsContainer context={context} theme={theme === "light" ? themes.light : themes.dark}>
			{children}
		</DocsContainer>
	);
}

function ComponentApi() {
	const context = useContext(DocsContext);
	if (Object.keys(context.storyById().argTypes).length === 0) return null;
	return (
		<details className="workshop-api">
			<summary>Component API and controls</summary>
			<Controls />
		</details>
	);
}

/** Content grows naturally. The first example appears once; the API stays available. */
export function WorkshopDocsPage() {
	return (
		<>
			<Title />
			<Description />
			<Primary />
			<Stories includePrimary={false} />
			<ComponentApi />
		</>
	);
}

/** Global mocks, portals, and fixed navigation need one active example per document. */
export function SinglePreviewDocsPage() {
	const context = useContext(DocsContext);
	return (
		<>
			<Title />
			<Description />
			<Primary />
			<h2>Review each state</h2>
			<p>Open a state in Canvas to run its interaction in isolation.</p>
			<ul>
				{context.componentStories().map((story) => (
					<li key={story.id}>
						<a href={`./?path=/story/${story.id}`} target="_top">
							{story.name}
						</a>
					</li>
				))}
			</ul>
			<ComponentApi />
		</>
	);
}
