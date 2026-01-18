"use client";

/**
 * MediaImage - Premium Image Zoom with Shared Element Transition
 *
 * @module media-image
 * @description
 * Modern Swiss image component with expand-in-place zoom.
 * Uses Framer Motion layoutId for shared element transitions.
 *
 * Modern Swiss Design:
 * - Subtle backdrop blur (glassmorphism)
 * - Sharp corners (0 radius)
 * - High contrast overlay
 * - Mono typography for captions
 */

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

interface MediaImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  className?: string;
}

export function MediaImage({
  src,
  alt = "",
  width = 1200,
  height = 800,
  caption,
  className,
}: MediaImageProps) {
  const layoutId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side only for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle closing
  const close = useCallback(() => {
    setIsOpen(false);
    // Immediately reset body overflow
    document.body.style.overflow = "";
  }, []);

  // Handle keyboard close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Always reset on cleanup
      if (isOpen) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, close]);

  const aspectRatio = width / height;

  return (
    <>
      {/* In-content Thumbnail */}
      <figure className="mb-8">
        {/* Only render thumbnail when NOT open */}
        {!isOpen && (
          <motion.div
            layoutId={layoutId}
            onClick={() => setIsOpen(true)}
            transition={springs.layout}
            className={cn(
              "relative w-full cursor-zoom-in overflow-hidden",
              "border border-surface-200 dark:border-surface-800",
              className,
            )}
            style={{
              aspectRatio,
              boxShadow: [
                "0 1px 2px rgba(0, 0, 0, 0.04)",
                "0 4px 8px -2px rgba(0, 0, 0, 0.06)",
                "0 12px 24px -4px rgba(0, 0, 0, 0.08)",
              ].join(", "),
            }}
          >
            <NextImage
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="(max-width: 768px) 100vw, 768px"
              className="size-full object-cover"
            />

            {/* Hover Indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/10 hover:opacity-100">
              <span className="border border-surface-200 bg-white/95 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-surface-900 shadow-md">
                View
              </span>
            </div>
          </motion.div>
        )}

        {/* Placeholder to maintain layout when image is open */}
        {isOpen && (
          <div className={cn("w-full", className)} style={{ aspectRatio }} />
        )}

        {/* Caption */}
        {(caption || alt) && (
          <figcaption className="mt-3 text-center font-mono text-xs text-muted-foreground">
            {caption || alt}
          </figcaption>
        )}
      </figure>

      {/* Zoomed Overlay — Portal for z-index correctness */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Overlay Background - handles all clicks */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={close}
                  className="fixed inset-0 z-[9998] cursor-zoom-out bg-black/90 backdrop-blur-sm"
                  aria-hidden="true"
                />

                {/* Image Container - centered, clicks pass through to overlay */}
                <motion.div
                  layoutId={layoutId}
                  transition={springs.layout}
                  onClick={close}
                  className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 cursor-zoom-out"
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    aspectRatio,
                  }}
                >
                  <NextImage
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    sizes="90vw"
                    className="size-full object-contain"
                    priority
                  />
                </motion.div>

                {/* Caption Badge */}
                {(caption || alt) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={springs.gentle}
                    className="pointer-events-none fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 border border-surface-200 bg-white/95 px-4 py-2 font-mono text-xs text-surface-900 dark:border-surface-800 dark:bg-surface-900/95 dark:text-surface-100"
                  >
                    {caption || alt}
                  </motion.div>
                )}

                {/* ESC Hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pointer-events-none fixed right-6 top-6 z-[10000] font-mono text-xs uppercase tracking-wider text-white/60"
                >
                  ESC
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
