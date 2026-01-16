"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// reveal phases
// 0: Initial (everything hidden except background)
// 1: Borders/Structure
// 2: Main Content
// 3: Floating UI
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
		// Phase 1: Structure (Borders) - 500ms
		const t1 = setTimeout(() => setPhase(1), 500);
		// Phase 2: Content - 800ms
		const t2 = setTimeout(() => setPhase(2), 800);
		// Phase 3: UI - 1200ms
		const t3 = setTimeout(() => setPhase(3), 1200);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			clearTimeout(t3);
		};
	}, []);

	return <RevealContext.Provider value={{ phase }}>{children}</RevealContext.Provider>;
}
