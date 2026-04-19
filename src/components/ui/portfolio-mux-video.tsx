"use client";

import "@mux/mux-video";
import type MuxVideoElement from "@mux/mux-video";
import {
	ArrowsInIcon,
	ArrowsOutIcon,
	PauseIcon,
	PlayIcon,
	SpeakerHighIcon,
	SpeakerLowIcon,
	SpeakerSimpleSlashIcon,
	XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Spinner } from "@/src/components/ui/spinner";
import type { MuxVideoMetadata } from "@/src/content/types";
import { cn, tweens } from "@/src/lib/index";
import {
	announceActivePortfolioVideo,
	PORTFOLIO_VIDEO_ACTIVE_EVENT,
	type PortfolioVideoActiveEventDetail,
} from "@/src/lib/portfolio-video-sync";

type PortfolioMuxVideoVariant = "gallery" | "lightbox" | "article";

interface PortfolioMuxVideoProps {
	playbackId: string;
	poster?: string | StaticImageData;
	metadata?: MuxVideoMetadata;
	variant: PortfolioMuxVideoVariant;
	active?: boolean;
	autoPlay?: boolean;
	loop?: boolean;
	muted?: boolean;
	className?: string;
	onExit?: () => void;
	onPlayingChange?: (playing: boolean) => void;
}

type QualityOption = {
	label: string;
	shortLabel: string;
	value: string;
	badge?: string;
};

const PLAYBACK_RATE_OPTIONS = [
	{ label: "1x", value: 1 },
	{ label: "1.25x", value: 1.25 },
	{ label: "1.5x", value: 1.5 },
	{ label: "1.75x", value: 1.75 },
	{ label: "2x", value: 2 },
] as const;

let nextPortfolioMuxVideoId = 0;

const PLAYER_BUTTON_CLASS_NAME = cn(
	"flex h-10 items-center justify-center gap-2 rounded-none border-none bg-surface-950 px-3 text-white",
	"disabled:pointer-events-none disabled:opacity-35",
	"focus-visible:outline-none",
	"hover:bg-surface-800",
);

const PLAYER_ICON_BUTTON_CLASS_NAME = cn(
	"flex h-10 w-10 items-center justify-center rounded-none border-none bg-surface-950 text-white",
	"disabled:pointer-events-none disabled:opacity-35",
	"focus-visible:outline-none",
	"hover:bg-surface-800",
);

const PLAYER_TIME_DISPLAY_CLASS_NAME = cn(
	"pointer-events-auto inline-flex h-10 cursor-default items-center rounded-none border-none bg-surface-950 px-3 font-mono text-[10px] text-white uppercase tracking-[0.22em]",
);

