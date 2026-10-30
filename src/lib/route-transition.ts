"use client";

interface RouteHandoff {
	path: string;
	surface: HTMLElement;
	transition?: ViewTransition;
	release: () => void;
}

let active: RouteHandoff | undefined;
let generation = 0;
let navigationRevision = 0;

/** Prepare after the route's layout/scroll commit, including restored Activity trees. */
function prepareRouteCopy(surface: HTMLElement, transition: ViewTransition) {
	const revision = ++generation;
	const restore: (() => void)[] = [];
	for (const element of surface.querySelectorAll<HTMLElement>("[data-entry-kind]")) {
		// Native participants lose hit testing. Keep actions and media in the live
		// page instead of capturing a whole control row, form or project gallery.
		const liveContent =
			"a, button, input, select, textarea, [role='button'], [contenteditable='true'], img, video, canvas";
		if (element.matches(liveContent) || element.querySelector(liveContent)) continue;
		const box = element.getBoundingClientRect();
		if (!box.height || box.bottom <= 0 || box.top >= innerHeight) continue;
		const heading = element.dataset.entryKind === "heading";
		const resolve = heading && element.dataset.entryEffect === "resolve";
		// The swept blur has two live masks; a single captured bitmap would flatten
		// their moving front. Its entry hook starts after transition.ready instead.
		if (resolve) continue;
		const words = heading ? element.querySelectorAll<HTMLElement>("[data-heading-word]") : [];
		const targets = words.length ? Array.from(words) : [element];
		const lead = Math.min(
			Math.max(Number(element.dataset.entryDelay) || 0, 0),
			heading ? 0.04 : 0.12,
		);
		for (const [index, target] of targets.entries()) {
			const name = `portfolio-entry-${element.dataset.entryIdentity}-${revision}-${index}`;
			const previousName = target.style.viewTransitionName;
			const previousClasses = target.style.viewTransitionClass;
			target.style.viewTransitionName = name;
			target.style.viewTransitionClass = `portfolio-entry-${heading ? "heading" : "copy"} portfolio-entry-delay-${Math.min(Math.round(lead / 0.02) + index, 6)}`;
			restore.push(() => {
				if (target.style.viewTransitionName !== name) return;
				target.style.viewTransitionName = previousName;
				target.style.viewTransitionClass = previousClasses;
			});
		}
	}
	const cleanup = () => {
		for (const reset of restore) reset();
	};
	void transition.finished.then(cleanup, cleanup);
}

export function getRouteTransition() {
	return active?.transition;
}

/** Stop a visual handoff without cancelling Next's navigation or changing history. */
export function cancelRouteTransition() {
	const handoff = active;
	if (!handoff) return;
	active = undefined;
	handoff.transition?.skipTransition();
	handoff.release();
	delete document.documentElement.dataset.routeTransition;
}

/** History navigation supersedes any link still waiting for its capture callback. */
export function supersedeRouteTransition() {
	navigationRevision++;
	cancelRouteTransition();
}

/** The layout acknowledges the actual route commit, including a real Suspense fallback. */
export function commitRouteTransition(path: string) {
	if (!active) return;
	const loading = active.surface.querySelector<HTMLElement>(".portfolio-page-loading");
	if (active.path !== path || (loading && loading.getClientRects().length > 0)) {
		cancelRouteTransition();
		return;
	}
	active.release();
}

/**
 * A small adapter around public Link/router APIs, not an alternative router.
 * Capture the viewport, never the full height of a scrolling case study.
 * Leave incoming chrome and controls uncaptured so they stay interactive.
 * Return false to retain the unmodified Link path on unsupported/input-sensitive paths.
 */
export function startRouteTransition(href: string, navigate: () => void): boolean {
	const revision = ++navigationRevision;
	cancelRouteTransition();
	const surface = document.querySelector<HTMLElement>(".portfolio-scene");
	const root = document.documentElement;
	const destination = new URL(href, location.href);
	if (
		!surface ||
		!document.startViewTransition ||
		window.self !== window.top ||
		document.documentElement.dataset.navigationInput === "keyboard" ||
		document.documentElement.dataset.themeTransition ||
		matchMedia("(prefers-reduced-motion: reduce)").matches ||
		destination.origin !== location.origin ||
		destination.pathname === location.pathname ||
		document.querySelector('[role="dialog"], [role="alertdialog"]')
	)
		return false;

	let deadline: number | undefined;
	let resolveCommit = () => {};
	const committed = new Promise<void>((resolve) => {
		resolveCommit = resolve;
	});
	const release = () => {
		window.clearTimeout(deadline);
		resolveCommit();
	};
	const handoff: RouteHandoff = {
		path: destination.pathname,
		surface,
		release,
	};
	active = handoff;
	root.dataset.routeTransition = "capturing";
	let navigated = false;
	const update = () => {
		// Theme, scroll or an earlier route commit can cancel only the visual
		// capture. Drop this link only when a newer navigation intent replaces it.
		if (revision !== navigationRevision) return Promise.resolve();
		// Capture only the old viewport. The destination and persistent controls
		// must stay in the live DOM so pointer input works throughout the handoff.
		if (active === handoff) root.dataset.routeTransition = "true";
		if (!navigated) {
			navigated = true;
			if (active === handoff)
				deadline = window.setTimeout(() => {
					handoff.transition?.skipTransition();
					release();
				}, 150);
			navigate();
		}
		return committed.then(() => {
			if (active !== handoff || location.pathname !== handoff.path) return;
			// Let Next finish its scroll/focus commit before measuring copy. A document
			// capture suspends rendering, so awaiting an animation frame would deadlock it.
			return new Promise<void>((resolve) => {
				window.setTimeout(() => {
					if (active === handoff && handoff.transition)
						prepareRouteCopy(surface, handoff.transition);
					resolve();
				}, 0);
			});
		});
	};
	try {
		const transition = document.startViewTransition(update);
		handoff.transition = transition;
		// Never hold a captured page over a slow request. Next continues normally;
		// its pending control and real loading boundary remain the source of truth.
		void transition.ready.then(
			() => window.clearTimeout(deadline),
			() => {
				window.clearTimeout(deadline);
				void update();
			},
		);
		void transition.finished
			.catch(() => {})
			.finally(() => {
				window.clearTimeout(deadline);
				if (active !== handoff) return;
				active = undefined;
				delete root.dataset.routeTransition;
				// Visual cancellation can finish before a slow route. The link's local
				// transition still tracks the router's pending work through useTransition.
			});
		return true;
	} catch {
		cancelRouteTransition();
		return false;
	}
}
