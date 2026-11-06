import type PhotoSwipe from "photoswipe";
import styles from "./gallery-viewer.module.css";

type Bounds = { left: number; top: number; width: number; height: number };

function intersection(a: Bounds, b: Bounds): Bounds | null {
	const left = Math.max(a.left, b.left);
	const top = Math.max(a.top, b.top);
	const right = Math.min(a.left + a.width, b.left + b.width);
	const bottom = Math.min(a.top + a.height, b.top + b.height);
	return right - left > 0.5 && bottom - top > 0.5
		? { left, top, width: right - left, height: bottom - top }
		: null;
}

function place(element: HTMLElement, bounds: Bounds, origin: Bounds) {
	Object.assign(element.style, {
		position: "absolute",
		left: `${bounds.left - origin.left}px`,
		top: `${bounds.top - origin.top}px`,
		width: `${bounds.width}px`,
		height: `${bounds.height}px`,
	});
}

function copyFrame(source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
	if (source instanceof HTMLImageElement) {
		if (!source.complete || !source.naturalWidth) return null;
		const image = new Image();
		image.alt = "";
		image.decoding = "sync";
		// Reuse the exact decoded candidate; never shrink a retiring image into a preview canvas.
		image.src = source.currentSrc || source.src;
		return image;
	}
	const canvas = document.createElement("canvas");
	const width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
	const height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
	if (!width || !height) return null;
	const bounds = source.getBoundingClientRect();
	const scale = Math.min(1, (bounds.width * Math.min(devicePixelRatio, 2)) / width);
	canvas.width = Math.round(width * scale);
	canvas.height = Math.round(height * scale);
	try {
		canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
	} catch {
		return null;
	}
	return canvas;
}

/** Flatten the visible pieces when retargeting a moving scene, without capturing any controls. */
export function captureTransitionScene(
	viewer: PhotoSwipe,
	retained: HTMLElement | null,
	poster?: HTMLImageElement,
) {
	const root = viewer.element;
	const stage = viewer.scrollWrap;
	if (!root || !stage) return null;
	const viewport = root.getBoundingClientRect();
	const scene = document.createElement("div");
	scene.className = styles.mediaTransition;
	scene.dataset.galleryTransition = "";
	scene.setAttribute("aria-hidden", "true");
	const appendPlane = (
		clip: Bounds,
		source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
		artwork: Bounds,
	) => {
		const visible = intersection(clip, viewport);
		if (!visible) return;
		const frame = copyFrame(source);
		if (!frame) return;
		const plane = document.createElement("div");
		plane.dataset.galleryPlane = "";
		place(plane, visible, viewport);
		plane.style.overflow = "hidden";
		frame.dataset.galleryFrame = "";
		place(frame, artwork, visible);
		plane.append(frame);
		scene.append(plane);
	};
	for (const plane of retained?.querySelectorAll<HTMLElement>("[data-gallery-plane]") ?? []) {
		const frame = plane.querySelector<HTMLImageElement | HTMLCanvasElement>(
			"[data-gallery-frame]",
		);
		if (frame) appendPlane(plane.getBoundingClientRect(), frame, frame.getBoundingClientRect());
	}
	const content = viewer.currSlide?.content.element;
	const video = content?.querySelector("mux-video")?.shadowRoot?.querySelector("video");
	const source =
		content instanceof HTMLImageElement
			? content
			: video && video.readyState >= 2
				? video
				: poster;
	if (content && source) {
		appendPlane(stage.getBoundingClientRect(), source, content.getBoundingClientRect());
	}
	return scene.childElementCount ? scene : null;
}
