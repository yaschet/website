"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import {
	cancelRouteTransition,
	commitRouteTransition,
	supersedeRouteTransition,
} from "@/src/lib/route-transition";

/** Only route content participates in the page handoff; persistent chrome sits outside. */
export function PortfolioScene({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const scene = useRef<HTMLDivElement>(null);
	const previousPath = useRef(pathname);
	useLayoutEffect(() => {
		if (previousPath.current === pathname) return;
		previousPath.current = pathname;
		commitRouteTransition(pathname);
		const element = scene.current;
		const loading = element?.querySelector<HTMLElement>(".portfolio-page-loading");
		const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
		if (
			!element ||
			(loading && loading.getClientRects().length > 0) ||
			element.dataset.routeTransition ||
			document.documentElement.dataset.navigationInput === "keyboard" ||
			reducedMotion.matches
		)
			return;
		const style = getComputedStyle(element);
		const duration = style.getPropertyValue("--duration-fast").trim();
		const animation = element.animate(
			[{ transform: "translateY(var(--distance-base))" }, { transform: "translateY(0)" }],
			{
				duration: Number.parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000),
				easing: style.getPropertyValue("--ease-smooth-out").trim(),
			},
		);
		animation.id = "portfolio-entry-frame";
		const cancel = () => animation.cancel();
		reducedMotion.addEventListener("change", cancel);
		document.addEventListener("keydown", cancel, true);
		return () => {
			cancel();
			reducedMotion.removeEventListener("change", cancel);
			document.removeEventListener("keydown", cancel, true);
		};
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
		window.addEventListener("wheel", cancelRouteTransition, { passive: true });
		window.addEventListener("touchmove", cancelRouteTransition, { passive: true });
		return () => {
			supersedeRouteTransition();
			preference.removeEventListener("change", cancelRouteTransition);
			document.removeEventListener("pointerdown", pointer, true);
			document.removeEventListener("keydown", keyboard, true);
			window.removeEventListener("popstate", supersedeRouteTransition);
			window.removeEventListener("wheel", cancelRouteTransition);
			window.removeEventListener("touchmove", cancelRouteTransition);
		};
	}, []);
	return (
		<div ref={scene} className="portfolio-scene">
			{children}
		</div>
	);
}
