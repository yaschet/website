"use client";

import type MuxVideoElement from "@mux/mux-video";
import {
	RiFullscreenExitLine as ArrowsInIcon,
	RiFullscreenLine as ArrowsOutIcon,
	RiPauseLine as PauseIcon,
	RiPlayLine as PlayIcon,
	RiVolumeUpLine as SpeakerHighIcon,
	RiVolumeDownLine as SpeakerLowIcon,
	RiVolumeMuteLine as SpeakerSimpleSlashIcon,
	RiCloseLine as XIcon,
} from "@remixicon/react";
import {
	AnimatePresence,
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "framer-motion";
import type { StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties, KeyboardEvent, MouseEvent, WheelEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { StateSwap } from "@/src/components/ui/state-swap";
import { useAnimationVisibility } from "@/src/components/ui/use-animation-visibility";
import type { MuxVideoMetadata } from "@/src/content/types";
import { cn, springs, tweens } from "@/src/lib/index";
import {
	announceActivePortfolioVideo,
	PORTFOLIO_VIDEO_ACTIVE_EVENT,
	type PortfolioVideoActiveEventDetail,
} from "@/src/lib/portfolio-video-sync";
import { GALLERY_CHROME_BUTTON_CLASS_NAME } from "./gallery-chrome";
import { GalleryPlayButton } from "./gallery-play-button";
import styles from "./portfolio-mux-video.module.css";
import { CompactVideoSettingsMenu } from "./video-settings-menu";

type PortfolioMuxVideoVariant = "gallery" | "lightbox" | "article";

interface PortfolioMuxVideoProps {
	playbackId: string;
	poster?: string | StaticImageData;
	durationLabel?: string;
	metadata?: MuxVideoMetadata;
	variant: PortfolioMuxVideoVariant;
	active?: boolean;
	autoPlay?: boolean;
	loop?: boolean;
	muted?: boolean;
	className?: string;
	onExit?: () => void;
	onPlayingChange?: (playing: boolean) => void;
	onReadyChange?: (ready: boolean) => void;
	onPlaybackError?: (failed: boolean) => void;
	onDimensionsChange?: (width: number, height: number) => void;
}

type QualityOption = {
	label: string;
	value: string;
	detailLabel?: string;
	chipLabel?: string;
	height?: number;
	resolutionLabel?: string;
	triggerLabel?: string;
};

type VideoRenditionLike = {
	bitrate?: number;
	frameRate?: number;
	height?: number;
	id?: string;
};

type HlsLevelLike = {
	bitrate?: number;
	frameRate?: number;
	height?: number;
};

interface NativeFullscreenVideo extends HTMLVideoElement {
	webkitEnterFullscreen?: () => void;
	webkitExitFullscreen?: () => void;
	webkitDisplayingFullscreen?: boolean;
}

type StoryboardCue = {
	startTime: number;
	endTime: number;
	imageUrl: string;
	x: number;
	y: number;
	width: number;
	height: number;
};

const PLAYBACK_RATE_OPTIONS = [
	{ label: "1x", value: 1 },
	{ label: "1.25x", value: 1.25 },
	{ label: "1.5x", value: 1.5 },
	{ label: "1.75x", value: 1.75 },
	{ label: "2x", value: 2 },
] as const;

let nextPortfolioMuxVideoId = 0;

const PLAYER_ICON_BUTTON_CLASS_NAME = cn(GALLERY_CHROME_BUTTON_CLASS_NAME, "border-0");

function formatPlaybackTime(value: number, mode: "floor" | "ceil" = "floor") {
	if (!Number.isFinite(value) || value <= 0) {
		return "0:00";
	}

	const totalSeconds =
		mode === "ceil" ? Math.max(0, Math.ceil(value - 0.0001)) : Math.floor(value);
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
	if (height >= 1080) return "Full HD";
	if (height >= 720) return "HD";
	if (height >= 480) return "SD";
	return null;
}

function formatResolutionLabel(height?: number) {
	return height ? `${height}p` : null;
}

function formatFrameRateLabel(frameRate?: number) {
	if (!frameRate || frameRate <= 0 || !Number.isFinite(frameRate)) return null;
	const roundedFrameRate =
		Math.abs(frameRate - Math.round(frameRate)) < 0.05
			? String(Math.round(frameRate))
			: frameRate.toFixed(2).replace(/\.?0+$/, "");
	return roundedFrameRate;
}

function resolveRenditionFrameRate(media: MuxVideoElement, rendition: VideoRenditionLike) {
	if (rendition.frameRate && Number.isFinite(rendition.frameRate)) {
		return rendition.frameRate;
	}

	const hls = (media as unknown as { _hls?: { levels?: HlsLevelLike[] } })._hls;
	const levels = Array.isArray(hls?.levels) ? hls.levels : [];
	if (levels.length === 0) return undefined;

	const candidates = levels.filter(
		(level) =>
			level.frameRate &&
			Number.isFinite(level.frameRate) &&
			rendition.height != null &&
			level.height === rendition.height,
	);
	if (candidates.length === 0) return undefined;

	const exactMatch = candidates.find(
		(level) => rendition.bitrate != null && level.bitrate === rendition.bitrate,
	);
	if (exactMatch) return exactMatch.frameRate;
	const frameRates = new Set(candidates.map((level) => level.frameRate));
	return frameRates.size === 1 ? candidates[0]?.frameRate : undefined;
}

function formatQualityOption(rendition: VideoRenditionLike): QualityOption {
	const resolutionLabel = formatResolutionLabel(rendition.height) ?? rendition.id ?? "Manual";
	const frameRateLabel = formatFrameRateLabel(rendition.frameRate);
	return {
		label: frameRateLabel ? `${resolutionLabel}${frameRateLabel}` : resolutionLabel,
		value: String(rendition.id),
		chipLabel: getQualityBadge(rendition.height) ?? undefined,
		height: rendition.height,
		resolutionLabel,
		triggerLabel: (rendition.height ?? 0) >= 2160 ? "4K" : resolutionLabel,
	};
}

function dedupeQualityOptions(options: QualityOption[]) {
	const seen = new Set<string>();
	const deduped: QualityOption[] = [];

	for (const option of options) {
		const key = `${option.resolutionLabel ?? option.label}|${option.detailLabel ?? ""}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(option);
	}

	return deduped;
}

function parseTimestamp(value: string) {
	const parts = value.trim().split(":");

	if (parts.length === 3) {
		const [hours = "0", minutes = "0", secondsRaw = "0"] = parts;
		const seconds = Number.parseFloat(secondsRaw.replace(",", "."));
		if (Number.isNaN(seconds)) return 0;
		return Number(hours) * 3600 + Number(minutes) * 60 + seconds;
	}

	if (parts.length === 2) {
		const [minutes = "0", secondsRaw = "0"] = parts;
		const seconds = Number.parseFloat(secondsRaw.replace(",", "."));
		if (Number.isNaN(seconds)) return 0;
		return Number(minutes) * 60 + seconds;
	}

	return Number.parseFloat(value.replace(",", ".")) || 0;
}

function parseStoryboardVtt(content: string): StoryboardCue[] {
	return content
		.split(/\n\s*\n/g)
		.map((block) => block.trim())
		.filter(Boolean)
		.flatMap((block) => {
			const lines = block
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean);

			const timingLine = lines.find((line) => line.includes("-->"));
			const imageLine = lines.at(-1);

			if (!timingLine || !imageLine || imageLine === timingLine || imageLine === "WEBVTT") {
				return [];
			}

			const [startTimeRaw, endTimeRaw] = timingLine.split("-->").map((part) => part.trim());
			const [imageUrlRaw, fragment = ""] = imageLine.split("#");
			const xywhFragment = fragment.startsWith("xywh=") ? fragment.slice(5) : "";
			const [x = "0", y = "0", width = "160", height = "90"] = xywhFragment.split(",");

			return [
				{
					startTime: parseTimestamp(startTimeRaw),
					endTime: parseTimestamp(endTimeRaw),
					imageUrl: imageUrlRaw,
					x: Number.parseInt(x, 10) || 0,
					y: Number.parseInt(y, 10) || 0,
					width: Number.parseInt(width, 10) || 160,
					height: Number.parseInt(height, 10) || 90,
				},
			];
		});
}

function getPosterSrc(poster?: string | StaticImageData) {
	if (!poster) return undefined;
	return typeof poster === "string" ? poster : poster.src;
}

function getMuxStreamSrc(playbackId: string) {
	return `https://stream.mux.com/${playbackId}.m3u8`;
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
	if (media.nativeEl) pauseNativeMediaElement(media.nativeEl);

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

/** Warm the engine on media intent without requesting an unplayed film. */
export function preloadPortfolioVideo() {
	return import("@mux/mux-video");
}

/** Register the playback engine on mount, so route prefetching stays lightweight. */
export function PortfolioMuxVideo(props: PortfolioMuxVideoProps) {
	const [runtimeReady, setRuntimeReady] = useState(false);
	const [playbackFailed, setPlaybackFailed] = useState(false);
	const [attempt, setAttempt] = useState(0);
	const [retryRequested, setRetryRequested] = useState(false);
	const callbacks = useRef(props);
	callbacks.current = props;
	const retryRef = useRef<HTMLButtonElement>(null);
	const handlePlaybackError = useCallback((failed: boolean) => {
		setPlaybackFailed(failed);
		if (failed) callbacks.current.onPlayingChange?.(false);
		callbacks.current.onPlaybackError?.(failed);
	}, []);
	const handlePlayingChange = useCallback((playing: boolean) => {
		if (playing) setRetryRequested(false);
		callbacks.current.onPlayingChange?.(playing);
	}, []);

	useEffect(() => {
		// A retry also reattempts a playback-runtime chunk that failed to load.
		void attempt;
		let cancelled = false;
		void preloadPortfolioVideo().then(
			() => {
				if (!cancelled) setRuntimeReady(true);
			},
			() => {
				if (!cancelled) handlePlaybackError(true);
			},
		);
		return () => {
			cancelled = true;
		};
	}, [attempt, handlePlaybackError]);

	useEffect(() => {
		if (!playbackFailed || !retryRef.current) return;
		const retry = retryRef.current;
		if (retry.closest("[inert]")) return;
		const focused = retry.ownerDocument.activeElement;
		// Replace a removed player control's focus, but preserve focus elsewhere
		// (for example the viewer's close button or the reader's next link).
		if (!focused || focused === retry.ownerDocument.body || focused.closest("[inert]")) {
			retry.focus({ preventScroll: true });
		}
	}, [playbackFailed]);

	if (playbackFailed) {
		return (
			<section
				className={cn(styles.player, styles.playbackFallback, props.className)}
				data-playback-error
				data-portfolio-video
				aria-label="Video player"
			>
				<p role="status">Video couldn’t start. Try again or continue reading.</p>
				<div className={styles.fallbackActions}>
					<button
						ref={retryRef}
						type="button"
						className={styles.fallbackButton}
						onClick={() => {
							handlePlaybackError(false);
							setRetryRequested(true);
							setAttempt((current) => current + 1);
						}}
					>
						Try again
					</button>
					{props.onExit ? (
						<button
							type="button"
							className={styles.fallbackButton}
							onClick={props.onExit}
						>
							Return to poster
						</button>
					) : null}
				</div>
			</section>
		);
	}
	return runtimeReady ? (
		<PortfolioMuxVideoPlayer
			{...props}
			key={attempt}
			active={(props.active ?? props.autoPlay) || retryRequested}
			onPlaybackError={handlePlaybackError}
			onPlayingChange={handlePlayingChange}
		/>
	) : null;
}

function PortfolioMuxVideoPlayer({
	playbackId,
	poster,
	durationLabel,
	metadata,
	variant,
	active,
	autoPlay = false,
	loop = false,
	muted = false,
	className,
	onExit,
	onPlayingChange,
	onReadyChange,
	onPlaybackError,
	onDimensionsChange,
}: PortfolioMuxVideoProps) {
	const pathname = usePathname();
	const mediaRef = useRef<MuxVideoElement | null>(null);
	const dimensionsCallback = useRef(onDimensionsChange);
	dimensionsCallback.current = onDimensionsChange;
	const playbackErrorCallback = useRef(onPlaybackError);
	playbackErrorCallback.current = onPlaybackError;
	const containerRef = useRef<HTMLElement>(null);
	const shouldReduceMotion = useReducedMotion();
	const visible = useAnimationVisibility(containerRef);
	const volumeControlHoverRef = useRef(false);
	const timelinePointerDownRef = useRef(false);
	const hideControlsTimeoutRef = useRef<number | null>(null);
	const instanceIdRef = useRef(++nextPortfolioMuxVideoId);
	const lastEmittedPlayingStateRef = useRef<boolean | null>(null);
	const playbackCommandIdRef = useRef(0);
	const preferredMutedRef = useRef(muted);
	const preferredVolumeRef = useRef(1);
	const lastAudibleVolumeRef = useRef(1);
	const preferredPlaybackRateRef = useRef(1);
	const isActive = active ?? autoPlay;
	const desiredPlayingRef = useRef(Boolean(isActive));
	const [isPlaying, setIsPlaying] = useState(Boolean(isActive));
	const [isMuted, setIsMuted] = useState(muted);
	const [volume, setVolume] = useState(muted ? 0 : 1);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [bufferedRanges, setBufferedRanges] = useState<{ start: number; end: number }[]>([]);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [controlsVisible, setControlsVisible] = useState(true);
	const [isPointerInside, setIsPointerInside] = useState(false);
	const [isFocusVisibleWithin, setIsFocusVisibleWithin] = useState(false);
	const [openMenu, setOpenMenu] = useState<"quality" | "rate" | "settings" | null>(null);
	const [manifestLevels, setManifestLevels] = useState<HlsLevelLike[] | null>(null);
	const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([
		{ label: "Auto", value: "auto", resolutionLabel: "AUTO" },
	]);
	const [qualityValue, setQualityValue] = useState("auto");
	const [resolvedQualityLabel, setResolvedQualityLabel] = useState<string | null>(null);
	const [resolvedQualityChipLabel, setResolvedQualityChipLabel] = useState<string | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMediaReady, setIsMediaReady] = useState(false);
	const [isBuffering, setIsBuffering] = useState(Boolean(isActive));
	const [, setIsWaitingForPlayback] = useState(Boolean(isActive));
	const [isSeeking, setIsSeeking] = useState(false);
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
	const [storyboardCues, setStoryboardCues] = useState<StoryboardCue[]>([]);
	const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null);
	const [scrubPreviewRawX, setScrubPreviewRawX] = useState<number | null>(null);
	const [scrubPreviewTrackWidth, setScrubPreviewTrackWidth] = useState(0);
	const [previewImage, setPreviewImage] = useState<{
		url: string;
		status: "loading" | "ready" | "error";
	} | null>(null);
	const [canHover, setCanHover] = useState(false);
	const [isCoarsePointer, setIsCoarsePointer] = useState(false);
	const [playerWidth, setPlayerWidth] = useState(0);
	const [playerHeight, setPlayerHeight] = useState(0);
	const scrubPreviewX = useMotionValue(0);
	const scrubPreviewSpringX = useSpring(scrubPreviewX, springs.responsive);

	const posterSrc = useMemo(() => getPosterSrc(poster), [poster]);
	const resolvedPlaybackSrc = useMemo(() => getMuxStreamSrc(playbackId), [playbackId]);
	useEffect(() => {
		void resolvedPlaybackSrc;
		setManifestLevels(null);
	}, [resolvedPlaybackSrc]);
	useEffect(() => {
		if (!openMenu || manifestLevels !== null) return;
		const controller = new AbortController();
		void fetch(resolvedPlaybackSrc, { signal: controller.signal })
			.then((response) => (response.ok ? response.text() : ""))
			.then((manifest) => {
				const levels: HlsLevelLike[] = [];
				for (const line of manifest.split(/\r?\n/)) {
					if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;
					const height = Number(line.match(/RESOLUTION=\d+x(\d+)/)?.[1]);
					const frameRate = Number(line.match(/FRAME-RATE=([\d.]+)/)?.[1]);
					if (height > 0 && frameRate > 0 && Number.isFinite(frameRate)) {
						levels.push({ height, frameRate });
					}
				}
				if (!controller.signal.aborted) setManifestLevels(levels);
			})
			.catch(() => {
				if (!controller.signal.aborted) setManifestLevels([]);
			});
		return () => controller.abort();
	}, [openMenu, manifestLevels, resolvedPlaybackSrc]);
	const menuOpen = openMenu !== null;
	const hasQualityMenu = qualityOptions.length > 1;
	const playedPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
	const volumePercent = Math.min(Math.max(volume * 100, 0), 100);
	const volumeState = isMuted || volume <= 0.01 ? "muted" : volume < 0.5 ? "low" : "high";
	const controlsInteractiveClassName = controlsVisible
		? "pointer-events-auto"
		: "pointer-events-none";
	const showTimelineBuffering = isActive && hasStartedPlayback && isBuffering && !isSeeking;
	const isCompactLayout = playerWidth < 760 || isCoarsePointer;
	const isMinimalLayout = playerWidth > 0 && playerWidth < 240;
	const showElapsedOnly = playerWidth > 0 && playerWidth < 320;
	const hideVisibleTime = playerWidth > 0 && playerWidth < 272;
	const showInlineVolume = !isCompactLayout && !isCoarsePointer;
	const iconButtonClassName = PLAYER_ICON_BUTTON_CLASS_NAME;
	const activeStoryboardCue = useMemo(() => {
		if (scrubPreviewTime === null) return null;
		return (
			storyboardCues.find(
				(cue) => scrubPreviewTime >= cue.startTime && scrubPreviewTime < cue.endTime,
			) ??
			storyboardCues.at(-1) ??
			null
		);
	}, [scrubPreviewTime, storyboardCues]);
	const scrubPreviewScale = activeStoryboardCue
		? Math.min(
				1,
				Math.max(0, scrubPreviewTrackWidth) / activeStoryboardCue.width,
				Math.max(0, playerHeight - 84) / activeStoryboardCue.height,
			)
		: 1;
	const scrubPreviewWidth = (activeStoryboardCue?.width ?? 160) * scrubPreviewScale;
	const previewImageUrl = activeStoryboardCue?.imageUrl;
	useEffect(() => {
		if (!previewImageUrl) return;
		let cancelled = false;
		const image = new window.Image();
		setPreviewImage({ url: previewImageUrl, status: "loading" });
		image.onload = () => {
			if (!cancelled) setPreviewImage({ url: previewImageUrl, status: "ready" });
		};
		image.onerror = () => {
			if (!cancelled) setPreviewImage({ url: previewImageUrl, status: "error" });
		};
		image.src = previewImageUrl;
		return () => {
			cancelled = true;
		};
	}, [previewImageUrl]);

	useEffect(() => {
		if (!isActive || (hasStartedPlayback && !isBuffering)) return;
		// A blocked request must not leave the poster action pending indefinitely.
		const timeout = window.setTimeout(() => {
			if (desiredPlayingRef.current) playbackErrorCallback.current?.(true);
		}, 20_000);
		return () => window.clearTimeout(timeout);
	}, [hasStartedPlayback, isActive, isBuffering]);

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

	useEffect(() => {
		if (!visible && isPlaying) stopPlayback();
	}, [visible, isPlaying, stopPlayback]);

	const handleExitSurface = useCallback(async () => {
		stopPlayback();

		if (
			typeof document !== "undefined" &&
			document.fullscreenElement === containerRef.current
		) {
			await document.exitFullscreen().catch(() => undefined);
		}

		onExit?.();
	}, [onExit, stopPlayback]);

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

	const keepPlaybackRunning = useCallback(() => {
		const media = mediaRef.current;
		if (!media || !desiredPlayingRef.current || media.ended || !media.paused) {
			return;
		}

		void media.play().catch(() => undefined);
	}, []);

	const applyStableMediaConfig = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		media.loop = loop;
		media.muted = preferredMutedRef.current;
		media.defaultMuted = preferredMutedRef.current;
		media.volume = preferredVolumeRef.current;
		media.defaultPlaybackRate = preferredPlaybackRateRef.current;
		media.playbackRate = preferredPlaybackRateRef.current;
		media.playsInline = true;
		media.poster = posterSrc ?? "";
		media.preload = isActive || variant !== "article" ? "auto" : "metadata";
		media.streamType = "on-demand";
		media.metadata = metadata ?? {};
	}, [isActive, loop, metadata, posterSrc, variant]);

	const scheduleControlsHide = useCallback(() => {
		clearControlsTimeout();
		if (
			!isPlaying ||
			!hasStartedPlayback ||
			isFocusVisibleWithin ||
			menuOpen ||
			timelinePointerDownRef.current
		) {
			setControlsVisible(true);
			return;
		}
		hideControlsTimeoutRef.current = window.setTimeout(
			() => {
				setControlsVisible(false);
			},
			canHover ? 1600 : 2200,
		);
	}, [
		canHover,
		clearControlsTimeout,
		hasStartedPlayback,
		isFocusVisibleWithin,
		isPlaying,
		menuOpen,
	]);

	const syncFromMedia = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		const currentlyPlaying = !media.paused && !media.ended;
		const readyState = media.readyState ?? 0;
		const metadataReady = readyState >= 1;
		// Metadata can precede decoded footage. Keep the poster's pending action
		// until a frame is available; an established playback may then rebuffer.
		const presentablePlayback =
			currentlyPlaying && (readyState >= 2 || lastEmittedPlayingStateRef.current === true);
		const buffering =
			desiredPlayingRef.current &&
			!media.ended &&
			(media.seeking || readyState < (currentlyPlaying ? 3 : 2));
		const waitingForPlayback = desiredPlayingRef.current && !currentlyPlaying && !media.ended;
		const mediaVolume = media.volume ?? preferredVolumeRef.current;
		if (!media.muted && mediaVolume > 0.01) {
			lastAudibleVolumeRef.current = mediaVolume;
			preferredVolumeRef.current = mediaVolume;
		}
		preferredMutedRef.current = media.muted;
		preferredPlaybackRateRef.current = media.playbackRate ?? 1;
		setIsPlaying(currentlyPlaying);
		setCurrentTime(Number.isFinite(media.currentTime) ? media.currentTime : 0);
		setDuration(Number.isFinite(media.duration) ? media.duration : 0);
		const ranges = media.buffered;
		setBufferedRanges(
			Number.isFinite(media.duration) && media.duration > 0 && ranges
				? Array.from({ length: ranges.length }, (_, index) => ({
						start: (ranges.start(index) / media.duration) * 100,
						end: (ranges.end(index) / media.duration) * 100,
					}))
				: [],
		);
		setIsMuted(preferredMutedRef.current);
		setVolume(preferredMutedRef.current ? 0 : mediaVolume);
		setPlaybackRate(preferredPlaybackRateRef.current);
		setIsMediaReady(metadataReady);
		setIsBuffering(buffering);
		setIsWaitingForPlayback(waitingForPlayback);
		setIsSeeking(media.seeking);
		if (presentablePlayback) {
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
			...dedupeQualityOptions(
				sortedRenditions.map((rendition) =>
					formatQualityOption({
						...rendition,
						frameRate: resolveRenditionFrameRate(media, rendition),
					}),
				),
			),
			{ label: "Auto", value: "auto", resolutionLabel: "AUTO" },
		];

		setQualityOptions(nextOptions);
		const selectedQualityValue =
			renditionList && renditionList.selectedIndex >= 0
				? String(renditions[renditionList.selectedIndex]?.id)
				: "auto";
		setQualityValue(selectedQualityValue);
		setResolvedQualityLabel(
			selectedQualityValue === "auto" ? formatResolutionLabel(media.videoHeight) : null,
		);
		setResolvedQualityChipLabel(
			selectedQualityValue === "auto" ? getQualityBadge(media.videoHeight) : null,
		);
		const shouldEmitPlayingChange =
			presentablePlayback || lastEmittedPlayingStateRef.current === true;
		if (shouldEmitPlayingChange && lastEmittedPlayingStateRef.current !== presentablePlayback) {
			lastEmittedPlayingStateRef.current = presentablePlayback;
			onPlayingChange?.(presentablePlayback);
		}
	}, [onPlayingChange]);

	useEffect(() => {
		void playbackId;
		setIsMediaReady(false);
		setIsBuffering(false);
		setIsWaitingForPlayback(false);
		setIsSeeking(false);
		setHasStartedPlayback(false);
		preferredMutedRef.current = muted;
		preferredVolumeRef.current = 1;
		lastAudibleVolumeRef.current = 1;
		preferredPlaybackRateRef.current = 1;
		setIsMuted(muted);
		setVolume(muted ? 0 : 1);
		setPlaybackRate(1);
		setCurrentTime(0);
		setDuration(0);
		setBufferedRanges([]);
		setQualityOptions([{ label: "Auto", value: "auto", resolutionLabel: "AUTO" }]);
		setQualityValue("auto");
		setResolvedQualityLabel(null);
		setResolvedQualityChipLabel(null);
		setStoryboardCues([]);
		setScrubPreviewTime(null);
		setScrubPreviewRawX(null);
		setScrubPreviewTrackWidth(0);
	}, [muted, playbackId]);

	useEffect(() => {
		onReadyChange?.(isMediaReady);
	}, [isMediaReady, onReadyChange]);

	useEffect(() => {
		preferredMutedRef.current = muted;
		const restoredVolume =
			preferredVolumeRef.current > 0.01
				? preferredVolumeRef.current
				: lastAudibleVolumeRef.current;

		const media = mediaRef.current;
		if (media) {
			if (!muted) {
				media.volume = restoredVolume;
			}
			media.muted = muted;
			media.defaultMuted = muted;
		}

		setIsMuted(muted);
		setVolume(muted ? 0 : restoredVolume);
	}, [muted]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const coarseQuery = window.matchMedia("(pointer: coarse)");
		const syncPointerModes = () => {
			setCanHover(hoverQuery.matches);
			setIsCoarsePointer(coarseQuery.matches);
		};

		syncPointerModes();
		hoverQuery.addEventListener("change", syncPointerModes);
		coarseQuery.addEventListener("change", syncPointerModes);

		return () => {
			hoverQuery.removeEventListener("change", syncPointerModes);
			coarseQuery.removeEventListener("change", syncPointerModes);
		};
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver(([entry]) => {
			setPlayerWidth(entry.contentRect.width);
			setPlayerHeight(entry.contentRect.height);
		});

		observer.observe(container);
		return () => observer.disconnect();
	}, []);

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
					playbackErrorCallback.current?.(true);
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

		if (media.muted || media.volume <= 0.01) {
			const restoredVolume =
				lastAudibleVolumeRef.current > 0.01 ? lastAudibleVolumeRef.current : 1;
			preferredMutedRef.current = false;
			preferredVolumeRef.current = restoredVolume;
			media.volume = restoredVolume;
			media.muted = false;
			media.defaultMuted = false;
		} else {
			const currentVolume = media.volume > 0.01 ? media.volume : preferredVolumeRef.current;
			if (currentVolume > 0.01) {
				lastAudibleVolumeRef.current = currentVolume;
				preferredVolumeRef.current = currentVolume;
			}
			preferredMutedRef.current = true;
			media.muted = true;
			media.defaultMuted = true;
		}

		syncFromMedia();
	}, [syncFromMedia]);

	const handleVolumeChange = useCallback(
		(nextVolume: number) => {
			const media = mediaRef.current;
			if (!media) return;

			const clampedVolume = Math.min(1, Math.max(0, nextVolume));
			if (clampedVolume > 0.01) {
				lastAudibleVolumeRef.current = clampedVolume;
				preferredVolumeRef.current = clampedVolume;
				preferredMutedRef.current = false;
				media.volume = clampedVolume;
				media.muted = false;
				media.defaultMuted = false;
			} else {
				preferredMutedRef.current = true;
				media.volume = 0;
				media.muted = true;
				media.defaultMuted = true;
			}

			syncFromMedia();
		},
		[syncFromMedia],
	);

	const adjustVolumeByStep = useCallback(
		(stepDelta: number) => {
			const startingVolume = isMuted
				? lastAudibleVolumeRef.current
				: volume > 0.01
					? volume
					: preferredVolumeRef.current;
			const nextVolume = Math.min(1, Math.max(0, startingVolume + stepDelta));

			handleVolumeChange(Number(nextVolume.toFixed(2)));
			setControlsVisible(true);
			scheduleControlsHide();
		},
		[handleVolumeChange, isMuted, scheduleControlsHide, volume],
	);

	const handleVolumeWheel = useCallback(
		(event: WheelEvent<HTMLElement>) => {
			if (!canHover || !isFullscreen) return;

			const target = event.target as HTMLElement | null;
			if (target?.closest("[data-player-interactive]")) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			adjustVolumeByStep(event.deltaY < 0 ? 0.06 : -0.06);
		},
		[adjustVolumeByStep, canHover, isFullscreen],
	);

	const handleInteractiveVolumeWheel = useCallback(
		(event: WheelEvent<HTMLElement>) => {
			event.preventDefault();
			event.stopPropagation();
			adjustVolumeByStep(event.deltaY < 0 ? 0.06 : -0.06);
		},
		[adjustVolumeByStep],
	);

	useEffect(() => {
		const handleWindowWheel = (event: globalThis.WheelEvent) => {
			if (!volumeControlHoverRef.current) return;

			event.preventDefault();
			event.stopPropagation();
			adjustVolumeByStep(event.deltaY < 0 ? 0.06 : -0.06);
		};

		window.addEventListener("wheel", handleWindowWheel, {
			capture: true,
			passive: false,
		});

		return () =>
			window.removeEventListener("wheel", handleWindowWheel, {
				capture: true,
			});
	}, [adjustVolumeByStep]);

	const handleSeek = useCallback((nextTime: number) => {
		const media = mediaRef.current;
		if (!media) return;

		media.currentTime = nextTime;
		setCurrentTime(nextTime);
	}, []);

	const updateScrubPreview = useCallback(
		(clientX: number, input: HTMLInputElement) => {
			if (!duration) return;

			const bounds = input.getBoundingClientRect();
			if (bounds.width <= 0) return;

			const percent = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
			setScrubPreviewRawX(percent * bounds.width);
			setScrubPreviewTrackWidth(bounds.width);
			setScrubPreviewTime(percent * duration);
		},
		[duration],
	);

	const clearScrubPreview = useCallback(() => {
		setScrubPreviewTime(null);
		setScrubPreviewRawX(null);
	}, []);

	const handlePlaybackRateChange = useCallback(
		(nextRate: string) => {
			const media = mediaRef.current;
			if (!media) return;

			const shouldResume = desiredPlayingRef.current && !media.ended;
			const parsedRate = Number(nextRate);
			preferredPlaybackRateRef.current = parsedRate;
			media.defaultPlaybackRate = parsedRate;
			media.playbackRate = parsedRate;
			setPlaybackRate(parsedRate);
			setOpenMenu(null);

			if (shouldResume && typeof window !== "undefined") {
				window.setTimeout(() => {
					keepPlaybackRunning();
				}, 0);
			}
		},
		[keepPlaybackRunning],
	);

	const handleQualityChange = useCallback(
		(nextQuality: string) => {
			const media = mediaRef.current;
			if (!media?.videoRenditions) return;

			const shouldResume = desiredPlayingRef.current && !media.ended;
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

			if (shouldResume && typeof window !== "undefined") {
				window.setTimeout(() => {
					keepPlaybackRunning();
				}, 0);
			}
		},
		[keepPlaybackRunning, syncFromMedia],
	);

	const toggleFullscreen = useCallback(async () => {
		const container = containerRef.current;
		const media = mediaRef.current;
		const nativeVideo: NativeFullscreenVideo | undefined = media?.nativeEl;
		if (!container || typeof document === "undefined") return;
		if (nativeVideo?.webkitDisplayingFullscreen) {
			nativeVideo.webkitExitFullscreen?.();
			return;
		}

		// Helper: Check if fullscreen is active (handles vendor prefixes for Android)
		const checkIsFullscreen = (el: HTMLElement): boolean => {
			if (document.fullscreenElement === el) return true;
			if (
				(document as unknown as { webkitFullscreenElement?: HTMLElement })
					.webkitFullscreenElement === el
			)
				return true;
			if (
				(document as unknown as { mozFullScreenElement?: HTMLElement })
					.mozFullScreenElement === el
			)
				return true;
			if (
				(document as unknown as { msFullscreenElement?: HTMLElement })
					.msFullscreenElement === el
			)
				return true;
			return false;
		};

		// Exit fullscreen
		if (checkIsFullscreen(container)) {
			// Try standard exit first
			if (document.exitFullscreen) {
				await document.exitFullscreen().catch(() => undefined);
			}
			// Fallback to webkit (Android)
			else if (
				(document as unknown as { webkitExitFullscreen?: () => Promise<void> })
					.webkitExitFullscreen
			) {
				await (document as unknown as { webkitExitFullscreen: () => Promise<void> })
					.webkitExitFullscreen()
					.catch(() => undefined);
			}
			// Fallback to moz (Firefox)
			else if (
				(document as unknown as { mozCancelFullScreen?: () => Promise<void> })
					.mozCancelFullScreen
			) {
				await (document as unknown as { mozCancelFullScreen: () => Promise<void> })
					.mozCancelFullScreen()
					.catch(() => undefined);
			}
			// Unlock orientation when exiting fullscreen
			if (screen?.orientation?.unlock) {
				screen.orientation.unlock();
			}
			return;
		}

		// Enter fullscreen
		// Mobile strategy: try video element's native fullscreen first (iOS),
		// then fall back to container fullscreen API (Android/desktop)
		try {
			// iOS: Use video element's webkitEnterFullscreen if available
			if (typeof nativeVideo?.webkitEnterFullscreen === "function") {
				nativeVideo.webkitEnterFullscreen();
				// Lock to landscape on mobile
				if (screen?.orientation?.lock) {
					screen.orientation.lock("landscape").catch(() => {
						// Silently fail if lock not supported
					});
				}
				return;
			}

			// Standard: Request fullscreen on container
			if (container.requestFullscreen) {
				await container.requestFullscreen({
					navigationUI: "hide",
				});
				// Lock to landscape on mobile
				if (screen?.orientation?.lock) {
					screen.orientation.lock("landscape").catch(() => {
						// Silently fail if lock not supported
					});
				}
			}
			// Fallback to webkit (Android)
			else if (
				(container as unknown as { webkitRequestFullscreen?: () => Promise<void> })
					.webkitRequestFullscreen
			) {
				await (container as unknown as { webkitRequestFullscreen: () => Promise<void> })
					.webkitRequestFullscreen()
					.catch(() => undefined);
				if (screen?.orientation?.lock) {
					screen.orientation.lock("landscape").catch(() => {
						// Silently fail if lock not supported
					});
				}
			}
			// Fallback to moz (Firefox)
			else if (
				(container as unknown as { mozRequestFullScreen?: () => Promise<void> })
					.mozRequestFullScreen
			) {
				await (container as unknown as { mozRequestFullScreen: () => Promise<void> })
					.mozRequestFullScreen()
					.catch(() => undefined);
				if (screen?.orientation?.lock) {
					screen.orientation.lock("landscape").catch(() => {
						// Silently fail if lock not supported
					});
				}
			}
		} catch (_error) {
			// Silently fail - browser may have fullscreen disabled or user denied permission
		}
	}, []);

	// Mux's native video defaults to intrinsic sizing with min/max constraints.
	// Give the owned playback surface definite dimensions, avoiding an inline
	// replaced-element baseline and independently rounded intrinsic dimensions.
	useLayoutEffect(() => {
		const video = mediaRef.current?.nativeEl;
		if (!video) return;
		video.style.display = "block";
		video.style.width = "100%";
		video.style.height = "100%";
		video.style.minWidth = "0";
		video.style.minHeight = "0";
	}, []);

	// Register before the source/play layout effect below can emit an early error.
	useLayoutEffect(() => {
		const media = mediaRef.current;
		if (!media) return;

		const handleMediaEvent = (event: Event) => {
			if (event.type === "error") {
				desiredPlayingRef.current = false;
				pauseMuxMediaElement(media);
				playbackErrorCallback.current?.(true);
				return;
			}
			// A pending engine play can settle after a gallery slide is deactivated.
			if ((event.type === "play" || event.type === "playing") && !desiredPlayingRef.current) {
				pauseMuxMediaElement(media);
				syncFromMedia();
				return;
			}
			syncFromMedia();
			if (event.type === "loadedmetadata" || event.type === "resize") {
				if (media.videoWidth > 0 && media.videoHeight > 0)
					dimensionsCallback.current?.(media.videoWidth, media.videoHeight);
			}

			if (
				desiredPlayingRef.current &&
				(media.paused || media.readyState < 3) &&
				(event.type === "loadedmetadata" ||
					event.type === "loadeddata" ||
					event.type === "canplay" ||
					event.type === "canplaythrough")
			) {
				if (typeof window === "undefined") {
					keepPlaybackRunning();
					return;
				}

				window.setTimeout(() => {
					keepPlaybackRunning();
				}, 0);
			}
		};

		const handleSourceIntegrityEvent = () => {
			if (typeof window === "undefined") {
				return;
			}

			window.setTimeout(() => {
				const currentMedia = mediaRef.current;
				if (!currentMedia) return;

				const currentSource = currentMedia.currentSrc || currentMedia.src || "";
				const sourceLooksMissing =
					!currentSource ||
					(!currentSource.includes(playbackId) && currentSource !== resolvedPlaybackSrc);

				if (!sourceLooksMissing) {
					return;
				}

				ensureMediaSource();
				keepPlaybackRunning();
				syncFromMedia();
			}, 0);
		};

		const eventNames = [
			"error",
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
			"resize",
			"loadeddata",
			"canplay",
			"canplaythrough",
			"progress",
			"waiting",
			"stalled",
			"seeking",
			"seeked",
		] as const;

		const sourceIntegrityEventNames = ["emptied"] as const;

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

		media.setAttribute("data-player-initialized", "");
		// Also cover a native error that existed before this element was connected.
		if (media.error) handleMediaEvent(new Event("error"));
		else syncFromMedia();
		if (media.videoWidth > 0 && media.videoHeight > 0)
			dimensionsCallback.current?.(media.videoWidth, media.videoHeight);

		return () => {
			media.removeAttribute("data-player-initialized");
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
	}, [ensureMediaSource, keepPlaybackRunning, playbackId, resolvedPlaybackSrc, syncFromMedia]);

	useEffect(() => {
		applyStableMediaConfig();
	}, [applyStableMediaConfig]);

	useEffect(() => {
		ensureMediaSource();
	}, [ensureMediaSource]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const controller = new AbortController();

		void fetch(`https://image.mux.com/${playbackId}/storyboard.vtt?format=webp`, {
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) {
					return "";
				}

				return response.text();
			})
			.then((content) => {
				if (!content) {
					setStoryboardCues([]);
					return;
				}

				setStoryboardCues(parseStoryboardVtt(content));
			})
			.catch(() => {
				setStoryboardCues([]);
			});

		return () => controller.abort();
	}, [playbackId]);

	useLayoutEffect(() => {
		if (scrubPreviewRawX === null || scrubPreviewTrackWidth <= 0) {
			return;
		}

		const minLeft = 0;
		const maxLeft = Math.max(minLeft, scrubPreviewTrackWidth - scrubPreviewWidth);
		const targetLeft = Math.min(
			Math.max(scrubPreviewRawX - scrubPreviewWidth / 2, minLeft),
			maxLeft,
		);
		scrubPreviewX.set(targetLeft);
	}, [scrubPreviewRawX, scrubPreviewTrackWidth, scrubPreviewWidth, scrubPreviewX]);

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
				setControlsVisible(true);
				if (typeof window === "undefined") {
					syncFromMedia();
					return;
				}

				window.setTimeout(() => {
					if (playbackCommandIdRef.current !== commandId) return;
					keepPlaybackRunning();
					syncFromMedia();
				}, 0);
			});
			return;
		}

		stopPlayback();
	}, [
		applyStableMediaConfig,
		ensureMediaSource,
		isActive,
		keepPlaybackRunning,
		pauseOtherDocumentMedia,
		stopPlayback,
		syncFromMedia,
	]);

	useEffect(() => {
		const media = mediaRef.current;
		if (!media || typeof window === "undefined") return;

		const announceActivation = () => {
			if (!desiredPlayingRef.current) return;
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

			stopPlayback();
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
	}, [stopPlayback]);

	useEffect(() => {
		if (typeof document === "undefined") return;

		// Helper: Check if fullscreen is active (handles vendor prefixes for Android)
		const checkIsFullscreen = (container: HTMLElement): boolean => {
			// Standard API
			if (document.fullscreenElement === container) return true;
			// Webkit (Android, older Safari)
			if (
				(document as unknown as { webkitFullscreenElement?: HTMLElement })
					.webkitFullscreenElement === container
			)
				return true;
			// Moz (Firefox)
			if (
				(document as unknown as { mozFullScreenElement?: HTMLElement })
					.mozFullScreenElement === container
			)
				return true;
			// MS (Edge)
			if (
				(document as unknown as { msFullscreenElement?: HTMLElement })
					.msFullscreenElement === container
			)
				return true;
			return false;
		};

		let previousStyles: { htmlOverflow: string; bodyOverflow: string; contain: string } | null =
			null;
		const restoreFullscreenStyles = () => {
			if (!previousStyles) return;
			document.documentElement.style.overflow = previousStyles.htmlOverflow;
			document.body.style.overflow = previousStyles.bodyOverflow;
			if (containerRef.current) containerRef.current.style.contain = previousStyles.contain;
			previousStyles = null;
		};
		const handleFullscreenChange = () => {
			const container = containerRef.current;
			if (!container) return;

			const isNowFullscreen = checkIsFullscreen(container);
			setIsFullscreen(isNowFullscreen);

			if (isNowFullscreen) {
				previousStyles ??= {
					htmlOverflow: document.documentElement.style.overflow,
					bodyOverflow: document.body.style.overflow,
					contain: container.style.contain,
				};
				// Prevent scrolling in fullscreen mode
				document.documentElement.style.overflow = "hidden";
				document.body.style.overflow = "hidden";
				// Update layout containment
				container.style.contain = "layout style paint";
			} else {
				restoreFullscreenStyles();
				// Ensure orientation is unlocked when exiting
				if (screen?.orientation?.unlock) {
					screen.orientation.unlock();
				}
			}
		};

		// iOS: Listen for native video fullscreen changes
		const media: NativeFullscreenVideo | undefined = isMediaReady
			? mediaRef.current?.nativeEl
			: undefined;
		const handleWebkitFullscreenChange = () => {
			// Exit custom fullscreen when native fullscreen exits
			if (media && "webkitDisplayingFullscreen" in media) {
				const isWebkitFullscreen = media.webkitDisplayingFullscreen;
				if (!isWebkitFullscreen) {
					setIsFullscreen(false);
				}
			}
		};

		// Listen to multiple fullscreen change events (standard + vendor prefixes for Android)
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
		document.addEventListener("mozfullscreenchange", handleFullscreenChange);
		document.addEventListener("msfullscreenchange", handleFullscreenChange);

		const handleNativeFullscreenStart = () => {
			setIsFullscreen(true);
			// Lock orientation when entering fullscreen
			if (screen?.orientation?.lock) {
				screen.orientation.lock("landscape").catch(() => {
					// Silently fail if lock not supported
				});
			}
		};
		const handleNativeFullscreenEnd = () => {
			setIsFullscreen(false);
			// Unlock orientation when exiting fullscreen
			if (screen?.orientation?.unlock) {
				screen.orientation.unlock();
			}
		};
		if (media) {
			media.addEventListener("webkitfullscreenchange", handleWebkitFullscreenChange);
			media.addEventListener("webkitbeginfullscreen", handleNativeFullscreenStart);
			media.addEventListener("webkitendfullscreen", handleNativeFullscreenEnd);
		}

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
			document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
			document.removeEventListener("msfullscreenchange", handleFullscreenChange);
			if (media) {
				media.removeEventListener("webkitfullscreenchange", handleWebkitFullscreenChange);
				media.removeEventListener("webkitbeginfullscreen", handleNativeFullscreenStart);
				media.removeEventListener("webkitendfullscreen", handleNativeFullscreenEnd);
			}
			restoreFullscreenStyles();
		};
	}, [isMediaReady]);

	useEffect(() => {
		if (!isPlaying) {
			clearControlsTimeout();
			setControlsVisible(true);
			return;
		}

		scheduleControlsHide();
	}, [clearControlsTimeout, isPlaying, scheduleControlsHide]);

	useEffect(() => {
		if (controlsVisible) return;
		setOpenMenu(null);
	}, [controlsVisible]);

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
			if (isPlaying && hasStartedPlayback && !isFocusVisibleWithin && !menuOpen)
				setControlsVisible(false);
		};
		const handleWindowFocus = () => {
			setControlsVisible(true);
			scheduleControlsHide();
		};

		// Hide controls when page becomes hidden (tab switch, minimize)
		const handleVisibilityChange = () => {
			if (document.hidden) handleWindowBlur();
			else handleWindowFocus();
		};

		window.addEventListener("blur", handleWindowBlur);
		window.addEventListener("focus", handleWindowFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("blur", handleWindowBlur);
			window.removeEventListener("focus", handleWindowFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [hasStartedPlayback, isFocusVisibleWithin, isPlaying, menuOpen, scheduleControlsHide]);

	const hideControlsImmediately = useCallback(() => {
		clearControlsTimeout();
		if (!isPlaying || !hasStartedPlayback || isFocusVisibleWithin || menuOpen) {
			return;
		}
		setControlsVisible(false);
	}, [clearControlsTimeout, hasStartedPlayback, isFocusVisibleWithin, isPlaying, menuOpen]);

	const handlePointerActivity = useCallback(() => {
		setControlsVisible(true);
		scheduleControlsHide();
	}, [scheduleControlsHide]);

	useEffect(() => {
		if (typeof window === "undefined" || typeof document === "undefined") return;
		if (!canHover || !isPlaying) return;

		const handleGlobalPointerMove = (event: PointerEvent) => {
			const container = containerRef.current;
			if (!container) return;

			const target = event.target as Node | null;
			if (target && container.contains(target)) {
				return;
			}

			setIsPointerInside(false);
			hideControlsImmediately();
		};

		const handleDocumentPointerOut = (event: PointerEvent) => {
			if (event.relatedTarget !== null) return;
			setIsPointerInside(false);
			hideControlsImmediately();
		};

		window.addEventListener("pointermove", handleGlobalPointerMove, true);
		document.addEventListener("pointerout", handleDocumentPointerOut, true);

		return () => {
			window.removeEventListener("pointermove", handleGlobalPointerMove, true);
			document.removeEventListener("pointerout", handleDocumentPointerOut, true);
		};
	}, [canHover, hideControlsImmediately, isPlaying]);

	const handleRootClick = useCallback(
		(event: MouseEvent<HTMLElement>) => {
			const target = event.target as HTMLElement | null;
			if (target?.closest("[data-player-interactive]")) {
				return;
			}

			if (isCoarsePointer && isPlaying) {
				setControlsVisible((shown) => !shown);
				scheduleControlsHide();
				return;
			}

			void togglePlayback();
		},
		[isCoarsePointer, isPlaying, scheduleControlsHide, togglePlayback],
	);

	const handleRootDoubleClick = useCallback(
		(event: MouseEvent<HTMLElement>) => {
			if (isCoarsePointer) return;
			const target = event.target as HTMLElement | null;
			if (target?.closest("[data-player-interactive]")) {
				return;
			}

			event.preventDefault();
			void toggleFullscreen();
		},
		[isCoarsePointer, toggleFullscreen],
	);

	const handleVolumeControlPointerEnter = useCallback(() => {
		volumeControlHoverRef.current = true;
	}, []);

	const handleVolumeControlPointerLeave = useCallback(() => {
		volumeControlHoverRef.current = false;
	}, []);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			const target = event.target as HTMLElement | null;
			if (
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				menuOpen
			) {
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
				case "ArrowUp":
					event.preventDefault();
					adjustVolumeByStep(0.05);
					return;
				case "ArrowDown":
					event.preventDefault();
					adjustVolumeByStep(-0.05);
					return;
				case "Escape":
					if (isFullscreen) {
						event.preventDefault();
						void toggleFullscreen();
						return;
					}

					if (onExit) {
						event.preventDefault();
						void handleExitSurface();
					}
					return;
				default:
					return;
			}
		},
		[
			currentTime,
			duration,
			handleExitSurface,
			handleSeek,
			isFullscreen,
			menuOpen,
			onExit,
			adjustVolumeByStep,
			toggleFullscreen,
			toggleMute,
			togglePlayback,
		],
	);

	const resolvedQualityOptions = qualityOptions.map((option) => {
		if (option.value === "auto") {
			return {
				...option,
				detailLabel: resolvedQualityLabel ?? undefined,
				chipLabel: resolvedQualityChipLabel ?? undefined,
			};
		}
		const rates = new Set(
			(manifestLevels ?? [])
				.filter((level) => level.height === option.height)
				.map((level) => level.frameRate),
		);
		const rate = rates.size === 1 ? formatFrameRateLabel([...rates][0]) : null;
		return rate && option.label === option.resolutionLabel
			? { ...option, label: `${option.resolutionLabel}${rate}` }
			: option;
	});
	const rateOptions = PLAYBACK_RATE_OPTIONS.map((option) => ({
		...option,
		value: String(option.value),
	}));
	const menuContainer = isFullscreen || variant === "lightbox" ? containerRef.current : undefined;
	const compactSettingsControl = (
		<CompactVideoSettingsMenu
			open={openMenu === "settings"}
			onOpenChange={(open) => {
				setOpenMenu(open ? "settings" : null);
				if (open) {
					clearControlsTimeout();
					setControlsVisible(true);
				}
			}}
			container={menuContainer}
			actions={
				isMinimalLayout
					? [
							{ label: isMuted ? "Unmute video" : "Mute video", onClick: toggleMute },
							{
								label: isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
								onClick: () => void toggleFullscreen(),
							},
						]
					: []
			}
			groups={[
				{
					label: "Playback speed",
					value: String(playbackRate),
					options: rateOptions,
					onValueChange: handlePlaybackRateChange,
				},
				...(hasQualityMenu
					? [
							{
								label: "Video quality",
								value: qualityValue,
								options: resolvedQualityOptions,
								onValueChange: handleQualityChange,
							},
						]
					: []),
			]}
		/>
	);

	const fullscreenControl = (
		<button
			type="button"
			className={iconButtonClassName}
			data-player-interactive
			aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void toggleFullscreen();
			}}
		>
			<StateSwap
				value={isFullscreen ? "full" : "inline"}
				items={{ full: <ArrowsInIcon size={16} />, inline: <ArrowsOutIcon size={16} /> }}
			/>
		</button>
	);
	const controlsPanelClassName = cn(styles.controlsPanel, "relative flex flex-col");
	const timelineRowClassName = cn("relative h-6", controlsInteractiveClassName);

	return (
		<section
			ref={containerRef}
			className={cn(
				styles.player,
				"group relative h-full w-full overflow-hidden bg-surface-950 text-surface-50",
				"outline-none focus-visible:ring-2 focus-visible:ring-surface-50/18 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
				canHover && isPlaying && !controlsVisible && "cursor-none",
				isFullscreen && "fixed inset-0 z-50 m-0 rounded-none",
				className,
			)}
			data-portfolio-video
			data-fullscreen={isFullscreen || undefined}
			data-motion-input={isFocusVisibleWithin ? "keyboard" : "pointer"}
			aria-label="Video player"
			onClick={handleRootClick}
			onDoubleClick={handleRootDoubleClick}
			onFocus={(event) => {
				const target = event.target as HTMLElement | null;
				if (target?.matches(":focus-visible")) {
					setIsFocusVisibleWithin(true);
					setControlsVisible(true);
					clearControlsTimeout();
				}
			}}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setIsFocusVisibleWithin(false);
				}
			}}
			onKeyDown={handleKeyDown}
			onKeyDownCapture={() => {
				setIsFocusVisibleWithin(true);
				setControlsVisible(true);
				clearControlsTimeout();
			}}
			onPointerDownCapture={() => {
				setIsFocusVisibleWithin(false);
			}}
			onPointerEnter={() => {
				if (!canHover) return;
				setIsPointerInside(true);
				handlePointerActivity();
			}}
			onPointerLeave={() => {
				if (!canHover) return;
				setIsPointerInside(false);
				hideControlsImmediately();
			}}
			onPointerMove={() => {
				if (!canHover) return;
				if (!isPointerInside) {
					setIsPointerInside(true);
				}
				handlePointerActivity();
			}}
			onTouchMove={(event) => {
				// Allow scrolling in non-fullscreen mode
				if (isFullscreen && (event.target as HTMLElement)?.closest("mux-video")) {
					event.preventDefault();
				}
			}}
			onWheel={handleVolumeWheel}
		>
			<mux-video
				ref={mediaRef}
				crossOrigin="anonymous"
				className={cn("portfolio-mux-video-host block size-full", styles.playbackArea)}
				tabIndex={0}
				role="group"
				aria-label="Video playback area"
				aria-description="Use the labeled playback controls, or Space to play or pause, left and right arrows to seek, M to mute, and F for fullscreen while this area is focused."
				data-playback-id={playbackId}
				style={
					{
						"--media-object-fit": isFullscreen ? "contain" : "cover",
						"--media-object-position": "center",
						"--media-max-width": "100%",
						"--media-max-height": "100%",
					} as CSSProperties
				}
			/>
			{isActive && (!isMediaReady || isBuffering) ? (
				<span role="status" className={styles.loadingStatus}>
					<span className="sr-only">Loading video…</span>
					<GalleryPlayButton
						duration={durationLabel}
						loading
						tabIndex={-1}
						aria-hidden="true"
						className="pointer-events-none"
					/>
				</span>
			) : null}

			{onExit ? (
				<div
					className={cn(
						styles.posterReturn,
						styles.controlsChrome,
						"absolute z-20 flex justify-end",
					)}
					data-visible={controlsVisible}
					inert={!controlsVisible}
				>
					<button
						type="button"
						className={cn(iconButtonClassName, "pointer-events-auto")}
						data-player-interactive
						aria-label="Return video tile to poster"
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void handleExitSurface();
						}}
					>
						<XIcon size={16} />
					</button>
				</div>
			) : null}

			<div
				className={cn(styles.controlsChrome, "absolute inset-x-0 bottom-0 z-20")}
				data-player-panel
				data-visible={controlsVisible && isMediaReady}
				inert={!controlsVisible || !isMediaReady}
			>
				<div data-player-surface className="absolute inset-0 bg-surface-950" />
				<div className={controlsPanelClassName}>
					<div className={timelineRowClassName}>
						<AnimatePresence initial={false}>
							{activeStoryboardCue &&
							scrubPreviewTime !== null &&
							scrubPreviewScale > 0 ? (
								<motion.div
									data-scrub-preview
									aria-hidden="true"
									initial={{
										opacity: 0,
										y: shouldReduceMotion ? 0 : 6,
										scale: shouldReduceMotion ? 1 : 0.97,
									}}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 3 }}
									className="pointer-events-none absolute bottom-full z-30 mb-[var(--portfolio-overlay-gap)] overflow-hidden border border-white/20 bg-black"
									style={{
										left: 0,
										x: shouldReduceMotion ? scrubPreviewX : scrubPreviewSpringX,
										width: scrubPreviewWidth,
										height: activeStoryboardCue.height * scrubPreviewScale,
									}}
									transition={
										shouldReduceMotion
											? { duration: 0 }
											: {
													...springs.responsive,
													opacity: tweens.interactionFast,
												}
									}
								>
									<div
										className={cn(
											styles.previewArtwork,
											"size-full bg-no-repeat",
										)}
										style={{
											opacity:
												previewImage?.url === previewImageUrl &&
												previewImage?.status === "ready"
													? 1
													: 0,
											width: activeStoryboardCue.width,
											height: activeStoryboardCue.height,
											transform: `scale(${scrubPreviewScale})`,
											transformOrigin: "top left",
											backgroundImage: `url(${activeStoryboardCue.imageUrl})`,
											backgroundPosition: `-${activeStoryboardCue.x}px -${activeStoryboardCue.y}px`,
										}}
									/>
									<span className={styles.previewTime}>
										{formatPlaybackTime(scrubPreviewTime)}
									</span>
									{previewImage?.status !== "ready" &&
									scrubPreviewScale >= 0.7 ? (
										<span className={styles.previewStatus}>
											{previewImage?.status === "error"
												? "Preview unavailable"
												: "Loading preview…"}
										</span>
									) : null}
								</motion.div>
							) : null}
						</AnimatePresence>

						<div
							className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[color:var(--portfolio-player-track-color)]"
							aria-hidden
						/>
						{bufferedRanges.map((range) => (
							<div
								key={range.start}
								data-buffered-range
								aria-hidden="true"
								className="pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 bg-white/30"
								style={{
									left: `${range.start}%`,
									width: `${range.end - range.start}%`,
								}}
							/>
						))}
						<motion.div
							className="pointer-events-none absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-white"
							animate={
								showTimelineBuffering && !shouldReduceMotion
									? { opacity: [1, 0.6, 1] }
									: { opacity: 1 }
							}
							transition={
								showTimelineBuffering && !shouldReduceMotion
									? {
											duration: 1.2,
											ease: "easeInOut",
											repeat: Number.POSITIVE_INFINITY,
										}
									: tweens.interactionFast
							}
							style={{ width: `${playedPercent}%` }}
							aria-hidden
						/>
						<input
							data-player-interactive
							data-seeking={isSeeking}
							type="range"
							min={0}
							max={duration || 0}
							step={0.1}
							value={duration > 0 ? currentTime : 0}
							disabled={duration <= 0}
							onChange={(event) => handleSeek(Number(event.target.value))}
							onPointerMove={(event) => {
								updateScrubPreview(event.clientX, event.currentTarget);
							}}
							onPointerDown={(event) => {
								timelinePointerDownRef.current = true;
								clearControlsTimeout();
								event.currentTarget.setPointerCapture?.(event.pointerId);
								updateScrubPreview(event.clientX, event.currentTarget);
							}}
							onPointerUp={(event) => {
								timelinePointerDownRef.current = false;
								event.currentTarget.releasePointerCapture?.(event.pointerId);
								if (event.pointerType !== "mouse") clearScrubPreview();
								scheduleControlsHide();
							}}
							onPointerCancel={() => {
								timelinePointerDownRef.current = false;
								clearScrubPreview();
								scheduleControlsHide();
							}}
							onPointerLeave={clearScrubPreview}
							onBlur={clearScrubPreview}
							className={cn(
								"portfolio-video-range",
								styles.seekInput,
								controlsInteractiveClassName,
							)}
							aria-label="Seek video timeline"
							aria-valuetext={`${formatPlaybackTime(currentTime)} of ${formatPlaybackTime(duration, "ceil")}`}
						/>
					</div>

					<div
						className={cn(
							"flex items-center justify-between gap-3",
							isCompactLayout && "gap-1",
						)}
					>
						<div
							className={cn(
								"flex min-w-0 items-center gap-2",
								controlsInteractiveClassName,
								isCompactLayout && "gap-1",
							)}
						>
							<button
								type="button"
								className={iconButtonClassName}
								data-player-interactive
								aria-label={isPlaying ? "Pause video" : "Play video"}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void togglePlayback();
								}}
							>
								<StateSwap
									value={isPlaying ? "playing" : "paused"}
									items={{
										playing: <PauseIcon size={16} />,
										paused: <PlayIcon size={16} />,
									}}
								/>
							</button>

							<div className={cn("flex shrink-0 items-center", styles.volumeGroup)}>
								{!isMinimalLayout && (
									<button
										type="button"
										className={iconButtonClassName}
										data-player-interactive
										aria-label={isMuted ? "Unmute video" : "Mute video"}
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											toggleMute();
										}}
									>
										<StateSwap
											value={volumeState}
											items={{
												muted: <SpeakerSimpleSlashIcon size={16} />,
												low: <SpeakerLowIcon size={16} />,
												high: <SpeakerHighIcon size={16} />,
											}}
										/>
									</button>
								)}

								{showInlineVolume ? (
									<div
										data-player-interactive
										className={cn("flex items-center", styles.volumeReveal)}
										onPointerEnter={handleVolumeControlPointerEnter}
										onPointerLeave={handleVolumeControlPointerLeave}
										onWheelCapture={handleInteractiveVolumeWheel}
										onWheel={handleInteractiveVolumeWheel}
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
											onPointerEnter={handleVolumeControlPointerEnter}
											onPointerLeave={handleVolumeControlPointerLeave}
											onWheelCapture={handleInteractiveVolumeWheel}
											onWheel={handleInteractiveVolumeWheel}
											className="portfolio-video-volume w-20"
											aria-label="Adjust video volume"
											style={
												{
													"--portfolio-video-range-progress": `${volumePercent}%`,
												} as CSSProperties
											}
										/>
									</div>
								) : null}
							</div>

							<div className={hideVisibleTime ? "sr-only" : styles.timeDisplay}>
								<span>{formatPlaybackTime(currentTime)}</span>
								<span className={showElapsedOnly ? "sr-only" : styles.timeDuration}>
									<span>of</span>
									<span>{formatPlaybackTime(duration, "ceil")}</span>
								</span>
							</div>
						</div>

						<div
							className={cn(
								"flex shrink-0 items-center gap-2",
								controlsInteractiveClassName,
								isCompactLayout && "gap-1",
							)}
						>
							{compactSettingsControl}
							{!isMinimalLayout && fullscreenControl}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
