"use client";

import { useLayoutEffect } from "react";

/** Keep every border, inset frame and seam at one physical display pixel. */
export function HairlineScale() {
	useLayoutEffect(() => {
		let resolution: MediaQueryList;
		const sync = () => {
			resolution?.removeEventListener("change", sync);
			const ratio = window.devicePixelRatio || 1;
			document.documentElement.style.setProperty("--foundation-hairline", `${1 / ratio}px`);
			resolution = window.matchMedia(`(resolution: ${ratio}dppx)`);
			resolution.addEventListener("change", sync);
		};
		sync();
		return () => resolution.removeEventListener("change", sync);
	}, []);
	return null;
}
