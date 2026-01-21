/**
 * Atmospheric background for headline content.
 *
 * @remarks
 * Cinematic gradient treatment inspired by Dune (2024) atmospheric haze.
 * - Near-imperceptible ambient glow
 * - Film grain texture overlay
 * - Monochromatic restraint
 *
 * Design principle: If you can consciously see it, it's too strong.
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
	 * Film grain texture generator.
	 * Creates subtle analog noise reminiscent of 35mm film stock.
	 * Dune-style atmospheric dust particles.
	 */
	const drawFilmGrain = useCallback(() => {
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

		// Film grain parameters
		const grainDensity = 0.35; // Percentage of pixels that get grain
		const grainOpacity = isDark ? 0.025 : 0.018;

		// Create organic film grain (not uniform grid)
		const imageData = ctx.createImageData(rect.width, drawHeight);
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			if (Math.random() < grainDensity) {
				const brightness = Math.random() * 255;
				data[i] = brightness; // R
				data[i + 1] = brightness; // G
				data[i + 2] = brightness; // B
				data[i + 3] = grainOpacity * 255; // A
			}
		}

		ctx.putImageData(imageData, 0, 0);
	}, [isDark]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			requestAnimationFrame(drawFilmGrain);
		}
	}, [mounted, drawFilmGrain]);

	useEffect(() => {
		window.addEventListener("resize", drawFilmGrain);
		return () => window.removeEventListener("resize", drawFilmGrain);
	}, [drawFilmGrain]);

	if (!mounted) {
		return null;
	}

	// Atmospheric color palette - near-neutral, not accent
	// Dark: cool blue-gray haze | Light: warm amber dust
	const atmosphereColor = isDark
		? "oklch(0.55 0.02 250)" // Desaturated cool gray-blue
		: "oklch(0.75 0.025 80)"; // Warm dust/sand tone

	const atmosphereColorSecondary = isDark
		? "oklch(0.45 0.015 260)" // Deeper cool tone
		: "oklch(0.70 0.02 60)"; // Subtle warm

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
					"linear-gradient(to bottom, transparent 0%, black 8%, black 35%, transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 8%, black 35%, transparent 100%)",
			}}
		>
			{/* ATMOSPHERIC HAZE — Near-imperceptible ambient glow */}
			<div className="absolute inset-0">
				{/* Primary atmosphere — massive blur, barely visible */}
				<div
					className="absolute"
					style={{
						width: "120%",
						height: "80%",
						left: "50%",
						top: "-10%",
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
										opacity: { ...springs.ambient, delay: stagger.phi(0) },
										scale: { ...springs.ambient, delay: stagger.phi(0) },
									}
						}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: "100%",
							backgroundColor: atmosphereColor,
							opacity: isDark ? 0.035 : 0.025,
							filter: "blur(200px)",
							mixBlendMode: isDark ? "screen" : "multiply",
						}}
					/>
				</div>

				{/* Secondary atmosphere — asymmetric, organic placement */}
				<div
					className="absolute"
					style={{
						width: "70%",
						height: "50%",
						left: "55%",
						top: "5%",
						transform: "translateX(-50%)",
					}}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.75 }}
						animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75 }}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										opacity: { ...springs.ambient, delay: stagger.phi(1) },
										scale: { ...springs.ambient, delay: stagger.phi(1) },
									}
						}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: "100%",
							backgroundColor: atmosphereColorSecondary,
							opacity: isDark ? 0.025 : 0.018,
							filter: "blur(160px)",
							mixBlendMode: isDark ? "screen" : "multiply",
						}}
					/>
				</div>

				{/* Tertiary — slight warm/cool counter-tone for depth */}
				<div
					className="absolute"
					style={{
						width: "50%",
						height: "35%",
						left: "40%",
						top: "15%",
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
										opacity: { ...springs.ambient, delay: stagger.phi(2) },
										scale: { ...springs.ambient, delay: stagger.phi(2) },
									}
						}
						style={{
							width: "100%",
							height: "100%",
							borderRadius: "100%",
							// Counter-tone: warm in dark, cool in light
							backgroundColor: isDark
								? "oklch(0.50 0.025 40)" // Warm amber hint
								: "oklch(0.65 0.015 240)", // Cool blue hint
							opacity: isDark ? 0.015 : 0.012,
							filter: "blur(120px)",
							mixBlendMode: isDark ? "screen" : "multiply",
						}}
					/>
				</div>
			</div>

			{/* FILM GRAIN TEXTURE — Cinematic dust overlay */}
			<motion.canvas
				ref={canvasRef}
				initial={{ opacity: 0 }}
				animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
				transition={
					prefersReducedMotion
						? { duration: 0 }
						: { ...springs.ambient, delay: stagger.phi(3) + 0.15 }
				}
				className="absolute inset-0 h-full w-full"
				style={{
					zIndex: 1,
					mixBlendMode: isDark ? "overlay" : "soft-light",
				}}
			/>
		</motion.div>
	);
}
