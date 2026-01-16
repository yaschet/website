"use client";

/**
 * Ambient Background
 *
 * A slowly floating gradient orb that adds "life" to the page.
 * Pure CSS animation for performance.
 */

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary orb - slow float */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20 blur-[120px] animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, var(--color-cyan-400) 0%, transparent 70%)",
          top: "10%",
          right: "-10%",
        }}
      />

      {/* Secondary orb - slower float, offset timing */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-15 blur-[100px] animate-float-slower"
        style={{
          background:
            "radial-gradient(circle, var(--color-violet-400) 0%, transparent 70%)",
          bottom: "20%",
          left: "-5%",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
