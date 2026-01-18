"use client";

/**
 * MediaGallery - Inline Scrub Gallery
 *
 * @module media-gallery
 * @description
 * Same scrub interaction as hero gallery, usable inline in content.
 * Resolves images through assetMap for automatic blur.
 *
 * Modern Swiss Design:
 * - Sharp badge for image counter
 * - Precise tick indicators
 * - 3-tier shadow system
 * - Background glassmorphism
 */

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { cn } from "@/src/lib/utils";
import { resolveAsset } from "@/src/lib/assets";

interface MediaGalleryProps {
  images: string[];
  caption?: string;
  aspectRatio?: string;
  className?: string;
}

export function MediaGallery({
  images: rawImages,
  caption,
  aspectRatio = "16/9",
  className,
}: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasGallery = rawImages.length > 1;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!hasGallery) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const newIndex = Math.floor((x / width) * rawImages.length);
    const clampedIndex = Math.max(0, Math.min(newIndex, rawImages.length - 1));
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  }

  function handleMouseLeave() {
    setActiveIndex(0);
  }

  if (rawImages.length === 0) return null;

  return (
    <figure className="mb-8">
      <div
        className={cn(
          "group relative w-full overflow-hidden",
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gallery Strip */}
        <div
          className="flex h-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            width: `${rawImages.length * 100}%`,
            transform: `translateX(-${(activeIndex * 100) / rawImages.length}%)`,
          }}
        >
          {rawImages.map((rawSrc, i) => {
            const src = resolveAsset(rawSrc);
            const isStatic = typeof src !== "string";

            return (
              <div key={rawSrc} className="relative h-full w-full flex-1">
                <Image
                  src={src}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  placeholder={isStatic ? "blur" : "empty"}
                />
              </div>
            );
          })}
        </div>

        {/* Swiss Ticks */}
        {hasGallery && (
          <div className="absolute inset-x-0 bottom-0 flex gap-0.5 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {rawImages.map((src, i) => (
              <div
                key={`tick-${src}`}
                className={cn(
                  "h-0.5 flex-1 transition-colors duration-200",
                  i === activeIndex
                    ? "bg-surface-900 dark:bg-surface-100"
                    : "bg-surface-900/20 dark:bg-surface-100/20",
                )}
              />
            ))}
          </div>
        )}

        {/* Image Counter Badge */}
        <div className="absolute right-3 top-3 border border-surface-200 bg-white/95 px-2 py-1 font-mono text-[10px] text-surface-900 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:border-surface-800 dark:bg-surface-950/95 dark:text-surface-100">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(rawImages.length).padStart(2, "0")}
        </div>

        {/* Hover Label */}
        <div className="absolute left-3 top-3 border border-surface-200 bg-white/95 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-surface-900 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:border-surface-800 dark:bg-surface-950/95 dark:text-surface-100">
          Gallery
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
