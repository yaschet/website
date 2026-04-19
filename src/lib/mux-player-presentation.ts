import type MuxPlayer from "@mux/mux-player-react";
import type { ComponentProps } from "react";

type MuxPlayerPresentationStyle = NonNullable<ComponentProps<typeof MuxPlayer>["style"]>;

export const muxPlayerPresentationStyle = {
	height: "100%",
	width: "100%",
	"--controls-backdrop-color":
		"linear-gradient(to top, rgba(3,7,18,0.7), rgba(3,7,18,0.24) 42%, rgba(3,7,18,0) 68%)",
	"--media-object-fit": "cover",
	"--media-primary-color": "rgba(255, 255, 255, 0.96)",
	"--media-secondary-color": "transparent",
	"--media-accent-color": "rgba(255, 255, 255, 0.98)",
	"--media-control-background": "transparent",
	"--media-control-hover-background": "transparent",
	"--media-range-bar-color": "rgba(255, 255, 255, 0.98)",
	"--media-range-track-background": "rgba(255, 255, 255, 0.2)",
	"--media-time-range-buffered-color": "rgba(255, 255, 255, 0.36)",
	"--media-range-thumb-background":
		"radial-gradient(circle, rgba(255,255,255,0.98) 0 46%, rgba(15,23,42,0.92) 47% 100%)",
	"--media-text-color": "rgba(255, 255, 255, 0.96)",
} satisfies MuxPlayerPresentationStyle;
