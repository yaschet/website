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
import { type RevealPhase, useRevealState } from "@/src/components/providers/reveal-provider";
import { distances, springs, stagger, tweens } from "@/src/lib/index";

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
	phase?: RevealPhase; // 0=Structure, 1=Primary, 2=Hero, 3=Scroll
}

export function Reveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	void delay;
	void phase;
	return <div className={className}>{children}</div>;
}

export function ScrollReveal({ children, delay = 0, className, phase = 3 }: RevealProps) {
	const { environment, entryKey } = useRevealState();
	const shouldReduceMotion = useReducedMotion();
	const isAutomation = environment === "automation";
	const isReduced = environment === "reduced-motion" || shouldReduceMotion;
	void phase;

	if (isAutomation || isReduced) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`scroll-reveal-${entryKey}-${delay}`}
			initial={{ opacity: 0, y: distances.small }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0.08 }}
			transition={{ ...springs.gentle, delay }}
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
	const { environment, entryKey } = useRevealState();
	const shouldBypass = environment !== "normal";
	void phase;

	if (shouldBypass) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			key={`reveal-stagger-${entryKey}`}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0.08 }}
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
	void delay;
	void phase;
	return <div className={className}>{children}</div>;
}
