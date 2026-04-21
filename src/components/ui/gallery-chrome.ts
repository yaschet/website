import { cn } from "@/src/lib/index";

export const GALLERY_CHROME_ICON_SIZE = 18;

export const GALLERY_CHROME_BUTTON_CLASS_NAME = cn(
	"inline-flex h-10 w-10 items-center justify-center rounded-none border border-white/12 bg-black/92 text-white backdrop-blur-md",
	"shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150",
	"hover:border-white/18 hover:bg-black/84",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
	"disabled:pointer-events-none disabled:opacity-30",
);

export const GALLERY_CHROME_TOUCH_BUTTON_CLASS_NAME = "h-11 w-11";

export const GALLERY_CHROME_META_CHIP_CLASS_NAME = cn(
	"inline-flex h-10 items-center justify-center rounded-none border border-white/12 bg-black/92 px-3 text-white backdrop-blur-md",
	"shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150",
	"hover:border-white/18 hover:bg-black/84",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-50/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
);

export const GALLERY_CHROME_COUNTER_CLASS_NAME =
	"font-mono text-[10px] uppercase tabular-nums tracking-[0.22em] text-white/80";
