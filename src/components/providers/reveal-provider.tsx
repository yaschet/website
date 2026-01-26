"use client";

import type React from "react";
import { useEffect, useState } from "react";

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

export interface RevealContextType {
	phase: RevealPhase;
}

import { getStrictContext } from "@/lib/get-strict-context";

const [StrictRevealProvider, useReveal] = getStrictContext<RevealContextType>("RevealContext");

export { useReveal };

interface RevealProviderProps {
	children: React.ReactNode;
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
	const [phase, setPhase] = useState<RevealPhase>(0);

	useEffect(() => {
		// // Force scroll to top on initial mount
		// if (typeof window !== "undefined") {
		// 	window.scrollTo(0, 0);
		// }

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

	return <StrictRevealProvider value={{ phase }}>{children}</StrictRevealProvider>;
}
