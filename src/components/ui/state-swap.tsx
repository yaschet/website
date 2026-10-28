"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import { cn } from "@/src/lib/index";

interface StateSwapProps {
	value: string;
	items: Readonly<Record<string, ReactNode>>;
	kind?: "icon" | "text";
	/** Stable reserves the longest label; content follows the active label with a width transition. */
	sizing?: "stable" | "content";
	className?: string;
}

/** Measures only the active label, including font changes; CSS owns interruptible resizing. */
function ContentSizedText({ value, items, className }: StateSwapProps) {
	const frame = useRef<HTMLSpanElement>(null);
	useLayoutEffect(() => {
		const element = frame.current;
		const active = Array.from(element?.children ?? []).find(
			(child) => child instanceof HTMLElement && child.dataset.state === value,
		);
		if (!element || !(active instanceof HTMLElement)) return;
		const measure = () => {
			element.style.width = getComputedStyle(active).width;
			element.dataset.measured = "true";
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(active);
		return () => observer.disconnect();
	}, [value]);
	return (
		<span
			ref={frame}
			aria-hidden="true"
			className={cn("t-state-label", className)}
			data-sizing="content"
		>
			{Object.entries(items).map(([key, content]) => (
				<span key={key} data-state={key} data-active={key === value}>
					{content}
				</span>
			))}
		</span>
	);
}

/** Persistent text/icon layers use Foundation motion. The owning control supplies its accessible name. */
export function StateSwap({
	value,
	items,
	kind = "icon",
	sizing = "stable",
	className,
}: StateSwapProps) {
	if (kind === "text" && sizing === "content") {
		return <ContentSizedText value={value} items={items} className={className} />;
	}
	return (
		<span
			aria-hidden="true"
			className={cn(
				kind === "icon" ? "t-icon-swap size-4 shrink-0" : "t-state-label",
				className,
			)}
		>
			{Object.entries(items).map(([key, content]) => (
				<span
					key={key}
					className={kind === "icon" ? "t-icon" : undefined}
					data-active={key === value}
				>
					{content}
				</span>
			))}
		</span>
	);
}
