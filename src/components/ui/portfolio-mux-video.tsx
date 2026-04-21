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
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties, KeyboardEvent, MouseEvent, WheelEvent } from "react";
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
import { applyEdgeResistance, cn, springs, tweens } from "@/src/lib/index";
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

const PLAYER_BUTTON_CLASS_NAME = cn(
	"flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-none border-none bg-surface-950 px-3 text-white",
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
	"pointer-events-auto inline-flex h-10 cursor-default items-center whitespace-nowrap rounded-none border-none bg-surface-950 px-3 font-mono text-[10px] text-white uppercase tracking-[0.22em]",
);

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
	if (height >= 1080) return "FHD";
	if (height >= 720) return "HD";
	if (height >= 480) return "SD";
	return null;
}

function formatResolutionLabel(height?: number) {
	return height ? `${height}P` : null;
}

function formatFrameRateLabel(frameRate?: number) {
	if (!frameRate || !Number.isFinite(frameRate)) return null;
	const roundedFrameRate =
		Math.abs(frameRate - Math.round(frameRate)) < 0.05
			? String(Math.round(frameRate))
			: frameRate.toFixed(2).replace(/\.?0+$/, "");
	return `${roundedFrameRate} FPS`;
}

function resolveRenditionFrameRate(
	media: MuxVideoElement,
	rendition: VideoRenditionLike,
) {
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
			(rendition.height == null || level.height === rendition.height),
	);
	if (candidates.length === 0) return undefined;

	const bestLevel = [...candidates].sort((left, right) => {
		const leftBitrateDelta =
			rendition.bitrate != null && left.bitrate != null
				? Math.abs(left.bitrate - rendition.bitrate)
				: Number.POSITIVE_INFINITY;
		const rightBitrateDelta =
			rendition.bitrate != null && right.bitrate != null
				? Math.abs(right.bitrate - rendition.bitrate)
				: Number.POSITIVE_INFINITY;
		return leftBitrateDelta - rightBitrateDelta;
	})[0];

	return bestLevel?.frameRate;
}

