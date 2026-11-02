"use client";

import { type RefObject, useId, useLayoutEffect } from "react";
import { useRevealState } from "@/src/components/providers/reveal-provider";
import { blur, distances, stagger, tweens } from "@/src/lib/physics";
import { getRouteTransition } from "@/src/lib/route-transition";

/**
 * Animate route-entry copy, leaving server HTML and resting layout intact.
 * Delays are in seconds. The live-DOM fallback animates visible copy only;
 * viewport transitions own their title/copy groups and frame handoff separately.
 * Navigation, keyboard input and reduced motion cancel every owned animation.
 */
export function useEntryReveal(
	ref: RefObject<HTMLElement | null>,
	{
		delay = 0,
		heading = false,
		effect = "rise",
	}: { delay?: number; heading?: boolean; effect?: "rise" | "resolve" } = {},
) {
	const { entryKey, shouldAnimateEntry } = useRevealState();
	const identity = useId();
	// biome-ignore lint/correctness/useExhaustiveDependencies: Route identity must restart an entry even when this component and its props are reused.
	useLayoutEffect(() => {
		const element = ref.current;
		if (element) {
			element.dataset.entryKind = heading ? "heading" : "copy";
			element.dataset.entryDelay = String(delay);
			element.dataset.entryIdentity = identity;
			element.dataset.entryEffect = effect;
		}
		const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
		if (
			!element ||
			!shouldAnimateEntry ||
			reducedMotion.matches ||
			document.documentElement.dataset.navigationInput === "keyboard"
		)
			return;
		const bounds = element.getBoundingClientRect();
		if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
		const words = heading ? element.querySelectorAll<HTMLElement>("[data-heading-word]") : [];
		const targets = words.length ? Array.from(words) : [element];
		const lead = effect === "resolve" ? 0 : Math.min(Math.max(delay, 0), heading ? 0.04 : 0.12);
		const transition = getRouteTransition();
		if (transition && effect !== "resolve") return;
		let cancelled = false;
		const resolveLayers = element.querySelectorAll<HTMLElement>(
			"[data-resolve-sharp], [data-resolve-front]",
		);
		if (effect === "resolve" && resolveLayers.length) {
			const animations = Array.from(resolveLayers, (layer) => {
				const timing = getComputedStyle(
					layer.parentElement?.closest("[data-heading-word]") ?? element,
				);
				const animation = layer.animate(
					[{ maskPosition: "100% 0%" }, { maskPosition: "0% 0%" }],
					{
						duration: Number.parseFloat(timing.getPropertyValue("--resolve-duration")),
						delay: Number.parseFloat(timing.getPropertyValue("--resolve-delay")),
						easing: "linear",
						fill: "backwards",
					},
				);
				animation.id = "portfolio-entry-heading";
				if (transition) animation.pause();
				return animation;
			});
			const play = () => {
				if (!cancelled) for (const animation of animations) animation.play();
			};
			// A native capture suspends paints. Keep this reveal live and start its
			// front only when capture finishes, rather than freezing a blurred image.
			if (transition) void transition.ready.then(play, play);
			const cancel = () => {
				cancelled = true;
				for (const animation of animations) animation.cancel();
			};
			reducedMotion.addEventListener("change", cancel);
			document.addEventListener("keydown", cancel, true);
			return () => {
				cancel();
				reducedMotion.removeEventListener("change", cancel);
				document.removeEventListener("keydown", cancel, true);
			};
		}

		const animations = targets.map((target, index) => {
			const animation = target.animate(
				[
					{
						opacity: heading ? 0.25 : 0.6,
						...(effect === "rise"
							? { transform: `translateY(${distances.small}px)` }
							: {}),
						...(heading ? { filter: blur.subtle } : {}),
					},
					{
						opacity: 1,
						...(effect === "rise" ? { transform: "translateY(0)" } : {}),
						...(heading ? { filter: blur.none } : {}),
					},
				],
				{
					duration: tweens.interactionSlow.duration * 1000,
					delay: Math.min(lead + index * stagger.char, 0.12) * 1000,
					easing: `cubic-bezier(${tweens.content.ease.join(",")})`,
					fill: "backwards",
				},
			);
			animation.id = heading ? "portfolio-entry-heading" : "portfolio-entry-copy";
			return animation;
		});
		const cancel = () => {
			for (const animation of animations) animation.cancel();
		};
		reducedMotion.addEventListener("change", cancel);
		document.addEventListener("keydown", cancel, true);
		return () => {
			cancel();
			reducedMotion.removeEventListener("change", cancel);
			document.removeEventListener("keydown", cancel, true);
		};
	}, [ref, entryKey, shouldAnimateEntry, delay, heading, effect, identity]);
}
