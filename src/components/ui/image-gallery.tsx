/**
 * ImageGallery - Shared rich media gallery.
 *
 * @remarks
 * Supports image and Mux video tiles, always-visible controls, scroll-snap
 * navigation, and an optional expanded viewer for detail pages.
 *
 * @public
 */

"use client";

import { CaretLeft, CaretRight, Play } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GalleryLightbox } from "@/src/components/ui/gallery-lightbox";
import type { MuxVideoMetadata } from "@/src/content/types";
import { resolveAsset } from "@/src/lib/assets";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { cn } from "@/src/lib/index";

const PortfolioMuxVideo = dynamic(
	() =>
		import("@/src/components/ui/portfolio-mux-video").then(
			(module) => module.PortfolioMuxVideo,
		),
	{ ssr: false },
);

interface ImageGalleryProps {
	/** Rich gallery items. Preferred over legacy `images`. */
	items?: GalleryMediaSource[];
	/** Legacy array of image sources (strings or static imports). */
	images?: (string | StaticImageData)[];
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
	/** Allow opening the expanded lightbox viewer */
	expandable?: boolean;
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

type ResolvedGalleryItem =
	| {
			kind: "image";
			src: string | StaticImageData;
			alt: string;
			caption?: string;
	  }
	| {
			kind: "mux-video";
			playbackId: string;
			poster: string | StaticImageData;
			title?: string;
			alt: string;
			caption?: string;
			duration?: string;
			metadata?: MuxVideoMetadata;
	  };

const GALLERY_CONTROL_CLASS_NAME = cn(
	"flex h-10 items-center justify-center gap-2 rounded-none border-none bg-surface-950/70 px-3 text-white",
	"hover:bg-surface-950/80",
	"focus-visible:outline-none",
	"disabled:pointer-events-none disabled:opacity-35",
);

function parseAspectRatio(ratio: string): number {
	if (ratio.includes("/")) {
		const [w, h] = ratio.split("/").map(Number);
		return w / h;
	}
	return Number.parseFloat(ratio) || 16 / 9;
}

function getResolvedAspectRatio(item: ResolvedGalleryItem): number {
	const asset = item.kind === "image" ? item.src : item.poster;

	if (typeof asset !== "string" && asset.width && asset.height) {
		return asset.width / asset.height;
	}

	return 16 / 9;
}

function getGalleryItemKey(item: ResolvedGalleryItem): string {
	if (item.kind === "image") {
		return typeof item.src === "string" ? item.src : item.src.src;
	}

	return item.playbackId;
}

export function ImageGallery({
	items,
	images,
	alts,
	altPrefix = "Gallery image",
	aspectRatio = "auto",
	showArrows = true,
	showProgress = true,
	showCounter = false,
	enableKeyboard = true,
	expandable = false,
	className,
	imageClassName,
	onIndexChange,
	prioritizeFirstImage = true,
	sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw",
	quality = 75,
}: ImageGalleryProps) {
	const outerRef = useRef<HTMLElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const scrollFrameRef = useRef<number | null>(null);
	const activeIndexRef = useRef(0);
	const shouldReduceMotion = useReducedMotion();
	const [activeIndex, setActiveIndex] = useState(0);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [playingIndex, setPlayingIndex] = useState<number | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [isFocusedWithin, setIsFocusedWithin] = useState(false);
	const [isPointerInside, setIsPointerInside] = useState(false);
	const [viewportWidth, setViewportWidth] = useState(0);
	const [canHover, setCanHover] = useState(false);

	const galleryItems = useMemo<ResolvedGalleryItem[]>(() => {
		if (items?.length) {
			return items.map((item, index) => {
				if (item.kind === "image") {
					const src = typeof item.src === "string" ? resolveAsset(item.src) : item.src;
					return {
						kind: "image",
						src,
						alt: item.alt ?? alts?.[index] ?? `${altPrefix} ${index + 1}`,
						caption: item.caption,
					};
				}

				const poster =
					typeof item.poster === "string" ? resolveAsset(item.poster) : item.poster;

				return {
					kind: "mux-video",
					playbackId: item.playbackId,
					poster,
					title: item.title,
					alt: item.alt ?? item.title ?? alts?.[index] ?? `${altPrefix} ${index + 1}`,
					caption: item.caption,
					duration: item.duration,
					metadata: item.metadata,
				};
			});
		}

		return (images ?? []).map((rawImage, index) => ({
			kind: "image" as const,
			src: typeof rawImage === "string" ? resolveAsset(rawImage) : rawImage,
			alt: alts?.[index] ?? `${altPrefix} ${index + 1}`,
		}));
	}, [alts, altPrefix, images, items]);

	const hasMultiple = galleryItems.length > 1;

	const aspectRatios = useMemo(() => {
		if (Array.isArray(aspectRatio)) {
			return aspectRatio.map(parseAspectRatio);
		}

		if (aspectRatio === "auto") {
			return galleryItems.map(getResolvedAspectRatio);
		}

		const fixed = parseAspectRatio(aspectRatio);
		return galleryItems.map(() => fixed);
	}, [aspectRatio, galleryItems]);

	const hasVaryingRatios = useMemo(() => {
		const first = aspectRatios[0];
		return aspectRatios.some((ratio) => Math.abs(ratio - first) > 0.01);
	}, [aspectRatios]);
	const activeItem = galleryItems[activeIndex];
	const isActiveVideoPlaying = activeItem?.kind === "mux-video" && playingIndex === activeIndex;
	const chromeVisible = isFocusedWithin || (canHover && isPointerInside);

	const currentHeight =
		hasVaryingRatios && viewportWidth > 0
			? viewportWidth / (aspectRatios[activeIndex] ?? 16 / 9)
			: undefined;

	const goToIndex = useCallback(
		(index: number) => {
			const nextIndex = Math.max(0, Math.min(index, galleryItems.length - 1));
			const container = scrollContainerRef.current;
			const width = viewportWidth || container?.clientWidth || 0;

			setActiveIndex(nextIndex);

			if (container && width > 0) {
				container.scrollTo({
					left: nextIndex * width,
					behavior: shouldReduceMotion ? "auto" : "smooth",
				});
			}
		},
		[galleryItems.length, shouldReduceMotion, viewportWidth],
	);

	const goToNext = useCallback(() => {
		goToIndex(activeIndex + 1);
	}, [activeIndex, goToIndex]);

	const goToPrev = useCallback(() => {
		goToIndex(activeIndex - 1);
	}, [activeIndex, goToIndex]);

	useEffect(() => {
		onIndexChange?.(activeIndex);
	}, [activeIndex, onIndexChange]);

	useEffect(() => {
		activeIndexRef.current = activeIndex;
	}, [activeIndex]);

	useEffect(() => {
		if (playingIndex !== null && playingIndex !== activeIndex) {
			setPlayingIndex(null);
		}
	}, [activeIndex, playingIndex]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const syncCanHover = () => setCanHover(mediaQuery.matches);
		syncCanHover();
		mediaQuery.addEventListener("change", syncCanHover);
		return () => mediaQuery.removeEventListener("change", syncCanHover);
	}, []);

