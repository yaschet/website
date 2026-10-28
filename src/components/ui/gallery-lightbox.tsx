"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
	RiArrowLeftSLine as CaretLeft,
	RiArrowRightSLine as CaretRight,
	RiZoomOutLine as MagnifyingGlassMinus,
	RiZoomInLine as MagnifyingGlassPlus,
	RiCloseLine as X,
} from "@remixicon/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	GALLERY_CHROME_BUTTON_CLASS_NAME,
	GALLERY_CHROME_COUNTER_CLASS_NAME,
	GALLERY_CHROME_ICON_SIZE,
	GALLERY_CHROME_META_CHIP_CLASS_NAME,
	GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME,
} from "@/src/components/ui/gallery-chrome";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { cn } from "@/src/lib/index";
import { stopAllPortfolioVideos } from "@/src/lib/portfolio-video-sync";
import { ZoomableGalleryImage, type ZoomableImageHandle } from "./zoomable-gallery-image";

const PortfolioMuxVideo = dynamic(
	() =>
		import("@/src/components/ui/portfolio-mux-video").then(
			(module) => module.PortfolioMuxVideo,
		),
	{ ssr: false },
);

interface GalleryLightboxProps {
	activeIndex: number;
	items: GalleryMediaSource[];
	onIndexChange: (index: number) => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	quality: number;
	returnFocusRef?: RefObject<HTMLElement | null>;
	sizes: string;
}

