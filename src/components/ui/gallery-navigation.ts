import type PhotoSwipe from "photoswipe";
import {
	createGalleryMotionBlur,
	galleryTravel,
	galleryTravelDuration,
	galleryTravelSpeed,
} from "./gallery-motion";
import { captureTransitionScene } from "./gallery-transition-scene";
import styles from "./gallery-viewer.module.css";

export const GALLERY_INTERACTIVE_TARGETS =
	"[data-player-interactive], [data-gallery-interactive], button, input, a, [role=slider], [role=menu]";

/** PhotoSwipe keeps gestures and its bounded image cache; this controller prepares deliberate selections. */
export function createGalleryNavigation(
	viewer: PhotoSwipe,
	onPendingChange: (index: number | null) => void,
	reduced: boolean,
) {
	const prepared = new WeakMap<HTMLImageElement, { src: string; ready: Promise<void> }>();
	const posters = new WeakMap<HTMLElement, HTMLImageElement>();
	let snapshot: HTMLElement | null = null;
	let animations: Animation[] = [];
	let travel: {
		distance: number;
		duration: number;
		velocity: number;
		animation: Animation;
	} | null = null;
	let frameId: number | undefined;
	let nativeFrame: number | undefined;
	let version = 0;
	let pending: number | null = null;
	let handingOff = false;
	let motion: ReturnType<typeof createGalleryMotionBlur> | null = null;
	let lastNative = { x: 0, time: 0 };
	const prepare = (index: number) => {
		if (index < 0 || index >= viewer.getNumItems() || viewer.isDestroying) return;
		viewer.contentLoader.loadSlideByIndex(index);
		const content = viewer.contentLoader.getContentByIndex(index);
		if (!content?.element) return;
		let image: HTMLImageElement;
		if (content.element instanceof HTMLImageElement) image = content.element;
		else {
			const cachedPoster = posters.get(content.element);
			image = cachedPoster ?? new Image();
			if (!cachedPoster) {
				image.sizes = `${viewer.viewportSize.x}px`;
				image.srcset = content.data.srcset ?? "";
				image.src = content.data.src ?? content.data.msrc ?? "";
				posters.set(content.element, image);
			}
		}
		const src = `${image.srcset}|${image.sizes}|${image.src}`;
		const cached = prepared.get(image);
		if (cached?.src === src) return cached.ready;
		// Coalesce intent, keyboard and click preparation on the same decoded candidate.
		const ready = image.decode().then(
			() => {
				if (content.element && !(content.element instanceof HTMLImageElement))
					content.element.style.backgroundImage = `url(${JSON.stringify(image.currentSrc || image.src)})`;
			},
			() => {},
		);
		prepared.set(image, { src, ready });
		return ready;
	};
	const clearMotion = () => {
		for (const animation of animations) animation.cancel();
		animations = [];
		travel = null;
		if (frameId !== undefined) cancelAnimationFrame(frameId);
		frameId = undefined;
		if (nativeFrame !== undefined) cancelAnimationFrame(nativeFrame);
		nativeFrame = undefined;
		motion?.clear();
		if (viewer.scrollWrap) {
			viewer.scrollWrap.style.willChange = "";
		}
		snapshot?.remove();
		snapshot = null;
		viewer.element?.removeAttribute("data-gallery-jump");
	};
	const clear = () => {
		version += 1;
		pending = null;
		onPendingChange(null);
		clearMotion();
	};
	const navigate = (index: number, instant: boolean) => {
		const next = Math.max(0, Math.min(viewer.getNumItems() - 1, index));
		if (next === pending) return;
		const request = ++version;
		pending = next;
		onPendingChange(next === viewer.currIndex ? null : next);
		viewer.element?.setAttribute("data-instant", String(instant));
		const arrive = async () => {
			if (request !== version || viewer.isDestroying) return;
			const root = viewer.element;
			const stage = viewer.scrollWrap;
			if (!root || !stage) return;
			if (next === viewer.currIndex) {
				if (instant) clearMotion();
				else
					for (const animation of animations)
						if (animation.playState === "paused") animation.play();
				pending = null;
				onPendingChange(null);
				return;
			}
			const direction = Math.sign(next - viewer.currIndex);
			const screenVelocity = travel
				? (-travel.distance *
						galleryTravelSpeed(
							Number(travel.animation.currentTime ?? 0) / travel.duration,
							travel.velocity,
						)) /
					travel.duration
				: 0;
			for (const animation of animations) animation.pause();
			const currentElement = viewer.currSlide?.content.element;
			const captured = instant
				? null
				: captureTransitionScene(
						viewer,
						snapshot,
						currentElement ? posters.get(currentElement) : undefined,
					);
			// Clones share decoded image resources. Wait before replacing the visible scene.
			await Promise.all(
				[...(captured?.querySelectorAll("img") ?? [])].map((image) =>
					image.decode().catch(() => {}),
				),
			);
			if (request !== version || viewer.isDestroying) return;
			clearMotion();
			handingOff = true;
			viewer.goTo(next);
			handingOff = false;
			pending = null;
			onPendingChange(null);
			if (instant || !captured) return;
			snapshot = captured;
			stage.parentElement?.append(captured);
			root.dataset.galleryJump = "animating";
			const element = viewer.currSlide?.content.element;
			stage.style.willChange = "transform";
			const distance = root.clientWidth * direction;
			const duration = galleryTravelDuration(root.clientWidth);
			// Carry the visible scene's screen velocity, including braking before a reversal.
			const velocity = Math.max(-1.6, Math.min(1.6, (-screenVelocity * duration) / distance));
			const frames = Array.from({ length: 61 }, (_, frame) => {
				const offset = frame / 60;
				return { offset, progress: galleryTravel(offset, velocity) };
			});
			const timing = { duration, fill: "both" } as const;
			const incoming = stage.animate(
				frames.map(({ offset, progress }) => ({
					offset,
					translate: `${distance * (1 - progress)}px 0`,
				})),
				timing,
			);
			const outgoing = captured.animate(
				frames.map(({ offset, progress }) => ({
					offset,
					translate: `${-distance * progress}px 0`,
				})),
				timing,
			);
			// Copy only a resolved clock. Assigning the initially null startTime freezes
			// the outgoing plane over the incoming artwork until cleanup. Let the browser
			// start both at its next paint, avoiding a stale timeline time after decoding.
			void Promise.all([incoming.ready, outgoing.ready]).then(
				() => {
					if (snapshot === captured && typeof incoming.startTime === "number")
						outgoing.startTime = incoming.startTime;
				},
				() => {},
			);
			animations = [incoming, outgoing];
			travel = { animation: incoming, distance, duration, velocity };
			const artwork = [
				...(element ? [element] : []),
				...captured.querySelectorAll<HTMLElement>("[data-gallery-frame]"),
			];
			const expose = () => {
				const time = Number(incoming.currentTime ?? 0);
				// The derivative at this exact animation time avoids a one-frame blur lag
				// and the long-exposure smear of averaging across a delayed callback.
				motion?.update(
					(distance * galleryTravelSpeed(time / duration, velocity)) / duration,
					artwork,
				);
				frameId = requestAnimationFrame(expose);
			};
			frameId = requestAnimationFrame(expose);
			void incoming.finished.then(
				() => {
					if (snapshot === captured) clearMotion();
				},
				() => {},
			);
		};
		const ready = prepare(next);
		if (ready) void ready.then(arrive);
		else void arrive();
	};
	viewer.on("afterInit", () => {
		if (viewer.element && viewer.scrollWrap) {
			const viewport = document.createElement("div");
			viewport.className = styles.mediaViewport;
			viewer.scrollWrap.before(viewport);
			viewport.append(viewer.scrollWrap);
			if (!reduced) motion = createGalleryMotionBlur(viewer.element);
		}
	});
	viewer.on("openingAnimationEnd", () => {
		void prepare(viewer.currIndex);
	});
	viewer.on("moveMainScroll", ({ x }) => {
		if (!motion || snapshot || handingOff || !viewer.opener.isOpen) return;
		const time = performance.now();
		const elapsed = time - lastNative.time;
		motion.update(
			elapsed > 0 && elapsed < 80 ? (x - lastNative.x) / elapsed : 0,
			viewer.currSlide?.content.element ? [viewer.currSlide.content.element] : [],
		);
		lastNative = { x, time };
		if (nativeFrame !== undefined) cancelAnimationFrame(nativeFrame);
		// An idle pointer or settled spring has zero exposure, even without another scroll event.
		nativeFrame = requestAnimationFrame(() => {
			nativeFrame = requestAnimationFrame(() => motion?.clear());
		});
	});
	viewer.on("pointerDown", (event) => {
		const target = event.originalEvent.target;
		if (target instanceof Element && target.closest(GALLERY_INTERACTIVE_TARGETS)) return;
		const grabbing =
			target instanceof Element && target.closest(".pswp__img, [data-portfolio-video]");
		const offset =
			snapshot && grabbing && viewer.element && viewer.scrollWrap
				? viewer.scrollWrap.getBoundingClientRect().x -
					viewer.element.getBoundingClientRect().x
				: 0;
		clear();
		if (Math.abs(offset) > 0.1) {
			// Give the gesture engine the exact visible position before it records the pointer.
			// Its native release spring can then settle the interrupted selection naturally.
			handingOff = true;
			viewer.mainScroll.moveTo(viewer.mainScroll.x + offset);
			handingOff = false;
			lastNative = { x: viewer.mainScroll.x, time: performance.now() };
		}
	});
	viewer.on("close", clear);
	viewer.on("resize", clear);
	viewer.on("destroy", () => {
		clear();
		if (nativeFrame !== undefined) cancelAnimationFrame(nativeFrame);
		motion?.destroy();
	});
	return { navigate, prepare, clear, getTarget: () => pending ?? viewer.currIndex };
}
