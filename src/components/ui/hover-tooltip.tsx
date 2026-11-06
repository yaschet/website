"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** One available control and its plain-text hint; the DOM anchor owns positioning. */
export interface TooltipTarget {
	id: string;
	label: string;
	anchor: HTMLElement;
	/** Optional outer surface used for vertical clearance, independent of the icon inset. */
	boundary?: HTMLElement;
	/** End controls can pin the hint to the outer surface rather than their glyph center. */
	align?: "start" | "center" | "end";
}

function isAvailable(anchor: HTMLElement) {
	return (
		anchor.isConnected &&
		!anchor.matches(":disabled, [aria-disabled='true']") &&
		!anchor.closest("[hidden], [inert], [aria-hidden='true']")
	);
}

/** Shares an opening delay and short handoff grace period across a group of controls. */
export function useHoverTooltip() {
	const [target, setTarget] = useState<TooltipTarget | null>(null);
	const targetRef = useRef<TooltipTarget | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastClose = useRef(0);
	const cancelTimer = useCallback(() => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
	}, []);
	const dismiss = useCallback(() => {
		cancelTimer();
		targetRef.current = null;
		setTarget(null);
		lastClose.current = Date.now();
	}, [cancelTimer]);
	const show = useCallback(
		(next: TooltipTarget, keyboard = false) => {
			cancelTimer();
			if (!isAvailable(next.anchor)) return;
			const open = () => {
				timer.current = null;
				if (!isAvailable(next.anchor)) return;
				targetRef.current = next;
				setTarget(next);
			};
			if (keyboard || targetRef.current || Date.now() - lastClose.current < 120) open();
			else timer.current = setTimeout(open, 350);
		},
		[cancelTimer],
	);
	const hide = useCallback(() => {
		cancelTimer();
		timer.current = setTimeout(dismiss, 120);
	}, [cancelTimer, dismiss]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (["Escape", "Enter", " "].includes(event.key)) dismiss();
		};
		const onVisibility = () => {
			if (document.hidden) dismiss();
		};
		window.addEventListener("keydown", onKeyDown, true);
		window.addEventListener("pointerdown", dismiss, true);
		window.addEventListener("blur", dismiss);
		window.addEventListener("scroll", dismiss, true);
		window.addEventListener("resize", dismiss);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelTimer();
			window.removeEventListener("keydown", onKeyDown, true);
			window.removeEventListener("pointerdown", dismiss, true);
			window.removeEventListener("blur", dismiss);
			window.removeEventListener("scroll", dismiss, true);
			window.removeEventListener("resize", dismiss);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [cancelTimer, dismiss]);

	useEffect(() => {
		if (!target) return;
		const check = () => {
			if (!isAvailable(target.anchor)) dismiss();
		};
		const observer = new MutationObserver(check);
		observer.observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ["hidden", "inert", "aria-hidden", "disabled", "aria-disabled"],
		});
		return () => observer.disconnect();
	}, [target, dismiss]);
	return { target, show, hide, dismiss, keepOpen: cancelTimer };
}

/**
 * One measured shell moves between anchors without stretching text. The last hint
 * remains mounted through dismissal; keyboard and reduced-motion handoffs are immediate.
 */
export function HoverTooltip({
	target,
	id,
	instant = false,
	onPointerEnter,
	onPointerLeave,
}: {
	target: TooltipTarget | null;
	id: string;
	instant?: boolean;
	onPointerEnter: () => void;
	onPointerLeave: () => void;
}) {
	const reduced = useReducedMotion();
	const [retained, setRetained] = useState(target);
	if (target && target !== retained) setRetained(target);
	const data = target ?? retained;
	const measure = useRef<HTMLDivElement>(null);
	const [geometry, setGeometry] = useState<{
		x: number;
		y: number;
		width: number;
		height: number;
		snap: boolean;
	} | null>(null);
	const visible = useRef(false);
	const immediate = reduced || instant;
	useLayoutEffect(() => {
		if (!target && immediate) visible.current = false;
		if (!target || !data || !measure.current) return;
		const { width, height } = measure.current.getBoundingClientRect();
		const anchor = data.anchor.getBoundingClientRect();
		const surface = data.boundary ?? data.anchor;
		const boundary = surface.getBoundingClientRect();
		const gap = Number.parseFloat(getComputedStyle(surface).paddingTop);
		const left = Math.max(12, boundary.left);
		const right = Math.min(innerWidth - 12, boundary.right);
		const centered = anchor.left + (anchor.width - width) / 2;
		const aligned =
			data.align === "start" ? left : data.align === "end" ? right - width : centered;
		setGeometry({
			width,
			height,
			snap: !visible.current,
			x: Math.max(left, Math.min(aligned, right - width)),
			y: Math.max(12, boundary.top - height - gap),
		});
		visible.current = true;
	}, [data, target, immediate]);
	if (!data) return null;
	return createPortal(
		<>
			<div
				ref={measure}
				aria-hidden="true"
				className="portfolio-tooltip-measure portfolio-tooltip-copy"
			>
				{data.label}
			</div>
			{geometry && (
				<div
					id={id}
					role="tooltip"
					aria-label={data.label}
					aria-hidden={!target}
					data-state={target ? "open" : "closed"}
					data-snap={geometry.snap || immediate}
					data-instant={immediate}
					className="portfolio-tooltip"
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					style={{
						transform: `translate3d(${geometry.x}px, ${geometry.y}px, 0)`,
						width: geometry.width,
						height: geometry.height,
					}}
					onTransitionEnd={(event) => {
						if (
							!target &&
							event.target === event.currentTarget &&
							event.propertyName === "opacity"
						) {
							visible.current = false;
						}
					}}
				>
					<AnimatePresence initial={false} mode="popLayout">
						<motion.div
							key={data.id}
							aria-hidden="true"
							className="portfolio-tooltip-copy"
							style={{ width: "100%" }}
							initial={{
								opacity: 0,
								y: immediate ? 0 : 3,
								filter: immediate ? "none" : "blur(2px)",
							}}
							animate={{ opacity: 1, y: 0, filter: immediate ? "none" : "blur(0px)" }}
							exit={{
								opacity: 0,
								y: immediate ? 0 : -3,
								filter: immediate ? "none" : "blur(2px)",
							}}
							transition={{ duration: immediate ? 0 : 0.12 }}
						>
							{data.label}
						</motion.div>
					</AnimatePresence>
				</div>
			)}
		</>,
		document.body,
	);
}
