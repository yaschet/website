/**
 * Atmospheric background management for headline content.
 *
 * @remarks
 * - CSS radial gradients for lighting.
 * - Canvas-based grain overlay.
 * - GPU-accelerated canvas rendering for dot-matrix density.
 *
 * All motion is synchronized with the global `RevealProvider` state.
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
import { useCallback, useEffect, useRef, useState } from "react";
import { springs, stagger } from "@/src/lib/index";
import { useReveal } from "../providers/reveal-provider";

interface HeroGradientProps {
	/** Optional additional class names for positioning or container overrides. */
	className?: string;
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
	const { resolvedTheme } = useTheme();
	const { phase } = useReveal();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	const isDark = resolvedTheme === "dark";
	// Sync with hero content reveal (phase 2)
	const isEnabled = phase >= 2;

	/**
	 * @method drawPixels
	 * @description
	 * Renders a retro CRT/pixelated screen pattern using the Canvas API.
	 * Evokes 1990s high-tech monitors when zoomed in.
	 *
	 * GRID HARMONIZATION:
	 * Uses 16px spacing.
	 * Calculates the container offset so dots align with the centered max-w-3xl container.
	 */
	const drawDots = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		const drawHeight = Math.max(rect.height, window.innerHeight * 1.2);

		canvas.width = rect.width * dpr;
		canvas.height = drawHeight * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, rect.width, drawHeight);

		// Grid-aligned retro CRT settings
		// DOT_SPACING must be a divisor of GRID_CYCLE (16) to maintain vertical alignment
		// Options: 1, 2, 4, 8, 16 - using 4px for dense retro CRT effect
		const _GRID_CYCLE = 16;
		const DOT_SPACING = 4; // Dense CRT grid (4 dots per grid cycle)
		const MAX_CONTAINER_WIDTH = 768;
		const pixelSize = 1.5; // Small dots for authentic CRT feel

		// Calculate the offset to align with the centered max-w-3xl container
		const containerLeft = Math.max(0, (rect.width - MAX_CONTAINER_WIDTH) / 2);
		const offsetX = containerLeft % DOT_SPACING;

		// Vertical offset: align with first horizontal grid line at nav bottom (118px)
		const NAV_HEIGHT = 118;
		const offsetY = (NAV_HEIGHT + 1) % DOT_SPACING;

		// CRT dots - subtle retro texture
		ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.035)";

		// Square pixels for authentic CRT feel
		for (let x = offsetX; x < rect.width; x += DOT_SPACING) {
			for (let y = offsetY; y < drawHeight; y += DOT_SPACING) {
				ctx.fillRect(x, y, pixelSize, pixelSize);
			}
		}
	}, [isDark]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			requestAnimationFrame(drawDots);
		}
	}, [mounted, drawDots]);

	useEffect(() => {
		window.addEventListener("resize", drawDots);
		return () => window.removeEventListener("resize", drawDots);
	}, [drawDots]);

	if (!mounted) {
		return null;
	}

	return (
		<motion.div
			ref={containerRef}
			initial={{ opacity: 0 }}
			animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
			transition={springs.ambient}
			className={`pointer-events-none overflow-hidden ${className}`}
			aria-hidden="true"
			style={{
				maskImage:
					"linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)",
			}}
		>
			{/* GRADIENT LAYERS — Staggered physics-based entrance */}
			<div className="absolute inset-0">
				{/* Primary Gradient — Arrives first, scales up */}
				<div
					className="absolute"
					style={{
						width: "80%",
						height: "55%",
						left: "50%",
						top: "3%",
						transform: "translateX(-50%)",
					}}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.7 }}
						animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										opacity: { ...springs.ambient, delay: stagger.phi(0) },
										scale: { ...springs.gentle, delay: stagger.phi(0) },
									}
						}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: "100%",
							backgroundColor: "var(--accent-500)",
							opacity: isDark ? 0.1 : 0.06,
							filter: "blur(150px)",
						}}
					/>
				</div>

				{/* Secondary Gradient — Arrives second */}
				<div
					className="absolute"
					style={{
						width: "60%",
						height: "40%",
						left: "50%",
						top: "8%",
						transform: "translateX(-50%)",
					}}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.65 }}
						animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.65 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										opacity: { ...springs.ambient, delay: stagger.phi(1) },
										scale: { ...springs.gentle, delay: stagger.phi(1) },
									}
						}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: "100%",
							backgroundColor: "var(--accent-400)",
							opacity: isDark ? 0.08 : 0.05,
							filter: "blur(120px)",
						}}
					/>
				</div>

				{/* Tertiary Ambient Core — Arrives last, settling into place */}
				<div
					className="absolute"
					style={{
						width: "40%",
						height: "25%",
						left: "50%",
						top: "12%",
						transform: "translateX(-50%)",
					}}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.6 }}
						animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										opacity: { ...springs.ambient, delay: stagger.phi(2) },
										scale: { ...springs.gentle, delay: stagger.phi(2) },
									}
						}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: "100%",
							backgroundColor: "var(--accent-300)",
							opacity: isDark ? 0.06 : 0.04,
							filter: "blur(80px)",
						}}
					/>
				</div>
			</div>

			{/* TEXTURE OVERLAY — Fades in after gradients settle */}
			<motion.canvas
				ref={canvasRef}
				initial={{ opacity: 0 }}
				animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
				transition={
					prefersReducedMotion
						? { duration: 0 }
						: { ...springs.ambient, delay: stagger.phi(3) + 0.2 }
				}
				className="absolute inset-0 h-full w-full"
				style={{ zIndex: 1 }}
			/>
		</motion.div>
	);
}
