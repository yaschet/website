/**
 * Atmospheric background for headline content.
 *
 * @remarks
 * GPU-accelerated ambient gradient using CSS transforms only.
 * Zero canvas, zero blend modes, zero runtime calculations.
 *
 * Performance: 240fps target via GPU compositing.
 * - Uses `will-change: transform, opacity` for layer promotion
 * - CSS blur filter (GPU-accelerated)
 * - Static SVG noise texture (no JS generation)
 * - Design system color tokens
 *
 * @example
 * ```tsx
 * <HeroGradient className="h-screen" />
 * ```
 *
 * @public
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { springs, stagger } from "@/src/lib/index";
import { useReveal } from "../providers/reveal-provider";

interface HeroGradientProps {
	/** Optional additional class names for positioning or container overrides. */
	className?: string;
}

/**
 * SVG noise filter for film grain texture.
 * Static, GPU-composited, zero runtime cost.
 */
function NoiseFilter() {
	return (
		<svg className="absolute h-0 w-0" aria-hidden="true">
			<defs>
				<filter id="hero-noise" x="0%" y="0%" width="100%" height="100%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.8"
						numOctaves="4"
						stitchTiles="stitch"
						result="noise"
					/>
					<feColorMatrix type="saturate" values="0" in="noise" result="mono" />
					<feComponentTransfer in="mono" result="final">
						<feFuncA type="linear" slope="0.03" />
					</feComponentTransfer>
				</filter>
			</defs>
		</svg>
	);
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
	const { resolvedTheme } = useTheme();
	const { phase } = useReveal();
	const [mounted, setMounted] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	const isDark = resolvedTheme === "dark";
	const isEnabled = phase >= 2;

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
			transition={prefersReducedMotion ? { duration: 0 } : springs.ambient}
			className={`pointer-events-none overflow-hidden ${className}`}
			aria-hidden="true"
			style={{
				willChange: "opacity",
				maskImage:
					"linear-gradient(to bottom, transparent 0%, black 10%, black 30%, transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 10%, black 30%, transparent 100%)",
			}}
		>
			{/* SVG Filter Definition */}
			<NoiseFilter />

			{/* ATMOSPHERIC LAYERS — GPU-accelerated CSS gradients */}
			<div className="absolute inset-0">
				{/* Primary atmosphere — uses design system accent color */}
				<div
					className="absolute"
					style={{
						width: "100%",
						height: "70%",
						left: "50%",
						top: "-5%",
						transform: "translateX(-50%)",
					}}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.85 }}
						animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										opacity: { ...springs.ambient, delay: stagger.phi(0) },
										scale: { ...springs.ambient, delay: stagger.phi(0) },
									}
						}
						className="h-full w-full rounded-full"
						style={{
							willChange: "transform, opacity",
							// Using surface token — near-neutral, not distracting
							background: isDark
								? "radial-gradient(ellipse at center, var(--surface-700) 0%, transparent 70%)"
								: "radial-gradient(ellipse at center, var(--surface-200) 0%, transparent 70%)",
							opacity: isDark ? 0.4 : 0.5,
							filter: "blur(80px)",
						}}
					/>
				</div>

				{/* Secondary — subtle accent hint, asymmetric */}
				<div
					className="absolute"
					style={{
						width: "60%",
						height: "45%",
						left: "55%",
						top: "5%",
						transform: "translateX(-50%)",
					}}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										opacity: { ...springs.ambient, delay: stagger.phi(1) },
										scale: { ...springs.ambient, delay: stagger.phi(1) },
									}
						}
						className="h-full w-full rounded-full"
						style={{
							willChange: "transform, opacity",
							// Accent token — burgundy/merlot from design system
							background: isDark
								? "radial-gradient(ellipse at center, var(--accent-800) 0%, transparent 65%)"
								: "radial-gradient(ellipse at center, var(--accent-200) 0%, transparent 65%)",
							opacity: isDark ? 0.15 : 0.2,
							filter: "blur(60px)",
						}}
					/>
				</div>
			</div>

			{/* NOISE TEXTURE — Static SVG filter, GPU-composited */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
				transition={
					prefersReducedMotion
						? { duration: 0 }
						: { ...springs.ambient, delay: stagger.phi(2) }
				}
				className="absolute inset-0"
				style={{
					willChange: "opacity",
					filter: "url(#hero-noise)",
					opacity: isDark ? 0.5 : 0.35,
				}}
			/>
		</motion.div>
	);
}
