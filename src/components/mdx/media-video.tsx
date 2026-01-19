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
import { useEffect, useRef, useState } from "react";
import { cn, springs } from "@/src/lib/index";

interface MediaVideoProps {
	src: string;
	poster?: string;
	caption?: string;
	loop?: boolean;
	muted?: boolean;
	className?: string;
}

export function MediaVideo({
	src,
	poster,
	caption,
	loop = true,
	muted = true,
	className,
}: MediaVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);

	// True Lazy Load: Only inject <source> when near viewport
	const [shouldLoad, setShouldLoad] = useState(false);

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

		if (videoRef.current) observer.observe(videoRef.current);
		return () => observer.disconnect();
	}, [shouldLoad]);

	const togglePlay = () => {
		const video = videoRef.current;
		if (!video) return;

		if (!shouldLoad) {
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
		<figure className="group mb-8">
			<button
				type="button"
				aria-label="Video player"
				className={cn(
					"relative aspect-video w-full overflow-hidden",
					"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800",
					"cursor-pointer",
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
							"flex size-14 items-center justify-center bg-white/95 shadow-lg",
							"border border-surface-200 text-surface-900",
							"rounded-none",
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
