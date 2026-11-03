"use client";

import { flushSync } from "react-dom";
import { cancelRouteTransition } from "./route-transition";

type Theme = "light" | "dark";

let activeTransition: ViewTransition | null = null;
let requestedTheme: Theme | null = null;
let revision = 0;
let paintRevision = 0;
let paintFrame: number | undefined;

/** Change theme in place, with an optional material fade at the page opening. */
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

	// Change theme in place while reading; reserve the viewport fade for the
	// opening. This avoids depending on unreliable scrolled root snapshots.
	// Embedded previews and live dialogs also keep their interactive surface.
	if (
		window.self !== window.top ||
		window.scrollX !== 0 ||
		window.scrollY !== 0 ||
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
		// Capture the opening viewport; the destination remains live and interactive.
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
