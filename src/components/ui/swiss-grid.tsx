"use client";

import { useReducedMotion } from "framer-motion";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { useRevealState } from "@/src/components/providers/reveal-provider";
import { ShellReveal } from "@/src/components/ui/reveal";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DASH = 9;
const GAP = 7;

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT — scoped per box, not global
// ═══════════════════════════════════════════════════════════════════════════

interface SwissGridBoxContextValue {
	registerRow: (id: string, el: HTMLElement | null) => void;
	notify: () => void;
}

const SwissGridBoxContext = createContext<SwissGridBoxContextValue | null>(null);

function useSwissGridBox() {
	const ctx = useContext(SwissGridBoxContext);
	if (!ctx) throw new Error("SwissGridRow must be used within a SwissGridBox");
	return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════
// SwissGridBox
//
// Self-contained animated dashed border around any content block.
// Width is inherited from the page rail. Multiple SwissGridRows inside receive internal
// horizontal dividers (all rows except the last get a bottom separator).
// ═══════════════════════════════════════════════════════════════════════════

export function SwissGridBox({ children, className }: { children: ReactNode; className?: string }) {
	const boxRef = useRef<HTMLDivElement>(null);
	const rowRefs = useRef<Map<string, HTMLElement>>(new Map());
	const shouldReduceMotion = useReducedMotion();
	const { phase } = useRevealState();

	const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
	const [dividerYs, setDividerYs] = useState<number[]>([]);

	const recalculate = useCallback(() => {
		const box = boxRef.current;
		if (!box) return;

		const boxRect = box.getBoundingClientRect();
		setBoxSize({
			w: boxRect.width,
			h: boxRect.height,
		});

		// Collect the bottom edge of each registered row, relative to box top.
		const bottoms: number[] = [];
		rowRefs.current.forEach((el) => {
			const r = el.getBoundingClientRect();
			bottoms.push(r.bottom - boxRect.top);
		});

		// Sort ascending; drop the last value (= box height = outer border already closes it).
		bottoms.sort((a, b) => a - b);
		setDividerYs(bottoms.slice(0, -1));
	}, []);

	const registerRow = useCallback(
		(id: string, el: HTMLElement | null) => {
			if (el) rowRefs.current.set(id, el);
			else rowRefs.current.delete(id);
			recalculate();
		},
		[recalculate],
	);

	useEffect(() => {
		recalculate();
		// Second pass after layout settles
		const raf = requestAnimationFrame(recalculate);
		const obs = new ResizeObserver(recalculate);
		if (boxRef.current) obs.observe(boxRef.current);
		window.addEventListener("resize", recalculate, { passive: true });
		return () => {
			cancelAnimationFrame(raf);
			obs.disconnect();
			window.removeEventListener("resize", recalculate);
		};
	}, [recalculate]);

	const { w, h } = boxSize;
	const animate = !shouldReduceMotion && phase >= 1;
	const horizontalDashStyle = {
		backgroundImage: `repeating-linear-gradient(to right, currentColor 0 ${DASH}px, transparent ${DASH}px ${DASH + GAP}px)`,
	};
	const verticalDashStyle = {
		backgroundImage: `repeating-linear-gradient(to bottom, currentColor 0 ${DASH}px, transparent ${DASH}px ${DASH + GAP}px)`,
	};
	const perimeterClassName = cn(
		"text-surface-900/10 dark:text-surface-100/10",
		animate && "animate-ants-x",
	);
	const verticalPerimeterClassName = cn(
		"text-surface-900/10 dark:text-surface-100/10",
		animate && "animate-ants-y",
	);
	const dividerClassName = cn(
		"text-surface-900/10 dark:text-surface-100/10",
		animate && "animate-ants-x-subtle",
	);

	return (
		<SwissGridBoxContext.Provider value={{ registerRow, notify: recalculate }}>
			<ShellReveal phase={1}>
				<div
					ref={boxRef}
					className={cn(
						"relative w-full overflow-hidden",
						"bg-white transition-colors dark:bg-surface-900/80",
						className,
					)}
				>
					{w > 0 && h > 0 && (
						<>
							<div
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute inset-x-0 top-0 z-10 h-px",
									perimeterClassName,
								)}
								style={horizontalDashStyle}
							/>
							<div
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute inset-y-0 right-0 z-10 w-px",
									verticalPerimeterClassName,
								)}
								style={verticalDashStyle}
							/>
							<div
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px",
									perimeterClassName,
								)}
								style={horizontalDashStyle}
							/>
							<div
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute inset-y-0 left-0 z-10 w-px",
									verticalPerimeterClassName,
								)}
								style={verticalDashStyle}
							/>

							{dividerYs.map((y) => (
								<div
									key={y}
									aria-hidden="true"
									className={dividerClassName}
									style={{
										...horizontalDashStyle,
										position: "absolute",
										left: 0,
										right: 0,
										top: Math.round(y),
										height: "1px",
										zIndex: 10,
										pointerEvents: "none",
									}}
								/>
							))}
						</>
					)}

					{children}
				</div>
			</ShellReveal>
		</SwissGridBoxContext.Provider>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// SwissGridRow
//
// A section inside a SwissGridBox. Each row except the last gets a
// horizontal dashed divider drawn by the parent box's SVG.
// ═══════════════════════════════════════════════════════════════════════════

export function SwissGridRow({ children, className }: { children: ReactNode; className?: string }) {
	const id = useId();
	const ref = useRef<HTMLDivElement>(null);
	const { registerRow, notify } = useSwissGridBox();

	useEffect(() => {
		registerRow(id, ref.current);
		return () => registerRow(id, null);
	}, [id, registerRow]);

	// Re-notify the box whenever this row's content resizes
	useEffect(() => {
		const obs = new ResizeObserver(notify);
		if (ref.current) obs.observe(ref.current);
		return () => obs.disconnect();
	}, [notify]);

	return (
		<div ref={ref} className={cn("relative", className)}>
			{children}
		</div>
	);
}
