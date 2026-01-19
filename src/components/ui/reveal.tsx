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
import { type RevealPhase, useReveal } from "@/src/components/providers/reveal-provider";
import { distances, springs, stagger } from "@/src/lib/index";

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
	phase?: RevealPhase; // 0=Structure, 1=Primary, 2=Hero, 3=Scroll
}

export function Reveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	const { phase: currentPhase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	// Can only animate if global phase is reached
	const isEnabled = currentPhase >= phase;

	return (
		<motion.div
			initial={{ opacity: 0, y: shouldReduceMotion ? 0 : distances.small }}
			animate={
				isEnabled
					? { opacity: 1, y: 0 }
					: { opacity: 0, y: shouldReduceMotion ? 0 : distances.small }
			}
			transition={{
				...springs.responsive,
				delay: delay,
			}}
			className={className}
			style={{ willChange: "transform, opacity" }}
		>
			{children}
		</motion.div>
	);
}

// Special reveal for elements that trigger on scroll AFTER initial load
export function ScrollReveal({ children, delay = 0, className, phase = 3 }: RevealProps) {
	const { phase: currentPhase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	// Only allow scroll-reveal to trigger if we've reached the required animation phase
	const isEnabled = currentPhase >= phase;

	return (
		<motion.div
			initial={{ opacity: 0, y: shouldReduceMotion ? 0 : distances.medium }}
			whileInView={isEnabled ? { opacity: 1, y: 0 } : undefined}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ ...springs.gentle, delay }}
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
	const shouldReduceMotion = useReducedMotion();

	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: shouldReduceMotion ? 0 : distances.small },
				visible: {
					opacity: 1,
					y: 0,
					transition: springs.responsive,
				},
			}}
			className={className}
			style={{ willChange: "transform, opacity" }}
		>
			{children}
		</motion.div>
	);
}
