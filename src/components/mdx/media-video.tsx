"use client";

/**
 * MediaVideo - Click-to-Play Video Embed
 *
 * @module media-video
 * @description
 * Premium video component with poster frame and click-to-play.
 * Does not autoplay (respects Core Web Vitals).
 *
 * Usage in MDX:
 * ```mdx
 * <Video src="/videos/demo.mp4" poster="/images/poster.jpg" />
 * ```
 */

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Pause } from "@phosphor-icons/react";
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

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

	const togglePlay = () => {
		const video = videoRef.current;
		if (!video) return;

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
			<div
				className={cn(
					"relative aspect-video w-full overflow-hidden",
					"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800",
					"cursor-pointer",
					className,
				)}
				onClick={togglePlay}
			>
				{/* Video Element */}
				<video
					ref={videoRef}
					src={src}
					poster={poster}
					loop={loop}
					muted={muted}
					playsInline
					preload="none"
					onEnded={handleEnded}
					className="size-full object-cover"
				/>

				{/* Play/Pause Overlay */}
				<motion.div
					initial={false}
					animate={{
						opacity: isPlaying && hasStarted ? 0 : 1,
						scale: isPlaying && hasStarted ? 0.8 : 1,
					}}
					whileHover={{ opacity: 1, scale: 1 }}
					transition={springs.snappy}
					className="absolute inset-0 flex items-center justify-center bg-black/30"
				>
					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						transition={springs.snappy}
						className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg"
					>
						{isPlaying ? (
							<Pause size={28} weight="fill" className="text-surface-900" />
						) : (
							<Play size={28} weight="fill" className="ml-1 text-surface-900" />
						)}
					</motion.div>
				</motion.div>

				{/* Progress indicator could go here */}
			</div>

			{/* Caption */}
			{caption && (
				<figcaption className="mt-3 text-center font-mono text-xs text-muted-foreground">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}
