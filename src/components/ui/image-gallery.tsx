/**
 * ImageGallery - Shared gallery primitive.
 *
 * @remarks
 * Reusable gallery component with "240hz OLED" performance tuning:
 * - Layout Isolation: Uses `contain: content` to prevent reflow propagation
 * - Paint Optimization: Uses `will-change: transform` for slider
 * - Pixel-based Height: Animates explicit pixel height (smoother than % padding)
 * - Smart Windowing: Renders only active image + neighbors (±1)
 * - GPU Acceleration: Opacity/Transform only for controls
 *
 * @public
 */

"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { animate, motion, type PanInfo, useMotionValue } from "framer-motion";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveAsset } from "@/src/lib/assets";
import { cn, springs } from "@/src/lib/index";

interface ImageGalleryProps {
	/** Array of image sources (strings or static imports) */
	images: (string | StaticImageData)[];
	/** Alt text for each image (optional) */
	alts?: string[];
	/** Default alt prefix if alts not provided */
	altPrefix?: string;
	/**
	 * Aspect ratio(s) for the container.
	 * - Single string: fixed ratio for all images (e.g., "16/9")
	 * - Array: per-image ratios, container morphs between them
	 * - "auto": extract from static imports (falls back to 16/9)
	 */
	aspectRatio?: string | string[] | "auto";
	/** Show navigation arrows */
	showArrows?: boolean;
	/** Show progress indicators */
	showProgress?: boolean;
	/** Show counter badge */
	showCounter?: boolean;
	/** Enable keyboard navigation */
	enableKeyboard?: boolean;
	/** Additional class names */
	className?: string;
	/** Additional class names applied to each rendered image */
	imageClassName?: string;
	/** Custom sizes attribute for responsive optimization */
	sizes?: string;
	/** Image quality (1-100) */
	quality?: number;
	/** Callback when index changes */
	onIndexChange?: (index: number) => void;
	/** Preload the first image when the gallery is likely above the fold */
	prioritizeFirstImage?: boolean;
}

/**
 * Parse aspect ratio string to number (e.g., "16/9" → 1.777)
 */
function parseAspectRatio(ratio: string): number {
	if (ratio.includes("/")) {
		const [w, h] = ratio.split("/").map(Number);
		return w / h;
	}
	return Number.parseFloat(ratio) || 16 / 9;
}

/**
 * Extract aspect ratio from StaticImageData or return default
 */
function getImageAspectRatio(src: string | StaticImageData): number {
	if (typeof src !== "string" && src.width && src.height) {
		return src.width / src.height;
	}
	return 16 / 9; // Default fallback
}

