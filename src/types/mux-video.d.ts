import type MuxVideoElement from "@mux/mux-video";
import type * as React from "react";

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"mux-video": React.DetailedHTMLProps<
				React.HTMLAttributes<MuxVideoElement>,
				MuxVideoElement
			>;
		}
	}
}
