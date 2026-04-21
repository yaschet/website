"use client";

import { useReducedMotion } from "framer-motion";
import type React from "react";
import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

/**
 * Reveal Phase System
 *
 * Total duration: ~250ms (imperceptible as "waiting")
 *
 * Phase 0: Structure (0ms)
 *   - Renders layout scaffolding (grid, borders).
 *
 * Phase 1: Primary Content (50ms)
 *   - Renders navigation, badges, and profile information.
 *
 * Phase 2: Hero Content (150ms)
 *   - Renders headlines and primary call-to-action elements.
 *
 * Phase 3: Scroll Content (250ms)
 *   - Enables scroll-triggered animations for subsequent sections.
 */
// No change needed to RevealPhase export
export type RevealPhase = 0 | 1 | 2 | 3;
export type MotionEnvironment = "normal" | "reduced-motion" | "automation";

export interface RevealContextType {
	entryKey: string;
	environment: MotionEnvironment;
	phase: RevealPhase;
	forceRevealed: boolean;
}

const RevealContext = createContext<RevealContextType | null>(null);

export function useReveal() {
	const context = useContext(RevealContext);
	if (!context) {
		throw new Error("RevealContext");
	}
	return context;
}

export function useRevealState(): RevealContextType {
	return (
		useContext(RevealContext) ?? {
			phase: 3,
			environment: "normal",
			entryKey: "standalone",
			forceRevealed: false,
		}
	);
}

interface RevealProviderProps {
	children: React.ReactNode;
}

function detectAutomation() {
	if (typeof navigator === "undefined") return false;

	const userAgent = navigator.userAgent ?? "";
	return (
		navigator.webdriver ||
		/HeadlessChrome|Playwright|Puppeteer|puppeteer|playwright|webdriver/i.test(userAgent)
	);
}

/**
 * Manages staggered content delivery for improved perceived performance.
 *
 * @remarks
 * Manages the "Reveal Phase System" (0-3) which unlocks UI layers sequentially.
 * This ensures critical content loads first (LCP optimization) while
 * preventing layout thrashing and cognitive overload.
 *
 * @public
 */
export function RevealProvider({ children }: RevealProviderProps) {
	const prefersReducedMotion = useReducedMotion();
	const [entryKey, setEntryKey] = useState("0");
	const [phase, setPhase] = useState<RevealPhase>(0);
	const [isAutomation, setIsAutomation] = useState(detectAutomation);
	const [routeKey, setRouteKey] = useState(0);
	const [forceRevealed, setForceRevealed] = useState(false);

	useEffect(() => {
		setIsAutomation(detectAutomation());
	}, []);

	// Emergency keyboard shortcut: Shift+Ctrl+R to force reveal all content
	// Useful for debugging or when reveal system gets stuck
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.shiftKey && e.ctrlKey && e.key === "r") {
				setForceRevealed(true);
				setPhase(3);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		let lastPath = `${window.location.pathname}${window.location.search}`;
		let pendingFrame: number | null = null;
		const scheduleRouteKey = () => {
			if (pendingFrame !== null) {
				cancelAnimationFrame(pendingFrame);
			}
			pendingFrame = window.requestAnimationFrame(() => {
				pendingFrame = null;
				setRouteKey((current) => current + 1);
			});
		};

		const notifyPathChange = () => {
			const nextPath = `${window.location.pathname}${window.location.search}`;
			if (nextPath === lastPath) return;
			lastPath = nextPath;
			scheduleRouteKey();
		};

		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function pushState(...args) {
			const result = originalPushState.apply(this, args);
			notifyPathChange();
			return result;
		};

		window.history.replaceState = function replaceState(...args) {
			const result = originalReplaceState.apply(this, args);
			notifyPathChange();
			return result;
		};

		window.addEventListener("popstate", notifyPathChange);

		return () => {
			if (pendingFrame !== null) {
				cancelAnimationFrame(pendingFrame);
			}
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
			window.removeEventListener("popstate", notifyPathChange);
		};
	}, []);

	const environment: MotionEnvironment = isAutomation
		? "automation"
		: prefersReducedMotion
			? "reduced-motion"
			: "normal";

	useLayoutEffect(() => {
		void routeKey;
		setEntryKey((current) => String(Number(current) + 1));

		if (environment === "automation") {
			setPhase(3);
			return;
		}

		setPhase(0);

		const shellFrame = requestAnimationFrame(() => {
			setPhase(1);
		});

		const heroTimer = window.setTimeout(
			() => {
				setPhase(2);
			},
			environment === "reduced-motion" ? 40 : 180,
		);

		const scrollTimer = window.setTimeout(
			() => {
				setPhase(3);
			},
			environment === "reduced-motion" ? 120 : 320,
		);

		// Safety timeout: force phase 3 after absolute max time to prevent stuck reveals.
		// If timers fail to execute (e.g., browser tab backgrounded), this ensures content eventually becomes visible.
		const safetyTimer = window.setTimeout(() => {
			setPhase(3);
		}, 2000);

		return () => {
			cancelAnimationFrame(shellFrame);
			clearTimeout(heroTimer);
			clearTimeout(scrollTimer);
			clearTimeout(safetyTimer);
		};
	}, [environment, routeKey]);

	return (
		<RevealContext.Provider value={{ phase, environment, entryKey, forceRevealed }}>
			{children}
		</RevealContext.Provider>
	);
}
