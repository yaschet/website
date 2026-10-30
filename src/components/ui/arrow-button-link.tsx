"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { motion, useReducedMotion } from "motion/react";
import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "@/src/lib/index";
import { ButtonLink } from "./button-link";

// Independent springs preserve position and velocity when pointer intent changes.
const textTransition = { type: "spring", stiffness: 250, damping: 30 } as const;
const arrowTransition = { type: "spring", stiffness: 320, damping: 30 } as const;
const clearLetter = { y: "0em", rotateX: 0, filter: "blur(0em)", opacity: 1 };
const outgoingLetter = {
	y: "-0.333333em",
	rotateX: 80,
	filter: "blur(0.083333em)",
	opacity: 0,
};
const incomingLetter = {
	y: "0.333333em",
	rotateX: 270,
	filter: "blur(0.083333em)",
	opacity: 0,
};
const arrivedLetter = { ...clearLetter, rotateX: 360 };

type ReelLayer = "out" | "in";

function letterTarget(layer: ReelLayer, active: boolean) {
	if (layer === "out") return active ? outgoingLetter : clearLetter;
	return active ? arrivedLetter : incomingLetter;
}

/** Native navigation and pending feedback, with a character reel in a stable frame. */
export function ArrowButtonLink({
	children,
	className,
	onPointerEnter,
	onPointerLeave,
	onPointerCancel,
	...props
}: Omit<ComponentProps<typeof ButtonLink>, "children" | "icon" | "iconPosition" | "size"> & {
	children: string;
}) {
	const [ready, setReady] = useState(false);
	const [hovered, setHovered] = useState(false);
	const reducedMotion = useReducedMotion();
	useEffect(() => setReady(true), []);
	const characters = Array.from(children);
	const active = hovered && !reducedMotion;
	const arrowLayers = [
		{ layer: "in", x: active ? "0%" : "-80%" },
		{ layer: "out", x: active ? "80%" : "0%" },
	];
	const reel = (element: HTMLAnchorElement, pointerType: string, hover: boolean) => {
		if (!hover) {
			setHovered(false);
			return;
		}
		if (
			pointerType === "touch" ||
			reducedMotion ||
			!matchMedia("(hover: hover) and (pointer: fine)").matches ||
			element.matches(":focus-visible") ||
			element.getAttribute("aria-disabled") === "true" ||
			element.querySelector("[data-loading]")
		)
			return;
		setHovered(true);
	};
	return (
		<ButtonLink
			{...props}
			data-action-ready={ready || undefined}
			className={cn("portfolio-action-link", className)}
			onPointerEnter={(event) => {
				onPointerEnter?.(event);
				reel(event.currentTarget, event.pointerType, true);
			}}
			onPointerLeave={(event) => {
				onPointerLeave?.(event);
				reel(event.currentTarget, event.pointerType, false);
			}}
			onPointerCancel={(event) => {
				onPointerCancel?.(event);
				setHovered(false);
			}}
			icon={
				<span className="portfolio-action-reel-icon" aria-hidden="true">
					<span data-action-rest="">
						<ArrowRightIcon className="size-4" weight="bold" />
					</span>
					{arrowLayers.map(({ layer, x }) => (
						<motion.span
							key={layer}
							data-action-reel={layer}
							initial={false}
							animate={{ x }}
							transition={arrowTransition}
						>
							<ArrowRightIcon className="size-4" weight="bold" />
						</motion.span>
					))}
				</span>
			}
		>
			<span className="portfolio-action-reel-label">
				<span className="sr-only">{children}</span>
				<span data-action-rest="" aria-hidden="true">
					{children}
				</span>
				{(["out", "in"] as const).map((layer) => (
					<span key={layer} data-action-reel={layer} aria-hidden="true">
						{characters.map((character, index) => {
							const reverse = characters.length - 1 - index;
							const incoming = layer === "in";
							return (
								<motion.span
									// The label is immutable during a reel; index preserves spaces and repeated letters.
									// biome-ignore lint/suspicious/noArrayIndexKey: Character position is the animation identity.
									key={index}
									data-action-character=""
									style={{
										display: /\s/.test(character) ? "inline" : "inline-block",
									}}
									initial={false}
									animate={letterTarget(layer, active)}
									transition={{
										...textTransition,
										delay: active
											? (incoming ? 0.1 : 0) + index * 0.05
											: reverse * (incoming ? 0.05 : 0.06),
									}}
								>
									{character}
								</motion.span>
							);
						})}
					</span>
				))}
			</span>
		</ButtonLink>
	);
}
