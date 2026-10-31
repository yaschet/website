"use client";

import { RiPlayFill } from "@remixicon/react";
import { animate, motionValue } from "motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { createGalleryMotionBlur } from "./gallery-motion";
import styles from "./gallery-viewer.module.css";
import { Spinner } from "./spinner";

interface GalleryFilmstripProps {
	items: GalleryMediaSource[];
	index: number;
	pendingIndex: number | null;
	navigate: (index: number, keyboard: boolean) => void;
	prepare: (index: number) => void;
}

const response = { type: "spring", stiffness: 750, damping: 55, mass: 1 } as const;

export function GalleryFilmstrip({
	items,
	index,
	pendingIndex,
	navigate,
	prepare,
}: GalleryFilmstripProps) {
	const stripRef = useRef<HTMLFieldSetElement>(null);
	const controller = useRef<{
		follow: (current: number, destination: number) => void;
		stop: () => void;
	} | null>(null);
	const intent = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const current = useRef({ index, pendingIndex });
	current.current = { index, pendingIndex };
	useEffect(() => {
		const strip = stripRef.current;
		const track = strip?.querySelector<HTMLElement>("[data-gallery-track]");
		if (!strip || !track) return;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const blur = reduced ? null : createGalleryMotionBlur(strip);
		const position = motionValue(strip.scrollLeft);
		let scrollAnimation: ReturnType<typeof animate> | undefined;
		let auto = false;
		let initial = true;
		let last = { x: strip.scrollLeft, time: performance.now() };
		let idle: number | undefined;
		const unsubscribePosition = position.on("change", (value) => {
			strip.scrollLeft = value;
		});
		const stop = () => {
			scrollAnimation?.stop();
			auto = false;
			strip.removeAttribute("data-gallery-filmstrip-moving");
			position.jump(strip.scrollLeft);
			blur?.clear();
		};
		const follow = (current: number, destination: number) => {
			const active = track.querySelector<HTMLElement>(`[data-gallery-preview="${current}"]`);
			const target = track.querySelector<HTMLElement>(
				`[data-gallery-preview="${destination}"]`,
			);
			if (!active || !target) return;
			const instant = initial || reduced || strip.closest("[data-instant='true']") !== null;
			initial = false;
			const left = Math.max(
				0,
				Math.min(
					strip.scrollWidth - strip.clientWidth,
					target.offsetLeft - (strip.clientWidth - target.offsetWidth) / 2,
				),
			);
			scrollAnimation?.stop();
			if (instant) {
				stop();
				position.jump(left);
				return;
			}
			if (Math.abs(strip.scrollLeft - left) < 0.5) return;
			auto = true;
			strip.dataset.galleryFilmstripMoving = "true";
			scrollAnimation = animate(position, left, {
				...response,
				onComplete: () => {
					auto = false;
					strip.removeAttribute("data-gallery-filmstrip-moving");
					blur?.clear();
				},
			});
		};
		const onScroll = () => {
			const time = performance.now();
			const elapsed = time - last.time;
			if (!auto) position.jump(strip.scrollLeft);
			blur?.update(
				elapsed > 0 && elapsed < 80 ? (strip.scrollLeft - last.x) / elapsed : 0,
				[track],
				1.5,
			);
			last = { x: strip.scrollLeft, time };
			if (idle !== undefined) cancelAnimationFrame(idle);
			idle = requestAnimationFrame(() => {
				idle = requestAnimationFrame(() => blur?.clear());
			});
		};
		strip.addEventListener("scroll", onScroll, { passive: true });
		controller.current = { follow, stop };
		const resize = new ResizeObserver(() => {
			initial = true;
			follow(current.current.index, current.current.pendingIndex ?? current.current.index);
		});
		resize.observe(strip);
		return () => {
			stop();
			unsubscribePosition();
			position.destroy();
			if (idle !== undefined) cancelAnimationFrame(idle);
			if (intent.current !== undefined) clearTimeout(intent.current);
			resize.disconnect();
			strip.removeEventListener("scroll", onScroll);
			blur?.destroy();
			controller.current = null;
		};
	}, []);
	useEffect(() => {
		controller.current?.follow(index, pendingIndex ?? index);
	}, [index, pendingIndex]);
	return (
		<fieldset
			className={styles.filmstrip}
			ref={stripRef}
			aria-label="Gallery previews"
			data-gallery-filmstrip
			onPointerDown={() => controller.current?.stop()}
			onWheel={() => controller.current?.stop()}
		>
			<div className={styles.filmstripTrack} data-gallery-track>
				{items.map((item, itemIndex) => {
					const title = item.title || item.alt || `Gallery media ${itemIndex + 1}`;
					return (
						<button
							key={
								item.kind === "mux-video"
									? item.playbackId
									: typeof item.src === "string"
										? item.src
										: item.src.src
							}
							type="button"
							data-gallery-preview={itemIndex}
							className={styles.thumbnail}
							aria-label={`View slide ${itemIndex + 1}: ${title}`}
							aria-current={itemIndex === index}
							aria-busy={itemIndex === pendingIndex}
							title={title}
							onFocus={() => prepare(itemIndex)}
							onPointerEnter={(event) => {
								if (event.pointerType !== "mouse") return;
								clearTimeout(intent.current);
								intent.current = setTimeout(() => prepare(itemIndex), 80);
							}}
							onPointerMove={(event) => {
								if (event.pointerType !== "mouse") return;
								const button = event.currentTarget;
								button.style.setProperty(
									"--preview-x",
									`${(event.nativeEvent.offsetX / button.offsetWidth - 0.5) * 3}px`,
								);
								button.style.setProperty(
									"--preview-y",
									`${(event.nativeEvent.offsetY / button.offsetHeight - 0.5) * 3}px`,
								);
							}}
							onPointerLeave={(event) => {
								clearTimeout(intent.current);
								event.currentTarget.style.removeProperty("--preview-x");
								event.currentTarget.style.removeProperty("--preview-y");
							}}
							onPointerDown={() => prepare(itemIndex)}
							onClick={(event) => navigate(itemIndex, event.detail === 0)}
						>
							<span className={styles.previewMedia}>
								<Image
									src={item.kind === "image" ? item.src : item.poster}
									alt=""
									fill
									sizes="96px"
									quality={75}
									loading="eager"
									draggable={false}
								/>
							</span>
							{itemIndex === index && (
								<span
									className={styles.filmstripSelection}
									data-gallery-selection
									aria-hidden="true"
								/>
							)}
							{item.kind === "mux-video" && (
								<span className={styles.videoMark}>
									<RiPlayFill size={12} />
								</span>
							)}
							{itemIndex === pendingIndex && (
								<span className={styles.previewPending} aria-hidden="true">
									<Spinner
										size="xs"
										role="presentation"
										aria-label={undefined}
										aria-hidden="true"
									/>
								</span>
							)}
						</button>
					);
				})}
			</div>
		</fieldset>
	);
}
