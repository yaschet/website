"use client";

type RouteSurface = HTMLElement & {
	startViewTransition?: (update: () => Promise<void>) => ViewTransition;
};

interface RouteHandoff {
	path: string;
	surface: RouteSurface;
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
		const box = element.getBoundingClientRect();
		if (!box.height || box.bottom <= 0 || box.top >= innerHeight) continue;
		const heading = element.dataset.entryKind === "heading";
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
	delete handoff.surface.dataset.routeTransition;
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
 * Only an element-scoped snapshot is safe: the header, dock and tooltip stay live.
 * Return false to retain the unmodified Link path on unsupported/input-sensitive paths.
 */
export function startRouteTransition(href: string, navigate: () => void): boolean {
	const revision = ++navigationRevision;
	cancelRouteTransition();
	const surface = document.querySelector<RouteSurface>(".portfolio-scene");
	const destination = new URL(href, location.href);
	if (
		!surface?.startViewTransition ||
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
	surface.dataset.routeTransition = "true";
	let navigated = false;
	const update = () => {
		// Theme, scroll or an earlier route commit can cancel only the visual
		// capture. Drop this link only when a newer navigation intent replaces it.
		if (revision !== navigationRevision) return Promise.resolve();
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
			// Next's scroll/focus handlers can run after child layout effects. One
			// frame resolves their final geometry before the new native capture.
			return new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					if (active === handoff && handoff.transition)
						prepareRouteCopy(surface, handoff.transition);
					resolve();
				});
			});
		});
	};
	try {
		const transition = surface.startViewTransition(update);
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
				delete surface.dataset.routeTransition;
				// Visual cancellation can finish before a slow route. The link's local
				// transition still tracks the router's pending work through useTransition.
			});
		return true;
	} catch {
		cancelRouteTransition();
		return false;
	}
}
