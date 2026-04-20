import { cn } from "@/src/lib/index";

export const GALLERY_CHROME_ICON_SIZE = 18;

export const GALLERY_CHROME_BUTTON_CLASS_NAME = cn(
	"inline-flex h-10 w-10 items-center justify-center rounded-none border border-[color:var(--portfolio-player-hairline)] bg-surface-950 text-white",
	"shadow-none transition-[background-color,border-color,color,opacity,transform] duration-150",
	"hover:bg-surface-800",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
	"disabled:pointer-events-none disabled:opacity-30",
);

export const GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME = "h-11 w-11";

export const GALLERY_CHROME_META_CHIP_CLASS_NAME = cn(
	"inline-flex h-10 items-center justify-center rounded-none border border-[color:var(--portfolio-player-hairline)] bg-surface-950 px-3 text-white",
	"shadow-none transition-[background-color,border-color,color,opacity,transform] duration-150",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
);

export const GALLERY_CHROME_COUNTER_CLASS_NAME =
	"font-mono text-[10px] uppercase tabular-nums tracking-[0.22em] text-white/80";
