"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import type { RevealPhase } from "@/src/components/providers/reveal-provider";
import { useEntryReveal } from "./use-entry-reveal";

interface HeadingRevealProps {
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
	children: ReactNode;
	className?: string;
	delay?: number;
	phase?: RevealPhase;
	style?: CSSProperties;
}

/** Stable text geometry on every viewport, with a bounded word-entry sequence. */
export function HeadingReveal({
	as: Tag = "h2",
	children,
	className,
	delay = 0,
	phase = 1,
	style,
}: HeadingRevealProps) {
	const ref = useRef<HTMLHeadingElement>(null);
	useEntryReveal(ref, { delay, heading: true });
	void phase;
	const isText = typeof children === "string" || typeof children === "number";
	const occurrences = new Map<string, number>();
	const segments = isText
		? String(children)
				.split(/(\s+)/)
				.map((word) => {
					const occurrence = occurrences.get(word) ?? 0;
					occurrences.set(word, occurrence + 1);
					return { word, key: `${word}-${occurrence}` };
				})
		: [];
	return (
		<Tag ref={ref} className={className} style={style}>
			{isText
				? segments.map(({ word, key }) =>
						/\S/.test(word) ? (
							<span
								key={key}
								data-heading-word=""
								className="inline-block max-w-full"
							>
								{word}
							</span>
						) : (
							word
						),
					)
				: children}
		</Tag>
	);
}
