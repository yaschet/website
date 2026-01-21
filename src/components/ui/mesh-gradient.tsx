/**
 * Atmospheric mesh gradient — premium boxed hero background
 *
 * - CSS radial gradients for lighting
 * - Canvas-based dot-matrix overlay
 * - Boxed, clipped, and harmonized with SwissGrid
 * - Theme-reactive accent colors
 * - Context for text color (needsLightText)
 */
"use client";

import { motion } from "framer-motion";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/src/components/providers/reveal-provider";
import { springs } from "@/src/lib/index";
import { useSwissGrid } from "./swiss-grid-canvas";

interface MeshGradientContextValue {
	needsLightText: boolean;
	isDark: boolean;
}
const MeshGradientContext = createContext<MeshGradientContextValue | null>(null);
export function useMeshGradient(): MeshGradientContextValue | null {
	return useContext(MeshGradientContext);
}

interface MeshGradientProps {
	className?: string;
	children?: React.ReactNode;
}

export function MeshGradient({ className = "", children }: MeshGradientProps) {
	const { phase } = useReveal();
	const swissGrid = useSwissGrid();
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [mounted, setMounted] = useState(false);
	const [isDark, setIsDark] = useState(false);

	// Theme detection (sync with SwissGrid)
	useEffect(() => {
		setMounted(true);
	}, []);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
		checkDark();
		const observer = new MutationObserver(checkDark);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	// Context for text color
	const contextValue = useMemo<MeshGradientContextValue>(
		() => ({ needsLightText: isDark, isDark }),
		[isDark],
	);

	// Boxed layout harmonization
	const containerBounds = swissGrid?.containerBounds;
	const containerStyle = useMemo(() => {
		if (!containerBounds) return {};
		return {
			left: Math.round(containerBounds.left),
			width: Math.round(containerBounds.width),
			top: 0,
			bottom: 0,
		};
	}, [containerBounds]);

	// Dot-matrix overlay (retro CRT)
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
		// CRT grid settings
		const DOT_SPACING = 4;
		const MAX_CONTAINER_WIDTH = 768;
		const pixelSize = 1.5;
		const containerLeft = Math.max(0, (rect.width - MAX_CONTAINER_WIDTH) / 2);
		const offsetX = containerLeft % DOT_SPACING;
		const NAV_HEIGHT = 118;
		const offsetY = (NAV_HEIGHT + 1) % DOT_SPACING;
		ctx.fillStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.035)";
		for (let x = offsetX; x < rect.width; x += DOT_SPACING) {
			for (let y = offsetY; y < drawHeight; y += DOT_SPACING) {
				ctx.fillRect(x, y, pixelSize, pixelSize);
			}
		}
	}, [isDark]);

	useEffect(() => {
		if (mounted) requestAnimationFrame(drawDots);
	}, [mounted, drawDots]);
	useEffect(() => {
		window.addEventListener("resize", drawDots);
		return () => window.removeEventListener("resize", drawDots);
	}, [drawDots]);

	// Reveal animation
	const isEnabled = phase >= 1 && mounted && !!containerBounds;

	return (
		<MeshGradientContext.Provider value={contextValue}>
			<motion.div
				ref={containerRef}
				initial={{ opacity: 0 }}
				animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
				transition={springs.ambient}
				className={cn("pointer-events-none absolute z-1 overflow-hidden", className)}
				style={{
					...containerStyle,
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%), linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
					maskComposite: "intersect",
					WebkitMaskImage:
						"linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%), linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
					WebkitMaskComposite: "source-in",
				}}
				aria-hidden="true"
			>
				{/* GRADIENT LAYERS — premium mesh lighting (wider, more visible) */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
					transition={{ ...springs.ambient, delay: 0.2 }}
					className="absolute inset-0"
				>
					{/* Primary Gradient */}
					<div
						className="absolute"
						style={{
							width: "110%",
							height: "70%",
							left: "50%",
							top: "0%",
							transform: "translateX(-50%)",
							borderRadius: "100%",
							backgroundColor: "var(--accent-500)",
							opacity: isDark ? 0.22 : 0.13,
							filter: "blur(180px)",
						}}
					/>
					{/* Secondary Gradient */}
					<div
						className="absolute"
						style={{
							width: "85%",
							height: "55%",
							left: "50%",
							top: "7%",
							transform: "translateX(-50%)",
							borderRadius: "100%",
							backgroundColor: "var(--accent-400)",
							opacity: isDark ? 0.16 : 0.1,
							filter: "blur(140px)",
						}}
					/>
					{/* Tertiary Ambient Core */}
					<div
						className="absolute"
						style={{
							width: "60%",
							height: "35%",
							left: "50%",
							top: "15%",
							transform: "translateX(-50%)",
							borderRadius: "100%",
							backgroundColor: "var(--accent-300)",
							opacity: isDark ? 0.11 : 0.07,
							filter: "blur(100px)",
						}}
					/>
				</motion.div>
				{/* TEXTURE OVERLAY — dot-matrix CRT */}
				<motion.canvas
					ref={canvasRef}
					initial={{ opacity: 0 }}
					animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
					transition={{ duration: 1.2, delay: 0.5 }}
					className="absolute inset-0 h-full w-full"
					style={{ zIndex: 1 }}
				/>
			</motion.div>
			{children}
		</MeshGradientContext.Provider>
	);
}
