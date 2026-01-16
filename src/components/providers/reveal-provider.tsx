"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Reveal Phase System — Psychology-First Timing
 *
 * Total orchestration: ~250ms (imperceptible as "waiting")
 *
 * Phase 0: Structure (instant)
 *   - Background gradient, grid, borders, lines
 *   - These are scaffolding, not content — no animation
 *
 * Phase 1: Primary Content (+50ms)
 *   - Navigation, badges, profile section
 *   - The "who is this" moment
 *
 * Phase 2: Hero Content (+150ms)
 *   - Headline, CTA, hero messaging
 *   - The "what do they do" moment
 *
 * Phase 3: Scroll Content (scroll-triggered only)
 *   - Featured work, more projects
 *   - Only animates when scrolled into view
 */
export type RevealPhase = 0 | 1 | 2 | 3;

interface RevealContextType {
	phase: RevealPhase;
}

const RevealContext = createContext<RevealContextType | undefined>(undefined);

export function useReveal() {
	const context = useContext(RevealContext);
	if (!context) {
		throw new Error("useReveal must be used within a RevealProvider");
	}
	return context;
}

interface RevealProviderProps {
	children: React.ReactNode;
}

export function RevealProvider({ children }: RevealProviderProps) {
	const [phase, setPhase] = useState<RevealPhase>(0);

	useEffect(() => {
		// Force scroll to top on initial mount
		if (typeof window !== "undefined") {
			window.scrollTo(0, 0);
		}

		// Phase 1: Primary content (nav, profile) — 50ms
		const t1 = setTimeout(() => setPhase(1), 50);

		// Phase 2: Hero content (headline, CTA) — 150ms
		const t2 = setTimeout(() => setPhase(2), 150);

		// Phase 3: Scroll content ready — 250ms
		// This just unlocks scroll-triggered animations
		const t3 = setTimeout(() => setPhase(3), 250);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			clearTimeout(t3);
		};
	}, []);

	return <RevealContext.Provider value={{ phase }}>{children}</RevealContext.Provider>;
}
