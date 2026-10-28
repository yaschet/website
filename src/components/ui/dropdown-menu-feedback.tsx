"use client";

import * as React from "react";

/** Follow Base UI's highlighted row, not an independent pointer-only state.
 * Keyboard focus is immediate; pointer travel is interruptible and retained
 * during press. Coordinates stay in layout pixels while the popup scales. */
export function DropdownMenuFeedback({
	children,
	keyboard,
}: {
	children: React.ReactNode;
	keyboard: boolean;
}) {
	const rootRef = React.useRef<HTMLDivElement>(null);
	const surfaceRef = React.useRef<HTMLSpanElement>(null);

	React.useLayoutEffect(() => {
		const root = rootRef.current;
		const surface = surfaceRef.current;
		if (!root || !surface) return;
		const view = root.ownerDocument.defaultView;
		if (!view) return;
		let current: HTMLElement | null = null;
		const release = () =>
			root.querySelectorAll("[data-menu-pressed]").forEach((item) => {
				item.removeAttribute("data-menu-pressed");
			});

		const measure = () => {
			const target = root.querySelector<HTMLElement>(
				':is([role^="menuitem"], [role="option"])[data-highlighted]:not([data-disabled]):not([aria-disabled="true"])',
			);
			if (!target) {
				current?.removeAttribute("data-menu-underlay-active");
				current = null;
				delete root.dataset.underlayReady;
				return;
			}
			const container = root.getBoundingClientRect();
			const row = target.getBoundingClientRect();
			if (!container.width || !row.height) return;
			const style = view.getComputedStyle(root);
			const scaleX = container.width / parseFloat(style.width) || 1;
			const scaleY = container.height / parseFloat(style.height) || 1;
			const firstEntry = current === null;
			if (firstEntry) surface.style.transition = "none";
			surface.style.transform = `translate(${(row.left - container.left) / scaleX}px, ${(row.top - container.top) / scaleY}px)`;
			surface.style.width = `${row.width / scaleX}px`;
			surface.style.height = `${row.height / scaleY}px`;
			root.dataset.underlayTone =
				target.dataset.variant === "destructive"
					? "destructive"
					: target.matches('[aria-checked="true"], [aria-selected="true"]')
						? "selected"
						: "default";
			current?.removeAttribute("data-menu-underlay-active");
			current = target;
			target.setAttribute("data-menu-underlay-active", "");
			if (firstEntry) {
				void surface.offsetWidth;
				surface.style.removeProperty("transition");
			}
			root.dataset.underlayReady = "true";
		};

		const observer = new MutationObserver(measure);
		observer.observe(root, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [
				"data-highlighted",
				"data-disabled",
				"aria-disabled",
				"aria-checked",
				"aria-selected",
			],
		});
		const resize = new ResizeObserver(measure);
		resize.observe(root);
		root.addEventListener("scroll", measure);
		view.addEventListener("resize", measure);
		view.addEventListener("pointerup", release, true);
		view.addEventListener("pointercancel", release, true);
		view.addEventListener("keyup", release, true);
		view.addEventListener("blur", release);
		measure();
		return () => {
			observer.disconnect();
			resize.disconnect();
			root.removeEventListener("scroll", measure);
			view.removeEventListener("resize", measure);
			view.removeEventListener("pointerup", release, true);
			view.removeEventListener("pointercancel", release, true);
			view.removeEventListener("keyup", release, true);
			view.removeEventListener("blur", release);
			current?.removeAttribute("data-menu-underlay-active");
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className="dropdown-menu-feedback"
			data-slot="dropdown-menu-feedback"
			data-motion-input={keyboard ? "keyboard" : "pointer"}
			onKeyDownCapture={(event) => {
				event.currentTarget.dataset.motionInput = "keyboard";
				if (event.key === "Enter" || event.key === " ")
					markPressed(event.target, event.currentTarget);
			}}
			onPointerMoveCapture={(event) => {
				if (event.pointerType === "mouse")
					event.currentTarget.dataset.motionInput = "pointer";
			}}
			onPointerDownCapture={(event) => {
				event.currentTarget.dataset.motionInput =
					event.pointerType === "touch" ? "touch" : "pointer";
				markPressed(event.target, event.currentTarget);
			}}
		>
			<span ref={surfaceRef} className="dropdown-menu-underlay" aria-hidden="true" />
			<div className="dropdown-menu-feedback-content">{children}</div>
		</div>
	);
}

function markPressed(target: EventTarget, root: HTMLElement) {
	const item =
		target instanceof Element
			? target.closest<HTMLElement>(':is([role^="menuitem"], [role="option"])')
			: null;
	if (item && root.contains(item) && !item.matches('[data-disabled], [aria-disabled="true"]')) {
		item.setAttribute("data-menu-pressed", "");
	}
}
