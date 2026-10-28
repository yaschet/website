"use client";
import { motion, useReducedMotion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import {
	forwardRef,
	type PointerEvent as ReactPointerEvent,
	type TouchEvent as ReactTouchEvent,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { cn } from "@/src/lib/index";

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

export type ZoomableImageHandle = {
	isZoomed: () => boolean;
	panBy: (x: number, y: number) => void;
	reset: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
};

interface ZoomableGalleryImageProps {
	alt: string;
	quality: number;
	sizes: string;
	src: string | StaticImageData;
}

export const ZoomableGalleryImage = forwardRef<ZoomableImageHandle, ZoomableGalleryImageProps>(
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