export function ImageGallery({
	images: rawImages,
	alts,
	altPrefix = "Gallery image",
	aspectRatio = "auto",
	showArrows = true,
	showProgress = true,
	showCounter = false,
	enableKeyboard = true,
	className,
	imageClassName,
	onIndexChange,
	prioritizeFirstImage = true,
	sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw",
	quality = 75,
}: ImageGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasMultiple = rawImages.length > 1;

	// Track container width for specific pixel calculations
	// We need this for accurate drag constraints and pixel-perfect height animation
	const [viewportWidth, setViewportWidth] = useState(0);

	// Resolve all images and standardize format
	const resolvedImages = useMemo(() => {
		return rawImages.map((rawSrc) => {
			const src = typeof rawSrc === "string" ? resolveAsset(rawSrc) : rawSrc;
			return {
				src,
				isStatic: typeof src !== "string",
			};
		});
	}, [rawImages]);

	// Compute aspect ratios for each image
	const aspectRatios = useMemo(() => {
		if (Array.isArray(aspectRatio)) {
			// Explicit per-image ratios provided
			return aspectRatio.map(parseAspectRatio);
		}

		if (aspectRatio === "auto") {
			// Extract from static imports
			return rawImages.map(getImageAspectRatio);
		}

		// Single fixed ratio for all
		const fixed = parseAspectRatio(aspectRatio);
		return rawImages.map(() => fixed);
	}, [rawImages, aspectRatio]);

	// Check if we have varying ratios (enables adaptive mode)
	const hasVaryingRatios = useMemo(() => {
		const first = aspectRatios[0];
		// If ANY ratio deviates significantly, we treat it as adaptive
		return aspectRatios.some((r) => Math.abs(r - first) > 0.01);
	}, [aspectRatios]);

	// Animation Values
	const x = useMotionValue(0);
	const height = useMotionValue(0); // Pixel height animation

	// Update dimensions securely via ResizeObserver
	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				setViewportWidth(w);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	// Calculate and animate target height (Pixel Perf Power Move)
	// We animate explicit PIXEL height, which is robust and stops % recalc thrashing
	useEffect(() => {
		if (viewportWidth === 0) return;

		const currentRatio = aspectRatios[activeIndex] || 16 / 9;
		const targetHeight = viewportWidth / currentRatio;

		if (height.get() === 0) {
			// Initial set instant to avoid jump
			height.set(targetHeight);
		} else {
			// Animate smoothly on change
			animate(height, targetHeight, springs.gentle);
		}
	}, [viewportWidth, activeIndex, aspectRatios, height]);

	// Slide Animation
	useEffect(() => {
		if (viewportWidth === 0) return;
		const targetX = -activeIndex * viewportWidth;
		animate(x, targetX, springs.layout);
	}, [activeIndex, x, viewportWidth]);

	// Notify parent of index change
	useEffect(() => {
		onIndexChange?.(activeIndex);
	}, [activeIndex, onIndexChange]);

	// Navigation functions (memoized to avoid dependency thrashing)
	const goToNext = useCallback(() => {
		setActiveIndex((prev) => Math.min(prev + 1, rawImages.length - 1));
	}, [rawImages.length]);

	const goToPrev = useCallback(() => {
		setActiveIndex((prev) => Math.max(prev - 1, 0));
	}, []);

	const goToIndex = useCallback(
		(index: number) => {
			setActiveIndex(Math.max(0, Math.min(index, rawImages.length - 1)));
		},
		[rawImages.length],
	);

	// Keyboard navigation
	useEffect(() => {
		if (!enableKeyboard) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Only capture if container is focused or hovered
			if (!containerRef.current?.matches(":hover, :focus-within")) return;

			if (e.key === "ArrowRight") {
				e.preventDefault();
				goToNext();
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				goToPrev();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [enableKeyboard, goToNext, goToPrev]);

	// Swipe handling
	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			const threshold = viewportWidth * 0.2;
			const velocity = info.velocity.x;

			if (info.offset.x < -threshold || velocity < -500) {
				goToNext();
			} else if (info.offset.x > threshold || velocity > 500) {
				goToPrev();
			} else {
				// Snap back if threshold not met
				const targetX = -activeIndex * viewportWidth;
				animate(x, targetX, springs.layout);
			}
		},
		[activeIndex, goToNext, goToPrev, x, viewportWidth],
	);

	if (rawImages.length === 0) return null;

	return (
		<motion.div
			ref={containerRef}
			className={cn(
				"group relative w-full overflow-hidden bg-surface-100 dark:bg-surface-900",
				// PERF: Layout Isolation
				// 'contain-content' ensures internal layout changes don't reflow the page
				// Note: 'contain: content' acts like overflow: hidden + optimizations
				"contain-content",
				className,
			)}
			style={{
				// PERF: Pixel-perfect height animation or fixed aspect fallback
				// If ratios vary, we animate height. If fixed, we set constant aspect-ratio.
				height: hasVaryingRatios ? height : undefined,
				aspectRatio: hasVaryingRatios ? undefined : `${aspectRatios[0]}`,
				// Fix border radius issues during animation clipping
				borderRadius: "var(--radius)",
			}}
		>
			{/* Slider Track - GPU Accelerated Layer */}
			<motion.div
				className="flex h-full will-change-transform" // PERF: Hint to browser to prioritize compositing
				style={{
					width: `${rawImages.length * 100}%`,
					x,
				}}
				drag={hasMultiple ? "x" : false}
				dragConstraints={{
					left: -(rawImages.length - 1) * viewportWidth,
					right: 0,
				}}
				dragElastic={0.1}
				onDragEnd={handleDragEnd}
			>
				{resolvedImages.map(({ src, isStatic }, i) => {
					// PERF: Smart Windowing
					// Only render image content if it's Active or Neighbor (±1)
					// We keep the container `div` for layout stability (flex-1), but empty content.
					// This drastically reduces DOM nodes and heavy image decoding for long galleries.
					const shouldRender = Math.abs(activeIndex - i) <= 1;

					const alt = alts?.[i] || `${altPrefix} ${i + 1}`;

					return (
						<div
							key={
								typeof rawImages[i] === "string"
									? rawImages[i]
									: (rawImages[i] as StaticImageData).src
							}
							className="relative h-full flex-1"
							aria-hidden={!shouldRender}
						>
							{shouldRender ? (
								<Image
									src={src}
									alt={alt}
									fill
									sizes={sizes}
									className={cn(
										"pointer-events-none select-none",
										// Use object-contain when adaptive (show full image)
										// Use object-cover when fixed (crop to container)
										hasVaryingRatios ? "object-contain" : "object-cover",
										imageClassName,
									)}
									placeholder={isStatic ? "blur" : "empty"}
									draggable={false}
									priority={prioritizeFirstImage && i === 0} // Only prioritize above-the-fold galleries.
									decoding="async"
									quality={quality}
								/>
							) : null}
						</div>
					);
				})}
			</motion.div>

			{/* CONTROLS LAYER */}
			{/* Navigation Arrows — Ghost style (minimal, no borders) */}
			{hasMultiple && showArrows && (
				<>
					{/* Left Arrow */}
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							goToPrev();
						}}
						disabled={activeIndex === 0}
						aria-label="Previous image"
						className={cn(
							"absolute top-1/2 left-4 z-20 -translate-y-1/2",
							"flex size-8 items-center justify-center",
							"text-white transition-opacity duration-200",
							"opacity-0 group-hover:opacity-100",
							"disabled:pointer-events-none disabled:opacity-0",
						)}
					>
						<CaretLeft size={20} weight="bold" />
					</button>

					{/* Right Arrow */}
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							goToNext();
						}}
						disabled={activeIndex === rawImages.length - 1}
						aria-label="Next image"
						className={cn(
							"absolute top-1/2 right-4 z-20 -translate-y-1/2",
							"flex size-8 items-center justify-center",
							"text-white transition-opacity duration-200",
							"opacity-0 group-hover:opacity-100",
							"disabled:pointer-events-none disabled:opacity-0",
						)}
					>
						<CaretRight size={20} weight="bold" />
					</button>
				</>
			)}

			{/* Scrim — Subtle gradient for control legibility on light images */}
			{hasMultiple && (showProgress || showCounter) && (
				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
					style={{
						background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
					}}
					aria-hidden="true"
				/>
			)}

			{/* Progress Indicators — Thin horizontal line segments (Swiss 2026) */}
			{hasMultiple && showProgress && (
				<div className="absolute inset-x-4 bottom-4 z-20 flex gap-1">
					{rawImages.map((src, i) => (
						<button
							key={`progress-${typeof src === "string" ? src : src.src}`}
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								goToIndex(i);
							}}
							aria-label={`Go to image ${i + 1}`}
							className={cn(
								"h-0.5 flex-1 transition-opacity duration-300",
								i === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/70",
							)}
						/>
					))}
				</div>
			)}

			{/* Counter Badge — Minimal, integrated */}
			{hasMultiple && showCounter && (
				<div className="absolute top-4 right-4 z-20 font-mono text-[10px] text-white tabular-nums">
					{activeIndex + 1}/{rawImages.length}
				</div>
			)}
		</motion.div>
	);
}
