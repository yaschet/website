"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

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

function detectAutomation() {
	if (typeof navigator === "undefined") return false;

	const userAgent = navigator.userAgent ?? "";
	return (
		navigator.webdriver ||
		/HeadlessChrome|Playwright|Puppeteer|puppeteer|playwright|webdriver/i.test(userAgent)
	);
}

export function RevealProvider({ children }: { children: React.ReactNode }) {
	const [isAutomation, setIsAutomation] = useState(detectAutomation);
	const [entryKey, setEntryKey] = useState("initial");
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		setIsAutomation(detectAutomation());
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !("matchMedia" in window)) return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const syncReducedMotion = () => {
			setPrefersReducedMotion(mediaQuery.matches);
		};

		syncReducedMotion();
		mediaQuery.addEventListener("change", syncReducedMotion);

		return () => {
			mediaQuery.removeEventListener("change", syncReducedMotion);
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		let lastPath = `${window.location.pathname}${window.location.search}`;
		setEntryKey(lastPath);

		const syncEntryKey = () => {
			const nextPath = `${window.location.pathname}${window.location.search}`;
			if (nextPath === lastPath) return;
			lastPath = nextPath;
			setEntryKey(nextPath);
		};

		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function pushState(...args) {
			const result = originalPushState.apply(this, args);
			syncEntryKey();
			return result;
		};

		window.history.replaceState = function replaceState(...args) {
			const result = originalReplaceState.apply(this, args);
			syncEntryKey();
			return result;
		};

		window.addEventListener("popstate", syncEntryKey);

		return () => {
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
			window.removeEventListener("popstate", syncEntryKey);
		};
	}, []);

	const environment: MotionEnvironment = isAutomation
		? "automation"
		: prefersReducedMotion
			? "reduced-motion"
			: "normal";

	return (
		<RevealContext.Provider value={{ phase: 3, environment, entryKey, forceRevealed: false }}>
			{children}
		</RevealContext.Provider>
	);
}
