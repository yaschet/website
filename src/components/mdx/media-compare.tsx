"use client";

/**
 * MediaCompare - Before/After Comparison Slider
 *
 * @module media-compare
 * @description
 * Drag-based comparison slider for before/after images.
 * Uses Framer Motion for smooth dragging with spring physics.
 * Resolves images through assetMap for automatic blur.
 *
 * Modern Swiss Design:
 * - Industrial handle (no circles)
 * - Sharp badge-style labels
 * - 3-tier shadow system
 * - Precision typography
 */

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";
import { resolveAsset } from "@/src/lib/assets";

interface MediaCompareProps {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  caption?: string;
  className?: string;
}

export function MediaCompare({
  before: rawBefore,
  after: rawAfter,
  beforeAlt = "Before",
  afterAlt = "After",
  caption,
  className,
}: MediaCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Resolve assets
  const before = resolveAsset(rawBefore);
  const after = resolveAsset(rawAfter);
  const isBeforeStatic = typeof before !== "string";
  const isAfterStatic = typeof after !== "string";

  // Position as percentage (0-100)
  const position = useMotionValue(50);

  // Transform to clip-path percentage
  const clipPath = useTransform(
    position,
    (val) => `inset(0 ${100 - val}% 0 0)`,
  );

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    position.set(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <figure className="mb-8">
      <div
        ref={containerRef}
        className={cn(
          "group relative aspect-video w-full cursor-ew-resize select-none overflow-hidden",
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
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <Image
            src={after}
            alt={afterAlt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            placeholder={isAfterStatic ? "blur" : "empty"}
          />
        </div>

        {/* Before Image (Clipped) */}
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <Image
            src={before}
            alt={beforeAlt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            placeholder={isBeforeStatic ? "blur" : "empty"}
          />
        </motion.div>

        {/* Divider Line & Handle */}
        <motion.div
          className="absolute inset-y-0 z-10 w-0.5 bg-white mix-blend-difference"
          style={{ left: useTransform(position, (val) => `${val}%`) }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className={cn(
                "flex h-12 w-6 items-center justify-center bg-white shadow-xl shadow-black/20",
                "border border-surface-200 transition-transform active:scale-95",
              )}
            >
              <div className="flex gap-0.5">
                <div className="h-4 w-0.5 bg-black/20" />
                <div className="h-4 w-0.5 bg-black/20" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Labels - Industrial Swiss Badges */}
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-between px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="border border-surface-200 bg-white/95 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-surface-900 shadow-md dark:border-surface-800 dark:bg-surface-950/95 dark:text-surface-100">
            {beforeAlt}
          </span>
          <span className="border border-surface-200 bg-white/95 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-surface-900 shadow-md dark:border-surface-800 dark:bg-surface-950/95 dark:text-surface-100">
            {afterAlt}
          </span>
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
