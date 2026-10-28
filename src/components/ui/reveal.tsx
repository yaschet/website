"use client";

import { type ReactNode, useRef } from "react";
import type { RevealPhase } from "@/src/components/providers/reveal-provider";
import { useEntryReveal } from "./use-entry-reveal";

interface RevealProps {
	children: ReactNode;
	delay?: number;
	className?: string;
	phase?: RevealPhase;
}

export const revealSequence = {
	backLink: 0,
	eyebrow: 0,
	kicker: 0.02,
	heading: 0.02,
	headingLate: 0.04,
	body: 0.08,
	bodyLate: 0.08,
	children: 0.1,
	controls: 0.12,
	meta: 0.12,
} as const;

/** Supporting copy follows the title without fading page material surfaces. */
export function Reveal({ children, delay = 0, className, phase = 1 }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	useEntryReveal(ref, { delay });
	void phase;
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

/** Section frames stay opaque; PortfolioScene owns their coordinated arrival. */
export function ScrollReveal({ children, className }: RevealProps) {
	return <div className={className}>{children}</div>;
}

export function RevealStagger({ children, className }: RevealProps) {
	return <div className={className}>{children}</div>;
}

export function RevealItem({ children, className }: RevealProps) {
	return <Reveal className={className}>{children}</Reveal>;
}

export function ShellReveal({ children, className }: RevealProps) {
	return <div className={className}>{children}</div>;
}
