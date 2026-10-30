"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/index";

const AUTO_SPEED = -24;
const INERTIA_DECAY = 0.14;
const MAX_COAST = 0.7;

type Drag = {
	id: number;
	x: number;
	y: number;
	start: number;
	lastX: number;
	lastTime: number;
	velocity: number;
	moved: boolean;
};

/** Compositor-owned autoplay; direct manipulation uses a bounded, interruptible coast. */
export function MarqueeBadge({
	items,
	className,
}: {
	items: readonly string[];
	className?: string;
}) {
	const button = useRef<HTMLButtonElement>(null);
	const track = useRef<HTMLSpanElement>(null);
	const cycle = useRef<HTMLSpanElement>(null);
	const controller = useRef<{
		sync: (isStopped: boolean) => void;
		step: (pixels: number) => void;
	} | null>(null);
	const suppressClick = useRef(false);
	const [paused, setPaused] = useState(false);
	const [focused, setFocused] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [copies, setCopies] = useState(2);
	const stopped = useRef(false);
	const copy = items.join(" · ");

	useEffect(() => {
		const control = button.current;
		const node = track.current;
		const source = cycle.current;
		if (!control || !node || !source) return;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		let width = 0;
		let position = 0;
		let auto: Animation | null = null;
		let frame = 0;
		let drag: Drag | null = null;
		let disposed = false;
		let inView = true;
		const wrap = (value: number) => (width > 0 ? -(((-value % width) + width) % width) : 0);
		const paint = (value: number) => {
			position = wrap(value);
			node.style.transform = `translateX(${position}px)`;
		};
		const freeze = () => {
			cancelAnimationFrame(frame);
			frame = 0;
			if (auto) {
				const time = typeof auto.currentTime === "number" ? auto.currentTime : 0;
				position = wrap((time / 1000) * AUTO_SPEED);
				auto.cancel();
				auto = null;
			}
			paint(position);
		};
		const play = () => {
			if (disposed || !width || reduced.matches || drag || frame) return;
			const duration = (width / -AUTO_SPEED) * 1000;
			if (!auto) {
				auto = node.animate(
					[{ transform: "translateX(0)" }, { transform: `translateX(-${width}px)` }],
					{ duration, iterations: Infinity, easing: "linear" },
				);
				auto.currentTime = (position / AUTO_SPEED) * 1000;
			}
			if (stopped.current || document.hidden || !inView) auto.pause();
			else auto.play();
		};
		const sync = () => {
			if (reduced.matches || (frame && (document.hidden || !inView || stopped.current)))
				freeze();
			play();
		};
		const measure = () => {
			if (disposed) return;
			freeze();
			const progress = width ? -position / width : 0;
			width = source.getBoundingClientRect().width;
			paint(-progress * width);
			if (width) setCopies(Math.max(2, Math.ceil(control.clientWidth / width) + 1));
			play();
		};
		const coast = (velocity: number) => {
			if (reduced.matches || document.hidden || !inView || Math.abs(velocity) < 20) {
				play();
				return;
			}
			const start = position;
			const time = performance.now();
			const target = stopped.current ? 0 : AUTO_SPEED;
			const tick = (now: number) => {
				const elapsed = Math.min((now - time) / 1000, MAX_COAST);
				paint(
					start +
						target * elapsed +
						(velocity - target) *
							INERTIA_DECAY *
							(1 - Math.exp(-elapsed / INERTIA_DECAY)),
				);
				if (elapsed < MAX_COAST) frame = requestAnimationFrame(tick);
				else {
					frame = 0;
					play();
				}
			};
			frame = requestAnimationFrame(tick);
		};
		const down = (event: PointerEvent) => {
			if (!event.isPrimary || event.button !== 0) return;
			freeze();
			suppressClick.current = false;
			drag = {
				id: event.pointerId,
				x: event.clientX,
				y: event.clientY,
				start: position,
				lastX: event.clientX,
				lastTime: event.timeStamp,
				velocity: 0,
				moved: false,
			};
			control.setPointerCapture(event.pointerId);
		};
		const move = (event: PointerEvent) => {
			if (!drag || drag.id !== event.pointerId) return;
			const delta = event.clientX - drag.x;
			if (!drag.moved) {
				if (Math.abs(delta) < 4 || Math.abs(delta) <= Math.abs(event.clientY - drag.y))
					return;
				drag.moved = true;
				setDragging(true);
			}
			const duration = event.timeStamp - drag.lastTime;
			if (duration > 0) {
				const sample = Math.max(
					-1800,
					Math.min(1800, ((event.clientX - drag.lastX) / duration) * 1000),
				);
				drag.velocity = drag.velocity * 0.4 + sample * 0.6;
			}
			drag.lastX = event.clientX;
			drag.lastTime = event.timeStamp;
			paint(drag.start + delta);
		};
		const finish = (event: PointerEvent) => {
			if (!drag || drag.id !== event.pointerId) return;
			const previous = drag;
			drag = null;
			suppressClick.current = previous.moved;
			setDragging(false);
			if (control.hasPointerCapture(event.pointerId))
				control.releasePointerCapture(event.pointerId);
			if (event.type === "pointerup" && previous.moved)
				coast(event.timeStamp - previous.lastTime > 80 ? 0 : previous.velocity);
			else play();
		};
		controller.current = {
			sync: (isStopped) => {
				stopped.current = isStopped;
				sync();
			},
			step: (pixels) => {
				freeze();
				paint(position + pixels);
			},
		};
		let measureFrame = 0;
		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(measureFrame);
			measureFrame = requestAnimationFrame(measure);
		});
		observer.observe(source);
		observer.observe(control);
		const visibilityObserver = new IntersectionObserver(([entry]) => {
			inView = entry?.isIntersecting ?? false;
			sync();
		});
		visibilityObserver.observe(control);
		control.addEventListener("pointerdown", down);
		control.addEventListener("pointermove", move);
		control.addEventListener("pointerup", finish);
		control.addEventListener("pointercancel", finish);
		control.addEventListener("lostpointercapture", finish);
		reduced.addEventListener("change", sync);
		document.addEventListener("visibilitychange", sync);
		void document.fonts.ready.then(measure);
		measure();
		return () => {
			disposed = true;
			freeze();
			observer.disconnect();
			visibilityObserver.disconnect();
			cancelAnimationFrame(measureFrame);
			controller.current = null;
			control.removeEventListener("pointerdown", down);
			control.removeEventListener("pointermove", move);
			control.removeEventListener("pointerup", finish);
			control.removeEventListener("pointercancel", finish);
			control.removeEventListener("lostpointercapture", finish);
			reduced.removeEventListener("change", sync);
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);

	useEffect(() => {
		controller.current?.sync(paused || focused);
	}, [paused, focused]);

	return (
		<button
			ref={button}
			type="button"
			className={cn("portfolio-context-badge portfolio-marquee", className)}
			aria-label={`Highlights: ${copy}`}
			aria-description="Drag left or right to explore. Use the Left and Right arrow keys to move. Press Space to pause or resume."
			aria-pressed={paused || focused}
			data-paused={paused || focused}
			data-dragging={dragging}
			onClick={(event) => {
				if (suppressClick.current && event.detail > 0) {
					suppressClick.current = false;
					return;
				}
				setPaused(event.detail === 0 ? !(paused || focused) : !paused);
				setFocused(false);
			}}
			onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
			onBlur={() => setFocused(false)}
			onKeyDown={(event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
				event.preventDefault();
				setPaused(true);
				controller.current?.step(event.key === "ArrowLeft" ? 80 : -80);
			}}
		>
			<span className="portfolio-marquee-window" aria-hidden="true">
				<span ref={track} className="portfolio-marquee-track">
					{Array.from({ length: copies }, (_, index) => (
						<span
							ref={index === 0 ? cycle : undefined}
							className="portfolio-marquee-cycle"
							// biome-ignore lint/suspicious/noArrayIndexKey: Identical cycles have fixed positions; resizing only appends or removes trailing copies.
							key={`cycle-${index}`}
						>
							{items.map((item) => (
								<span className="portfolio-marquee-item" key={item}>
									{/* Keep one searchable text cycle; mirrored copies are decoration. */}
									<span data-marquee-copy={index === 0 ? undefined : item}>
										{index === 0 ? item : null}
									</span>
									<span>·</span>
								</span>
							))}
						</span>
					))}
				</span>
			</span>
		</button>
	);
}
