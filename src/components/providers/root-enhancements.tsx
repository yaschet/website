"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Toaster } from "@/src/components/ui/sonner";
import { NAVIGATION_SHORTCUTS } from "@/src/constants/navigation";
import { DeferredGlobalChrome } from "./deferred-global-chrome";
import { DevAgentation } from "./dev-agentation";
import { WebVitals } from "./web-vitals";

export function RootEnhancements() {
	const router = useRouter();
	const [isIdleReady, setIsIdleReady] = useState(false);
	const [shouldMountTelemetry, setShouldMountTelemetry] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return undefined;

		if ("requestIdleCallback" in window) {
			const idleId = window.requestIdleCallback(
				() => {
					setIsIdleReady(true);
				},
				{ timeout: 1200 },
			);

			return () => window.cancelIdleCallback(idleId);
		}

		const timeoutId = globalThis.setTimeout(() => {
			setIsIdleReady(true);
		}, 600);

		return () => globalThis.clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const hostname = window.location.hostname;
		const isLocalHost =
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "::1" ||
			hostname.startsWith("10.") ||
			hostname.startsWith("192.168.") ||
			/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

		setShouldMountTelemetry(!isLocalHost);
	}, []);

	useHotkeys(
		[NAVIGATION_SHORTCUTS.home.win, NAVIGATION_SHORTCUTS.home.mac],
		() => router.push(NAVIGATION_SHORTCUTS.home.link),
		{
			enabled: isIdleReady,
			description: NAVIGATION_SHORTCUTS.home.description,
		},
	);

	useHotkeys(
		[NAVIGATION_SHORTCUTS.blog.win, NAVIGATION_SHORTCUTS.blog.mac],
		() => router.push(NAVIGATION_SHORTCUTS.blog.link),
		{
			enabled: isIdleReady,
			description: NAVIGATION_SHORTCUTS.blog.description,
		},
	);

	useHotkeys(
		[NAVIGATION_SHORTCUTS.projects.win, NAVIGATION_SHORTCUTS.projects.mac],
		() => router.push(NAVIGATION_SHORTCUTS.projects.link),
		{
			enabled: isIdleReady,
			description: NAVIGATION_SHORTCUTS.projects.description,
		},
	);

	useHotkeys(
		[NAVIGATION_SHORTCUTS.contact.win, NAVIGATION_SHORTCUTS.contact.mac],
		() => router.push(NAVIGATION_SHORTCUTS.contact.link),
		{
			enabled: isIdleReady,
			description: NAVIGATION_SHORTCUTS.contact.description,
		},
	);

	if (!isIdleReady) {
		return null;
	}

	return (
		<>
			<DeferredGlobalChrome />
			{shouldMountTelemetry ? (
				<>
					<SpeedInsights />
					<Analytics />
				</>
			) : null}
			<WebVitals />
			<Toaster closeButton={true} expand={false} position="top-right" richColors={false} />
			<DevAgentation />
		</>
	);
}
