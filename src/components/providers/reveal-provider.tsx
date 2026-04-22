"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Motion environment context.
 *
 * The old phased reveal orchestration is intentionally retired.
 * `phase` remains for compatibility with existing component props, but the
 * actual source of truth is:
 * - motion environment (`normal`, `reduced-motion`, `automation`)
 * - current route identity (`entryKey`)
 * - whether a client-side route entry should animate
 */
export type RevealPhase = 0 | 1 | 2 | 3;
export type MotionEnvironment = "normal" | "reduced-motion" | "automation";

export interface RevealContextType {
	entryKey: string;
	environment: MotionEnvironment;
	phase: RevealPhase;
	forceRevealed: boolean;
	shouldAnimateEntry: boolean;
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
			shouldAnimateEntry: false,
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
	const pathname = usePathname();
	const [isAutomation, setIsAutomation] = useState(detectAutomation);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const previousPathRef = useRef<string>(pathname ?? "initial");

	useEffect(() => {
		setIsAutomation(detectAutomation());
	}, []);

	useEffect(() => {
		setIsHydrated(true);
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
		if (!pathname) return;
		previousPathRef.current = pathname;
	}, [pathname]);

	const environment: MotionEnvironment = isAutomation
		? "automation"
		: prefersReducedMotion
			? "reduced-motion"
			: "normal";
	const entryKey = pathname ?? previousPathRef.current;
	const shouldAnimateEntry = isHydrated && entryKey !== previousPathRef.current;
	const forceRevealed = environment !== "normal" || !shouldAnimateEntry;

	return (
		<RevealContext.Provider
			value={{
				phase: 3,
				environment,
				entryKey,
				forceRevealed,
				shouldAnimateEntry,
			}}
		>
			{children}
		</RevealContext.Provider>
	);
}
