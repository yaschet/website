"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * HeroGradient
 *
 * Premium cloud-like gradient glow floating INSIDE the page.
 * Uses SVG filter with noise to eliminate color banding.
 * Multiple blur layers for natural depth.
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

  return (
    <div
      ref={containerRef}
      className={`absolute inset-x-0 top-0 h-screen overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        // Mask that fades to transparent at all edges
        maskImage: `
          linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)
        `,
        WebkitMaskImage: `
          linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)
        `,
      }}
    >
      {/* SVG filter for noise - breaks up color banding */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="noise-filter" x="0%" y="0%" width="100%" height="100%">
            {/* Add subtle noise to break banding */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 
        Premium cloud gradient - LARGER for presence
        Multiple layers with noise filter to eliminate banding
      */}

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

      {/* Layer 2: Medium accent cloud - adds depth */}
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

      {/* Layer 3: Small bright core - premium glow center */}
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
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
