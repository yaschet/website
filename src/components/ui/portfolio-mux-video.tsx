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
import type { StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import type { MuxVideoMetadata } from "@/src/content/types";
import { cn } from "@/src/lib/index";

type PortfolioMuxVideoVariant = "gallery" | "lightbox" | "article";

interface PortfolioMuxVideoProps {
	playbackId: string;
	poster?: string | StaticImageData;
	metadata?: MuxVideoMetadata;
	variant: PortfolioMuxVideoVariant;
	autoPlay?: boolean;
	loop?: boolean;
	muted?: boolean;
	className?: string;
	onExit?: () => void;
}

type QualityOption = {
	label: string;
	shortLabel: string;
	value: string;
};

const PLAYBACK_RATE_OPTIONS = [
	{ label: "1x", value: 1 },
	{ label: "1.25x", value: 1.25 },
	{ label: "1.5x", value: 1.5 },
	{ label: "1.75x", value: 1.75 },
	{ label: "2x", value: 2 },
] as const;

const ACTIVE_PLAYER_EVENT = "portfolio:mux-video-active";
let nextPortfolioMuxVideoId = 0;

const PLAYER_BUTTON_CLASS_NAME = cn(
	"flex h-10 items-center justify-center gap-2 px-3 border-none bg-surface-950/10 text-white rounded-none",
	"hover:bg-surface-950",
	"focus-visible:outline-none",
	"disabled:pointer-events-none disabled:opacity-35",
);

const PLAYER_ICON_BUTTON_CLASS_NAME = cn(
	"flex h-10 w-10 items-center justify-center border-none bg-surface-950/10 text-white rounded-none",
	"hover:bg-surface-950",
	"focus-visible:outline-none",
	"disabled:pointer-events-none disabled:opacity-35",
);

const PLAYER_TIME_DISPLAY_CLASS_NAME = cn(
	"pointer-events-auto inline-flex h-10 items-center rounded-none border-none bg-surface-950/10 hover:bg-surface-950 px-3 font-mono text-[10px] text-white uppercase tracking-[0.22em]",
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

function formatBitrate(bitrate?: number) {
	if (!bitrate || bitrate <= 0) {
		return null;
	}

	const megabits = bitrate / 1_000_000;
	return Number.isInteger(megabits) ? `${megabits} Mbps` : `${megabits.toFixed(1)} Mbps`;
}

function formatQualityOptionLabel(rendition: { bitrate?: number; height?: number; id?: string }) {
	const resolutionLabel = rendition.height ? `${rendition.height}p` : (rendition.id ?? "Manual");
	const bitrateLabel = formatBitrate(rendition.bitrate);
	return bitrateLabel ? `${resolutionLabel} (${bitrateLabel})` : resolutionLabel;
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
	autoPlay = false,
	loop = false,
	muted = false,
	className,
	onExit,
}: PortfolioMuxVideoProps) {
	const pathname = usePathname();
	const mediaRef = useRef<MuxVideoElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const hideControlsTimeoutRef = useRef<number | null>(null);
	const instanceIdRef = useRef(++nextPortfolioMuxVideoId);
	const playbackCommandIdRef = useRef(0);
	const desiredPlayingRef = useRef(Boolean(autoPlay));
	const lastSourceRepairTimestampRef = useRef(0);
	const [isPlaying, setIsPlaying] = useState(Boolean(autoPlay));
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

	const ensureMediaSource = useCallback(
		(options?: { forceLoad?: boolean }) => {
			const media = mediaRef.current;
			if (!media) return;

			const expectedSrc = resolvedPlaybackSrc;
			const currentSource = media.currentSrc || media.src || "";
			const sourceLooksMissing =
				!currentSource ||
				(!currentSource.includes(playbackId) && currentSource !== expectedSrc);
			const sourceNeedsRepair = media.src !== expectedSrc || sourceLooksMissing;

			if (sourceNeedsRepair) {
				media.src = expectedSrc;
			}

			const shouldReload =
				options?.forceLoad ||
				sourceNeedsRepair ||
				media.networkState === HTMLMediaElement.NETWORK_EMPTY;

			if (!shouldReload) return;

			const now = Date.now();
			if (!options?.forceLoad && now - lastSourceRepairTimestampRef.current < 250) {
				return;
			}

			lastSourceRepairTimestampRef.current = now;
			media.load();
		},
		[playbackId, resolvedPlaybackSrc],
	);

	const applyStableMediaConfig = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		media.loop = loop;
		media.muted = muted;
		media.defaultMuted = muted;
		media.playsInline = true;
		media.poster = posterSrc ?? "";
		media.preload = autoPlay || variant !== "article" ? "auto" : "metadata";
		media.streamType = "on-demand";
		media.metadata = metadata ?? {};
	}, [autoPlay, loop, metadata, muted, posterSrc, variant]);

	const scheduleControlsHide = useCallback(() => {
		clearControlsTimeout();
		if (!isPlaying || isPointerInside || isFocusedWithin || menuOpen) {
			setControlsVisible(true);
			return;
		}

		hideControlsTimeoutRef.current = window.setTimeout(() => {
			setControlsVisible(false);
		}, 1800);
	}, [clearControlsTimeout, isFocusedWithin, isPlaying, isPointerInside, menuOpen]);

	const syncFromMedia = useCallback(() => {
		const media = mediaRef.current;
		if (!media) return;

		setIsPlaying(!media.paused && !media.ended);
		setCurrentTime(Number.isFinite(media.currentTime) ? media.currentTime : 0);
		setDuration(Number.isFinite(media.duration) ? media.duration : 0);
		setIsMuted(media.muted);
		setVolume(media.volume ?? 1);
		setPlaybackRate(media.playbackRate ?? 1);

		const renditionList = media.videoRenditions;
		const renditions = renditionList ? Array.from(renditionList) : [];
		const sortedRenditions = [...renditions].sort((left, right) => {
			const heightDelta = (right.height ?? 0) - (left.height ?? 0);
			if (heightDelta !== 0) return heightDelta;
			return (right.bitrate ?? 0) - (left.bitrate ?? 0);
		});

		const nextOptions = [
			...sortedRenditions.map((rendition) => ({
				label: formatQualityOptionLabel(rendition),
				shortLabel: rendition.height ? `${rendition.height}p` : "Manual",
				value: String(rendition.id),
			})),
			{ label: "Auto", shortLabel: "Auto", value: "auto" },
		];

		setQualityOptions(nextOptions);
		setQualityValue(
			renditionList && renditionList.selectedIndex >= 0
				? String(renditions[renditionList.selectedIndex]?.id)
				: "auto",
		);
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
			ensureMediaSource({ forceLoad: media.networkState === HTMLMediaElement.NETWORK_EMPTY });
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

		await container.requestFullscreen?.().catch(() => undefined);
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
			"play",
			"pause",
			"ended",
			"timeupdate",
			"durationchange",
			"volumechange",
			"ratechange",
			"loadedmetadata",
			"canplay",
			"progress",
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
		ensureMediaSource({ forceLoad: true });
	}, [ensureMediaSource]);

	useEffect(() => {
		if (!autoPlay) return;

		const media = mediaRef.current;
		if (!media) return;

		desiredPlayingRef.current = true;
		const playWhenReady = () => {
			void togglePlayback();
		};

		if (media.readyState >= 1) {
			playWhenReady();
			return;
		}

		media.addEventListener("loadedmetadata", playWhenReady, { once: true });
		return () => media.removeEventListener("loadedmetadata", playWhenReady);
	}, [autoPlay, togglePlayback]);

	useEffect(() => {
		const media = mediaRef.current;
		if (!media || typeof window === "undefined") return;

		const announceActivation = () => {
			window.dispatchEvent(
				new CustomEvent(ACTIVE_PLAYER_EVENT, {
					detail: { instanceId: instanceIdRef.current, pathname },
				}),
			);
		};

		media.addEventListener("play", announceActivation);
		return () => media.removeEventListener("play", announceActivation);
	}, [pathname]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleActivePlayerChange = (event: Event) => {
			const detail = (event as CustomEvent<{ instanceId?: number }>).detail;
			if (detail?.instanceId === instanceIdRef.current) {
				return;
			}

			stopPlayback();
		};

		window.addEventListener(ACTIVE_PLAYER_EVENT, handleActivePlayerChange as EventListener);
		return () =>
			window.removeEventListener(
				ACTIVE_PLAYER_EVENT,
				handleActivePlayerChange as EventListener,
			);
	}, [stopPlayback]);

	useEffect(() => {
		if (typeof document === "undefined") return;

		const handleFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement === containerRef.current);
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

	useEffect(() => {
		return () => {
			clearControlsTimeout();
			stopPlayback();
		};
	}, [clearControlsTimeout, stopPlayback]);

	useEffect(() => {
		const activePathname = pathname;

		return () => {
			void activePathname;
			pauseOtherDocumentMedia();
			stopPlayback();
		};
	}, [pathname, pauseOtherDocumentMedia, stopPlayback]);

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
				scheduleControlsHide();
			}}
			onPointerMove={handlePointerActivity}
		>
			<mux-video
				ref={mediaRef}
				className="portfolio-mux-video-host block size-full"
				tabIndex={0}
				data-playback-id={playbackId}
				style={
					{
						"--media-object-fit": variant === "lightbox" ? "contain" : "cover",
						"--media-object-position": "center",
					} as CSSProperties
				}
			/>

			<div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-end">
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
			</div>

			<div
				className={cn(
					"pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-opacity duration-200",
					controlsVisible ? "opacity-100" : "opacity-0",
				)}
			>
				<div className="absolute inset-0 bg-linear-to-t from-surface-950/88 via-surface-950/34 to-transparent" />
				<div className="relative flex flex-col gap-3 px-4 pt-12 pb-4">
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
									className="portfolio-video-volume hidden w-20 md:block"
									aria-label="Adjust video volume"
									style={
										{
											"--portfolio-video-range-progress": `${volumePercent}%`,
										} as CSSProperties
									}
								/>
							</div>

							<div className={PLAYER_TIME_DISPLAY_CLASS_NAME}>
								{formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
							</div>
						</div>

						<div
							className={cn("flex items-center gap-2", controlsInteractiveClassName)}
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
										className="min-w-40 border-surface-700/45 bg-surface-950/96 p-1.5 text-surface-50 backdrop-blur-md"
									>
										<DropdownMenuRadioGroup
											value={qualityValue}
											onValueChange={handleQualityChange}
										>
											{qualityOptions.map((option) => (
												<DropdownMenuRadioItem
													key={option.value}
													value={option.value}
													className="text-surface-100 focus:bg-surface-800 focus:text-white dark:focus:bg-surface-800"
												>
													{option.label}
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
									className="min-w-36 border-surface-700/45 bg-surface-950/96 p-1.5 text-surface-50 backdrop-blur-md"
								>
									<DropdownMenuRadioGroup
										value={String(playbackRate)}
										onValueChange={handlePlaybackRateChange}
									>
										{PLAYBACK_RATE_OPTIONS.map((option) => (
											<DropdownMenuRadioItem
												key={option.value}
												value={String(option.value)}
												className="text-surface-100 focus:bg-surface-800 focus:text-white dark:focus:bg-surface-800"
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
			</div>
		</div>
	);
}
