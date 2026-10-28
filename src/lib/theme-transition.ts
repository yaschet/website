"use client";

import { flushSync } from "react-dom";
import { cancelRouteTransition } from "./route-transition";

type Theme = "light" | "dark";
type ThemeSurface = HTMLElement & {
	startViewTransition?: (update: () => void) => ViewTransition;
};

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

	root.dataset.themeTransition = "true";
	try {
		const surface = document.querySelector<ThemeSurface>(".portfolio-theme-surface");
		// Element-scoped capture keeps the fixed dock above the snapshot and interactive.
		// Older browsers retain the Office-style document crossfade.
		const transition = surface?.startViewTransition
			? surface.startViewTransition(update)
			: document.startViewTransition(update);
		activeTransition = transition;
		// A skipped or unavailable snapshot is recoverable; the theme still commits.
		void transition.ready.catch(() => {});
		void transition.finished.catch(update).finally(finish);
	} catch {
		update();
		finish();
	}
}