function formatPlaybackTime(value: number) {
	if (!Number.isFinite(value) || value <= 0) {
		return "0:00";
	}

	const totalSeconds = Math.floor(value);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getQualityBadge(height?: number) {
	if (!height) return null;
	if (height >= 2160) return "4K";
	if (height >= 1440) return "QHD";
	if (height >= 720) return "HD";
	if (height >= 480) return "SD";
	return null;
}

function formatQualityOption(rendition: {
	bitrate?: number;
	height?: number;
	id?: string;
}): QualityOption {
	const resolutionLabel = rendition.height ? `${rendition.height}p` : (rendition.id ?? "Manual");
	return {
		label: resolutionLabel,
		shortLabel: resolutionLabel,
		value: String(rendition.id),
		badge: getQualityBadge(rendition.height) ?? undefined,
	};
}

function getPosterSrc(poster?: string | StaticImageData) {
	if (!poster) return undefined;
	return typeof poster === "string" ? poster : poster.src;
}

function getMuxStreamSrc(playbackId: string) {
	return `https://stream.mux.com/${playbackId}.m3u8`;
}

function getPlaybackRateLabel(value: number) {
	return PLAYBACK_RATE_OPTIONS.find((option) => option.value === value)?.label ?? `${value}x`;
}

function getVolumeIcon(isMuted: boolean, volume: number) {
	if (isMuted || volume <= 0.01) {
		return SpeakerSimpleSlashIcon;
	}

	if (volume < 0.5) {
		return SpeakerLowIcon;
	}

	return SpeakerHighIcon;
}

function pauseNativeMediaElement(media: HTMLMediaElement) {
	try {
		media.pause();
	} catch {}
}

function pauseMuxMediaElement(media: MuxVideoElement, options?: { unload?: boolean }) {
	try {
		media.pause();
	} catch {}

	try {
		media.autoplay = false;
	} catch {}

	try {
		media.removeAttribute("autoplay");
	} catch {}

	if (options?.unload) {
		try {
			media.unload?.();
		} catch {}
	}
}

export function PortfolioMuxVideo({
	playbackId,
	poster,
	metadata,
	variant,
	active,
	autoPlay = false,
	loop = false,
	muted = false,
	className,
	onExit,
	onPlayingChange,
}: PortfolioMuxVideoProps) {
	const pathname = usePathname();
	const mediaRef = useRef<MuxVideoElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const hideControlsTimeoutRef = useRef<number | null>(null);
	const instanceIdRef = useRef(++nextPortfolioMuxVideoId);
	const lastEmittedPlayingStateRef = useRef<boolean | null>(null);
	const playbackCommandIdRef = useRef(0);
	const isActive = active ?? autoPlay;
	const desiredPlayingRef = useRef(Boolean(isActive));
	const [isPlaying, setIsPlaying] = useState(Boolean(isActive));
	const [isMuted, setIsMuted] = useState(muted);
	const [volume, setVolume] = useState(1);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [controlsVisible, setControlsVisible] = useState(true);
	const [isPointerInside, setIsPointerInside] = useState(false);
	const [isFocusedWithin, setIsFocusedWithin] = useState(false);
	const [openMenu, setOpenMenu] = useState<"quality" | "rate" | null>(null);
	const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([
		{ label: "Auto", shortLabel: "Auto", value: "auto" },
	]);
	const [qualityValue, setQualityValue] = useState("auto");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMediaReady, setIsMediaReady] = useState(false);
	const [isBuffering, setIsBuffering] = useState(Boolean(isActive));
	const [isWaitingForPlayback, setIsWaitingForPlayback] = useState(Boolean(isActive));
	const [isSeeking, setIsSeeking] = useState(false);
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

	const posterSrc = useMemo(() => getPosterSrc(poster), [poster]);
	const resolvedPlaybackSrc = useMemo(() => getMuxStreamSrc(playbackId), [playbackId]);
	const menuOpen = openMenu !== null;
	const hasQualityMenu = qualityOptions.length > 2;
	const playedPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
	const volumePercent = Math.min(Math.max(volume * 100, 0), 100);
	const rateLabel = getPlaybackRateLabel(playbackRate);
	const qualityLabel =
		qualityOptions.find((option) => option.value === qualityValue)?.shortLabel ?? "Auto";
	const VolumeIcon = getVolumeIcon(isMuted, volume);
	const controlsInteractiveClassName = controlsVisible
		? "pointer-events-auto"
		: "pointer-events-none";
	const showCenterStatus = isActive && (isWaitingForPlayback || isBuffering || isSeeking);
	const centerStatusLabel = isSeeking
		? "Seeking"
		: !isMediaReady || !hasStartedPlayback
			? "Loading video"
			: "Buffering";

	const clearControlsTimeout = useCallback(() => {
		if (hideControlsTimeoutRef.current !== null) {
			window.clearTimeout(hideControlsTimeoutRef.current);
			hideControlsTimeoutRef.current = null;
		}
	}, []);

	const pauseOtherDocumentMedia = useCallback((except?: MuxVideoElement | null) => {
		if (typeof document === "undefined") return;

		for (const media of document.querySelectorAll("mux-video")) {
			const muxMedia = media as MuxVideoElement;
			if (except && muxMedia === except) continue;
			pauseMuxMediaElement(muxMedia);
		}

		for (const media of document.querySelectorAll("video, audio")) {
			pauseNativeMediaElement(media as HTMLMediaElement);
		}
	}, []);

	const stopPlayback = useCallback((options?: { unload?: boolean }) => {
		const media = mediaRef.current;
		if (!media) return;

		playbackCommandIdRef.current += 1;
		desiredPlayingRef.current = false;
		pauseMuxMediaElement(media, options);

		setIsPlaying(false);
		setOpenMenu(null);
		setControlsVisible(true);
	}, []);

	const ensureMediaSource = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		const expectedSrc = resolvedPlaybackSrc;
		const currentSource = media.currentSrc || media.src || "";
		const sourceLooksMissing =
			!currentSource ||
			(!currentSource.includes(playbackId) && currentSource !== expectedSrc);

		if (media.src !== expectedSrc || sourceLooksMissing) {
			media.src = expectedSrc;
		}
	}, [playbackId, resolvedPlaybackSrc]);

	const applyStableMediaConfig = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		media.loop = loop;
		media.muted = muted;
		media.defaultMuted = muted;
		media.playsInline = true;
		media.poster = posterSrc ?? "";
		media.preload = isActive || variant !== "article" ? "auto" : "metadata";
		media.streamType = "on-demand";
		media.metadata = metadata ?? {};
	}, [isActive, loop, metadata, muted, posterSrc, variant]);

	const scheduleControlsHide = useCallback(() => {
		clearControlsTimeout();
		if (!isPlaying || isPointerInside || isFocusedWithin || menuOpen) {
			setControlsVisible(true);
			return;
		}

		// Instant disappearance on pointer leave for maximum video aspect
		setControlsVisible(false);
	}, [clearControlsTimeout, isFocusedWithin, isPlaying, isPointerInside, menuOpen]);

	const syncFromMedia = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		const currentlyPlaying = !media.paused && !media.ended;
		const readyState = media.readyState ?? 0;
		const metadataReady = readyState >= 1;
		const buffering =
			desiredPlayingRef.current &&
			!media.ended &&
			(media.seeking || readyState < (currentlyPlaying ? 3 : 2));
		const waitingForPlayback = desiredPlayingRef.current && !currentlyPlaying && !media.ended;
		setIsPlaying(currentlyPlaying);
		setCurrentTime(Number.isFinite(media.currentTime) ? media.currentTime : 0);
		setDuration(Number.isFinite(media.duration) ? media.duration : 0);
		setIsMuted(media.muted);
		setVolume(media.volume ?? 1);
		setPlaybackRate(media.playbackRate ?? 1);
		setIsMediaReady(metadataReady);
		setIsBuffering(buffering);
		setIsWaitingForPlayback(waitingForPlayback);
		setIsSeeking(media.seeking);
		if (currentlyPlaying || media.currentTime > 0) {
			setHasStartedPlayback(true);
		}

		const renditionList = media.videoRenditions;
		const renditions = renditionList ? Array.from(renditionList) : [];
		const sortedRenditions = [...renditions].sort((left, right) => {
			const heightDelta = (right.height ?? 0) - (left.height ?? 0);
			if (heightDelta !== 0) return heightDelta;
			return (right.bitrate ?? 0) - (left.bitrate ?? 0);
		});

		const nextOptions = [
			...sortedRenditions.map((rendition) => formatQualityOption(rendition)),
			{ label: "Auto", shortLabel: "Auto", value: "auto" },
		];

		setQualityOptions(nextOptions);
		setQualityValue(
			renditionList && renditionList.selectedIndex >= 0
				? String(renditions[renditionList.selectedIndex]?.id)
				: "auto",
		);
		const shouldEmitPlayingChange =
			currentlyPlaying || lastEmittedPlayingStateRef.current === true;
		if (shouldEmitPlayingChange && lastEmittedPlayingStateRef.current !== currentlyPlaying) {
			lastEmittedPlayingStateRef.current = currentlyPlaying;
			onPlayingChange?.(currentlyPlaying);
		}
	}, [onPlayingChange]);

	useEffect(() => {
		void playbackId;
		setIsMediaReady(false);
		setIsBuffering(false);
		setIsWaitingForPlayback(false);
		setIsSeeking(false);
		setHasStartedPlayback(false);
		setCurrentTime(0);
		setDuration(0);
		setQualityOptions([{ label: "Auto", shortLabel: "Auto", value: "auto" }]);
		setQualityValue("auto");
	}, [playbackId]);

	const togglePlayback = useCallback(async () => {
		const media = mediaRef.current;
		if (!media) return;

		const shouldPlay = media.paused || media.ended || !desiredPlayingRef.current;

		if (shouldPlay) {
			const commandId = ++playbackCommandIdRef.current;
			desiredPlayingRef.current = true;
			setControlsVisible(true);
			applyStableMediaConfig();
			ensureMediaSource();
			pauseOtherDocumentMedia(media);

			try {
				await media.play();
			} catch {
				if (playbackCommandIdRef.current === commandId) {
					desiredPlayingRef.current = false;
					syncFromMedia();
				}
				setControlsVisible(true);
				return;
			}

			if (
				playbackCommandIdRef.current !== commandId ||
				!desiredPlayingRef.current ||
				mediaRef.current !== media
			) {
				pauseMuxMediaElement(media);
				syncFromMedia();
			}
			return;
		}

		stopPlayback();
	}, [
		applyStableMediaConfig,
		ensureMediaSource,
		pauseOtherDocumentMedia,
		stopPlayback,
		syncFromMedia,
	]);

	const toggleMute = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		media.muted = !media.muted;
		syncFromMedia();
	}, [syncFromMedia]);

	const handleVolumeChange = useCallback(
		(nextVolume: number) => {
			const media = mediaRef.current;
			if (!media) return;

			media.volume = nextVolume;
			media.muted = nextVolume <= 0.01;
			syncFromMedia();
		},
		[syncFromMedia],
	);

	const handleSeek = useCallback((nextTime: number) => {
		const media = mediaRef.current;
		if (!media) return;

		media.currentTime = nextTime;
		setCurrentTime(nextTime);
	}, []);

	const handlePlaybackRateChange = useCallback((nextRate: string) => {
		const media = mediaRef.current;
		if (!media) return;

		const parsedRate = Number(nextRate);
		media.playbackRate = parsedRate;
		setPlaybackRate(parsedRate);
		setOpenMenu(null);
	}, []);

	const handleQualityChange = useCallback(
		(nextQuality: string) => {
			const media = mediaRef.current;
			if (!media?.videoRenditions) return;

			const renditions = Array.from(media.videoRenditions);
			if (nextQuality === "auto") {
				media.videoRenditions.selectedIndex = -1;
			} else {
				const renditionIndex = renditions.findIndex(
					(rendition) => String(rendition.id) === nextQuality,
				);
				if (renditionIndex >= 0) {
					media.videoRenditions.selectedIndex = renditionIndex;
				}
			}

			syncFromMedia();
			setOpenMenu(null);
		},
		[syncFromMedia],
	);

	const toggleFullscreen = useCallback(async () => {
		const container = containerRef.current;
		if (!container || typeof document === "undefined") return;

		if (document.fullscreenElement === container) {
			await document.exitFullscreen().catch(() => undefined);
			return;
		}

		try {
			if (container.requestFullscreen) {
				await container.requestFullscreen({
					navigationUI: "hide",
				});
			}
		} catch (_error) {}
	}, []);

	useEffect(() => {
		const media = mediaRef.current;
		if (!media) return;

		const handleMediaEvent = () => {
			syncFromMedia();
		};

		const handleSourceIntegrityEvent = () => {
			ensureMediaSource();
		};

		const eventNames = [
			"loadstart",
			"play",
			"playing",
			"pause",
			"ended",
			"timeupdate",
			"durationchange",
			"volumechange",
			"ratechange",
			"loadedmetadata",
			"loadeddata",
			"canplay",
			"canplaythrough",
			"progress",
			"waiting",
			"stalled",
			"seeking",
			"seeked",
		] as const;

		const sourceIntegrityEventNames = ["emptied", "abort", "suspend"] as const;

		for (const eventName of eventNames) {
			media.addEventListener(eventName, handleMediaEvent);
		}

		for (const eventName of sourceIntegrityEventNames) {
			media.addEventListener(eventName, handleSourceIntegrityEvent);
		}

		const renditions = media.videoRenditions;
		if (renditions) {
			renditions.addEventListener("change", handleMediaEvent);
			renditions.addEventListener("addrendition", handleMediaEvent);
			renditions.addEventListener("removerendition", handleMediaEvent);
		}

		syncFromMedia();

		return () => {
			for (const eventName of eventNames) {
				media.removeEventListener(eventName, handleMediaEvent);
			}

			for (const eventName of sourceIntegrityEventNames) {
				media.removeEventListener(eventName, handleSourceIntegrityEvent);
			}

			if (renditions) {
				renditions.removeEventListener("change", handleMediaEvent);
				renditions.removeEventListener("addrendition", handleMediaEvent);
				renditions.removeEventListener("removerendition", handleMediaEvent);
			}
		};
	}, [ensureMediaSource, syncFromMedia]);

	useEffect(() => {
		applyStableMediaConfig();
	}, [applyStableMediaConfig]);

	useEffect(() => {
		ensureMediaSource();
	}, [ensureMediaSource]);

	useLayoutEffect(() => {
		const media = mediaRef.current;
		if (!media) return;
		desiredPlayingRef.current = isActive;

		if (isActive) {
			if (!media.paused && !media.ended) {
				setControlsVisible(true);
				return;
			}

			const commandId = ++playbackCommandIdRef.current;
			setControlsVisible(true);
			applyStableMediaConfig();
			ensureMediaSource();
			pauseOtherDocumentMedia(media);

			void media.play().catch(() => {
				if (playbackCommandIdRef.current === commandId) {
					desiredPlayingRef.current = false;
					syncFromMedia();
				}
				setControlsVisible(true);
			});
			return;
		}

		try {
			media.pause();
		} catch {}

		setIsPlaying(false);
		setControlsVisible(true);
	}, [
		applyStableMediaConfig,
		ensureMediaSource,
		isActive,
		pauseOtherDocumentMedia,
		syncFromMedia,
	]);

	useEffect(() => {
		const media = mediaRef.current;
		if (!media || typeof window === "undefined") return;

		const announceActivation = () => {
			announceActivePortfolioVideo({
				instanceId: instanceIdRef.current,
				pathname,
			});
		};

		media.addEventListener("play", announceActivation);
		return () => media.removeEventListener("play", announceActivation);
	}, [pathname]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleActivePlayerChange = (event: Event) => {
			const detail = (event as CustomEvent<PortfolioVideoActiveEventDetail>).detail;
			if (detail?.instanceId === instanceIdRef.current) {
				return;
			}

			const media = mediaRef.current;
			if (!media) return;
			desiredPlayingRef.current = false;
			try {
				media.pause();
			} catch {}
			setIsPlaying(false);
			setControlsVisible(true);
		};

		window.addEventListener(
			PORTFOLIO_VIDEO_ACTIVE_EVENT,
			handleActivePlayerChange as EventListener,
		);
		return () =>
			window.removeEventListener(
				PORTFOLIO_VIDEO_ACTIVE_EVENT,
				handleActivePlayerChange as EventListener,
			);
	}, []);

	useEffect(() => {
		if (typeof document === "undefined") return;

		const handleFullscreenChange = () => {
			const isNowFullscreen = document.fullscreenElement === containerRef.current;
			setIsFullscreen(isNowFullscreen);

			const container = containerRef.current;
			if (container) {
				if (isNowFullscreen) {
					// Prevent scrolling in fullscreen mode
					document.documentElement.style.overflow = "hidden";
					document.body.style.overflow = "hidden";
					// Update layout containment
					container.style.contain = "layout style paint";
				} else {
					// Restore scrolling
					document.documentElement.style.overflow = "";
					document.body.style.overflow = "";
					container.style.contain = "";
				}
			}
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	useEffect(() => {
		if (!isPlaying) {
			clearControlsTimeout();
			setControlsVisible(true);
			return;
		}

		scheduleControlsHide();
	}, [clearControlsTimeout, isPlaying, scheduleControlsHide]);

	// Handle window resize and orientation change for responsive fullscreen
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleResize = () => {
			const container = containerRef.current;
			if (!container || document.fullscreenElement !== container) return;

			// Force re-layout in fullscreen mode
			const wasVisible = container.style.display;
			container.style.display = "none";
			// Trigger reflow
			void container.offsetHeight;
			container.style.display = wasVisible;
		};

		const handleOrientationChange = () => {
			// Allow brief delay for browser to update viewport dimensions
			setTimeout(handleResize, 100);
		};

		window.addEventListener("resize", handleResize, { passive: true });
		window.addEventListener("orientationchange", handleOrientationChange, { passive: true });

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleOrientationChange);
		};
	}, []);

	useEffect(() => {
		return () => {
			clearControlsTimeout();
			stopPlayback({ unload: true });
		};
	}, [clearControlsTimeout, stopPlayback]);

	useEffect(() => {
		const activePathname = pathname;

		return () => {
			void activePathname;
			pauseOtherDocumentMedia();
			stopPlayback({ unload: true });
		};
	}, [pathname, pauseOtherDocumentMedia, stopPlayback]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		// Hide controls when window loses focus (switching to another app)
		const handleWindowBlur = () => {
			setControlsVisible(false);
		};

		// Hide controls when page becomes hidden (tab switch, minimize)
		const handleVisibilityChange = () => {
			if (document.hidden) {
				setControlsVisible(false);
			}
		};

		window.addEventListener("blur", handleWindowBlur);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("blur", handleWindowBlur);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	const handlePointerActivity = useCallback(() => {
		setControlsVisible(true);
		scheduleControlsHide();
	}, [scheduleControlsHide]);

	const handleRootClick = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			const target = event.target as HTMLElement | null;
			if (target?.closest("[data-player-interactive]")) {
				return;
			}

			void togglePlayback();
		},
		[togglePlayback],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			const target = event.target as HTMLElement | null;
			if (menuOpen) {
				return;
			}

			if (target instanceof HTMLInputElement) {
				return;
			}

			if (
				target?.closest("[data-player-interactive]") &&
				(event.key === " " || event.key === "Enter")
			) {
				return;
			}

			switch (event.key) {
				case " ":
				case "k":
				case "K":
					event.preventDefault();
					void togglePlayback();
					return;
				case "m":
				case "M":
					event.preventDefault();
					toggleMute();
					return;
				case "f":
				case "F":
					event.preventDefault();
					void toggleFullscreen();
					return;
				case "ArrowLeft":
					event.preventDefault();
					handleSeek(Math.max(0, currentTime - 5));
					return;
				case "ArrowRight":
					event.preventDefault();
					handleSeek(Math.min(duration || currentTime + 5, currentTime + 5));
					return;
				case "Escape":
					if (onExit) {
						event.preventDefault();
						onExit();
					}
					return;
				default:
					return;
			}
		},
		[
			currentTime,
			duration,
			handleSeek,
			menuOpen,
			onExit,
			toggleFullscreen,
			toggleMute,
			togglePlayback,
		],
	);

	return (
		<div
			ref={containerRef}
			className={cn(
				"group relative h-full w-full overflow-hidden bg-surface-950 text-surface-50",
				"outline-none focus-visible:ring-2 focus-visible:ring-surface-50/18 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
				isFullscreen && "fixed inset-0 z-50 m-0 rounded-none",
				className,
			)}
			role="application"
			aria-label="Video player"
			onClick={handleRootClick}
			onFocus={() => setIsFocusedWithin(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setIsFocusedWithin(false);
				}
			}}
			onKeyDown={handleKeyDown}
			onPointerEnter={() => {
				setIsPointerInside(true);
				handlePointerActivity();
			}}
			onPointerLeave={() => {
				setIsPointerInside(false);
				clearControlsTimeout();
				setControlsVisible(false);
			}}
			onPointerMove={handlePointerActivity}
			onTouchStart={(event) => {
				// Prevent default touch behaviors that might interfere
				if ((event.target as HTMLElement)?.closest("input, button, [role='button']"))
					return;
				handlePointerActivity();
			}}
			onTouchEnd={() => {
				clearControlsTimeout();
				setControlsVisible(false);
			}}
			onTouchMove={(event) => {
				// Allow scrolling in non-fullscreen mode
				if (isFullscreen && (event.target as HTMLElement)?.closest("mux-video")) {
					event.preventDefault();
				}
			}}
		>
			<mux-video
				ref={mediaRef}
				className="portfolio-mux-video-host block size-full"
				tabIndex={0}
				data-playback-id={playbackId}
				style={
					{
						"--media-object-fit": isFullscreen
							? "contain"
							: variant === "lightbox"
								? "contain"
								: "cover",
						"--media-object-position": "center",
						"--media-max-width": "100%",
						"--media-max-height": "100%",
					} as CSSProperties
				}
			/>

			<motion.div
				className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
				initial={false}
				animate={{ opacity: showCenterStatus ? 1 : 0 }}
				transition={tweens.interactionFast}
				aria-hidden={!showCenterStatus}
			>
				<div className="flex min-w-36 items-center gap-3 border border-[color:var(--portfolio-player-hairline)] bg-surface-950 px-4 py-3 text-surface-50">
					<Spinner size="sm" color="white" className="shrink-0" />
					<div className="flex flex-col gap-1">
						<span className="font-mono text-[10px] text-surface-50 uppercase tracking-[0.22em]">
							{centerStatusLabel}
						</span>
						<span className="text-[11px] text-surface-300">
							{isSeeking
								? "Updating playback position"
								: !isMediaReady || !hasStartedPlayback
									? "Preparing stream"
									: "Waiting for enough data to continue"}
						</span>
					</div>
				</div>
			</motion.div>

			<motion.div
				className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-end"
				initial={{ opacity: 1 }}
				animate={{
					opacity: controlsVisible ? 1 : 0,
					pointerEvents: controlsVisible ? "auto" : "none",
				}}
				transition={tweens.interactionFast}
			>
				<button
					type="button"
					className={cn(PLAYER_ICON_BUTTON_CLASS_NAME, "pointer-events-auto")}
					data-player-interactive
					aria-label="Return video tile to poster"
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						onExit?.();
					}}
				>
					<XIcon size={18} weight="bold" />
				</button>
			</motion.div>

			<motion.div
				className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t"
				style={{ borderColor: "var(--portfolio-player-hairline)" }}
				initial={{ opacity: 1 }}
				animate={{
					opacity: controlsVisible ? 1 : 0,
					pointerEvents: controlsVisible ? "auto" : "none",
				}}
				transition={tweens.interactionFast}
			>
				<div className="absolute inset-0 bg-surface-950" />
				<div className="relative flex flex-col gap-2 px-4 pt-3 pb-3">
					<input
						data-player-interactive
						type="range"
						min={0}
						max={duration || 0}
						step={0.1}
						value={duration > 0 ? currentTime : 0}
						onChange={(event) => handleSeek(Number(event.target.value))}
						className={cn("portfolio-video-range", controlsInteractiveClassName)}
						aria-label="Seek video timeline"
						style={
							{
								"--portfolio-video-range-progress": `${playedPercent}%`,
							} as CSSProperties
						}
					/>

					<div className="flex items-center justify-between gap-3">
						<div
							className={cn(
								"flex min-w-0 items-center gap-2",
								controlsInteractiveClassName,
							)}
						>
							<button
								type="button"
								className={PLAYER_ICON_BUTTON_CLASS_NAME}
								data-player-interactive
								aria-label={isPlaying ? "Pause video" : "Play video"}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void togglePlayback();
								}}
							>
								{isPlaying ? (
									<PauseIcon size={18} weight="fill" />
								) : (
									<PlayIcon
										size={18}
										weight="fill"
										className="-translate-x-[0.75px]"
									/>
								)}
							</button>

							<div className="flex items-center gap-2">
								<button
									type="button"
									className={PLAYER_ICON_BUTTON_CLASS_NAME}
									data-player-interactive
									aria-label={isMuted ? "Unmute video" : "Mute video"}
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										toggleMute();
									}}
								>
									<VolumeIcon size={18} weight="fill" />
								</button>

								<div
									className="hidden items-center border-l pl-2 md:flex"
									style={{ borderColor: "var(--portfolio-player-hairline)" }}
								>
									<input
										data-player-interactive
										type="range"
										min={0}
										max={1}
										step={0.05}
										value={isMuted ? 0 : volume}
										onChange={(event) =>
											handleVolumeChange(Number(event.target.value))
										}
										className="portfolio-video-volume w-20"
										aria-label="Adjust video volume"
										style={
											{
												"--portfolio-video-range-progress": `${volumePercent}%`,
											} as CSSProperties
										}
									/>
								</div>
							</div>

							<div
								className={cn(PLAYER_TIME_DISPLAY_CLASS_NAME, "border-l pl-3")}
								style={{ borderColor: "var(--portfolio-player-hairline)" }}
							>
								{formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
							</div>
						</div>

						<div
							className={cn(
								"flex items-center gap-2 border-l pl-2",
								controlsInteractiveClassName,
							)}
							style={{ borderColor: "var(--portfolio-player-hairline)" }}
						>
							{hasQualityMenu && (
								<DropdownMenu
									size="sm"
									open={openMenu === "quality"}
									onOpenChange={(open) => setOpenMenu(open ? "quality" : null)}
								>
									<DropdownMenuTrigger asChild>
										<button
											type="button"
											className={cn(
												PLAYER_BUTTON_CLASS_NAME,
												"min-w-21 justify-center font-mono text-[10px] uppercase tracking-[0.22em]",
											)}
											data-player-interactive
											aria-label="Select video quality"
										>
											{qualityLabel}
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="min-w-40 rounded-none border-[color:var(--portfolio-player-hairline)] bg-surface-950 p-1 text-surface-50 shadow-none"
									>
										<DropdownMenuRadioGroup
											value={qualityValue}
											onValueChange={handleQualityChange}
										>
											{qualityOptions.map((option) => (
												<DropdownMenuRadioItem
													key={option.value}
													value={option.value}
													className="rounded-none text-surface-100 focus:bg-surface-800 focus:text-white data-[state=checked]:bg-surface-800 data-[state=checked]:text-white dark:focus:bg-surface-800"
												>
													<span className="flex min-w-0 items-center justify-between gap-3">
														<span>{option.label}</span>
														{option.badge ? (
															<span className="inline-flex min-w-9 items-center justify-center border border-[color:var(--portfolio-player-hairline)] px-1.5 py-0.5 font-mono text-[9px] text-surface-100 uppercase leading-none tracking-[0.18em]">
																{option.badge}
															</span>
														) : null}
													</span>
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							<DropdownMenu
								size="sm"
								open={openMenu === "rate"}
								onOpenChange={(open) => setOpenMenu(open ? "rate" : null)}
							>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className={cn(
											PLAYER_BUTTON_CLASS_NAME,
											"min-w-19 justify-center font-mono text-[10px] uppercase tracking-[0.22em]",
										)}
										data-player-interactive
										aria-label="Select playback speed"
									>
										{rateLabel}
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="min-w-36 rounded-none border-[color:var(--portfolio-player-hairline)] bg-surface-950 p-1 text-surface-50 shadow-none"
								>
									<DropdownMenuRadioGroup
										value={String(playbackRate)}
										onValueChange={handlePlaybackRateChange}
									>
										{PLAYBACK_RATE_OPTIONS.map((option) => (
											<DropdownMenuRadioItem
												key={option.value}
												value={String(option.value)}
												className="rounded-none text-surface-100 focus:bg-surface-800 focus:text-white data-[state=checked]:bg-surface-800 data-[state=checked]:text-white dark:focus:bg-surface-800"
											>
												{option.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>

							<button
								type="button"
								className={PLAYER_ICON_BUTTON_CLASS_NAME}
								data-player-interactive
								aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void toggleFullscreen();
								}}
							>
								{isFullscreen ? (
									<ArrowsInIcon size={18} weight="bold" />
								) : (
									<ArrowsOutIcon size={18} weight="bold" />
								)}
							</button>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