function formatQualityOption(rendition: VideoRenditionLike): QualityOption {
	const resolutionLabel = rendition.height ? `${rendition.height}P` : (rendition.id ?? "MANUAL");
	const frameRateLabel = formatFrameRateLabel(rendition.frameRate);
	return {
		label: frameRateLabel ? `${resolutionLabel} · ${frameRateLabel}` : resolutionLabel,
		detailLabel: frameRateLabel ?? undefined,
		value: String(rendition.id),
		chipLabel: getQualityBadge(rendition.height) ?? undefined,
		height: rendition.height,
		resolutionLabel,
		triggerLabel: frameRateLabel
			? `${resolutionLabel}/${frameRateLabel.replace(" FPS", "")}`
			: resolutionLabel,
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
	const volumeControlHoverRef = useRef(false);
	const hideControlsTimeoutRef = useRef<number | null>(null);
	const suppressNextRootClickRef = useRef(false);
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
	const [playbackRate, setPlaybackRate] = useState(1);
	const [controlsVisible, setControlsVisible] = useState(true);
	const [isPointerInside, setIsPointerInside] = useState(false);
	const [isFocusVisibleWithin, setIsFocusVisibleWithin] = useState(false);
	const [openMenu, setOpenMenu] = useState<"quality" | "rate" | null>(null);
	const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([
		{ label: "Auto", value: "auto", resolutionLabel: "AUTO" },
	]);
	const [qualityValue, setQualityValue] = useState("auto");
	const [resolvedQualityLabel, setResolvedQualityLabel] = useState<string | null>(null);
	const [resolvedQualityChipLabel, setResolvedQualityChipLabel] = useState<string | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMediaReady, setIsMediaReady] = useState(false);
	const [isBuffering, setIsBuffering] = useState(Boolean(isActive));
	const [isWaitingForPlayback, setIsWaitingForPlayback] = useState(Boolean(isActive));
	const [isSeeking, setIsSeeking] = useState(false);
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
	const [storyboardCues, setStoryboardCues] = useState<StoryboardCue[]>([]);
	const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null);
	const [scrubPreviewRawX, setScrubPreviewRawX] = useState<number | null>(null);
	const [scrubPreviewTrackWidth, setScrubPreviewTrackWidth] = useState(0);
	const [canHover, setCanHover] = useState(false);
	const [isCoarsePointer, setIsCoarsePointer] = useState(false);
	const [playerWidth, setPlayerWidth] = useState(0);
	const scrubPreviewX = useMotionValue(0);
	const scrubPreviewXSpring = useSpring(scrubPreviewX, springs.layout);

	const posterSrc = useMemo(() => getPosterSrc(poster), [poster]);
	const resolvedPlaybackSrc = useMemo(() => getMuxStreamSrc(playbackId), [playbackId]);
	const menuOpen = openMenu !== null;
	const hasQualityMenu = qualityOptions.length > 2;
	const playedPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
	const volumePercent = Math.min(Math.max(volume * 100, 0), 100);
	const rateLabel = getPlaybackRateLabel(playbackRate);
	const activeQualityOption = qualityOptions.find((option) => option.value === qualityValue);
	const qualityLabel = activeQualityOption?.triggerLabel ?? activeQualityOption?.label ?? "Auto";
	const VolumeIcon = getVolumeIcon(isMuted, volume);
	const controlsInteractiveClassName = controlsVisible
		? "pointer-events-auto"
		: "pointer-events-none";
	const showInitialLoadSpinner =
		isActive && !hasStartedPlayback && (isWaitingForPlayback || !isMediaReady);
	const showTimelineBuffering = isActive && hasStartedPlayback && isBuffering && !isSeeking;
	const qualityTriggerLabel =
		qualityValue === "auto"
			? {
					mode: "auto" as const,
					label: "AUTO",
					resolved: resolvedQualityLabel,
					chipLabel: resolvedQualityChipLabel,
				}
			: {
					mode: "manual" as const,
					label: qualityLabel.toUpperCase(),
					chipLabel: activeQualityOption?.chipLabel ?? null,
				};
	const isCompactLayout = playerWidth > 0 && playerWidth < 760;
	const isTightLayout = playerWidth > 0 && playerWidth < 560;
	const isUltraCompactLayout = playerWidth > 0 && playerWidth < 430;
	const showInlineVolume = !isCompactLayout && !isCoarsePointer;
	const compactQualityTriggerLabel =
		qualityValue === "auto" ? (resolvedQualityLabel ?? "AUTO") : qualityLabel.toUpperCase();
	const showQualityChipInTrigger = !isTightLayout && qualityTriggerLabel.chipLabel;
	const showResolvedQualityInTrigger =
		!isTightLayout &&
		qualityTriggerLabel.mode === "auto" &&
		Boolean(qualityTriggerLabel.resolved);
	const qualityMenuContentClassName = cn(
		"w-auto min-w-0 rounded-none border-[color:var(--portfolio-player-hairline)] bg-surface-950 p-1 text-surface-50 shadow-none",
	);
	const rateMenuContentClassName = cn(
		"rounded-none border-[color:var(--portfolio-player-hairline)] bg-surface-950 p-1 text-surface-50 shadow-none",
		isCompactLayout ? "min-w-28" : "min-w-36",
	);
	const qualityTriggerClassName = cn(
		PLAYER_BUTTON_CLASS_NAME,
		isUltraCompactLayout
			? "min-w-[3.5rem] px-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em]"
			: isCompactLayout
				? "min-w-[4.25rem] px-2 font-mono text-[9px] uppercase tracking-[0.16em]"
				: "min-w-21 justify-center font-mono text-[10px] uppercase tracking-[0.22em]",
	);
	const rateTriggerClassName = cn(
		PLAYER_BUTTON_CLASS_NAME,
		isUltraCompactLayout
			? "min-w-[2.75rem] px-1.5 font-mono text-[8.5px] uppercase tabular-nums tracking-[0.12em]"
			: isCompactLayout
				? "min-w-[3.5rem] px-2 font-mono text-[9px] uppercase tabular-nums tracking-[0.16em]"
				: "min-w-[4.75rem] justify-center gap-0 px-3 font-mono text-[10px] uppercase tabular-nums tracking-[0.22em]",
	);
	const iconButtonClassName = cn(
		PLAYER_ICON_BUTTON_CLASS_NAME,
		isUltraCompactLayout ? "h-8 w-8" : isCompactLayout && "h-9 w-9",
	);
	const timeDisplayClassName = cn(
		PLAYER_TIME_DISPLAY_CLASS_NAME,
		isUltraCompactLayout
			? "h-8 border-l px-1.5 text-[8.5px] tracking-[0.08em]"
			: isCompactLayout
				? "h-9 border-l px-2 text-[9px] tracking-[0.14em]"
				: "border-l pl-3",
	);
	const timeDisplayText = isCompactLayout
		? `${formatPlaybackTime(currentTime)}/${formatPlaybackTime(duration, "ceil")}`
		: `${formatPlaybackTime(currentTime)} / ${formatPlaybackTime(duration, "ceil")}`;
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
	const scrubPreviewWidth = activeStoryboardCue?.width ?? 160;

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
		if (!isPlaying || isFocusVisibleWithin || menuOpen) {
			setControlsVisible(true);
			return;
		}
		hideControlsTimeoutRef.current = window.setTimeout(
			() => {
				setControlsVisible(false);
			},
			canHover ? 1600 : 2200,
		);
	}, [canHover, clearControlsTimeout, isFocusVisibleWithin, isPlaying, menuOpen]);

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
		setIsMuted(preferredMutedRef.current);
		setVolume(preferredMutedRef.current ? 0 : mediaVolume);
		setPlaybackRate(preferredPlaybackRateRef.current);
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
		preferredMutedRef.current = muted;
		preferredVolumeRef.current = 1;
		lastAudibleVolumeRef.current = 1;
		preferredPlaybackRateRef.current = 1;
		setIsMuted(muted);
		setVolume(muted ? 0 : 1);
		setPlaybackRate(1);
		setCurrentTime(0);
		setDuration(0);
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
		preferredMutedRef.current = muted;
		const restoredVolume =
			preferredVolumeRef.current > 0.01 ? preferredVolumeRef.current : lastAudibleVolumeRef.current;

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
		(event: WheelEvent<HTMLDivElement>) => {
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
		if (!container || typeof document === "undefined") return;

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
			if (
				media &&
				"webkitEnterFullscreen" in media &&
				typeof (media as unknown as { webkitEnterFullscreen: () => void })
					.webkitEnterFullscreen === "function"
			) {
				(media as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
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

	useEffect(() => {
		const media = mediaRef.current;
		if (!media) return;

		const handleMediaEvent = () => {
			syncFromMedia();
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

	useEffect(() => {
		if (scrubPreviewRawX === null || scrubPreviewTrackWidth <= 0) {
			return;
		}

		const minLeft = 0;
		const maxLeft = Math.max(minLeft, scrubPreviewTrackWidth - scrubPreviewWidth);
		const targetLeft = applyEdgeResistance(
			scrubPreviewRawX - scrubPreviewWidth / 2,
			minLeft,
			maxLeft,
			Math.min(Math.max(scrubPreviewWidth * 0.85, 64), 112),
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

		const handleFullscreenChange = () => {
			const container = containerRef.current;
			if (!container) return;

			const isNowFullscreen = checkIsFullscreen(container);
			setIsFullscreen(isNowFullscreen);

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
				// Ensure orientation is unlocked when exiting
				if (screen?.orientation?.unlock) {
					screen.orientation.unlock();
				}
			}
		};

		// iOS: Listen for native video fullscreen changes
		const media = mediaRef.current;
		const handleWebkitFullscreenChange = () => {
			// Exit custom fullscreen when native fullscreen exits
			if (media && "webkitDisplayingFullscreen" in media) {
				const isWebkitFullscreen = (
					media as unknown as { webkitDisplayingFullscreen: boolean }
				).webkitDisplayingFullscreen;
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

		if (media) {
			media.addEventListener("webkitfullscreenchange", handleWebkitFullscreenChange);
			media.addEventListener("webkitbeginfullscreen", () => {
				setIsFullscreen(true);
				// Lock orientation when entering fullscreen
				if (screen?.orientation?.lock) {
					screen.orientation.lock("landscape").catch(() => {
						// Silently fail if lock not supported
					});
				}
			});
			media.addEventListener("webkitendfullscreen", () => {
				setIsFullscreen(false);
				// Unlock orientation when exiting fullscreen
				if (screen?.orientation?.unlock) {
					screen.orientation.unlock();
				}
			});
		}

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
			document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
			document.removeEventListener("msfullscreenchange", handleFullscreenChange);
			if (media) {
				media.removeEventListener("webkitfullscreenchange", handleWebkitFullscreenChange);
				media.removeEventListener("webkitbeginfullscreen", () => {});
				media.removeEventListener("webkitendfullscreen", () => {});
			}
		};
	}, []);

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

	const hideControlsImmediately = useCallback(() => {
		clearControlsTimeout();
		if (!isPlaying || isFocusVisibleWithin || menuOpen) {
			return;
		}
		setControlsVisible(false);
	}, [clearControlsTimeout, isFocusVisibleWithin, isPlaying, menuOpen]);

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
		(event: MouseEvent<HTMLDivElement>) => {
			const target = event.target as HTMLElement | null;
			if (target?.closest("[data-player-interactive]")) {
				return;
			}

			if (suppressNextRootClickRef.current) {
				suppressNextRootClickRef.current = false;
				return;
			}

			void togglePlayback();
		},
		[togglePlayback],
	);

	const handleRootDoubleClick = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			const target = event.target as HTMLElement | null;
			if (target?.closest("[data-player-interactive]")) {
				return;
			}

			event.preventDefault();
			void toggleFullscreen();
		},
		[toggleFullscreen],
	);

	const handleVolumeControlPointerEnter = useCallback(() => {
		volumeControlHoverRef.current = true;
	}, []);

	const handleVolumeControlPointerLeave = useCallback(() => {
		volumeControlHoverRef.current = false;
	}, []);

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

	const renderQualityMenuRow = useCallback(
		({
			active: rowActive,
			chipLabel,
			detailLabel,
			resolutionLabel,
		}: {
			active: boolean;
			chipLabel?: string;
			detailLabel?: string;
			resolutionLabel: string;
		}) => (
			<span className="grid w-full min-w-0 grid-cols-[2px_minmax(0,1fr)_3.25rem] items-center gap-2">
				<span
					aria-hidden
					className={cn(
						"h-4 w-[2px] self-center bg-white",
						rowActive ? "opacity-100" : "opacity-0",
					)}
				/>
				<span className="flex min-w-0 items-center gap-1.5">
					<span className="shrink-0 text-left font-mono tabular-nums text-[10px] uppercase leading-none tracking-[0.18em]">
						{resolutionLabel}
					</span>
					{detailLabel ? (
						<span className="truncate text-left font-mono tabular-nums text-[10px] text-white/50 uppercase leading-none tracking-[0.18em]">
							{detailLabel}
						</span>
					) : null}
				</span>
				{chipLabel ? (
					<span className="inline-flex h-5 w-[3.25rem] justify-self-end items-center justify-center border border-white/20 px-1.5 font-mono tabular-nums text-[9px] text-white/70 uppercase leading-none tracking-[0.12em]">
						{chipLabel}
					</span>
				) : (
					<span aria-hidden className="block h-5 w-[3.25rem] justify-self-end" />
				)}
			</span>
		),
		[],
	);

	const renderSimpleMenuRow = useCallback(
		({ active: rowActive, label }: { active: boolean; label: string }) => (
			<span className="inline-grid w-max max-w-full grid-cols-[2px_max-content] items-center gap-2.5">
				<span
					aria-hidden
					className={cn("h-4 w-[2px] self-center bg-white", rowActive ? "opacity-100" : "opacity-0")}
				/>
				<span className="truncate text-left font-mono tabular-nums text-[10px] uppercase leading-none tracking-[0.18em]">
					{label}
				</span>
			</span>
		),
		[],
	);

	const qualityControl = hasQualityMenu ? (
		<DropdownMenu
			size="sm"
			open={openMenu === "quality"}
			onOpenChange={(open) => setOpenMenu(open ? "quality" : null)}
		>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={qualityTriggerClassName}
					data-player-interactive
					aria-label="Select video quality"
				>
					<span className="flex items-center gap-2">
						<span className="flex items-center gap-2">
							<span>
								{isTightLayout
									? compactQualityTriggerLabel
									: qualityTriggerLabel.label}
							</span>
							{showResolvedQualityInTrigger ? (
								<span className="text-white/50">
									· {qualityTriggerLabel.resolved}
								</span>
							) : null}
						</span>
						{showQualityChipInTrigger ? (
							<span className="inline-flex h-5 min-w-[34px] items-center justify-center border border-white/18 px-1.5 font-mono text-[9px] text-white/70 uppercase leading-none tracking-[0.12em]">
								{qualityTriggerLabel.chipLabel}
							</span>
						) : null}
					</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				container={containerRef.current}
				align="end"
				side="top"
				sideOffset={8}
				collisionPadding={12}
				data-player-interactive
				className={qualityMenuContentClassName}
			>
				<DropdownMenuRadioGroup value={qualityValue} onValueChange={handleQualityChange}>
					{qualityOptions.map((option) => (
						<DropdownMenuRadioItem
							key={option.value}
							value={option.value}
							hideIndicator
							disableIndicatorPadding
							className={cn(
								"h-9 rounded-none px-3 text-white/70 outline-none",
								"hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-[highlighted]:bg-white/6 data-[highlighted]:text-white",
								"data-[state=checked]:bg-white/10 data-[state=checked]:font-semibold data-[state=checked]:text-white",
								"data-[state=checked]:data-[highlighted]:bg-white/14 data-[state=checked]:focus:bg-white/14 data-[state=checked]:hover:bg-white/14",
							)}
						>
							{renderQualityMenuRow({
								active: option.value === qualityValue,
								detailLabel: option.detailLabel,
								chipLabel: option.chipLabel,
								resolutionLabel: option.resolutionLabel ?? option.label,
							})}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	) : null;

	const rateControl = (
		<DropdownMenu
			size="sm"
			open={openMenu === "rate"}
			onOpenChange={(open) => setOpenMenu(open ? "rate" : null)}
		>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={rateTriggerClassName}
					data-player-interactive
					aria-label="Select playback speed"
				>
					{rateLabel}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				container={containerRef.current}
				align="end"
				side="top"
				sideOffset={8}
				collisionPadding={12}
				data-player-interactive
				className={rateMenuContentClassName}
			>
				<DropdownMenuRadioGroup
					value={String(playbackRate)}
					onValueChange={handlePlaybackRateChange}
				>
					{PLAYBACK_RATE_OPTIONS.map((option) => (
						<DropdownMenuRadioItem
							key={option.value}
							value={String(option.value)}
							hideIndicator
							disableIndicatorPadding
							className={cn(
								"h-9 rounded-none px-3 text-white/70 outline-none",
								"hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-[highlighted]:bg-white/6 data-[highlighted]:text-white",
								"data-[state=checked]:bg-white/10 data-[state=checked]:font-semibold data-[state=checked]:text-white",
								"data-[state=checked]:data-[highlighted]:bg-white/14 data-[state=checked]:focus:bg-white/14 data-[state=checked]:hover:bg-white/14",
							)}
						>
							{renderSimpleMenuRow({
								active: option.value === playbackRate,
								label: option.label,
							})}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
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
			{isFullscreen ? (
				<ArrowsInIcon size={18} weight="bold" />
			) : (
				<ArrowsOutIcon size={18} weight="bold" />
			)}
		</button>
	);
	const controlsPanelClassName = cn(
		"relative flex flex-col gap-2 px-4 pt-1 pb-3",
		isUltraCompactLayout
			? "gap-1 px-2.5 pt-1.5 pb-1.5"
			: isCompactLayout
				? "gap-1.5 px-3 pt-2 pb-2"
				: undefined,
	);
	const timelineRowClassName = cn(
		"relative",
		controlsInteractiveClassName,
		isUltraCompactLayout ? "h-3.5" : isCompactLayout ? "h-4" : "h-[18px]",
	);

	return (
		<div
			ref={containerRef}
			className={cn(
				"group relative h-full w-full overflow-hidden bg-surface-950 text-surface-50",
				"outline-none focus-visible:ring-2 focus-visible:ring-surface-50/18 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
				canHover && isPlaying && !controlsVisible && "cursor-none",
				isFullscreen && "fixed inset-0 z-50 m-0 rounded-none",
				className,
			)}
			role="application"
			aria-label="Video player"
			onClick={handleRootClick}
			onDoubleClick={handleRootDoubleClick}
			onFocus={(event) => {
				const target = event.target as HTMLElement | null;
				if (target?.matches(":focus-visible")) {
					setIsFocusVisibleWithin(true);
				}
			}}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setIsFocusVisibleWithin(false);
				}
			}}
			onKeyDown={handleKeyDown}
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
				clearControlsTimeout();
				setControlsVisible(false);
			}}
			onPointerMove={() => {
				if (!canHover) return;
				if (!isPointerInside) {
					setIsPointerInside(true);
				}
				handlePointerActivity();
			}}
			onTouchStart={(event) => {
				if ((event.target as HTMLElement)?.closest("input, button, [role='button']")) {
					return;
				}

				if (isPlaying && !controlsVisible) {
					suppressNextRootClickRef.current = true;
					setControlsVisible(true);
					scheduleControlsHide();
					return;
				}

				handlePointerActivity();
			}}
			onTouchEnd={() => {
				scheduleControlsHide();
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
				className="pointer-events-none absolute bottom-16 left-4 z-10"
				initial={false}
				animate={{ opacity: showInitialLoadSpinner ? 1 : 0 }}
				transition={tweens.interactionFast}
				aria-hidden={!showInitialLoadSpinner}
			>
				<Spinner size="sm" color="white" className="shrink-0" />
			</motion.div>

			{onExit ? (
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
						className={cn(iconButtonClassName, "pointer-events-auto")}
						data-player-interactive
						aria-label="Return video tile to poster"
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void handleExitSurface();
						}}
					>
						<XIcon size={18} weight="bold" />
					</button>
				</motion.div>
			) : null}

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
				<div className={controlsPanelClassName}>
					<div className={timelineRowClassName}>
						{activeStoryboardCue && scrubPreviewTime !== null ? (
							<motion.div
								className="pointer-events-none absolute bottom-full z-30 mb-[var(--portfolio-overlay-gap)] overflow-hidden border border-white/20 bg-black"
								style={{
									left: 0,
									x: scrubPreviewXSpring,
									width: activeStoryboardCue.width,
									height: activeStoryboardCue.height,
								}}
								transition={springs.layout}
							>
								<div
									className="size-full bg-no-repeat"
									style={{
										backgroundImage: `url(${activeStoryboardCue.imageUrl})`,
										backgroundPosition: `-${activeStoryboardCue.x}px -${activeStoryboardCue.y}px`,
									}}
								/>
							</motion.div>
						) : null}

						<div
							className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[color:var(--portfolio-player-track-color)]"
							aria-hidden
						/>
						<motion.div
							className="pointer-events-none absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-white"
							animate={
								showTimelineBuffering ? { opacity: [1, 0.6, 1] } : { opacity: 1 }
							}
							transition={
								showTimelineBuffering
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
							onChange={(event) => handleSeek(Number(event.target.value))}
							onPointerMove={(event) => {
								updateScrubPreview(event.clientX, event.currentTarget);
							}}
							onPointerDown={(event) => {
								event.currentTarget.setPointerCapture?.(event.pointerId);
								updateScrubPreview(event.clientX, event.currentTarget);
							}}
							onPointerUp={(event) => {
								event.currentTarget.releasePointerCapture?.(event.pointerId);
							}}
							onPointerLeave={clearScrubPreview}
							onBlur={clearScrubPreview}
							className={cn("portfolio-video-range", controlsInteractiveClassName)}
							aria-label="Seek video timeline"
						/>
					</div>

					<div
						className={cn(
							"flex items-center justify-between gap-3",
							isCompactLayout && "gap-2",
							isUltraCompactLayout && "gap-1.5",
						)}
					>
						<div
							className={cn(
								"flex min-w-0 items-center gap-2",
								controlsInteractiveClassName,
								isUltraCompactLayout && "gap-1.5",
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
								<VolumeIcon size={18} weight="fill" />
							</button>

								{showInlineVolume ? (
									<div
										data-player-interactive
										className="hidden items-center border-l pl-2 md:flex"
										style={{
											borderColor: "var(--portfolio-player-hairline)",
										}}
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

							<div
								className={timeDisplayClassName}
								style={{ borderColor: "var(--portfolio-player-hairline)" }}
							>
								{timeDisplayText}
							</div>
						</div>

						<div
							className={cn(
								"flex items-center gap-2 border-l pl-2",
								controlsInteractiveClassName,
								isCompactLayout && "gap-1.5 pl-1.5",
								isUltraCompactLayout && "gap-1 pl-1",
							)}
							style={{ borderColor: "var(--portfolio-player-hairline)" }}
						>
							{qualityControl}
							{rateControl}
							{fullscreenControl}
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
