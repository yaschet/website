"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { type RevealPhase, useRevealState } from "@/src/components/providers/reveal-provider";
import { blur, distances, springs, stagger, tweens } from "@/src/lib/index";

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
	phase?: RevealPhase;
}

export const revealSequence = {
	backLink: 0.02,
	eyebrow: 0.04,
	kicker: 0.06,
	heading: 0.1,
	headingLate: 0.12,
	body: 0.22,
	bodyLate: 0.26,
	children: 0.3,
	controls: 0.32,
	meta: 0.34,
} as const;

function useRevealMotionGate() {
	const shouldReduceMotion = useReducedMotion();
	const { environment, entryKey, forceRevealed, shouldAnimateEntry } = useRevealState();
	const shouldBypass =
		forceRevealed ||
		environment === "automation" ||
		environment === "reduced-motion" ||
		shouldReduceMotion ||
		!shouldAnimateEntry;

	return { entryKey, shouldBypass, shouldReduceMotion };
}

export function Reveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	const { entryKey, shouldBypass } = useRevealMotionGate();
	void phase;

	if (shouldBypass) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`reveal-${entryKey}-${delay}`}
			initial={{ opacity: 0, y: distances.small, filter: blur.subtle }}
			animate={{ opacity: 1, y: 0, filter: blur.none }}
			transition={{
				y: { ...springs.gentle, delay },
				opacity: { ...tweens.content, delay },
				filter: { ...tweens.interactionSlow, delay },
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function ScrollReveal({ children, delay = 0, className, phase = 3 }: RevealProps) {
	return (
		<Reveal delay={delay} className={className} phase={phase}>
			{children}
		</Reveal>
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
	const { entryKey, shouldBypass } = useRevealMotionGate();
	void phase;

	if (shouldBypass) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`reveal-stagger-${entryKey}`}
			initial="hidden"
			animate="visible"
			variants={{
				hidden: {},
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
	const { shouldBypass, shouldReduceMotion } = useRevealMotionGate();

	if (shouldBypass) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			variants={{
				hidden: {
					opacity: 0,
					y: shouldReduceMotion ? 0 : distances.small,
					filter: blur.subtle,
				},
				visible: {
					opacity: 1,
					y: 0,
					filter: blur.none,
					transition: shouldReduceMotion
						? tweens.reduced
						: {
								y: springs.responsive,
								opacity: tweens.content,
								filter: tweens.interactionSlow,
							},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function ShellReveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	void delay;
	void phase;
	return <div className={className}>{children}</div>;
}
