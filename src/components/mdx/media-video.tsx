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
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MuxVideoMetadata } from "@/src/content/types";
import { cn, springs } from "@/src/lib/index";
import { stopAllPortfolioVideos } from "@/src/lib/portfolio-video-sync";

const PortfolioMuxVideo = dynamic(
	() =>
		import("@/src/components/ui/portfolio-mux-video").then(
			(module) => module.PortfolioMuxVideo,
		),
	{ ssr: false },
);

interface MediaVideoProps {
	/** Direct URL to a video file (mp4). mutually exclusive with playbackId. */
	src?: string;
	/** Mux Playback ID. If provided, renders the portfolio Mux player. mutually exclusive with src. */
	playbackId?: string;
	/** Mux Data Metadata for analytics. */
	metadata?: MuxVideoMetadata;
	poster?: string;
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
	caption,
	loop = true,
	muted = true,
	className,
}: MediaVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [userRequestedPlay, setUserRequestedPlay] = useState(false);

	// True Lazy Load: Only inject <source> when near viewport
	const [shouldLoad, setShouldLoad] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		void playbackId;
		void src;
		setIsPlaying(false);
		setHasStarted(false);
		setUserRequestedPlay(false);
		setShouldLoad(false);
	}, [playbackId, src]);

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
		const shouldAutoPlayMux = (loop && muted) || userRequestedPlay;

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
				>
					{poster && (
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
					)}

					{shouldLoad && (
						<PortfolioMuxVideo
							key={`article-player-${playbackId}`}
							playbackId={playbackId}
							poster={poster}
							metadata={metadata}
							loop={loop}
							muted={muted}
							active={shouldAutoPlayMux}
							variant="article"
							className="absolute inset-0"
						/>
					)}

					{!shouldLoad && !shouldAutoPlayMux && (
						<div className="absolute inset-0 flex items-center justify-center">
							<button
								type="button"
								className={cn(
									"flex size-14 items-center justify-center rounded-none",
									"border border-surface-200 bg-white/95 text-surface-900 shadow-lg",
									"transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
								)}
								aria-label="Load and play video"
								onClick={() => {
									stopAllPortfolioVideos();
									setUserRequestedPlay(true);
									setShouldLoad(true);
								}}
							>
								<Play size={24} weight="fill" className="ml-1" />
							</button>
						</div>
					)}
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
