"use client";

import { flushSync } from "react-dom";
import { cancelRouteTransition } from "./route-transition";

type Theme = "light" | "dark";

let activeTransition: ViewTransition | null = null;
let requestedTheme: Theme | null = null;
let revision = 0;
let paintRevision = 0;
let paintFrame: number | undefined;

/** Capture one material change, rather than interpolating every surface independently. */
export function toggleThemeWithTransition(
	setTheme: (theme: string) => void,
	resolvedTheme: string | undefined,
	interaction: "pointer" | "keyboard",
) {
	cancelRouteTransition();
	const root = document.documentElement;
	const currentRevision = ++revision;
	root.dataset.themeInput = interaction;
	const dark =
		requestedTheme === "dark" ||
		(requestedTheme === null &&
			(root.classList.contains("dark") ||
				(!root.classList.contains("light") && resolvedTheme === "dark")));
	const nextTheme: Theme = dark ? "light" : "dark";
	requestedTheme = nextTheme;
	activeTransition?.skipTransition();
	activeTransition = null;
	delete root.dataset.themeTransition;

	let updated = false;
	const update = () => {
		if (revision !== currentRevision || updated) return;
		updated = true;
		// Only the outgoing viewport is captured. The new theme stays live under it.
		if (root.dataset.themeTransition === "capturing") root.dataset.themeTransition = "true";
		root.dataset.themeUpdating = "true";
		const currentPaintRevision = ++paintRevision;
		if (paintFrame !== undefined) cancelAnimationFrame(paintFrame);
		flushSync(() => setTheme(nextTheme));
		// Include the first new-theme paint, including next-themes' root class effect.
		paintFrame = requestAnimationFrame(() => {
			paintFrame = requestAnimationFrame(() => {
				if (paintRevision !== currentPaintRevision) return;
				delete root.dataset.themeUpdating;
				paintFrame = undefined;
			});
		});
	};
	const finish = () => {
		if (revision !== currentRevision) return;
		activeTransition = null;
		requestedTheme = null;
		delete root.dataset.themeTransition;
	};

	// Embedded previews and live dialogs need their original interactive surface.
	if (
		window.self !== window.top ||
		document.querySelector(
			'[role="dialog"]:not([aria-hidden="true"]), [role="alertdialog"]:not([aria-hidden="true"])',
		) ||
		interaction === "keyboard" ||
		!document.startViewTransition ||
		matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		update();
		finish();
		return;
	}

	root.dataset.themeTransition = "capturing";
	try {
		// A document snapshot is viewport-sized at every scroll depth. Capturing the
		// full scrolling surface can clip or rescale its bitmap on narrow viewports.
		const transition = document.startViewTransition(update);
		activeTransition = transition;
		const interrupt = () => transition.skipTransition();
		window.addEventListener("scroll", interrupt, { passive: true });
		window.addEventListener("resize", interrupt, { passive: true });
		document.addEventListener("pointerdown", interrupt, true);
		document.addEventListener("keydown", interrupt, true);
		// A skipped or unavailable snapshot is recoverable; the theme still commits.
		void transition.ready.catch(() => {});
		void transition.finished.catch(update).finally(() => {
			window.removeEventListener("scroll", interrupt);
			window.removeEventListener("resize", interrupt);
			document.removeEventListener("pointerdown", interrupt, true);
			document.removeEventListener("keydown", interrupt, true);
			finish();
		});
	} catch {
		update();
		finish();
	}
}
