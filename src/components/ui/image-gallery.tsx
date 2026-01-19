/**
 * ImageGallery - Shared gallery primitive.
 *
 * @remarks
 * Reusable gallery component with intentional navigation.
 *
 * 2026 Swiss Design controls:
 * - Thin horizontal line segments (not dots)
 * - Ghost arrows (minimal, no borders)
 * - Opacity-only animations (no scale transforms)
 *
 * Adaptive Aspect Ratio (Dynamic Island approach):
 * - Container morphs to each image's native ratio
 * - Spring physics for smooth transitions
 * - Variation becomes choreography, not limitation
 *
 * Used by: MonolithCard, ProjectContent, MediaGallery
 *
 * @example
 * ```tsx
 * <ImageGallery
 *   images={["/img1.jpg", "/img2.jpg"]}
 *   // Or with explicit ratios:
 *   aspectRatios={["16/9", "3/4", "1/1"]}
 * />
 * ```
 *
 * @public
 */

"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { animate, motion, type PanInfo, useMotionValue, useTransform } from "framer-motion";
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
	/** Callback when index changes */
	onIndexChange?: (index: number) => void;
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
	onIndexChange,
}: ImageGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasMultiple = rawImages.length > 1;

	// Resolve all images and compute per-image aspect ratios
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

	// Current aspect ratio (animated)
	const currentRatio = aspectRatios[activeIndex] || 16 / 9;

	// Animation
	const x = useMotionValue(0);
	const animatedRatio = useMotionValue(currentRatio);
	const containerWidth = useRef(0);

	// Check if we have varying ratios (enables adaptive mode)
	const hasVaryingRatios = useMemo(() => {
		const first = aspectRatios[0];
		return aspectRatios.some((r) => Math.abs(r - first) > 0.01);
	}, [aspectRatios]);

	// Update container width on mount/resize
	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				containerWidth.current = containerRef.current.offsetWidth;
			}
		};
		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	// Animate position and aspect ratio on index change
	useEffect(() => {
		const targetX = -activeIndex * containerWidth.current;
		animate(x, targetX, springs.layout);

		// Animate aspect ratio change (the "Dynamic Island" effect)
		if (hasVaryingRatios) {
			animate(animatedRatio, aspectRatios[activeIndex], springs.gentle);
		}
	}, [activeIndex, x, animatedRatio, aspectRatios, hasVaryingRatios]);

	// Notify parent of index change
	useEffect(() => {
		onIndexChange?.(activeIndex);
	}, [activeIndex, onIndexChange]);

	// Navigation functions
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

	// Drag/swipe handling
	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			const threshold = containerWidth.current * 0.2;
			const velocity = info.velocity.x;

			if (info.offset.x < -threshold || velocity < -500) {
				goToNext();
			} else if (info.offset.x > threshold || velocity > 500) {
				goToPrev();
			} else {
				const targetX = -activeIndex * containerWidth.current;
				animate(x, targetX, springs.layout);
			}
		},
		[activeIndex, goToNext, goToPrev, x],
	);

	// Transform animated ratio to CSS paddingBottom percentage (for fluid height)
	const paddingBottom = useTransform(animatedRatio, (r) => `${(1 / r) * 100}%`);

	if (rawImages.length === 0) return null;

	return (
		<motion.div
			ref={containerRef}
			className={cn(
				"group relative w-full overflow-hidden",
				"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900",
				className,
			)}
			// Use paddingBottom trick for fluid aspect ratio animation
			style={hasVaryingRatios ? { paddingBottom } : { aspectRatio: currentRatio }}
		>
			{/* Inner container for absolute positioning when using padding trick */}
			<div className={hasVaryingRatios ? "absolute inset-0" : "relative h-full"}>
				{/* Gallery Strip - Draggable */}
				<motion.div
					className="flex h-full cursor-grab active:cursor-grabbing"
					style={{
						width: `${rawImages.length * 100}%`,
						x,
					}}
					drag={hasMultiple ? "x" : false}
					dragConstraints={{
						left: -(rawImages.length - 1) * (containerWidth.current || 0),
						right: 0,
					}}
					dragElastic={0.1}
					onDragEnd={handleDragEnd}
				>
					{resolvedImages.map(({ src, isStatic }, i) => {
						const alt = alts?.[i] || `${altPrefix} ${i + 1}`;

						return (
							<div
								key={
									typeof rawImages[i] === "string"
										? rawImages[i]
										: (rawImages[i] as StaticImageData).src
								}
								className="relative h-full flex-1"
							>
								<Image
									src={src}
									alt={alt}
									fill
									sizes="(max-width: 768px) 100vw, 768px"
									className={cn(
										"pointer-events-none select-none",
										// Use object-contain when adaptive, object-cover when fixed
										hasVaryingRatios ? "object-contain" : "object-cover",
									)}
									placeholder={isStatic ? "blur" : "empty"}
									draggable={false}
									priority={i === 0}
								/>
							</div>
						);
					})}
				</motion.div>

				{/* Navigation Arrows */}
				{hasMultiple && showArrows && (
					<>
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

				{/* Scrim — Subtle gradient for control legibility */}
				{hasMultiple && (showProgress || showCounter) && (
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
						style={{
							background:
								"linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
						}}
						aria-hidden="true"
					/>
				)}

				{/* Progress Indicators */}
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
									i === activeIndex
										? "bg-white"
										: "bg-white/40 hover:bg-white/70",
								)}
							/>
						))}
					</div>
				)}

				{/* Counter Badge */}
				{hasMultiple && showCounter && (
					<div className="absolute top-4 right-4 z-20 font-mono text-[10px] text-white tabular-nums">
						{activeIndex + 1}/{rawImages.length}
					</div>
				)}
			</div>
		</motion.div>
	);
}
