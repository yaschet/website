"use client";

/**
 * MediaImage - Premium Image Zoom with Shared Element Transition
 *
 * @module media-image
 * @description
 * Ultra-stable shared element transition with custom blur placeholder.
 * Does NOT use Next.js built-in placeholder to avoid Framer Motion conflicts.
 * Instead, handles the blurDataURL manually for 100% reliable clearing.
 */

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";
import { resolveAsset } from "@/src/lib/assets";

interface MediaImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  className?: string;
}

export function MediaImage({
  src: rawSrc,
  alt = "",
  width = 1200,
  height = 800,
  caption,
  className,
}: MediaImageProps) {
  const layoutId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Resolve asset and extract blur data
  const src = resolveAsset(rawSrc);
  const isStatic = typeof src !== "string";
  const blurDataURL = isStatic ? (src as any).blurDataURL : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

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
      if (isOpen) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, close]);

  const aspectRatio = width / height;

  return (
    <>
      <figure className="mb-8">
        <motion.div
          layoutId={layoutId}
          onClick={() => setIsOpen(true)}
          transition={springs.layout}
          className={cn(
            "relative w-full cursor-zoom-in overflow-hidden",
            "border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800",
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
          {/* Custom Blur Placeholder - using base64 from asset */}
          {blurDataURL && !isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${blurDataURL})`,
                filter: "blur(20px)",
                scale: 1.1, // Scale up to hide edges
              }}
            />
          )}

          <NextImage
            src={src}
            alt={alt}
            width={isStatic ? undefined : width}
            height={isStatic ? undefined : height}
            fill={isStatic ? false : true}
            sizes="(max-width: 768px) 100vw, 768px"
            className={cn(
              "relative z-10 size-full object-cover transition-all duration-500",
              isOpen ? "opacity-0 scale-95" : "opacity-100 scale-100",
              isLoaded ? "blur-0" : "blur-lg",
            )}
            onLoad={() => setIsLoaded(true)}
            // We don't use the built-in placeholder="blur" to avoid shared layout conflicts
          />

          {/* Hover Badge */}
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/10 hover:opacity-100">
            <span className="border border-surface-200 bg-white/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-surface-900 shadow-md dark:border-surface-800 dark:bg-surface-950/95 dark:text-surface-100">
              Zoom
            </span>
          </div>

          <div className="absolute left-3 top-3 z-20 border border-surface-200 bg-white/95 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-surface-900 opacity-0 transition-opacity group-hover:opacity-100 dark:border-surface-800 dark:bg-surface-950/95 dark:text-surface-100">
            Image
          </div>
        </motion.div>

        {(caption || alt) && (
          <figcaption className="mt-3 text-center font-mono text-xs text-muted-foreground">
            {caption || alt}
          </figcaption>
        )}
      </figure>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={close}
                  className="fixed inset-0 z-[9998] cursor-zoom-out bg-black/95 backdrop-blur-md"
                  aria-hidden="true"
                />

                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center p-8 pointer-events-none"
                  onClick={close}
                >
                  <motion.div
                    layoutId={layoutId}
                    transition={springs.layout}
                    className="relative pointer-events-auto overflow-hidden bg-surface-900"
                    style={{
                      maxWidth: "92vw",
                      maxHeight: "92vh",
                      aspectRatio,
                    }}
                  >
                    <NextImage
                      src={src}
                      alt={alt}
                      width={isStatic ? undefined : width}
                      height={isStatic ? undefined : height}
                      fill={isStatic ? false : true}
                      sizes="95vw"
                      className="size-full object-contain"
                      priority
                    />
                  </motion.div>
                </div>

                {/* UI Controls */}
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

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pointer-events-none fixed right-6 top-6 z-[10000] font-mono text-xs uppercase tracking-wider text-white"
                >
                  ESC to close
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
