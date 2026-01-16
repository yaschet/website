"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * HeroGradient
 *
 * Large, soft, diffuse glow emanating from top-center of the page.
 * Dot grid overlay visible only within the gradient area.
 */

interface HeroGradientProps {
  className?: string;
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const isDark = resolvedTheme === "dark";

  // Draw dot grid pattern
  const drawDots = useCallback(() => {
    const canvas = canvasRef.current;
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

    // Small dots with tight spacing (1px dot, ~2px gap)
    const dotSize = 1;
    const spacing = 2;

    // White dots - subtle opacity
    ctx.fillStyle = isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(255, 255, 255, 0.35)";

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
      // Small delay to ensure container is rendered
      requestAnimationFrame(drawDots);
    }
  }, [mounted, drawDots]);

  useEffect(() => {
    window.addEventListener("resize", drawDots);
    return () => window.removeEventListener("resize", drawDots);
  }, [drawDots]);

  if (!mounted) {
    return null;
  }

  // Soft cyan/blue gradient
  const glowColor = isDark
    ? "rgba(56, 189, 248, 0.15)" // sky-400 very subtle
    : "rgba(14, 165, 233, 0.12)"; // sky-500 subtle

  return (
    <div
      ref={containerRef}
      className={`absolute inset-x-0 top-0 h-screen overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Large radial gradient emanating from top-center */}
      <div
        className="absolute w-full h-full"
        style={{
          background: `radial-gradient(ellipse 100% 70% at 50% 0%, ${glowColor}, transparent)`,
        }}
      />

      {/* Dot grid overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
