"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * HeroGradient
 *
 * Premium cloud-like gradient with subtle noise dithering.
 * The noise eliminates 8-bit color banding - technique used by Apple, Stripe.
 * Key: noise must be VERY subtle (~1% opacity) to work without being visible.
 */

interface HeroGradientProps {
  className?: string;
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
  const { resolvedTheme } = useTheme();
  const dotsCanvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [noiseDataUrl, setNoiseDataUrl] = useState<string>("");

  const isDark = resolvedTheme === "dark";

  /**
   * Create noise dithering pattern - the key to eliminating banding.
   * Must be VERY subtle - around 1% opacity as per research.
   */
  const createNoisePattern = useCallback(() => {
    const canvas = noiseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Small pattern that tiles - 128x128 is efficient
    const size = 128;
    canvas.width = size;
    canvas.height = size;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Random grayscale value
      const value = Math.random() * 255;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      // CRITICAL: Very low alpha (1-2%) - invisible but breaks banding
      // Formula from research: (1/255) = ~0.4% per channel
      data[i + 3] = 3; // ~1.2% opacity - almost invisible
    }

    ctx.putImageData(imageData, 0, 0);
    setNoiseDataUrl(canvas.toDataURL());
  }, []);

  // Draw dot grid pattern
  const drawDots = useCallback(() => {
    const canvas = dotsCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const dotSize = 1;
    const spacing = 2;

    ctx.fillStyle = isDark
      ? "rgba(255, 255, 255, 0.02)"
      : "rgba(255, 255, 255, 0.3)";

    for (let x = 0; x < rect.width; x += spacing) {
      for (let y = 0; y < rect.height; y += spacing) {
        ctx.fillRect(x, y, dotSize, dotSize);
      }
    }
  }, [isDark]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      createNoisePattern();
      requestAnimationFrame(drawDots);
    }
  }, [mounted, createNoisePattern, drawDots]);

  useEffect(() => {
    window.addEventListener("resize", drawDots);
    return () => window.removeEventListener("resize", drawDots);
  }, [drawDots]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-x-0 top-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        // Extend past viewport and fade out very gradually
        height: "120vh",
        maskImage: `
          linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)
        `,
        WebkitMaskImage: `
          linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)
        `,
      }}
    >
      {/* Hidden canvas for generating noise pattern */}
      <canvas ref={noiseCanvasRef} className="hidden" aria-hidden="true" />

      {/* Layer 1: Large base cloud */}
      <div
        className="absolute"
        style={{
          width: "80%",
          height: "55%",
          left: "50%",
          top: "3%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          backgroundColor: "var(--accent-500)",
          opacity: isDark ? 0.1 : 0.06,
          filter: "blur(150px)",
        }}
      />

      {/* Layer 2: Medium accent cloud */}
      <div
        className="absolute"
        style={{
          width: "60%",
          height: "40%",
          left: "50%",
          top: "8%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          backgroundColor: "var(--accent-400)",
          opacity: isDark ? 0.08 : 0.05,
          filter: "blur(120px)",
        }}
      />

      {/* Layer 3: Small bright core */}
      <div
        className="absolute"
        style={{
          width: "40%",
          height: "25%",
          left: "50%",
          top: "12%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          backgroundColor: "var(--accent-300)",
          opacity: isDark ? 0.06 : 0.04,
          filter: "blur(80px)",
        }}
      />

      {/* Dot grid overlay */}
      <canvas
        ref={dotsCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Noise dithering overlay - VERY subtle, breaks color banding */}
      {noiseDataUrl && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 2,
            backgroundImage: `url(${noiseDataUrl})`,
            backgroundRepeat: "repeat",
            opacity: 1, // Alpha is already in the canvas data (1.2%)
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
