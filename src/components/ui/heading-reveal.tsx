"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import { type RevealPhase, useRevealState } from "@/src/components/providers/reveal-provider";
import { useEntryReveal } from "./use-entry-reveal";

interface HeadingRevealProps {
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
	children: ReactNode;
	className?: string;
	effect?: "rise" | "resolve";
	delay?: number;
	phase?: RevealPhase;
	style?: CSSProperties;
}

/** Stable text geometry on every viewport, with a bounded word-entry sequence. */
export function HeadingReveal({
	as: Tag = "h2",
	children,
	className,
	effect = "rise",
	delay = 0,
	phase = 1,
	style,
}: HeadingRevealProps) {
	const ref = useRef<HTMLHeadingElement>(null);
	const { shouldAnimateEntry } = useRevealState();
	useEntryReveal(ref, { delay, heading: true, effect });
	void phase;
	const isText = typeof children === "string" || typeof children === "number";
	const occurrences = new Map<string, number>();
	let characterOffset = 0;
	const segments = isText
		? String(children)
				.split(/(\s+)/)
				.map((word) => {
					const occurrence = occurrences.get(word) ?? 0;
					occurrences.set(word, occurrence + 1);
					const offset = characterOffset;
					characterOffset += word.length;
					return { word, offset, key: `${word}-${occurrence}` };
				})
		: [];
	return (
		<Tag
			ref={ref}
			className={className}
			style={style}
			data-resolve-initial={effect === "resolve" && !shouldAnimateEntry ? "" : undefined}
		>
			{isText
				? segments.map(({ word, offset, key }) =>
						/\S/.test(word) ? (
							<span
								key={key}
								data-heading-word=""
								className={
									effect === "resolve"
										? "portfolio-resolve-word"
										: "inline-block max-w-full"
								}
								style={
									effect === "resolve"
										? ({
												"--resolve-delay": `${Math.max(offset - 3, 0) * 45}ms`,
												"--resolve-duration": `${(word.length + 6) * 45}ms`,
											} as CSSProperties)
										: undefined
								}
							>
								{effect === "resolve" ? (
									<>
										<span data-resolve-sharp="">{word}</span>
										<span data-resolve-fog="" aria-hidden="true">
											<span data-resolve-front="" data-resolve-text={word} />
										</span>
									</>
								) : (
									word
								)}
							</span>
						) : (
							word
						),
					)
				: children}
		</Tag>
	);
}
