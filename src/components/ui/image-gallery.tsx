/**
 * ImageGallery - Shared gallery primitive.
 *
 * @remarks
 * Reusable gallery component with intentional navigation:
 * - Click arrows or swipe to navigate
 * - Spring physics for slide transitions
 * - Always-visible dot indicators
 * - Touch/swipe support for mobile
 * - Keyboard navigation (arrow keys)
 *
 * Used by: MonolithCard, ProjectContent, MediaGallery
 *
 * @example
 * ```tsx
 * <ImageGallery
 *   images={["/img1.jpg", "/img2.jpg"]}
 *   aspectRatio="16/9"
 * />
 * ```
 *
 * @public
 */

"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { animate, motion, type PanInfo, useMotionValue } from "framer-motion";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { resolveAsset } from "@/src/lib/assets";
import { cn, springs } from "@/src/lib/index";

interface ImageGalleryProps {
	/** Array of image sources (strings or static imports) */
	images: (string | StaticImageData)[];
	/** Alt text for each image (optional) */
	alts?: string[];
	/** Default alt prefix if alts not provided */
	altPrefix?: string;
	/** Aspect ratio (e.g., "16/9", "4/3", "1/1") */
	aspectRatio?: string;
	/** Show navigation arrows */
	showArrows?: boolean;
	/** Show dot indicators */
	showDots?: boolean;
	/** Show counter badge */
	showCounter?: boolean;
	/** Enable keyboard navigation */
	enableKeyboard?: boolean;
	/** Additional class names */
	className?: string;
	/** Arrow size variant */
	arrowSize?: "sm" | "md";
	/** Callback when index changes */
	onIndexChange?: (index: number) => void;
}

export function ImageGallery({
	images: rawImages,
	alts,
	altPrefix = "Gallery image",
	aspectRatio = "16/9",
	showArrows = true,
	showDots = true,
	showCounter = false,
	enableKeyboard = true,
	arrowSize = "md",
	className,
	onIndexChange,
}: ImageGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasMultiple = rawImages.length > 1;

	// Animation
	const x = useMotionValue(0);
	const containerWidth = useRef(0);

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

	// Animate to current index
	useEffect(() => {
		const targetX = -activeIndex * containerWidth.current;
		animate(x, targetX, springs.layout);
	}, [activeIndex, x]);

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

	if (rawImages.length === 0) return null;

	// Arrow button classes
	const arrowClasses = cn(
		"absolute top-1/2 z-20 -translate-y-1/2",
		"flex items-center justify-center",
		"border border-surface-200 bg-white/95 dark:border-surface-700 dark:bg-surface-900/95",
		"text-surface-900 dark:text-surface-100",
		"opacity-0 transition-all duration-200 group-hover:opacity-100",
		"hover:bg-surface-100 dark:hover:bg-surface-800",
		"disabled:pointer-events-none disabled:opacity-0",
		arrowSize === "sm" ? "size-8" : "size-10",
	);

	return (
		<div
			ref={containerRef}
			className={cn(
				"group relative w-full overflow-hidden",
				"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900",
				className,
			)}
			style={{ aspectRatio }}
		>
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
				{rawImages.map((rawSrc, i) => {
					const src = typeof rawSrc === "string" ? resolveAsset(rawSrc) : rawSrc;
					const isStatic = typeof src !== "string";
					const alt = alts?.[i] || `${altPrefix} ${i + 1}`;

					return (
						<div
							key={typeof rawSrc === "string" ? rawSrc : rawSrc.src}
							className="relative h-full flex-1"
						>
							<Image
								src={src}
								alt={alt}
								fill
								sizes="(max-width: 768px) 100vw, 768px"
								className="pointer-events-none select-none object-cover"
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
						className={cn(arrowClasses, "left-3")}
					>
						<CaretLeft size={arrowSize === "sm" ? 14 : 18} weight="bold" />
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
						className={cn(arrowClasses, "right-3")}
					>
						<CaretRight size={arrowSize === "sm" ? 14 : 18} weight="bold" />
					</button>
				</>
			)}

			{/* Dot Indicators */}
			{hasMultiple && showDots && (
				<div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
					{rawImages.map((src, i) => (
						<button
							key={`dot-${typeof src === "string" ? src : src.src}`}
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								goToIndex(i);
							}}
							aria-label={`Go to image ${i + 1}`}
							className={cn(
								"size-2 transition-all duration-200",
								"border border-white/50",
								i === activeIndex
									? "scale-100 bg-white"
									: "scale-75 bg-white/40 hover:scale-90 hover:bg-white/60",
							)}
						/>
					))}
				</div>
			)}

			{/* Counter Badge */}
			{hasMultiple && showCounter && (
				<div className="absolute top-3 right-3 border border-surface-200 bg-white/95 px-2 py-1 font-mono text-[10px] text-surface-900 dark:border-surface-700 dark:bg-surface-900/95 dark:text-surface-100">
					{String(activeIndex + 1).padStart(2, "0")} /{" "}
					{String(rawImages.length).padStart(2, "0")}
				</div>
			)}
		</div>
	);
}
