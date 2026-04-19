import type MuxPlayer from "@mux/mux-player-react";
import type { ComponentProps } from "react";

type MuxPlayerPresentationStyle = NonNullable<ComponentProps<typeof MuxPlayer>["style"]>;

export const muxPlayerClassName = "portfolio-mux-player";

export const muxPlayerPresentationStyle = {
	height: "100%",
	width: "100%",
	"--controls-backdrop-color":
		"linear-gradient(to top, rgba(3,7,18,0.76), rgba(3,7,18,0.2) 44%, rgba(3,7,18,0) 82%)",
	"--media-object-fit": "cover",
	"--media-primary-color": "rgba(255, 255, 255, 0.76)",
	"--media-secondary-color": "transparent",
	"--media-accent-color": "rgba(255, 255, 255, 0.88)",
	"--media-control-background": "transparent",
	"--media-control-hover-background": "transparent",
	"--media-text-color": "rgba(255, 255, 255, 0.96)",
} satisfies MuxPlayerPresentationStyle;
