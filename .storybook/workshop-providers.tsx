import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { RevealProvider } from "../src/components/providers/reveal-provider";

function ThemeBridge({
	theme,
	onThemeChange,
}: {
	theme: string;
	onThemeChange: (theme: string) => void;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	useEffect(() => {
		document.documentElement.classList.add("yaschet");
		document.documentElement.dataset.theme = resolvedTheme === "dark" ? "dark" : "light";
	}, [resolvedTheme]);
	const lastToolbarTheme = useRef<string | null>(null);
	const pendingToolbarTheme = useRef<string | null>(null);
	useEffect(() => {
		if (lastToolbarTheme.current !== theme) {
			lastToolbarTheme.current = theme;
			pendingToolbarTheme.current = resolvedTheme === theme ? null : theme;
			setTheme(theme);
		} else if (pendingToolbarTheme.current) {
			if (resolvedTheme === pendingToolbarTheme.current) pendingToolbarTheme.current = null;
		} else if (resolvedTheme && resolvedTheme !== theme) {
			onThemeChange(resolvedTheme);
		}
	}, [theme, resolvedTheme, setTheme, onThemeChange]);
	return null;
}

/** Fresh query cache per story; synchronize native theme controls with the toolbar. */
export function WorkshopProviders({
	children,
	storyId,
	theme,
	onThemeChange,
}: {
	children: ReactNode;
	storyId: string;
	theme: string;
	onThemeChange: (theme: string) => void;
}) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
			}),
	);
	useEffect(() => () => client.clear(), [client]);
	return (
		<QueryClientProvider client={client}>
			<ThemeProvider
				attribute="class"
				defaultTheme={theme}
				storageKey={`storybook-theme-${storyId}`}
				enableSystem={false}
				disableTransitionOnChange
			>
				<ThemeBridge theme={theme} onThemeChange={onThemeChange} />
				<RevealProvider>{children}</RevealProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
