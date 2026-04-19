"use client";

import MuxPlayer from "@mux/mux-player-react";
import {
	CaretLeft,
	CaretRight,
	MagnifyingGlassMinus,
	MagnifyingGlassPlus,
	X,
} from "@phosphor-icons/react/dist/ssr";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import {
	forwardRef,
	type PointerEvent as ReactPointerEvent,
	type TouchEvent as ReactTouchEvent,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { cn } from "@/src/lib/index";
import { muxPlayerClassName, muxPlayerPresentationStyle } from "@/src/lib/mux-player-presentation";

const LIGHTBOX_CONTROL_CLASS_NAME = cn(
	"flex h-11 min-w-11 items-center justify-center gap-2 px-3",
	"border border-surface-700/45 bg-surface-950/68 text-surface-50 backdrop-blur-sm",
	"transition-[background-color,border-color,color,opacity] duration-200 hover:bg-surface-950/82 hover:text-surface-50",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/18 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
	"disabled:pointer-events-none disabled:opacity-35",
);

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function getTouchDistance(
	first: { clientX: number; clientY: number },
	second: { clientX: number; clientY: number },
) {
	return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

type ZoomState = {
	scale: number;
	x: number;
	y: number;
};

type ZoomableImageHandle = {
	isZoomed: () => boolean;
	panBy: (x: number, y: number) => void;
	reset: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
};

function getLightboxItemKey(item: GalleryMediaSource): string {
	if (item.kind === "image") {
		return typeof item.src === "string" ? item.src : item.src.src;
	}

	return item.playbackId;
}

interface ZoomableGalleryImageProps {
	alt: string;
	quality: number;
	sizes: string;
	src: string | StaticImageData;
}

const ZoomableGalleryImage = forwardRef<ZoomableImageHandle, ZoomableGalleryImageProps>(
	function ZoomableGalleryImage({ alt, quality, sizes, src }, ref) {
		const containerRef = useRef<HTMLButtonElement>(null);
		const dragRef = useRef<{
			id: number;
			startX: number;
			startY: number;
			startTranslateX: number;
			startTranslateY: number;
		} | null>(null);
		const pinchRef = useRef<{
			startDistance: number;
			startScale: number;
		} | null>(null);
		const shouldReduceMotion = useReducedMotion();
		const [zoom, setZoom] = useState<ZoomState>({
			scale: 1,
			x: 0,
			y: 0,
		});

		const clampPosition = useCallback((scale: number, x: number, y: number) => {
			const container = containerRef.current;
			if (!container || scale <= 1) {
				return {
					x: 0,
					y: 0,
				};
			}

			const { width, height } = container.getBoundingClientRect();
			const maxX = ((scale - 1) * width) / 2;
			const maxY = ((scale - 1) * height) / 2;

			return {
				x: clamp(x, -maxX, maxX),
				y: clamp(y, -maxY, maxY),
			};
		}, []);

		const setZoomState = useCallback(
			(nextScale: number, nextX = zoom.x, nextY = zoom.y) => {
				const clampedScale = clamp(nextScale, 1, 4);
				const nextPosition = clampPosition(clampedScale, nextX, nextY);
				setZoom({
					scale: clampedScale,
					x: nextPosition.x,
					y: nextPosition.y,
				});
			},
			[clampPosition, zoom.x, zoom.y],
		);

		useImperativeHandle(
			ref,
			() => ({
				isZoomed: () => zoom.scale > 1,
				panBy: (x, y) => {
					if (zoom.scale <= 1) return;
					setZoomState(zoom.scale, zoom.x + x, zoom.y + y);
				},
				reset: () => {
					setZoom({
						scale: 1,
						x: 0,
						y: 0,
					});
				},
				zoomIn: () => {
					setZoomState(zoom.scale + 0.35);
				},
				zoomOut: () => {
					setZoomState(zoom.scale - 0.35);
				},
			}),
			[setZoomState, zoom.scale, zoom.x, zoom.y],
		);

		const handleWheel = useCallback(
			(event: WheelEvent) => {
				event.preventDefault();
				const delta = event.deltaY * -0.0018;
				setZoomState(zoom.scale + delta);
			},
			[setZoomState, zoom.scale],
		);

		useEffect(() => {
			const node = containerRef.current;
			if (!node) return;

			node.addEventListener("wheel", handleWheel, { passive: false });
			return () => node.removeEventListener("wheel", handleWheel);
		}, [handleWheel]);

		const startPointerDrag = useCallback(
			(event: ReactPointerEvent<HTMLButtonElement>) => {
				if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
				if (zoom.scale <= 1) return;
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				dragRef.current = {
					id: event.pointerId,
					startX: event.clientX,
					startY: event.clientY,
					startTranslateX: zoom.x,
					startTranslateY: zoom.y,
				};
			},
			[zoom.scale, zoom.x, zoom.y],
		);

		const movePointerDrag = useCallback(
			(event: ReactPointerEvent<HTMLButtonElement>) => {
				if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
				const dragState = dragRef.current;
				if (!dragState || dragState.id !== event.pointerId) return;
				event.preventDefault();
				const deltaX = event.clientX - dragState.startX;
				const deltaY = event.clientY - dragState.startY;
				setZoomState(
					zoom.scale,
					dragState.startTranslateX + deltaX,
					dragState.startTranslateY + deltaY,
				);
			},
			[setZoomState, zoom.scale],
		);

		const endPointerDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
			if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
			if (dragRef.current?.id !== event.pointerId) return;
			dragRef.current = null;
			event.currentTarget.releasePointerCapture(event.pointerId);
		}, []);

		const handleTouchStart = useCallback(
			(event: ReactTouchEvent<HTMLButtonElement>) => {
				if (event.touches.length === 2) {
					pinchRef.current = {
						startDistance: getTouchDistance(event.touches[0], event.touches[1]),
						startScale: zoom.scale,
					};
					return;
				}

				if (event.touches.length === 1 && zoom.scale > 1) {
					const touch = event.touches[0];
					dragRef.current = {
						id: touch.identifier,
						startX: touch.clientX,
						startY: touch.clientY,
						startTranslateX: zoom.x,
						startTranslateY: zoom.y,
					};
				}
			},
			[zoom.scale, zoom.x, zoom.y],
		);

		const handleTouchMove = useCallback(
			(event: ReactTouchEvent<HTMLButtonElement>) => {
				if (event.touches.length === 2 && pinchRef.current) {
					event.preventDefault();
					const nextDistance = getTouchDistance(event.touches[0], event.touches[1]);
					const scaleMultiplier = nextDistance / pinchRef.current.startDistance;
					setZoomState(pinchRef.current.startScale * scaleMultiplier);
					return;
				}

				if (event.touches.length === 1 && dragRef.current && zoom.scale > 1) {
					event.preventDefault();
					const touch = event.touches[0];
					const deltaX = touch.clientX - dragRef.current.startX;
					const deltaY = touch.clientY - dragRef.current.startY;
					setZoomState(
						zoom.scale,
						dragRef.current.startTranslateX + deltaX,
						dragRef.current.startTranslateY + deltaY,
					);
				}
			},
			[setZoomState, zoom.scale],
		);

		const handleTouchEnd = useCallback(() => {
			dragRef.current = null;
			pinchRef.current = null;
		}, []);

		return (
			<button
				type="button"
				ref={containerRef}
				className={cn(
					"relative h-full w-full overflow-hidden border-0 bg-transparent p-0 text-left",
					zoom.scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
				)}
				aria-label={`${alt}. Press Enter to toggle zoom.`}
				style={{
					touchAction: "none",
				}}
				onDoubleClick={() => {
					setZoomState(zoom.scale > 1 ? 1 : 2.25);
				}}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						setZoomState(zoom.scale > 1 ? 1 : 2.25);
					}
				}}
				onPointerDown={startPointerDrag}
				onPointerMove={movePointerDrag}
				onPointerUp={endPointerDrag}
				onPointerCancel={endPointerDrag}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<motion.div
					className="relative h-full w-full"
					animate={{
						scale: zoom.scale,
						x: zoom.x,
						y: zoom.y,
					}}
					transition={
						shouldReduceMotion
							? {
									duration: 0,
								}
							: {
									type: "spring",
									stiffness: 280,
									damping: 32,
									mass: 0.7,
								}
					}
				>
					<Image
						src={src}
						alt={alt}
						fill
						className="pointer-events-none select-none object-contain"
						draggable={false}
						quality={quality}
						sizes={sizes}
					/>
				</motion.div>
			</button>
		);
	},
);

