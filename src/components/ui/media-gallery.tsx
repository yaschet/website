/**
 * MediaGallery - Shared rich media gallery.
 *
 * @remarks
 * Supports image and Mux video tiles, always-visible controls, scroll-snap
 * navigation, and an optional expanded viewer for detail pages.
 *
 * @public
 */

"use client";

import { CaretLeft, CaretRight, Play } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	GALLERY_CHROME_BUTTON_CLASS_NAME,
	GALLERY_CHROME_COUNTER_CLASS_NAME,
	GALLERY_CHROME_ICON_SIZE,
	GALLERY_CHROME_META_CHIP_CLASS_NAME,
	GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME,
} from "@/src/components/ui/gallery-chrome";
import type { MuxVideoMetadata } from "@/src/content/types";
import { resolveAsset } from "@/src/lib/assets";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { cn, tweens } from "@/src/lib/index";
import { stopAllPortfolioVideos } from "@/src/lib/portfolio-video-sync";

const importPortfolioMuxVideo = () => import("@/src/components/ui/portfolio-mux-video");

const GalleryLightbox = dynamic(
	() => import("@/src/components/ui/gallery-lightbox").then((module) => module.GalleryLightbox),
	{ ssr: false },
);

const PortfolioMuxVideo = dynamic(
	() => importPortfolioMuxVideo().then((module) => module.PortfolioMuxVideo),
	{
		ssr: false,
		loading: () => <div className="absolute inset-0 bg-surface-950" aria-hidden="true" />,
	},
);

