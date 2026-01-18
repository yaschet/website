"use client";

/**
 * MediaVideo - Click-to-Play Video Embed
 *
 * @module media-video
 * @description
 * Premium video component with poster frame and click-to-play.
 * Does not autoplay (respects Core Web Vitals).
 *
 * Modern Swiss Design:
 * - Sharp capsule for controls (matching MediaImage)
 * - 3-tier layered shadow system
 * - Subtle backdrop blur for overlays
 * - Physics-based springs
 */

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Pause } from "@phosphor-icons/react/dist/ssr";
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
        style={{
          // Premium layered shadow — matching MediaImage
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
              "rounded-none", // Sharp Swiss edges
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
        <div className="absolute left-3 top-3 border border-surface-200 bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-surface-900 opacity-0 transition-opacity group-hover:opacity-100 dark:border-surface-800 dark:bg-surface-900/90 dark:text-surface-100">
          Video
        </div>
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