export function GalleryLightbox({
	activeIndex,
	items,
	onIndexChange,
	onOpenChange,
	open,
	quality,
	returnFocusRef,
	sizes,
}: GalleryLightboxProps) {
	const zoomableRef = useRef<ZoomableImageHandle>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const openerRef = useRef<HTMLElement | null>(null);
	const shouldReduceMotion = useReducedMotion();
	const [canHover, setCanHover] = useState(false);
	const [viewportWidth, setViewportWidth] = useState(0);
	const currentItem = items[activeIndex];
	const currentCaption = currentItem?.caption;
	const slideLabel = `${String(activeIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
	const hasMultiple = items.length > 1;

	const canGoNext = activeIndex < items.length - 1;
	const canGoPrev = activeIndex > 0;
	const isTouchLayout = !canHover || viewportWidth < 768;
	const lightboxButtonClassName = cn(
		GALLERY_CHROME_BUTTON_CLASS_NAME,
		isTouchLayout && GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME,
	);

	useEffect(() => {
		if (!open || currentItem?.kind !== "mux-video") return;
		stopAllPortfolioVideos();
	}, [currentItem, open]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const syncCanHover = () => setCanHover(mediaQuery.matches);
		const syncViewportWidth = () => setViewportWidth(window.innerWidth);
		syncCanHover();
		syncViewportWidth();
		mediaQuery.addEventListener("change", syncCanHover);
		window.addEventListener("resize", syncViewportWidth);
		return () => {
			mediaQuery.removeEventListener("change", syncCanHover);
			window.removeEventListener("resize", syncViewportWidth);
		};
	}, []);

	const goToIndex = useCallback(
		(index: number) => {
			const nextIndex = Math.min(items.length - 1, Math.max(0, index));
			zoomableRef.current?.reset();
			onIndexChange(nextIndex);
		},
		[items.length, onIndexChange],
	);

	const handleKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLDivElement>) => {
			if (!open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
				return;
			// Media controls and nested menus own their keys, including slider arrows.
			if (
				event.target instanceof Element &&
				event.target.closest(
					"[data-portfolio-video], [data-player-interactive], input, textarea, select, [contenteditable=true], [role=menu], [role=slider]",
				)
			)
				return;

			if (event.key === "Home") {
				event.preventDefault();
				goToIndex(0);
				return;
			}

			if (event.key === "End") {
				event.preventDefault();
				goToIndex(items.length - 1);
				return;
			}

			if (event.key === "+" || event.key === "=") {
				event.preventDefault();
				zoomableRef.current?.zoomIn();
				return;
			}

			if (event.key === "-" || event.key === "_") {
				event.preventDefault();
				zoomableRef.current?.zoomOut();
				return;
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				if (zoomableRef.current?.isZoomed()) {
					zoomableRef.current.panBy(48, 0);
				} else if (canGoPrev) {
					goToIndex(activeIndex - 1);
				}
				return;
			}

			if (event.key === "ArrowRight") {
				event.preventDefault();
				if (zoomableRef.current?.isZoomed()) {
					zoomableRef.current.panBy(-48, 0);
				} else if (canGoNext) {
					goToIndex(activeIndex + 1);
				}
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				zoomableRef.current?.panBy(0, 48);
				return;
			}

			if (event.key === "ArrowDown") {
				event.preventDefault();
				zoomableRef.current?.panBy(0, -48);
			}
		},
		[activeIndex, canGoNext, canGoPrev, goToIndex, items.length, open],
	);

	const mediaTitle = useMemo(() => {
		if (!currentItem) return "Expanded gallery media";
		if (currentItem.kind === "mux-video") {
			return currentItem.title ?? currentItem.alt ?? "Expanded gallery video";
		}

		return currentItem.alt ?? "Expanded gallery image";
	}, [currentItem]);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-surface-950" />
				<DialogPrimitive.Content
					ref={contentRef}
					className="fixed inset-0 z-[81] outline-none"
					onKeyDown={handleKeyDown}
					onEscapeKeyDown={(event) => {
						// Radix listens in capture; let the nested Base UI menu handle this key first.
						if (
							contentRef.current?.querySelector(
								'[data-slot="dropdown-menu-content"]:not([data-closed])',
							)
						) {
							event.preventDefault();
							return;
						}
						// Escape exits the active fullscreen surface before dismissing its dialog.
						if (document.fullscreenElement) {
							event.preventDefault();
							void document.exitFullscreen().catch(() => {});
						}
					}}
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						openerRef.current =
							document.activeElement instanceof HTMLElement
								? document.activeElement
								: null;
						closeButtonRef.current?.focus({ preventScroll: true });
					}}
					onCloseAutoFocus={(event) => {
						const target = returnFocusRef?.current ?? openerRef.current;
						if (target?.isConnected) {
							event.preventDefault();
							target.focus({ preventScroll: true });
						}
					}}
				>
					<DialogPrimitive.Title className="sr-only">{mediaTitle}</DialogPrimitive.Title>
					<DialogPrimitive.Description className="sr-only">
						Expanded media viewer. Use the arrow keys to change images, plus and minus
						to zoom, and Escape to close.
					</DialogPrimitive.Description>
					<p role="status" className="sr-only">
						Slide {activeIndex + 1} of {items.length}: {mediaTitle}
					</p>

					<div className="relative flex h-full w-full flex-col px-4 py-4 sm:px-6 sm:py-6">
						<div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-start justify-end gap-2 sm:inset-x-10 sm:top-6">
							<div className="pointer-events-auto flex items-center gap-2">
								{!isTouchLayout && currentItem?.kind === "image" && (
									<>
										<button
											type="button"
											className={lightboxButtonClassName}
											onClick={() => zoomableRef.current?.zoomOut()}
											aria-label="Zoom out"
										>
											<MagnifyingGlassMinus size={GALLERY_CHROME_ICON_SIZE} />
										</button>
										<button
											type="button"
											className={lightboxButtonClassName}
											onClick={() => zoomableRef.current?.zoomIn()}
											aria-label="Zoom in"
										>
											<MagnifyingGlassPlus size={GALLERY_CHROME_ICON_SIZE} />
										</button>
									</>
								)}

								<button
									type="button"
									className={lightboxButtonClassName}
									onClick={() => onOpenChange(false)}
									aria-label="Close expanded viewer"
									ref={closeButtonRef}
								>
									<X size={GALLERY_CHROME_ICON_SIZE} />
								</button>
							</div>
						</div>

						<div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden pt-16 pb-16 sm:pt-20 sm:pb-20">
							{hasMultiple && (
								<>
									<button
										type="button"
										className={cn(
											lightboxButtonClassName,
											"absolute top-1/2 left-4 z-20 -translate-y-1/2 sm:left-10",
										)}
										onClick={() => goToIndex(activeIndex - 1)}
										disabled={!canGoPrev}
										aria-label="Previous slide"
									>
										<CaretLeft size={GALLERY_CHROME_ICON_SIZE} />
									</button>

									<button
										type="button"
										className={cn(
											lightboxButtonClassName,
											"absolute top-1/2 right-4 z-20 -translate-y-1/2 sm:right-10",
										)}
										onClick={() => goToIndex(activeIndex + 1)}
										disabled={!canGoNext}
										aria-label="Next slide"
									>
										<CaretRight size={GALLERY_CHROME_ICON_SIZE} />
									</button>
								</>
							)}

							<AnimatePresence mode="wait">
								{currentItem ? (
									<motion.div
										key={`${currentItem.kind}-${activeIndex}`}
										className="relative mx-auto h-full max-h-full w-full max-w-[min(92vw,1400px)]"
										initial={{
											opacity: 0,
										}}
										animate={{ opacity: 1 }}
										exit={{
											opacity: 0,
										}}
										transition={{
											duration: shouldReduceMotion ? 0 : 0.2,
										}}
									>
										{currentItem.kind === "image" ? (
											<ZoomableGalleryImage
												ref={zoomableRef}
												alt={currentItem.alt ?? `Slide ${activeIndex + 1}`}
												quality={quality}
												sizes={sizes}
												src={currentItem.src}
											/>
										) : (
											<div className="relative h-full w-full">
												<PortfolioMuxVideo
													key={`lightbox-player-${currentItem.playbackId}`}
													playbackId={currentItem.playbackId}
													poster={currentItem.poster}
													metadata={currentItem.metadata}
													active
													variant="lightbox"
													className="h-full w-full"
												/>
											</div>
										)}
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>

						<div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-col items-center gap-3 sm:inset-x-10 sm:bottom-6">
							{hasMultiple ? (
								<div
									className={cn(
										GALLERY_CHROME_META_CHIP_CLASS_NAME,
										GALLERY_CHROME_COUNTER_CLASS_NAME,
										"pointer-events-auto",
									)}
								>
									{slideLabel}
								</div>
							) : null}

							{currentCaption ? (
								<div className="pointer-events-auto max-w-[min(44rem,100%)] px-4 text-center font-sans text-sm text-surface-300 leading-relaxed">
									{currentCaption}
								</div>
							) : null}
						</div>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
