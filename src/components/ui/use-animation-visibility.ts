"use client";

import { type RefObject, useEffect, useState } from "react";

/** Pause ongoing work outside the viewport or in a hidden document. No preload margin. */
export function useAnimationVisibility(ref: RefObject<Element | null>) {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		let intersects = true;
		const sync = () => setVisible(intersects && !document.hidden);
		const observer = new IntersectionObserver(([entry]) => {
			intersects = entry?.isIntersecting ?? false;
			sync();
		});
		observer.observe(element);
		document.addEventListener("visibilitychange", sync);
		sync();
		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, [ref]);
	return visible;
}
