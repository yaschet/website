"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProgressBar as ProgressBar, useRouter } from "next-nprogress-bar";
import { ThemeProvider } from "next-themes";
import type React from "react";
import { useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Toaster } from "@/src/components/ui/sonner";
import { NAVIGATION_SHORTCUTS } from "@/src/constants/navigation";
import { RevealProvider } from "./reveal-provider";
import { WebVitals } from "./web-vitals";

export default function RootProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const router = useRouter();
	const queryClient = useMemo(() => new QueryClient(), []);

	useHotkeys(
		[NAVIGATION_SHORTCUTS.home.win, NAVIGATION_SHORTCUTS.home.mac],
		() => router.push(NAVIGATION_SHORTCUTS.home.link),
		{
			description: NAVIGATION_SHORTCUTS.home.description,
		},
	);

	useHotkeys(
		[NAVIGATION_SHORTCUTS.blog.win, NAVIGATION_SHORTCUTS.blog.mac],
		() => router.push(NAVIGATION_SHORTCUTS.blog.link),
		{
			description: NAVIGATION_SHORTCUTS.blog.description,
		},
	);
	useHotkeys(
		[NAVIGATION_SHORTCUTS.projects.win, NAVIGATION_SHORTCUTS.projects.mac],
		() => router.push(NAVIGATION_SHORTCUTS.projects.link),
		{
			description: NAVIGATION_SHORTCUTS.projects.description,
		},
	);
	useHotkeys(
		[NAVIGATION_SHORTCUTS.contact.win, NAVIGATION_SHORTCUTS.contact.mac],
		() => router.push(NAVIGATION_SHORTCUTS.contact.link),
		{
			description: NAVIGATION_SHORTCUTS.contact.description,
		},
	);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
				<RevealProvider>
					{children}

					<SpeedInsights />
					<Analytics />
					<WebVitals />

					<ProgressBar
						color="var(--foreground)" // Using foreground color (black/white) for progress bar
						delay={300}
						disableSameURL={true}
						height="2px"
						options={{
							easing: "easeInOutCubic",
							showSpinner: false,
							speed: 500,
						}}
						shallowRouting={true}
						startPosition={0.3}
						stopDelay={200}
					/>
					<Toaster
						closeButton={true}
						expand={false}
						position="top-right"
						richColors={false}
					/>
				</RevealProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