export interface MediaGalleryProps {
	/** Rich gallery items. Preferred over legacy `images`. */
	items?: GalleryMediaSource[];
	/** Legacy array of image sources (strings or static imports). */
	images?: (string | StaticImageData)[];
	/** Alt text for each gallery item (optional) */
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
	/** Additional class names applied to each rendered media poster/image */
	mediaClassName?: string;
	/** Custom sizes attribute for responsive optimization */
	sizes?: string;
	/** Image quality (1-100) */
	quality?: number;
	/** Callback when index changes */
	onIndexChange?: (index: number) => void;
	/** Preload the first image when the gallery is likely above the fold */
	prioritizeFirstImage?: boolean;
	/** Allow hover-triggered animated previews for Mux videos */
	enableHoverPreview?: boolean;
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

type NetworkInformationLike = {
	addEventListener?: (type: "change", listener: () => void) => void;
	removeEventListener?: (type: "change", listener: () => void) => void;
	effectiveType?: string;
	saveData?: boolean;
};

const GALLERY_PLAY_BUTTON_CLASS_NAME = cn(
	"pointer-events-auto inline-flex h-[var(--portfolio-control-default)] items-center justify-center px-[var(--portfolio-control-pad-default)]",
	"border border-white/12 bg-black/92 text-white backdrop-blur-md",
	"shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-[background-color,border-color,box-shadow] duration-150",
	"hover:border-white/18 hover:bg-black/84",
	"focus-visible:border-white/18 focus-visible:bg-black/84 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
	"disabled:pointer-events-none disabled:opacity-35",
);

const GALLERY_STAGE_INSET_CLASS_NAME =
	"[--gallery-stage-inset:var(--portfolio-control-pad-default)] [--gallery-progress-edge:var(--portfolio-space-tight)] [--gallery-progress-baseline:calc(var(--portfolio-space-tight)*0.8)]";

function getMuxAnimatedPreviewSrc(playbackId: string) {
	return `https://image.mux.com/${playbackId}/animated.webp?width=640&fps=15&start=0&end=4`;
}

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

export function MediaGallery({
	items,
	images,
	alts,
	altPrefix = "Gallery media",
	aspectRatio = "auto",
	showArrows = true,
	showProgress = true,
	showCounter = false,
	enableKeyboard = true,
	expandable = false,
	className,
	mediaClassName,
	onIndexChange,
	prioritizeFirstImage = true,
	enableHoverPreview = true,
	sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw",
	quality = 85,
}: MediaGalleryProps) {
	const outerRef = useRef<HTMLElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const scrollFrameRef = useRef<number | null>(null);
	const hoverPreviewTimeoutRef = useRef<number | null>(null);
	const touchChromeTimeoutRef = useRef<number | null>(null);
	const activeIndexRef = useRef(0);
	const shouldReduceMotion = useReducedMotion();
	const [activeIndex, setActiveIndex] = useState(0);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [hoverPreviewPlaybackId, setHoverPreviewPlaybackId] = useState<string | null>(null);
	const [visibleVideoId, setVisibleVideoId] = useState<string | null>(null);
	const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
	const [loadingInlineVideoId, setLoadingInlineVideoId] = useState<string | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [isFocusedWithin, setIsFocusedWithin] = useState(false);
	const [isPointerInside, setIsPointerInside] = useState(false);
	const [touchChromeVisible, setTouchChromeVisible] = useState(false);
	const [viewportWidth, setViewportWidth] = useState(0);
	const [canHover, setCanHover] = useState(false);
	const [allowHoverPreview, setAllowHoverPreview] = useState(enableHoverPreview);

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
	const galleryIdentity = useMemo(
		() => galleryItems.map(getGalleryItemKey).join("|"),
		[galleryItems],
	);

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
	const isActiveVideoVisible =
		activeItem?.kind === "mux-video" && visibleVideoId === activeItem.playbackId;
	const chromeVisible = isFocusedWithin || isPointerInside;
	const isTouchLayout = !canHover || viewportWidth < 768;
	const floatingChromeVisible =
		hasMultiple &&
		!isActiveVideoVisible &&
		(isTouchLayout ? touchChromeVisible : chromeVisible);
	const showStageArrows = hasMultiple && showArrows && !isActiveVideoVisible;
	const counterText = `${String(activeIndex + 1).padStart(2, "0")} / ${String(
		galleryItems.length,
	).padStart(2, "0")}`;

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
		void galleryIdentity;
		activeIndexRef.current = 0;
		setActiveIndex(0);
		setHoveredIndex(null);
		setHoverPreviewPlaybackId(null);
		setVisibleVideoId(null);
		setPlayingVideoId(null);
		setLoadingInlineVideoId(null);
		setIsLightboxOpen(false);
		setTouchChromeVisible(false);
	}, [galleryIdentity]);

	useEffect(() => {
		if (playingVideoId === null) return;
		if (activeItem?.kind !== "mux-video" || activeItem.playbackId !== playingVideoId) {
			setPlayingVideoId(null);
		}
	}, [activeItem, playingVideoId]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const syncCanHover = () => setCanHover(mediaQuery.matches);
		syncCanHover();
		mediaQuery.addEventListener("change", syncCanHover);
		return () => mediaQuery.removeEventListener("change", syncCanHover);
	}, []);

	useEffect(() => {
		if (typeof navigator === "undefined") {
			setAllowHoverPreview(enableHoverPreview);
			return;
		}

		const connection = (
			navigator as Navigator & { connection?: NetworkInformationLike }
		).connection;
		const syncHoverPreviewPolicy = () => {
			if (!enableHoverPreview) {
				setAllowHoverPreview(false);
				return;
			}

			const effectiveType = connection?.effectiveType;
			const saveData = connection?.saveData === true;
			const constrainedNetwork =
				saveData || effectiveType === "slow-2g" || effectiveType === "2g";

			setAllowHoverPreview(!constrainedNetwork);
		};

		syncHoverPreviewPolicy();
		connection?.addEventListener?.("change", syncHoverPreviewPolicy);

		return () => connection?.removeEventListener?.("change", syncHoverPreviewPolicy);
	}, [enableHoverPreview]);

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

	const clearHoverPreview = useCallback(() => {
		if (hoverPreviewTimeoutRef.current !== null) {
			window.clearTimeout(hoverPreviewTimeoutRef.current);
			hoverPreviewTimeoutRef.current = null;
		}
		setHoverPreviewPlaybackId(null);
	}, []);

	const armHoverPreview = useCallback(
		(item: ResolvedGalleryItem, index: number, isViewingInline: boolean) => {
			setHoveredIndex(index);

			if (
				typeof window === "undefined" ||
				!allowHoverPreview ||
				!canHover ||
				item.kind !== "mux-video" ||
				isViewingInline
			) {
				setHoverPreviewPlaybackId(null);
				return;
			}

			if (hoverPreviewTimeoutRef.current !== null) {
				window.clearTimeout(hoverPreviewTimeoutRef.current);
			}

			hoverPreviewTimeoutRef.current = window.setTimeout(() => {
				setHoverPreviewPlaybackId(item.playbackId);
				hoverPreviewTimeoutRef.current = null;
			}, 200);
		},
		[allowHoverPreview, canHover],
	);

	useEffect(() => {
		return () => {
			if (hoverPreviewTimeoutRef.current !== null) {
				window.clearTimeout(hoverPreviewTimeoutRef.current);
			}
			if (touchChromeTimeoutRef.current !== null) {
				window.clearTimeout(touchChromeTimeoutRef.current);
			}
		};
	}, []);

	const scheduleTouchChromeHide = useCallback(() => {
		if (typeof window === "undefined" || !isTouchLayout) return;
		if (touchChromeTimeoutRef.current !== null) {
			window.clearTimeout(touchChromeTimeoutRef.current);
		}
		touchChromeTimeoutRef.current = window.setTimeout(() => {
			setTouchChromeVisible(false);
			touchChromeTimeoutRef.current = null;
		}, 2000);
	}, [isTouchLayout]);

	const revealTouchChrome = useCallback(() => {
		if (!isTouchLayout || isActiveVideoVisible) return;
		setTouchChromeVisible(true);
		scheduleTouchChromeHide();
	}, [isActiveVideoVisible, isTouchLayout, scheduleTouchChromeHide]);

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
					"relative flex w-full flex-col overflow-hidden bg-surface-100 dark:bg-surface-900",
					"outline-none focus-visible:ring-2 focus-visible:ring-surface-900/15 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent dark:focus-visible:ring-surface-50/25",
					className,
				)}
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
				onPointerLeave={() => {
					setIsPointerInside(false);
					setHoveredIndex(null);
					clearHoverPreview();
				}}
				onPointerDownCapture={(event) => {
					if (event.pointerType !== "mouse") {
						revealTouchChrome();
					}
				}}
			>
				<div
					className={cn(
						"relative w-full overflow-hidden",
						GALLERY_STAGE_INSET_CLASS_NAME,
					)}
					style={{
						aspectRatio: hasVaryingRatios ? undefined : `${aspectRatios[0] ?? 16 / 9}`,
						height: currentHeight,
						transition: shouldReduceMotion ? undefined : "height 280ms ease",
					}}
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
							const isPlayingInline =
								item.kind === "mux-video" && playingVideoId === item.playbackId;
							const isViewingInline =
								item.kind === "mux-video" && visibleVideoId === item.playbackId;
							const shouldRenderInlineVideo =
								item.kind === "mux-video" && isViewingInline;
							const isLoadingInlineVideo =
								item.kind === "mux-video" &&
								loadingInlineVideoId === item.playbackId &&
								!isViewingInline;
							const isHoverPreviewActive =
								allowHoverPreview &&
								item.kind === "mux-video" &&
								hoverPreviewPlaybackId === item.playbackId &&
								!isViewingInline;
							const isExpandableImage = expandable && item.kind === "image";

							const stageClassName = cn(
								"relative h-full overflow-hidden bg-surface-100 dark:bg-surface-950",
								item.kind === "image" && expandable && "cursor-zoom-in",
							);
							const stageContent = (
								<>
									{shouldRenderInlineVideo && (
											<div
												className="absolute inset-0 z-0"
												style={{
													visibility:
														activeIndex === index
															? "visible"
															: "hidden",
													pointerEvents:
														activeIndex === index ? "auto" : "none",
												}}
											>
												<PortfolioMuxVideo
													playbackId={item.playbackId}
													poster={item.poster}
													metadata={item.metadata}
													active={isPlayingInline}
													variant="gallery"
													className="h-full w-full"
													onExit={() => {
														setVisibleVideoId((current) =>
															current === item.playbackId
																? null
																: current,
														);
														setPlayingVideoId((current) =>
															current === item.playbackId
																? null
																: current,
														);
													}}
													onPlayingChange={(playing) => {
														if (playing) {
															setVisibleVideoId(item.playbackId);
															setPlayingVideoId(item.playbackId);
															return;
														}

														setPlayingVideoId((current) =>
															current === item.playbackId
																? null
																: current,
														);
													}}
												/>
											</div>
										)}

									<motion.div
										className="absolute inset-0 z-10"
										animate={{
											opacity:
												item.kind === "mux-video" && isViewingInline
													? 0
													: 1,
										}}
										transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
										style={{
											pointerEvents:
												item.kind === "mux-video" && isViewingInline
													? "none"
													: "auto",
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
														mediaClassName,
													)}
													placeholder={
														typeof item.src === "string"
															? "empty"
															: "blur"
													}
													priority={prioritizeFirstImage && index === 0}
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
														mediaClassName,
													)}
													placeholder={
														typeof item.poster === "string"
															? "empty"
															: "blur"
													}
													priority={prioritizeFirstImage && index === 0}
													decoding="async"
													draggable={false}
													quality={quality}
												/>
											)}
										</div>

										{item.kind === "mux-video" && (
											<>
												<motion.div
													className="pointer-events-none absolute inset-0 z-10"
													initial={false}
													animate={{
														opacity: isHoverPreviewActive ? 1 : 0,
													}}
													transition={tweens.interaction}
													aria-hidden={!isHoverPreviewActive}
												>
													<Image
														src={getMuxAnimatedPreviewSrc(
															item.playbackId,
														)}
														alt=""
														fill
														unoptimized
														sizes={sizes}
														className={cn(
															hasVaryingRatios
																? "object-contain"
																: "object-cover",
															"pointer-events-none select-none",
															mediaClassName,
														)}
														loading="lazy"
														decoding="async"
														aria-hidden="true"
													/>
												</motion.div>
												<div
													className="pointer-events-none absolute inset-0 z-20"
													style={{
														background:
															"radial-gradient(circle at center, rgb(0 0 0 / 0) 36%, rgb(0 0 0 / 0.14) 100%)",
													}}
													aria-hidden
												/>
											</>
										)}

										{item.kind === "mux-video" && (
											<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-[var(--gallery-stage-inset)]">
												<motion.button
													type="button"
													initial="idle"
													whileHover="hover"
													whileTap="tap"
													variants={{
														idle: { scale: 1 },
														hover: { scale: 1.05 },
														tap: { scale: 0.92 },
													}}
													transition={tweens.interaction}
													className={cn(
														GALLERY_PLAY_BUTTON_CLASS_NAME,
														isHoverPreviewActive &&
															"border-white/20 bg-black/88",
													)}
													onClick={(event) => {
														event.preventDefault();
														event.stopPropagation();
														clearHoverPreview();
														setLoadingInlineVideoId(item.playbackId);
														void importPortfolioMuxVideo()
															.then(() => {
																stopAllPortfolioVideos();
																setActiveIndex(index);
																setVisibleVideoId(item.playbackId);
																setPlayingVideoId(
																	item.playbackId,
																);
															})
															.finally(() => {
																setLoadingInlineVideoId(
																	(current) =>
																		current === item.playbackId
																			? null
																			: current,
																);
															});
													}}
													disabled={isLoadingInlineVideo}
													aria-label={
														item.duration
															? `Play video, duration ${item.duration}`
															: "Play video"
													}
												>
													<span className="inline-grid grid-cols-[14px_auto] items-center gap-x-2">
														<span className="flex w-[14px] items-center justify-center">
															{isLoadingInlineVideo ? (
																<span
																	className="size-[14px] animate-spin rounded-full border border-white/30 border-t-white"
																	aria-hidden="true"
																/>
															) : (
																<Play size={14} weight="fill" />
															)}
														</span>
														<span className="inline-flex items-baseline gap-x-2">
															<span className="portfolio-control-label">
																{isLoadingInlineVideo
																	? "Loading"
																	: "Play"}
															</span>
															{item.duration ? (
																<>
																	<span
																		aria-hidden
																		className="h-3 w-px self-center bg-white/16"
																	/>
																	<span className="portfolio-chip-label text-white/72 tabular-nums">
																		{item.duration}
																	</span>
																</>
															) : null}
														</span>
													</span>
												</motion.button>
											</div>
										)}
									</motion.div>
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
											onPointerEnter={() =>
												armHoverPreview(item, index, isViewingInline)
											}
											onPointerLeave={() => {
												setHoveredIndex((current) =>
													current === index ? null : current,
												);
												clearHoverPreview();
											}}
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
											onPointerEnter={() =>
												armHoverPreview(item, index, isViewingInline)
											}
											onPointerLeave={() => {
												setHoveredIndex((current) =>
													current === index ? null : current,
												);
												clearHoverPreview();
											}}
										>
											{stageContent}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{showStageArrows && (
						<>
							{activeIndex > 0 ? (
								<motion.button
									type="button"
									initial="idle"
									whileHover="hover"
									whileTap="tap"
									variants={{
										idle: { scale: 1 },
										hover: { scale: 1.04 },
										tap: { scale: 0.96 },
									}}
									transition={tweens.interaction}
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										goToPrev();
									}}
									aria-label="Previous slide"
									className={cn(
										GALLERY_CHROME_BUTTON_CLASS_NAME,
										isTouchLayout && GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME,
										"absolute top-1/2 left-[var(--gallery-stage-inset)] z-30 -translate-y-1/2 transition-opacity",
										floatingChromeVisible
											? "pointer-events-auto opacity-100"
											: "pointer-events-none opacity-0",
									)}
								>
									<CaretLeft size={GALLERY_CHROME_ICON_SIZE} weight="bold" />
								</motion.button>
							) : null}

							{activeIndex < galleryItems.length - 1 ? (
								<motion.button
									type="button"
									initial="idle"
									whileHover="hover"
									whileTap="tap"
									variants={{
										idle: { scale: 1 },
										hover: { scale: 1.04 },
										tap: { scale: 0.96 },
									}}
									transition={tweens.interaction}
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										goToNext();
									}}
									aria-label="Next slide"
									className={cn(
										GALLERY_CHROME_BUTTON_CLASS_NAME,
										isTouchLayout && GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME,
										"absolute top-1/2 right-[var(--gallery-stage-inset)] z-30 -translate-y-1/2 transition-opacity",
										floatingChromeVisible
											? "pointer-events-auto opacity-100"
											: "pointer-events-none opacity-0",
									)}
								>
									<CaretRight size={GALLERY_CHROME_ICON_SIZE} weight="bold" />
								</motion.button>
							) : null}
						</>
					)}
					{hasMultiple && showCounter && !isActiveVideoVisible && (
						<div className="pointer-events-none absolute top-[var(--gallery-stage-inset)] left-[var(--gallery-stage-inset)] z-30">
							<div
								className={cn(
									GALLERY_CHROME_META_CHIP_CLASS_NAME,
									GALLERY_CHROME_COUNTER_CLASS_NAME,
								)}
							>
								{counterText}
							</div>
						</div>
					)}

					{hasMultiple && showProgress && !isActiveVideoVisible && (
						<>
							<div
								aria-hidden
								className={cn(
									"pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 transition-opacity duration-200",
									floatingChromeVisible ? "opacity-100" : "opacity-0",
								)}
								style={{
									background:
										"linear-gradient(to top, rgb(255 255 255 / 0.18) 0%, rgb(255 255 255 / 0.1) 22%, rgb(255 255 255 / 0.04) 46%, rgb(255 255 255 / 0.01) 68%, rgb(255 255 255 / 0) 100%)",
								}}
							/>
							<div
								className={cn(
									"pointer-events-none absolute right-[var(--gallery-progress-edge)] bottom-0 left-[var(--gallery-progress-edge)] z-30 flex h-14 items-stretch transition-opacity duration-200",
									isTouchLayout && "h-16",
									floatingChromeVisible ? "opacity-100" : "opacity-0",
								)}
							>
								{galleryItems.map((item, index) => (
									<button
										key={`progress-${getGalleryItemKey(item)}`}
										type="button"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											revealTouchChrome();
											goToIndex(index);
										}}
										aria-label={`Go to slide ${index + 1}`}
										aria-current={index === activeIndex}
										className={cn(
											"group relative flex h-full flex-1 items-end justify-center overflow-hidden px-1",
											floatingChromeVisible
												? "pointer-events-auto"
												: "pointer-events-none",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-950/20 focus-visible:ring-inset",
										)}
									>
										<span
											aria-hidden
											className={cn(
												"pointer-events-none absolute inset-x-[3px] bottom-0 h-full transition-opacity duration-150",
												"bg-[linear-gradient(to_top,rgb(255_255_255_/_0.26)_0%,rgb(255_255_255_/_0.12)_22%,rgb(255_255_255_/_0.05)_48%,rgb(255_255_255_/_0)_100%)]",
												index === activeIndex
													? "opacity-[0.48]"
													: "opacity-[0.12] group-hover:opacity-[0.24] group-active:opacity-[0.3]",
											)}
										/>
										<span
											className={cn(
												"relative z-10 mb-[calc(var(--gallery-progress-baseline)+4px)] block h-1 w-full rounded-none transition-[background-color,box-shadow,opacity] duration-150",
												index === activeIndex
													? "bg-black shadow-[0_6px_14px_rgba(0,0,0,0.14)]"
													: "bg-black/18 shadow-[0_4px_10px_rgba(0,0,0,0.08)] group-hover:bg-black/24 group-active:bg-black/28",
											)}
										/>
									</button>
								))}
							</div>
						</>
					)}
				</div>

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
