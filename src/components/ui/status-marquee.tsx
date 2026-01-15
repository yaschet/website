"use client";

import { useEffect, useState } from "react";

export function StatusBanner() {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Africa/Casablanca",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="h-8" />;

  return (
    <div className="w-full h-8 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 overflow-hidden">
      <div className="h-full max-w-5xl mx-auto px-4 flex items-center justify-between text-xs font-medium">
        {/* Left: Location */}
        <span className="shrink-0">Rabat, Morocco</span>

        {/* Center: Marquee */}
        <div className="flex-1 mx-8 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="flex items-center">
                <span>Open for work</span>
                <span className="mx-4 opacity-40">—</span>
                <span>Booking for February</span>
                <span className="mx-4 opacity-40">—</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Time */}
        <span className="shrink-0 tabular-nums">{time}</span>
      </div>
    </div>
  );
}
