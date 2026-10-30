"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import {
	cancelRouteTransition,
	commitRouteTransition,
	supersedeRouteTransition,
} from "@/src/lib/route-transition";

/** A persistent route outlet acknowledges commits without remounting site chrome. */
export function PortfolioScene({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const previousPath = useRef(pathname);
	useLayoutEffect(() => {
		if (previousPath.current === pathname) return;
		previousPath.current = pathname;
		commitRouteTransition(pathname);
	}, [pathname]);
	useEffect(() => {
		const root = document.documentElement;
		const pointer = () => {
			root.dataset.navigationInput = "pointer";
		};
		const keyboard = () => {
			root.dataset.navigationInput = "keyboard";
			cancelRouteTransition();
		};
		const preference = matchMedia("(prefers-reduced-motion: reduce)");
		preference.addEventListener("change", cancelRouteTransition);
		document.addEventListener("pointerdown", pointer, true);
		document.addEventListener("keydown", keyboard, true);
		window.addEventListener("popstate", supersedeRouteTransition);
		window.addEventListener("resize", cancelRouteTransition);
		window.visualViewport?.addEventListener("resize", cancelRouteTransition);
		window.addEventListener("wheel", cancelRouteTransition, { passive: true });
		window.addEventListener("touchmove", cancelRouteTransition, { passive: true });
		return () => {
			supersedeRouteTransition();
			preference.removeEventListener("change", cancelRouteTransition);
			document.removeEventListener("pointerdown", pointer, true);
			document.removeEventListener("keydown", keyboard, true);
			window.removeEventListener("popstate", supersedeRouteTransition);
			window.removeEventListener("resize", cancelRouteTransition);
			window.visualViewport?.removeEventListener("resize", cancelRouteTransition);
			window.removeEventListener("wheel", cancelRouteTransition);
			window.removeEventListener("touchmove", cancelRouteTransition);
		};
	}, []);
	return <div className="portfolio-scene">{children}</div>;
}
