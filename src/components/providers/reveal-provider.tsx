"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Motion environment context.
 *
 * The old phased reveal orchestration is intentionally retired.
 * `phase` remains for compatibility with existing component props, but the
 * actual source of truth is:
 * - motion environment (`normal`, `reduced-motion`)
 * - current route identity (`entryKey`)
 * - whether a client-side route entry should animate
 */
export type RevealPhase = 0 | 1 | 2 | 3;
export type MotionEnvironment = "normal" | "reduced-motion";

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

export function RevealProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	// Browser capabilities are resolved after hydration so the first render matches the server.
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const [entry, setEntry] = useState({ pathname, hasNavigated: false });
	// Resolve entry before committing children, never after already-painted text.
	// Returning to the initial URL is still a new entry.
	if (entry.pathname !== pathname) {
		setEntry({ pathname, hasNavigated: true });
	}

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

	const environment: MotionEnvironment = prefersReducedMotion ? "reduced-motion" : "normal";
	const entryKey = pathname ?? "initial";
	// Preference changes cancel active motion; re-enabling motion must not replay
	// content the visitor has already read. Entry hooks check the live preference.
	const shouldAnimateEntry = entry.hasNavigated;
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