interface GalleryLightboxProps {
	activeIndex: number;
	items: GalleryMediaSource[];
	onIndexChange: (index: number) => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	quality: number;
	sizes: string;
}

export function GalleryLightbox({
	activeIndex,
	items,
	onIndexChange,
	onOpenChange,
	open,
	quality,
	sizes,
}: GalleryLightboxProps) {
	const zoomableRef = useRef<ZoomableImageHandle>(null);
	const shouldReduceMotion = useReducedMotion();
	const currentItem = items[activeIndex];
	const currentCaption = currentItem?.caption;
	const slideLabel = `${activeIndex + 1} of ${items.length}`;
	const hasMultiple = items.length > 1;

	const canGoNext = activeIndex < items.length - 1;
	const canGoPrev = activeIndex > 0;

	const goToIndex = useCallback(
		(index: number) => {
			const nextIndex = clamp(index, 0, items.length - 1);
			zoomableRef.current?.reset();
			onIndexChange(nextIndex);
		},
		[items.length, onIndexChange],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!open) return;

			if (event.key === "Escape") {
				onOpenChange(false);
				return;
			}

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
		[activeIndex, canGoNext, canGoPrev, goToIndex, items.length, onOpenChange, open],
	);

	useEffect(() => {
		if (!open) return;

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown, open]);

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
				<AnimatePresence>
					{open && (
						<>
							<DialogPrimitive.Overlay asChild forceMount>
								<motion.div
									className="fixed inset-0 z-[80] bg-surface-950/92 backdrop-blur-md"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{
										duration: shouldReduceMotion ? 0 : 0.2,
									}}
								/>
							</DialogPrimitive.Overlay>

							<DialogPrimitive.Content asChild forceMount>
								<motion.div
									className="fixed inset-0 z-[81] outline-none"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{
										duration: shouldReduceMotion ? 0 : 0.2,
									}}
								>
									<DialogPrimitive.Title className="sr-only">
										{mediaTitle}
									</DialogPrimitive.Title>

									<div className="relative flex h-full w-full flex-col px-4 py-4 sm:px-6 sm:py-6">
										<div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
											<div className="pointer-events-auto flex items-center gap-2">
												<div className={LIGHTBOX_CONTROL_CLASS_NAME}>
													<span className="font-mono text-[10px] uppercase tracking-[0.22em]">
														Viewer
													</span>
												</div>
												{hasMultiple && (
													<div className={LIGHTBOX_CONTROL_CLASS_NAME}>
														<span className="font-mono text-[10px] uppercase tabular-nums tracking-[0.22em]">
															{slideLabel}
														</span>
													</div>
												)}
											</div>

											<div className="pointer-events-auto flex items-center gap-2">
												{currentItem?.kind === "image" && (
													<>
														<button
															type="button"
															className={LIGHTBOX_CONTROL_CLASS_NAME}
															onClick={() =>
																zoomableRef.current?.zoomOut()
															}
															aria-label="Zoom out"
														>
															<MagnifyingGlassMinus
																size={18}
																weight="bold"
															/>
														</button>
														<button
															type="button"
															className={LIGHTBOX_CONTROL_CLASS_NAME}
															onClick={() =>
																zoomableRef.current?.zoomIn()
															}
															aria-label="Zoom in"
														>
															<MagnifyingGlassPlus
																size={18}
																weight="bold"
															/>
														</button>
													</>
												)}

												<button
													type="button"
													className={LIGHTBOX_CONTROL_CLASS_NAME}
													onClick={() => onOpenChange(false)}
													aria-label="Close expanded viewer"
												>
													<X size={18} weight="bold" />
												</button>
											</div>
										</div>

										<div className="relative flex flex-1 items-center justify-center overflow-hidden pt-16 sm:pt-20">
											{hasMultiple && (
												<>
													<button
														type="button"
														className={cn(
															LIGHTBOX_CONTROL_CLASS_NAME,
															"absolute top-1/2 left-0 z-20 -translate-y-1/2 sm:left-1",
														)}
														onClick={() => goToIndex(activeIndex - 1)}
														disabled={!canGoPrev}
														aria-label="Previous slide"
													>
														<CaretLeft size={18} weight="bold" />
													</button>

													<button
														type="button"
														className={cn(
															LIGHTBOX_CONTROL_CLASS_NAME,
															"absolute top-1/2 right-0 z-20 -translate-y-1/2 sm:right-1",
														)}
														onClick={() => goToIndex(activeIndex + 1)}
														disabled={!canGoNext}
														aria-label="Next slide"
													>
														<CaretRight size={18} weight="bold" />
													</button>
												</>
											)}

											<AnimatePresence mode="wait">
												{currentItem ? (
													<motion.div
														key={`${currentItem.kind}-${activeIndex}`}
														className="relative h-full w-full"
														initial={{
															opacity: 0,
															y: shouldReduceMotion ? 0 : 8,
														}}
														animate={{ opacity: 1, y: 0 }}
														exit={{
															opacity: 0,
															y: shouldReduceMotion ? 0 : -8,
														}}
														transition={{
															duration: shouldReduceMotion ? 0 : 0.2,
														}}
													>
														{currentItem.kind === "image" ? (
															<ZoomableGalleryImage
																ref={zoomableRef}
																alt={
																	currentItem.alt ??
																	`Slide ${activeIndex + 1}`
																}
																quality={quality}
																sizes={sizes}
																src={currentItem.src}
															/>
														) : (
															<div className="relative h-full w-full">
																<MuxPlayer
																	playbackId={
																		currentItem.playbackId
																	}
																	metadata={currentItem.metadata}
																	autoPlay
																	streamType="on-demand"
																	className={muxPlayerClassName}
																	style={
																		muxPlayerPresentationStyle
																	}
																/>
															</div>
														)}
													</motion.div>
												) : null}
											</AnimatePresence>
										</div>

										<div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-col gap-3 sm:inset-x-6 sm:bottom-6">
											{hasMultiple && (
												<div className="pointer-events-auto flex gap-2">
													{items.map((item, index) => (
														<button
															key={`lightbox-progress-${getLightboxItemKey(item)}`}
															type="button"
															onClick={() => goToIndex(index)}
															aria-label={`Go to slide ${index + 1}`}
															className={cn(
																"h-0.5 flex-1 transition-colors duration-200",
																index === activeIndex
																	? "bg-surface-50"
																	: "bg-surface-50/25 hover:bg-surface-50/55",
															)}
														/>
													))}
												</div>
											)}

											<div className="flex items-end justify-between gap-4">
												{currentCaption ? (
													<div className="pointer-events-auto max-w-[min(44rem,72vw)] border border-surface-700/80 bg-surface-950/76 px-4 py-2 font-mono text-[11px] text-surface-100 uppercase tracking-[0.16em] backdrop-blur-md">
														{currentCaption}
													</div>
												) : (
													<div />
												)}

												{currentItem?.kind === "image" && (
													<div className="pointer-events-auto border border-surface-700/80 bg-surface-950/76 px-4 py-2 font-mono text-[10px] text-surface-100 uppercase tracking-[0.22em] backdrop-blur-md">
														Pinch or scroll to zoom
													</div>
												)}
											</div>
										</div>
									</div>
								</motion.div>
							</DialogPrimitive.Content>
						</>
					)}
				</AnimatePresence>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
