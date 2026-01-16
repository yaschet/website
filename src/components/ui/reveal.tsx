"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import {
  useReveal,
  RevealPhase,
} from "@/src/components/providers/reveal-provider";

/**
 * Scroll Reveal
 *
 * Wraps content and animates it into view when scrolled into viewport.
 * Uses spring physics for natural feel.
 * Respects global orchestration phases.
 */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  phase?: RevealPhase; // 1=Borders, 2=Content, 3=UI
}

const springConfig = {
  type: "spring" as const,
  mass: 0.5,
  stiffness: 100,
  damping: 20,
};

export function Reveal({
  children,
  delay = 0,
  className,
  phase = 2,
}: RevealProps) {
  const { phase: currentPhase } = useReveal();
  const shouldReduceMotion = useReducedMotion();

  // Can only animate if global phase is reached
  const isEnabled = currentPhase >= phase;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={
        isEnabled
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: shouldReduceMotion ? 0 : 20 }
      }
      transition={{
        ...springConfig,
        delay: delay,
      }}
      className={className}
      style={{ willChange: "transform, opacity" }} // GPU optimization
    >
      {children}
    </motion.div>
  );
}

// Special reveal for elements that trigger on scroll AFTER initial load
export function ScrollReveal({ children, delay = 0, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...springConfig, delay }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  phase = 2,
}: {
  children: ReactNode;
  className?: string;
  phase?: RevealPhase;
}) {
  const { phase: currentPhase } = useReveal();
  const isEnabled = currentPhase >= phase;

  return (
    <motion.div
      initial="hidden"
      animate={isEnabled ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: springConfig,
        },
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
