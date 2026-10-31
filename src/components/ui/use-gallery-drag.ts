"use client";

import type { MouseEvent, PointerEvent, RefObject } from "react";
import { useEffect, useRef } from "react";

type GalleryDragOptions = {
	containerRef: RefObject<HTMLDivElement | null>;
	count: number;
	onNavigate: (index: number) => void;
};

type DragSession = {
	id: number;
	startX: number;
	startY: number;
	startScroll: number;
	startIndex: number;
	lastX: number;
	lastTime: number;
	velocity: number;
	dragging: boolean;
};

/** Adds mouse/pen dragging to native scroll snap; touch retains browser scrolling and momentum. */
export function useGalleryDrag({ containerRef, count, onNavigate }: GalleryDragOptions) {
	const sessionRef = useRef<DragSession | null>(null);
	const suppressClickUntil = useRef(0);

	useEffect(() => {
		const container = containerRef.current;
		return () => {
			container?.removeAttribute("data-dragging");
			container?.style.removeProperty("scroll-snap-type");
			container?.style.removeProperty("scroll-behavior");
		};
	}, [containerRef]);

	function onPointerDown(event: PointerEvent<HTMLDivElement>) {
		if (count < 2 || event.pointerType === "touch" || event.button !== 0 || !event.isPrimary)
			return;
		if (
			event.target instanceof Element &&
			event.target.closest(
				"[data-portfolio-video], [data-player-interactive], button:not([data-gallery-open]), a, input, [role=slider]",
			)
		)
			return;
		const container = event.currentTarget;
		const width = container.clientWidth;
		if (!width) return;
		sessionRef.current = {
			id: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			startScroll: container.scrollLeft,
			startIndex: Math.round(container.scrollLeft / width),
			lastX: event.clientX,
			lastTime: event.timeStamp,
			velocity: 0,
			dragging: false,
		};
	}

	function onPointerMove(event: PointerEvent<HTMLDivElement>) {
		const session = sessionRef.current;
		if (!session || session.id !== event.pointerId) return;
		const dx = event.clientX - session.startX;
		const dy = event.clientY - session.startY;
		if (!session.dragging) {
			if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
				sessionRef.current = null;
				return;
			}
			if (Math.abs(dx) < 6) return;
			session.dragging = true;
			event.currentTarget.setPointerCapture(event.pointerId);
			event.currentTarget.dataset.dragging = "true";
			event.currentTarget.style.scrollSnapType = "none";
			event.currentTarget.style.scrollBehavior = "auto";
		}
		event.preventDefault();
		const elapsed = event.timeStamp - session.lastTime;
		if (elapsed > 0) session.velocity = (event.clientX - session.lastX) / elapsed;
		session.lastX = event.clientX;
		session.lastTime = event.timeStamp;
		event.currentTarget.scrollLeft = session.startScroll - dx;
	}

	function finish(event: PointerEvent<HTMLDivElement>, cancelled = false) {
		const session = sessionRef.current;
		if (!session || session.id !== event.pointerId) return;
		sessionRef.current = null;
		const container = event.currentTarget;
		if (container.hasPointerCapture(event.pointerId))
			container.releasePointerCapture(event.pointerId);
		if (!session.dragging) return;
		suppressClickUntil.current = performance.now() + 350;
		container.removeAttribute("data-dragging");
		container.style.removeProperty("scroll-snap-type");
		container.style.removeProperty("scroll-behavior");
		const distance = event.clientX - session.startX;
		const velocity = event.timeStamp - session.lastTime < 100 ? session.velocity : 0;
		const advances =
			Math.abs(distance) > container.clientWidth * 0.14 || Math.abs(velocity) > 0.45;
		const nextIndex = cancelled
			? session.startIndex
			: advances
				? session.startIndex + (distance < 0 ? 1 : -1)
				: session.startIndex;
		onNavigate(Math.max(0, Math.min(count - 1, nextIndex)));
	}

	function onClickCapture(event: MouseEvent<HTMLDivElement>) {
		if (event.detail !== 0 && performance.now() < suppressClickUntil.current) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: (event: PointerEvent<HTMLDivElement>) => finish(event),
		onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
		onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => finish(event, true),
		onClickCapture,
	};
}
