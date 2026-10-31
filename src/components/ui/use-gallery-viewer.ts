"use client";

import { getImageProps } from "next/image";
import PhotoSwipe, { type SlideData } from "photoswipe";
import type { RefObject } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
	createGalleryNavigation,
	GALLERY_INTERACTIVE_TARGETS,
} from "@/src/components/ui/gallery-navigation";
import { getGalleryPadding } from "@/src/components/ui/gallery-viewer-layout";
import type { GalleryOrigin } from "@/src/components/ui/page-gallery-scope";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { stopAllPortfolioVideos } from "@/src/lib/portfolio-video-sync";
import styles from "./gallery-viewer.module.css";

export interface GalleryViewerOptions {
	activeIndex: number;
	items: GalleryMediaSource[];
	onIndexChange: (index: number) => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	quality: number;
	returnFocusRef?: RefObject<HTMLElement | null>;
	sourceRef?: RefObject<HTMLElement | null>;
	origins?: GalleryOrigin[];
	instant?: boolean;
	sizes: string;
}

/** Reference counts survive overlapping viewers and development module refreshes. */
function isolateViewer() {
	const viewport = document.documentElement;
	const viewportCount = Number(viewport.dataset.galleryViewportCount ?? 0);
	if (viewportCount === 0) {
		viewport.dataset.galleryViewportOverflow = viewport.style.overflowY;
		// Preserve the page's stable gutter while removing its scrollbar behind the viewer.
		viewport.style.overflowY = "hidden";
	}
	viewport.dataset.galleryViewportCount = String(viewportCount + 1);
	const elements: HTMLElement[] = [];
	for (const element of document.body.children) {
		if (!(element instanceof HTMLElement) || element.matches("script, .pswp")) continue;
		const count = Number(element.dataset.galleryInertCount ?? 0);
		if (count === 0) element.dataset.galleryInertOriginal = String(element.inert);
		element.dataset.galleryInertCount = String(count + 1);
		element.inert = true;
		elements.push(element);
	}
	return () => {
		const viewportCount = Number(viewport.dataset.galleryViewportCount ?? 1) - 1;
		if (viewportCount > 0) viewport.dataset.galleryViewportCount = String(viewportCount);
		else {
			viewport.style.overflowY = viewport.dataset.galleryViewportOverflow ?? "";
			delete viewport.dataset.galleryViewportCount;
			delete viewport.dataset.galleryViewportOverflow;
		}
		for (const element of elements) {
			const count = Number(element.dataset.galleryInertCount ?? 1) - 1;
			if (count > 0) element.dataset.galleryInertCount = String(count);
			else {
				element.inert = element.dataset.galleryInertOriginal === "true";
				delete element.dataset.galleryInertCount;
				delete element.dataset.galleryInertOriginal;
			}
		}
	};
}

function originFor(options: GalleryViewerOptions, index: number) {
	return (
		options.origins?.[index]?.slide ??
		options.sourceRef?.current?.querySelector<HTMLElement>(`[data-gallery-slide="${index}"]`) ??
		null
	);
}

function slideData(
	item: GalleryMediaSource,
	origin: HTMLElement | null,
	quality: number,
): SlideData {
	const source = item.kind === "image" ? item.src : item.poster;
	const thumbnail = origin?.querySelector("img");
	const width = typeof source === "string" ? 3840 : source.width;
	const ratio =
		thumbnail?.naturalWidth && thumbnail.naturalHeight
			? thumbnail.naturalWidth / thumbnail.naturalHeight
			: typeof source === "string"
				? 16 / 9
				: source.width / source.height;
	const height = Math.round(width / ratio);
	const image = getImageProps({
		src: source,
		width,
		height,
		alt: item.alt ?? "",
		sizes: "100vw",
		quality,
	}).props;
	const bounds = origin?.getBoundingClientRect();
	const visible =
		bounds &&
		bounds.bottom > 0 &&
		bounds.top < innerHeight &&
		bounds.right > 0 &&
		bounds.left < innerWidth;
	return {
		src: image.src,
		srcset: image.srcSet,
		width,
		height,
		alt: item.alt,
		msrc: thumbnail?.currentSrc || image.src,
		element: visible ? (origin ?? undefined) : undefined,
		thumbCropped: thumbnail ? getComputedStyle(thumbnail).objectFit === "cover" : false,
		type: item.kind === "mux-video" ? "portfolio-video" : "image",
	};
}

