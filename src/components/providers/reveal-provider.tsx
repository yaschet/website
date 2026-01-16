"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// 0: Initial (Background: Beam + Grid)
// 1: Navigation & Badges
// 2: First Horizontal Line
// 3: Profile Info (Avatar, Name, Title, Socials)
// 4: Second Horizontal Line
// 5: Hero Content
// 6: Post-Hero Scroll Sections
export type RevealPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
    // Force scroll to top on initial mount to ensure clean start
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    // Phase 1: Nav & Badges - 400ms
    const t1 = setTimeout(() => setPhase(1), 400);
    // Phase 2: First Line - 700ms
    const t2 = setTimeout(() => setPhase(2), 700);
    // Phase 3: Profile - 900ms
    const t3 = setTimeout(() => setPhase(3), 900);
    // Phase 4: Second Line - 1200ms
    const t4 = setTimeout(() => setPhase(4), 1200);
    // Phase 5: Hero Content - 1400ms
    const t5 = setTimeout(() => setPhase(5), 1400);
    // Phase 6: Post-Hero Content - 1800ms
    const t6 = setTimeout(() => setPhase(6), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  return (
    <RevealContext.Provider value={{ phase }}>
      {children}
    </RevealContext.Provider>
  );
}
