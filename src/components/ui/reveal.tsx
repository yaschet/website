/**
 * Reveal component.
 *
 * @remarks
 * Manages entrance animations for children.
 *
 * @example
 * ```tsx
 * <Reveal>
 *   <h1>Content</h1>
 * </Reveal>
 * ```
 *
 * @public
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { type RevealPhase, useRevealState } from "@/src/components/providers/reveal-provider";
import { distances, springs, stagger, tweens } from "@/src/lib/index";

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
	phase?: RevealPhase; // 0=Structure, 1=Primary, 2=Hero, 3=Scroll
}

export function Reveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	const { phase: currentPhase, environment, entryKey, forceRevealed } = useRevealState();
	const shouldReduceMotion = useReducedMotion();

	// Can only animate if global phase is reached, OR if user force-reveals
	const isEnabled = forceRevealed || currentPhase >= phase;
	const isAutomation = environment === "automation";
	const isReduced = environment === "reduced-motion" || shouldReduceMotion;

	if (isAutomation) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`reveal-${entryKey}-${phase}-${delay}`}
			initial={{
				opacity: 0,
				y: isReduced ? 0 : distances.small,
			}}
			animate={
				isEnabled
					? { opacity: 1, y: 0 }
					: { opacity: 0, y: isReduced ? 0 : distances.small }
			}
			transition={{
				...(isReduced ? tweens.reduced : springs.responsive),
				delay: delay,
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Special reveal for elements that trigger on scroll AFTER initial load
export function ScrollReveal({ children, delay = 0, className, phase = 3 }: RevealProps) {
	const { phase: currentPhase, environment, entryKey, forceRevealed } = useRevealState();
	const shouldReduceMotion = useReducedMotion();
	const [hasEnteredView, setHasEnteredView] = useState(false);

	useEffect(() => {
		void entryKey;
		setHasEnteredView(false);
	}, [entryKey]);

	// Phase gate: start only after phase is reached, OR if user force-reveals
	const isPhaseReached = forceRevealed || currentPhase >= phase;
	const isAutomation = environment === "automation";
	const isReduced = environment === "reduced-motion" || shouldReduceMotion;
	const shouldReveal = isAutomation || (isPhaseReached && hasEnteredView) || forceRevealed;

	if (isAutomation) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`scroll-reveal-${entryKey}-${phase}-${delay}`}
			initial={{ opacity: 0, y: isReduced ? 0 : distances.medium }}
			animate={
				shouldReveal
					? { opacity: 1, y: 0 }
					: { opacity: 0, y: isReduced ? 0 : distances.medium }
			}
			onViewportEnter={() => setHasEnteredView(true)}
			viewport={{ once: true, margin: "-50px" }}
			transition={
				isReduced
					? { ...tweens.reduced, delay: 0, duration: 0 }
					: { ...springs.gentle, delay }
			}
			className={className}
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
	const { phase: currentPhase, environment, entryKey, forceRevealed } = useRevealState();
	const isEnabled = forceRevealed || currentPhase >= phase;
	const shouldBypass = environment !== "normal";

	if (shouldBypass) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`reveal-stagger-${entryKey}-${phase}`}
			initial="hidden"
			animate={isEnabled ? "visible" : "hidden"}
			variants={{
				visible: {
					transition: {
						staggerChildren: stagger.item,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
	const { environment } = useRevealState();
	const shouldReduceMotion = useReducedMotion();
	const isReduced = environment !== "normal" || shouldReduceMotion;

	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: isReduced ? 0 : distances.small },
				visible: {
					opacity: 1,
					y: 0,
					transition: isReduced ? tweens.reduced : springs.responsive,
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function ShellReveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	const { phase: currentPhase, environment, entryKey, forceRevealed } = useRevealState();
	const shouldReduceMotion = useReducedMotion();
	const isEnabled = forceRevealed || currentPhase >= phase;
	const isAutomation = environment === "automation";
	const isReduced = environment === "reduced-motion" || shouldReduceMotion;

	if (isAutomation) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`shell-reveal-${entryKey}-${phase}-${delay}`}
			initial={{ opacity: 0, y: isReduced ? 0 : distances.micro }}
			animate={
				isEnabled
					? { opacity: 1, y: 0 }
					: { opacity: 0, y: isReduced ? 0 : distances.micro }
			}
			transition={{
				...(isReduced ? tweens.reduced : tweens.shell),
				delay,
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}