/** PhotoSwipe owns image geometry, gestures and transition completion; React owns the player and chrome. */
export function useGalleryViewer(options: GalleryViewerOptions) {
	const latest = useRef(options);
	latest.current = options;
	const instance = useRef<PhotoSwipe | null>(null);
	const navigation = useRef<ReturnType<typeof createGalleryNavigation> | null>(null);
	const sources = useRef<SlideData[]>([]);
	const pendingClose = useRef<boolean | null>(null);
	const pendingNavigation = useRef<{ index: number; keyboard: boolean } | null>(null);
	const [chrome, setChrome] = useState<HTMLElement | null>(null);
	const [videos, setVideos] = useState<Map<number, HTMLElement>>(new Map());
	const [index, setIndex] = useState(options.activeIndex);
	const [zoom, setZoom] = useState(1);
	const [closing, setClosing] = useState(false);
	const [ready, setReady] = useState(false);
	const [pendingIndex, setPendingIndex] = useState<number | null>(null);
	const lifecycle = useRef(0);
	const titleId = useId();
	const descriptionId = useId();
	const reduced = useRef(false);
	const resizeVideoSlides = useCallback(() => {
		const viewer = instance.current;
		if (!viewer?.opener.isOpen || viewer.isDestroying) return;
		for (const holder of viewer.mainScroll.itemHolders) {
			const slide = holder.slide;
			const source = slide && sources.current[slide.index];
			if (!slide || source?.type !== "portfolio-video" || !source.width || !source.height)
				continue;
			if (slide.width === source.width && slide.height === source.height) continue;
			slide.data.width = slide.content.width = slide.width = source.width;
			slide.data.height = slide.content.height = slide.height = source.height;
			// Resize the existing content rather than replacing a playing video.
			slide.resize();
		}
	}, []);
	const updateVideoDimensions = useCallback(
		(itemIndex: number, width: number, height: number) => {
			if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
				return;
			const source = sources.current[itemIndex];
			if (source?.type !== "portfolio-video") return;
			if (
				source.width &&
				source.height &&
				Math.abs(source.width / source.height - width / height) < 0.002
			)
				return;
			source.width = width;
			source.height = height;
			resizeVideoSlides();
		},
		[resizeVideoSlides],
	);

	const close = useCallback((keyboard = false) => {
		const viewer = instance.current;
		if (!viewer || viewer.isDestroying) return;
		stopAllPortfolioVideos();
		if (!viewer.opener.isOpen) {
			pendingClose.current = keyboard;
			return;
		}
		viewer.options.hideAnimationDuration = keyboard || reduced.current ? 0 : 180;
		viewer.close();
	}, []);

	useEffect(() => {
		if (!options.open) {
			close();
			return;
		}
		if (instance.current) return;
		const config = latest.current;
		reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const immediate = reduced.current || Boolean(config.instant);
		const opener =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const dataSource = config.items.map((item, itemIndex) =>
			slideData(item, originFor(config, itemIndex), config.quality),
		);
		sources.current = dataSource;
		const viewer = new PhotoSwipe({
			dataSource,
			index: config.activeIndex,
			mainClass: `${styles.viewer}${config.items.length > 1 ? "" : ` ${styles.single}`}`,
			showAnimationDuration: immediate ? 0 : 250,
			hideAnimationDuration: immediate ? 0 : 180,
			zoomAnimationDuration: immediate ? 0 : 180,
			easing: "cubic-bezier(0.22, 1, 0.36, 1)",
			bgOpacity: 1,
			loop: false,
			spacing: 0.06,
			wheelToZoom: true,
			initialZoomLevel: "fit",
			secondaryZoomLevel: (levels) => levels.fit * 2,
			maxZoomLevel: (levels) => levels.fit * 4,
			getViewportSizeFn: () => ({ x: window.innerWidth, y: window.innerHeight }),
			paddingFn: (viewport, item) =>
				getGalleryPadding(
					instance.current?.element,
					viewport,
					config.items.length > 1,
					item.type !== "portfolio-video",
				),
			close: false,
			zoom: false,
			counter: false,
			arrowPrev: false,
			arrowNext: false,
			preloaderDelay: 300,
			returnFocus: false,
			trapFocus: true,
			escKey: false,
			arrowKeys: false,
			imageClickAction: false,
			bgClickAction: () => close(),
			tapAction: (_point, event) => {
				if (
					event.target instanceof Element &&
					!event.target.closest(".pswp__img, [data-portfolio-video]")
				)
					close();
			},
			doubleTapAction: "zoom",
		});
		instance.current = viewer;
		navigation.current = createGalleryNavigation(viewer, setPendingIndex, reduced.current);
		// Reserve one modest zoom step up front; responsive candidates still respect viewport and DPR.
		viewer.addFilter("srcsetSizesWidth", (width, content) =>
			Math.ceil(Math.min(content.width, width * 1.25)),
		);
		pendingClose.current = null;
		pendingNavigation.current = null;
		setClosing(false);
		setReady(false);
		setIndex(config.activeIndex);
		setZoom(1);
		let releaseIsolation: (() => void) | undefined;
		viewer.on("uiRegister", () => {
			viewer.ui?.registerElement({
				name: "gallery-chrome",
				appendTo: "root",
				className: styles.chrome,
				onInit: setChrome,
			});
		});
		viewer.on("afterInit", () => {
			viewer.element?.setAttribute("data-gallery-kind", config.items[viewer.currIndex].kind);
			viewer.element?.setAttribute("aria-modal", "true");
			viewer.element?.setAttribute("aria-labelledby", titleId);
			viewer.element?.setAttribute("aria-describedby", descriptionId);
			viewer.element?.setAttribute("data-instant", String(immediate));
			viewer.element?.setAttribute(
				"data-gallery-state",
				viewer.opener.isOpen ? "open" : "opening",
			);
			releaseIsolation = isolateViewer();
		});
		viewer.on("openingAnimationEnd", () => {
			resizeVideoSlides();
			setReady(true);
			viewer.element?.setAttribute("data-gallery-state", "open");
			viewer.element
				?.querySelector<HTMLButtonElement>("[data-gallery-close]")
				?.focus({ preventScroll: true });
			if (pendingClose.current !== null) close(pendingClose.current);
			else if (pendingNavigation.current) {
				const request = pendingNavigation.current;
				pendingNavigation.current = null;
				navigation.current?.navigate(request.index, request.keyboard || reduced.current);
			}
		});
		viewer.on("change", () => {
			viewer.element?.setAttribute("data-gallery-kind", config.items[viewer.currIndex].kind);
			stopAllPortfolioVideos();
			setIndex(viewer.currIndex);
			setZoom(1);
			latest.current.onIndexChange(viewer.currIndex);
		});
		viewer.on("zoomPanUpdate", ({ slide }) => {
			if (slide.isActive) setZoom(slide.currZoomLevel / slide.zoomLevels.fit);
		});
		viewer.on("pointerDown", (event) => {
			if (!reduced.current && viewer.opener.isOpen) {
				viewer.element?.setAttribute("data-instant", "false");
				viewer.options.zoomAnimationDuration = 180;
			}
			if (
				event.originalEvent.target instanceof Element &&
				event.originalEvent.target.closest(GALLERY_INTERACTIVE_TARGETS)
			)
				event.preventDefault();
		});
		viewer.on("bindEvents", () => {
			let backgroundPointer: { x: number; y: number } | null = null;
			const isBackground = (target: EventTarget | null) =>
				target instanceof Element &&
				!target.closest(
					`.pswp__img, [data-portfolio-video], fieldset, ${GALLERY_INTERACTIVE_TARGETS}`,
				);
			const onPointerDown = (event: PointerEvent) => {
				backgroundPointer = isBackground(event.target)
					? { x: event.clientX, y: event.clientY }
					: null;
			};
			const onBackgroundClick = (event: MouseEvent) => {
				if (
					!backgroundPointer ||
					!isBackground(event.target) ||
					Math.hypot(
						event.clientX - backgroundPointer.x,
						event.clientY - backgroundPointer.y,
					) > 8
				)
					return;
				event.preventDefault();
				event.stopPropagation();
				close();
			};
			const onDoubleClick = (event: MouseEvent) => {
				if (event.target instanceof Element && event.target.matches(".pswp__img")) {
					viewer.currSlide?.toggleZoom({ x: event.clientX, y: event.clientY });
				}
			};
			// Capture a stationary background click before PhotoSwipe suppresses clicks during settling.
			viewer.element?.addEventListener("pointerdown", onPointerDown, true);
			viewer.element?.addEventListener("click", onBackgroundClick, true);
			viewer.scrollWrap?.addEventListener("dblclick", onDoubleClick);
			viewer.on("destroy", () => {
				viewer.element?.removeEventListener("pointerdown", onPointerDown, true);
				viewer.element?.removeEventListener("click", onBackgroundClick, true);
				viewer.scrollWrap?.removeEventListener("dblclick", onDoubleClick);
			});
		});
		viewer.on("keydown", (event) => {
			const key = event.originalEvent;
			if (key.defaultPrevented || key.altKey || key.metaKey || key.ctrlKey) {
				event.preventDefault();
				return;
			}
			const target = key.target instanceof Element ? key.target : null;
			const playerOwnsInput = target?.closest(
				"[data-portfolio-video], [data-player-interactive], input, [role=slider], [role=menu]",
			);
			if (key.key === "Escape") {
				event.preventDefault();
				if (
					viewer.element?.querySelector(
						'[data-slot="dropdown-menu-content"]:not([data-closed])',
					)
				)
					return;
				if (document.fullscreenElement) {
					void document.exitFullscreen().catch(() => {});
					return;
				}
				key.preventDefault();
				close(true);
			} else if (playerOwnsInput) {
				event.preventDefault();
			} else if (
				[
					"ArrowLeft",
					"ArrowRight",
					"ArrowUp",
					"ArrowDown",
					"Home",
					"End",
					"+",
					"=",
					"-",
					"_",
				].includes(key.key)
			) {
				key.preventDefault();
				event.preventDefault();
				viewer.element?.setAttribute("data-instant", "true");
				const slide = viewer.currSlide;
				if (key.key === "Home" || key.key === "End")
					navigation.current?.navigate(
						key.key === "Home" ? 0 : config.items.length - 1,
						true,
					);
				else if (["+", "=", "-", "_"].includes(key.key) && slide?.isZoomable()) {
					const delta = key.key === "+" || key.key === "=" ? 0.5 : -0.5;
					viewer.zoomTo(
						Math.max(
							slide.zoomLevels.fit,
							Math.min(
								slide.zoomLevels.max,
								slide.currZoomLevel + delta * slide.zoomLevels.fit,
							),
						),
						undefined,
						0,
					);
				} else if (slide && slide.currZoomLevel > slide.zoomLevels.fit + 0.001) {
					slide.panTo(
						slide.pan.x +
							(key.key === "ArrowLeft" ? 60 : key.key === "ArrowRight" ? -60 : 0),
						slide.pan.y +
							(key.key === "ArrowUp" ? 60 : key.key === "ArrowDown" ? -60 : 0),
					);
				} else if (key.key === "ArrowLeft" || key.key === "ArrowRight")
					navigation.current?.navigate(
						navigation.current.getTarget() + (key.key === "ArrowRight" ? 1 : -1),
						true,
					);
			}
		});
		viewer.on("contentLoad", (event) => {
			const { content } = event;
			if (content.type !== "portfolio-video") return;
			event.preventDefault();
			const element = document.createElement("div");
			element.className = styles.video;
			element.style.backgroundImage = `url(${JSON.stringify(content.data.msrc || content.data.src)})`;
			content.element = element;
			content.onLoaded();
			setVideos((current) => new Map(current).set(content.index, element));
		});
		viewer.on("contentDestroy", ({ content }) => {
			if (content.type !== "portfolio-video") return;
			setVideos((current) => {
				const next = new Map(current);
				next.delete(content.index);
				return next;
			});
		});
		viewer.on("contentActivate", ({ content }) => {
			if (content.slide?.holderElement) content.slide.holderElement.inert = false;
		});
		viewer.on("contentAppend", ({ content }) => {
			if (content.slide?.holderElement)
				content.slide.holderElement.inert = !content.slide.isActive;
		});
		viewer.on("contentDeactivate", ({ content }) => {
			if (content.slide?.holderElement) content.slide.holderElement.inert = true;
		});
		viewer.on("close", () => {
			stopAllPortfolioVideos();
			setClosing(true);
			viewer.element?.setAttribute("data-gallery-state", "closing");
			latest.current.onOpenChange(false);
		});
		viewer.on("destroy", () => {
			releaseIsolation?.();
			instance.current = null;
			navigation.current = null;
			sources.current = [];
			setChrome(null);
			setVideos(new Map());
			const target = latest.current.returnFocusRef?.current ?? opener;
			if (target?.isConnected) target.focus({ preventScroll: true });
		});
		const onOpeningEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || viewer.opener.isOpen || viewer.isDestroying) return;
			event.preventDefault();
			event.stopPropagation();
			close(true);
		};
		document.addEventListener("keydown", onOpeningEscape, true);
		viewer.on("destroy", () => document.removeEventListener("keydown", onOpeningEscape, true));
		viewer.init();
	}, [options.open, close, titleId, descriptionId, resizeVideoSlides]);

	useEffect(() => {
		const viewer = instance.current;
		if (options.open && viewer?.opener.isOpen && viewer.currIndex !== options.activeIndex)
			navigation.current?.navigate(options.activeIndex, reduced.current);
	}, [options.activeIndex, options.open]);

	useEffect(() => {
		lifecycle.current += 1;
		return () => {
			const version = lifecycle.current;
			queueMicrotask(() => {
				if (version !== lifecycle.current) return;
				const viewer = instance.current;
				if (!viewer) return;
				if (viewer.opener.isOpening)
					viewer.on("openingAnimationEnd", () => viewer.destroy());
				else viewer.destroy();
			});
		};
	}, []);

	const navigate = useCallback((nextIndex: number, keyboard = false) => {
		const viewer = instance.current;
		if (!viewer || viewer.isDestroying) return;
		const next = Math.max(0, Math.min(viewer.getNumItems() - 1, nextIndex));
		viewer.element?.setAttribute("data-instant", String(keyboard || reduced.current));
		if (!viewer.opener.isOpen) {
			pendingNavigation.current = { index: next, keyboard };
			return;
		}
		navigation.current?.navigate(next, keyboard || reduced.current);
	}, []);
	const changeZoom = useCallback((change: number | "fit", keyboard = false) => {
		const viewer = instance.current;
		const slide = viewer?.currSlide;
		if (!viewer || !slide?.isZoomable()) return;
		viewer.element?.setAttribute("data-instant", String(keyboard || reduced.current));
		const next =
			change === "fit"
				? slide.zoomLevels.fit
				: Math.min(
						slide.zoomLevels.max,
						Math.max(
							slide.zoomLevels.fit,
							slide.currZoomLevel + change * slide.zoomLevels.fit,
						),
					);
		viewer.zoomTo(next, undefined, keyboard || reduced.current ? 0 : 180);
	}, []);
	const prepare = useCallback((nextIndex: number) => {
		void navigation.current?.prepare(nextIndex);
	}, []);
	return {
		ready,
		pendingIndex,
		chrome,
		videos,
		index,
		zoom,
		closing,
		close,
		navigate,
		prepare,
		changeZoom,
		updateVideoDimensions,
		titleId,
		descriptionId,
	};
}
