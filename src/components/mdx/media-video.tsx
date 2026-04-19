/**
 * MediaVideo component.
 *
 * @remarks
 * Video player with custom controls.
 *
 * @example
 * ```tsx
 * <MediaVideo src="/video.mp4" />
 * ```
 *
 * @public
 */

"use client";

import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PortfolioMuxVideo } from "@/src/components/ui/portfolio-mux-video";
import type { MuxVideoMetadata } from "@/src/content/types";
import { cn, springs } from "@/src/lib/index";
import { stopAllPortfolioVideos } from "@/src/lib/portfolio-video-sync";

interface MediaVideoProps {
	/** Direct URL to a video file (mp4). mutually exclusive with playbackId. */
	src?: string;
	/** Mux Playback ID. If provided, renders the portfolio Mux player. mutually exclusive with src. */
	playbackId?: string;
	/** Mux Data Metadata for analytics. */
	metadata?: MuxVideoMetadata;
	poster?: string;
	duration?: string;
	caption?: string;
	loop?: boolean;
	muted?: boolean;
	className?: string;
}

export function MediaVideo({
	src,
	playbackId,
	metadata,
	poster,
	duration,
	caption,
	loop = true,
	muted = true,
	className,
}: MediaVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const hoverPreviewTimeoutRef = useRef<number | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [isVideoVisible, setIsVideoVisible] = useState(false);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [canHover, setCanHover] = useState(false);
	const [hoverPreviewActive, setHoverPreviewActive] = useState(false);
	const shouldReduceMotion = useReducedMotion();

	// True Lazy Load: Only inject <source> when near viewport
	const [shouldLoad, setShouldLoad] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const clearHoverPreview = useCallback(() => {
		if (hoverPreviewTimeoutRef.current !== null) {
			window.clearTimeout(hoverPreviewTimeoutRef.current);
			hoverPreviewTimeoutRef.current = null;
		}
		setHoverPreviewActive(false);
	}, []);

	const armHoverPreview = useCallback(() => {
		if (
			typeof window === "undefined" ||
			!playbackId ||
			!canHover ||
			shouldReduceMotion ||
			isVideoVisible
		) {
			return;
		}

		if (hoverPreviewTimeoutRef.current !== null) {
			window.clearTimeout(hoverPreviewTimeoutRef.current);
		}

		hoverPreviewTimeoutRef.current = window.setTimeout(() => {
			setHoverPreviewActive(true);
			hoverPreviewTimeoutRef.current = null;
		}, 200);
	}, [canHover, isVideoVisible, playbackId, shouldReduceMotion]);

	useEffect(() => {
		void playbackId;
		void src;
		setIsPlaying(false);
		setHasStarted(false);
		setIsVideoVisible(false);
		setIsVideoPlaying(false);
		setShouldLoad(false);
		setHoverPreviewActive(false);
	}, [playbackId, src]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const syncCanHover = () => setCanHover(mediaQuery.matches);
		syncCanHover();
		mediaQuery.addEventListener("change", syncCanHover);
		return () => mediaQuery.removeEventListener("change", syncCanHover);
	}, []);

	useEffect(() => {
		return () => {
			if (hoverPreviewTimeoutRef.current !== null) {
				window.clearTimeout(hoverPreviewTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (shouldLoad) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setShouldLoad(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" }, // Load slightly before view
		);

		if (containerRef.current) observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [shouldLoad]);

	// 1. Mux Mode
	if (playbackId) {
		return (
			<figure className="group mb-8" ref={containerRef}>
				<div
					className={cn(
						"relative aspect-video w-full overflow-hidden",
						"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800",
						className,
					)}
					style={{
						boxShadow: [
							"0 1px 2px rgba(0, 0, 0, 0.04)",
							"0 4px 8px -2px rgba(0, 0, 0, 0.06)",
							"0 12px 24px -4px rgba(0, 0, 0, 0.08)",
						].join(", "),
					}}
					onPointerEnter={armHoverPreview}
					onPointerLeave={clearHoverPreview}
				>
					{shouldLoad && (
						<div
							className="absolute inset-0 z-0"
							style={{
								visibility: isVideoVisible ? "visible" : "hidden",
								pointerEvents: isVideoVisible ? "auto" : "none",
							}}
						>
							<PortfolioMuxVideo
								playbackId={playbackId}
								poster={poster}
								metadata={metadata}
								loop={loop}
								muted={muted}
								active={isVideoPlaying}
								variant="article"
								className="h-full w-full"
								onPlayingChange={(playing) => {
									if (playing) {
										setIsVideoVisible(true);
										setIsVideoPlaying(true);
										return;
									}

									setIsVideoPlaying(false);
								}}
							/>
						</div>
					)}

					<motion.div
						className="absolute inset-0 z-10"
						animate={{ opacity: isVideoVisible ? 0 : 1 }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
						style={{ pointerEvents: isVideoVisible ? "none" : "auto" }}
					>
						{poster ? (
							<div className="absolute inset-0">
								<Image
									src={poster}
									alt=""
									aria-hidden
									fill
									sizes="100vw"
									className="object-cover"
									decoding="async"
								/>
							</div>
						) : null}

						{poster && (
							<>
								<motion.div
									className="pointer-events-none absolute inset-0 z-10"
									initial={false}
									animate={{ opacity: hoverPreviewActive ? 1 : 0 }}
									transition={springs.snappy}
									aria-hidden={!hoverPreviewActive}
								>
									<Image
										src={`https://image.mux.com/${playbackId}/animated.webp?width=640&fps=15&start=0&end=4`}
										alt=""
										fill
										unoptimized
										sizes="100vw"
										className="object-cover"
										loading="lazy"
										decoding="async"
										aria-hidden="true"
									/>
								</motion.div>
								<div
									className="pointer-events-none absolute inset-0 z-20"
									style={{
										background:
											"radial-gradient(circle at center, rgb(0 0 0 / 0) 36%, rgb(0 0 0 / 0.14) 100%)",
									}}
									aria-hidden
								/>
							</>
						)}

						<div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
							<motion.button
								type="button"
								initial="idle"
								whileHover="hover"
								whileTap="tap"
								variants={{
									idle: { scale: 1 },
									hover: { scale: 1.05 },
									tap: { scale: 0.92 },
								}}
								transition={springs.snappy}
								className={cn(
									"pointer-events-auto inline-flex h-[var(--portfolio-control-default)] items-center justify-center gap-2",
									"border border-white/12 bg-surface-950/88 px-[var(--portfolio-control-pad-default)] text-white backdrop-blur-md",
									"shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-colors duration-150",
									"hover:border-white/18 hover:bg-surface-950/94",
									"focus-visible:border-white/18 focus-visible:bg-surface-950/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
									hoverPreviewActive && "border-white/20 bg-surface-950",
								)}
								aria-label={
									duration ? `Play video, duration ${duration}` : "Play video"
								}
								onClick={() => {
									clearHoverPreview();
									stopAllPortfolioVideos();
									setShouldLoad(true);
									setIsVideoVisible(true);
									setIsVideoPlaying(true);
								}}
							>
								<span className="inline-grid grid-cols-[14px_auto] items-center gap-x-2">
									<span className="flex w-[14px] items-center justify-center">
										<Play size={14} weight="fill" />
									</span>
									<span className="inline-flex items-baseline gap-x-2">
										<span className="portfolio-control-label">Play</span>
										{duration ? (
											<>
												<span
													aria-hidden
													className="h-3 w-px self-center bg-white/16"
												/>
												<span className="portfolio-chip-label text-white/72 tabular-nums">
													{duration}
												</span>
											</>
										) : null}
									</span>
								</span>
							</motion.button>
						</div>
					</motion.div>
				</div>

				{caption && (
					<figcaption className="mt-3 text-center font-mono text-muted-foreground text-xs">
						{caption}
					</figcaption>
				)}
			</figure>
		);
	}

	// 2. Legacy Mode (Requires SRC)
	if (src) {
		const togglePlay = () => {
			const video = videoRef.current;
			if (!video) return;

			if (!shouldLoad) {
				stopAllPortfolioVideos();
				setShouldLoad(true);
				// Wait for render cycle to inject source
				setTimeout(() => {
					if (videoRef.current) {
						videoRef.current.play();
						setIsPlaying(true);
						setHasStarted(true);
					}
				}, 50);
				return;
			}

			if (isPlaying) {
				video.pause();
				setIsPlaying(false);
			} else {
				stopAllPortfolioVideos();
				video.play();
				setIsPlaying(true);
				setHasStarted(true);
			}
		};

		const handleEnded = () => {
			if (!loop) {
				setIsPlaying(false);
			}
		};

		return (
			<figure className="group mb-8" ref={containerRef}>
				<button
					type="button"
					aria-label="Video player"
					className={cn(
						"relative aspect-video w-full overflow-hidden",
						"cursor-pointer",
						"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800",
						className,
					)}
					style={{
						// Shadow styling
						boxShadow: [
							"0 1px 2px rgba(0, 0, 0, 0.04)", // Contact shadow
							"0 4px 8px -2px rgba(0, 0, 0, 0.06)", // Direct shadow
							"0 12px 24px -4px rgba(0, 0, 0, 0.08)", // Ambient diffuse
						].join(", "),
					}}
					onClick={togglePlay}
				>
					{/* Video Element */}
					<video
						ref={videoRef}
						poster={poster}
						loop={loop}
						muted={muted}
						playsInline
						// preload="none" removal: We manually handle source
						onEnded={handleEnded}
						className="size-full object-cover"
					>
						{shouldLoad && <source src={src} type="video/mp4" />}
					</video>

					{/* Play/Pause Overlay */}
					<motion.div
						initial={false}
						animate={{
							opacity: isPlaying && hasStarted ? 0 : 1,
							backgroundColor:
								isPlaying && hasStarted ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.1)",
						}}
						whileHover={{ opacity: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
						transition={springs.snappy}
						className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
					>
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							transition={springs.snappy}
							className={cn(
								"flex size-14 items-center justify-center rounded-none",
								"border border-surface-200 bg-white/95 text-surface-900 shadow-lg",
							)}
						>
							{isPlaying ? (
								<Pause size={24} weight="fill" />
							) : (
								<Play size={24} weight="fill" className="ml-1" />
							)}
						</motion.div>
					</motion.div>

					{/* Corner Badge - "Video" indicator */}
					<div className="absolute top-3 left-3 border border-surface-200 bg-white/90 px-2 py-0.5 font-mono text-[10px] text-surface-900 uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100 dark:border-surface-800 dark:bg-surface-900/90 dark:text-surface-100">
						Video
					</div>
				</button>

				{/* Caption */}
				{caption && (
					<figcaption className="mt-3 text-center font-mono text-muted-foreground text-xs">
						{caption}
					</figcaption>
				)}
			</figure>
		);
	}

	// 3. Error Mode (Missing Config)
	return (
		<div className="mb-8 flex aspect-video w-full flex-col items-center justify-center rounded-none border border-destructive-400 border-dashed bg-destructive-50 p-4 text-center text-destructive-900 dark:bg-destructive-950/20 dark:text-destructive-200">
			<p className="font-bold">Video Component Error</p>
			<p className="text-sm">Must provide either `src` (mp4) or `playbackId` (Mux).</p>
		</div>
	);
}
