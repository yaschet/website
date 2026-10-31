"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { createGalleryAmbientLight } from "./gallery-ambient-light";
import styles from "./gallery-viewer.module.css";

interface GalleryAmbienceProps {
	root: HTMLElement;
	item: GalleryMediaSource;
	closing: boolean;
}

/** Low-resolution light follows presented video frames without per-frame React updates. */
export function GalleryAmbience({ root, item, closing }: GalleryAmbienceProps) {
	const field = useRef<HTMLCanvasElement>(null);
	const lighting = useRef<ReturnType<typeof createGalleryAmbientLight> | null>(null);
	useEffect(() => {
		if (closing) return;
		const canvas = field.current;
		const context = canvas?.getContext("2d", { willReadFrequently: true });
		if (!context) return;
		const light = lighting.current ?? createGalleryAmbientLight(context);
		lighting.current = light;
		let painted = false;
		let cancelled = false;
		let video: HTMLVideoElement | null = null;
		let blockedVideo: HTMLVideoElement | null = null;
		let frameId: number | undefined;
		let animationId: number | undefined;
		let lastTime = -1;
		let unbindVideo = () => {};
		let shadowObserver: MutationObserver | undefined;
		let observedHost: Element | null = null;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const poster = new window.Image();
		const source = item.kind === "image" ? item.src : item.poster;
		const artwork =
			item.kind === "image"
				? root.querySelector<HTMLImageElement>(
						'.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)',
					)
				: null;
		const draw = (frame: HTMLImageElement | HTMLVideoElement) => {
			if (cancelled || document.hidden) return false;
			try {
				if (painted) light.present(frame);
				else light.begin(frame, reduced || root.dataset.instant === "true");
				painted = true;
				return true;
			} catch {
				// A cross-origin or replaced stream must never prevent the poster fallback.
				if (frame instanceof HTMLVideoElement) blockedVideo = frame;
				return false;
			}
		};
		const paint = () => {
			if (!reduced && video && video !== blockedVideo && video.readyState >= 2) {
				if (draw(video)) return;
			}
			if (artwork?.complete && artwork.naturalWidth && draw(artwork)) return;
			if (poster.complete && poster.naturalWidth > 0) draw(poster);
		};
		const cancelFrame = () => {
			if (frameId !== undefined) video?.cancelVideoFrameCallback(frameId);
			if (animationId !== undefined) cancelAnimationFrame(animationId);
			frameId = animationId = undefined;
		};
		const scheduleFrame = () => {
			if (
				cancelled ||
				reduced ||
				document.hidden ||
				!video ||
				video === blockedVideo ||
				video.paused ||
				video.ended ||
				frameId !== undefined ||
				animationId !== undefined
			)
				return;
			if (typeof video.requestVideoFrameCallback === "function") {
				frameId = video.requestVideoFrameCallback(() => {
					frameId = undefined;
					paint();
					scheduleFrame();
				});
			} else {
				animationId = requestAnimationFrame(() => {
					animationId = undefined;
					if (video && lastTime !== video.currentTime) {
						lastTime = video.currentTime;
						paint();
					}
					scheduleFrame();
				});
			}
		};
		const refresh = () => {
			paint();
			cancelFrame();
			scheduleFrame();
		};
		const bindVideo = () => {
			const host = root.querySelector('.pswp__item[aria-hidden="false"] mux-video');
			if (host !== observedHost) {
				shadowObserver?.disconnect();
				observedHost = host;
				if (host?.shadowRoot) {
					shadowObserver = new MutationObserver(bindVideo);
					shadowObserver.observe(host.shadowRoot, { childList: true, subtree: true });
				}
			}
			const nextVideo = host?.shadowRoot?.querySelector("video") ?? null;
			if (nextVideo === video) return;
			cancelFrame();
			unbindVideo();
			video = nextVideo;
			if (!video) return;
			const events = ["loadeddata", "playing", "pause", "seeked", "emptied"];
			for (const event of events) video.addEventListener(event, refresh);
			const bound = video;
			unbindVideo = () => {
				for (const event of events) bound.removeEventListener(event, refresh);
			};
			refresh();
		};
		poster.onload = paint;
		paint();
		// Selection already decoded this artwork; do not wait for a second image request.
		if (!painted)
			poster.src = getImageProps({
				src: source,
				alt: "",
				width: 96,
				height: 54,
				quality: 75,
			}).props.src;
		const observer = new MutationObserver(() => {
			if (item.kind === "mux-video" && !reduced) bindVideo();
		});
		observer.observe(root, {
			childList: true,
			subtree: item.kind === "mux-video" && !reduced,
		});
		if (item.kind === "mux-video" && !reduced) {
			bindVideo();
			void customElements.whenDefined("mux-video").then(() => {
				if (!cancelled) {
					observedHost = null;
					bindVideo();
				}
			});
		}
		document.addEventListener("visibilitychange", refresh);
		return () => {
			cancelled = true;
			light.stop();
			poster.onload = null;
			cancelFrame();
			unbindVideo();
			observer.disconnect();
			shadowObserver?.disconnect();
			document.removeEventListener("visibilitychange", refresh);
		};
	}, [root, item, closing]);
	return (
		<div className={styles.ambience} data-gallery-ambience="" aria-hidden="true">
			<canvas ref={field} width={96} height={54} data-active="true" />
		</div>
	);
}