	useEffect(() => {
		if (!outerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setViewportWidth(entry.contentRect.width);
			}
		});

		observer.observe(outerRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container || viewportWidth === 0) return;

		container.scrollTo({
			left: activeIndexRef.current * viewportWidth,
			behavior: "auto",
		});
	}, [viewportWidth]);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			if (scrollFrameRef.current !== null) {
				window.cancelAnimationFrame(scrollFrameRef.current);
			}

			scrollFrameRef.current = window.requestAnimationFrame(() => {
				const width = container.clientWidth;
				if (width === 0) return;
				const nextIndex = Math.round(container.scrollLeft / width);
				setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
			});
		};

		container.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			container.removeEventListener("scroll", handleScroll);
			if (scrollFrameRef.current !== null) {
				window.cancelAnimationFrame(scrollFrameRef.current);
			}
		};
	}, []);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (!enableKeyboard) return;

			if (event.key === "ArrowRight") {
				event.preventDefault();
				goToNext();
				return;
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				goToPrev();
				return;
			}

			if ((event.key === "Enter" || event.key === " ") && expandable) {
				const currentItem = galleryItems[activeIndex];
				if (currentItem?.kind === "image") {
					event.preventDefault();
					setIsLightboxOpen(true);
				}
			}
		},
		[activeIndex, enableKeyboard, expandable, galleryItems, goToNext, goToPrev],
	);

	if (galleryItems.length === 0) return null;

	return (
		<>
			<section
				ref={outerRef}
				className={cn(
					"relative w-full overflow-hidden bg-surface-100 dark:bg-surface-900",
					"outline-none focus-visible:ring-2 focus-visible:ring-surface-900/15 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent dark:focus-visible:ring-surface-50/25",
					className,
				)}
				style={{
					aspectRatio: hasVaryingRatios ? undefined : `${aspectRatios[0] ?? 16 / 9}`,
					height: currentHeight,
					transition: shouldReduceMotion ? undefined : "height 280ms ease",
				}}
				tabIndex={enableKeyboard ? 0 : undefined}
				aria-roledescription="carousel"
				aria-label={altPrefix}
				onFocus={() => setIsFocusedWithin(true)}
				onBlur={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
						setIsFocusedWithin(false);
					}
				}}
				onKeyDown={handleKeyDown}
				onPointerEnter={() => setIsPointerInside(true)}
				onPointerLeave={() => setIsPointerInside(false)}
			>
				<div
					ref={scrollContainerRef}
					className={cn(
						"flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth",
						"[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
						hasMultiple && "cursor-grab active:cursor-grabbing",
					)}
					style={{
						scrollbarWidth: "none",
					}}
				>
					{galleryItems.map((item, index) => {
						const isHovered = canHover && hoveredIndex === index;
						const isPlayingInline = item.kind === "mux-video" && playingIndex === index;
						const isExpandableImage =
							expandable && item.kind === "image" && !isPlayingInline;

						const stageClassName = cn(
							"relative h-full overflow-hidden bg-surface-100 dark:bg-surface-950",
							item.kind === "image" && expandable && "cursor-zoom-in",
						);
						const stageContent = (
							<>
								<AnimatePresence mode="wait" initial={false}>
									{isPlayingInline ? (
										<motion.div
											key="portfolio-mux-video"
											className="absolute inset-0"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{
												duration: shouldReduceMotion ? 0 : 0.18,
											}}
										>
											<PortfolioMuxVideo
												playbackId={item.playbackId}
												poster={item.poster}
												metadata={item.metadata}
												autoPlay
												variant="gallery"
												className="h-full w-full"
												onExit={() => setPlayingIndex(null)}
											/>
										</motion.div>
									) : (
										<motion.div
											key="gallery-stage"
											className="absolute inset-0"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{
												duration: shouldReduceMotion ? 0 : 0.18,
											}}
										>
											<div
												className={cn(
													"absolute inset-0 transform-gpu transition-transform duration-650 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform motion-reduce:transition-none",
													isHovered && "scale-[1.03]",
												)}
											>
												{item.kind === "image" ? (
													<Image
														src={item.src}
														alt={item.alt}
														fill
														sizes={sizes}
														className={cn(
															hasVaryingRatios
																? "object-contain"
																: "object-cover",
															"pointer-events-none select-none",
															imageClassName,
														)}
														placeholder={
															typeof item.src === "string"
																? "empty"
																: "blur"
														}
														priority={
															prioritizeFirstImage && index === 0
														}
														decoding="async"
														draggable={false}
														quality={quality}
													/>
												) : (
													<Image
														src={item.poster}
														alt={item.alt}
														fill
														sizes={sizes}
														className={cn(
															hasVaryingRatios
																? "object-contain"
																: "object-cover",
															"pointer-events-none select-none",
															imageClassName,
														)}
														placeholder={
															typeof item.poster === "string"
																? "empty"
																: "blur"
														}
														priority={
															prioritizeFirstImage && index === 0
														}
														decoding="async"
														draggable={false}
														quality={quality}
													/>
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								{item.kind === "mux-video" && !isPlayingInline && (
									<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
										<motion.button
											type="button"
											className={cn(
												"flex h-11 items-center justify-center gap-3 rounded-none border-2 border-white bg-surface-950 px-6 text-white",
												"hover:bg-surface-900",
												"focus-visible:outline-none",
												"disabled:pointer-events-none disabled:opacity-35",
												"pointer-events-auto",
											)}
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setActiveIndex(index);
												setPlayingIndex(index);
											}}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.98 }}
											aria-label={
												item.duration
													? `Play video, duration ${item.duration}`
													: "Play video"
											}
										>
											<Play
												size={22}
												weight="fill"
												className="-translate-x-0.5"
											/>
											<span className="font-mono font-semibold text-sm uppercase tracking-[0.12em]">
												{item.duration
													? `Play · ${item.duration}`
													: "Play Demo"}
											</span>
										</motion.button>
									</div>
								)}
							</>
						);

						return (
							<div
								key={getGalleryItemKey(item)}
								className="relative h-full min-w-0 shrink-0 basis-full snap-center overflow-hidden"
							>
								{isExpandableImage ? (
									<button
										type="button"
										className={cn(
											stageClassName,
											"w-full border-0 p-0 text-left",
										)}
										onPointerEnter={() => setHoveredIndex(index)}
										onPointerLeave={() =>
											setHoveredIndex((current) =>
												current === index ? null : current,
											)
										}
										onClick={() => {
											setActiveIndex(index);
											setIsLightboxOpen(true);
										}}
										aria-label={`Open slide ${index + 1} in expanded viewer`}
									>
										{stageContent}
									</button>
								) : (
									<div
										className={stageClassName}
										onPointerEnter={() => setHoveredIndex(index)}
										onPointerLeave={() =>
											setHoveredIndex((current) =>
												current === index ? null : current,
											)
										}
									>
										{stageContent}
									</div>
								)}
							</div>
						);
					})}
				</div>

				{hasMultiple && showArrows && (
					<>
						<button
							type="button"
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								goToPrev();
							}}
							disabled={activeIndex === 0}
							aria-label="Previous slide"
							className={cn(
								GALLERY_CONTROL_CLASS_NAME,
								"pointer-events-none absolute top-1/2 left-4 z-30 -translate-y-1/2 opacity-0 transition-opacity disabled:opacity-0",
								chromeVisible &&
									!isActiveVideoPlaying &&
									"pointer-events-auto opacity-100",
							)}
						>
							<CaretLeft size={18} weight="bold" />
						</button>

						<button
							type="button"
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								goToNext();
							}}
							disabled={activeIndex === galleryItems.length - 1}
							aria-label="Next slide"
							className={cn(
								GALLERY_CONTROL_CLASS_NAME,
								"pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 opacity-0 transition-opacity disabled:opacity-0",
								chromeVisible &&
									!isActiveVideoPlaying &&
									"pointer-events-auto opacity-100",
							)}
						>
							<CaretRight size={18} weight="bold" />
						</button>
					</>
				)}

				{hasMultiple && showCounter && !isActiveVideoPlaying && (
					<div className="pointer-events-none absolute bottom-11 left-4 z-30">
						<div className={GALLERY_CONTROL_CLASS_NAME}>
							<span className="font-mono text-[10px] uppercase tabular-nums tracking-[0.22em]">
								{String(activeIndex + 1).padStart(2, "0")} /{" "}
								{String(galleryItems.length).padStart(2, "0")}
							</span>
						</div>
					</div>
				)}

				{hasMultiple && showProgress && !isActiveVideoPlaying && (
					<div className="absolute inset-x-4 bottom-4 z-30 flex gap-2">
						{galleryItems.map((item, index) => (
							<button
								key={`progress-${getGalleryItemKey(item)}`}
								type="button"
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									goToIndex(index);
								}}
								aria-label={`Go to slide ${index + 1}`}
								className={cn(
									"h-0.5 flex-1 transition-colors duration-200",
									index === activeIndex
										? "bg-surface-900 dark:bg-surface-50"
										: "bg-surface-900/18 hover:bg-surface-900/36 dark:bg-surface-50/22 dark:hover:bg-surface-50/42",
								)}
							/>
						))}
					</div>
				)}

				<div className="sr-only" aria-live="polite">
					Slide {activeIndex + 1} of {galleryItems.length}
				</div>
			</section>

			{expandable && (
				<GalleryLightbox
					activeIndex={activeIndex}
					items={galleryItems}
					onIndexChange={setActiveIndex}
					onOpenChange={setIsLightboxOpen}
					open={isLightboxOpen}
					quality={quality}
					sizes="95vw"
				/>
			)}
		</>
	);
}
