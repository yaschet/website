"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DotGridLength = number | string;
type DotGridOrigin = "center" | "inset";

interface DotGridProps {
	className?: string;
	step?: DotGridLength;
	minInset?: DotGridLength;
	radius?: number;
	origin?: DotGridOrigin;
}

function computeGridAxis(size: number, step: number, minInset: number, origin: DotGridOrigin) {
	const usable = Math.max(size - minInset * 2, step);
	const count = Math.max(2, Math.floor(usable / step) + 1);
	const span = (count - 1) * step;
	const offset = origin === "inset" ? minInset : (size - span) / 2;
	return { count, offset };
}

function resolveLength(node: HTMLElement, value: DotGridLength, fallback: number) {
	if (typeof value === "number") return value;

	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.inlineSize = value;
	probe.style.blockSize = "0";
	probe.style.padding = "0";
	probe.style.border = "0";

	node.appendChild(probe);
	const resolved = probe.getBoundingClientRect().width;
	node.removeChild(probe);

	return Number.isFinite(resolved) ? resolved : fallback;
}

export function DotGrid({
	className,
	step = 18,
	minInset = 12,
	radius = 1.15,
	origin = "center",
}: DotGridProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [metrics, setMetrics] = useState({
		width: 0,
		height: 0,
		step: typeof step === "number" ? step : 18,
		minInset: typeof minInset === "number" ? minInset : 12,
	});

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const updateMetrics = (width: number, height: number) => {
			const nextWidth = Math.round(width);
			const nextHeight = Math.round(height);
			const nextStep = Math.max(1, resolveLength(node, step, 18));
			const nextMinInset = Math.max(0, resolveLength(node, minInset, 12));

			setMetrics((current) =>
				current.width === nextWidth &&
				current.height === nextHeight &&
				current.step === nextStep &&
				current.minInset === nextMinInset
					? current
					: {
							width: nextWidth,
							height: nextHeight,
							step: nextStep,
							minInset: nextMinInset,
						},
			);
		};

		const observer = new ResizeObserver(([entry]) => {
			updateMetrics(entry.contentRect.width, entry.contentRect.height);
		});

		observer.observe(node);
		const rect = node.getBoundingClientRect();
		updateMetrics(rect.width, rect.height);

		return () => observer.disconnect();
	}, [step, minInset]);

	const { width, height, step: resolvedStep, minInset: resolvedMinInset } = metrics;
	const columns =
		width > 0 ? computeGridAxis(width, resolvedStep, resolvedMinInset, origin) : null;
	const rows =
		height > 0 ? computeGridAxis(height, resolvedStep, resolvedMinInset, origin) : null;
	const dots =
		columns && rows
			? Array.from({ length: rows.count * columns.count }, (_, index) => {
					const row = Math.floor(index / columns.count);
					const column = index % columns.count;
					const cx = columns.offset + column * resolvedStep;
					const cy = rows.offset + row * resolvedStep;
					return { cx, cy, key: `${cx}-${cy}` };
				})
			: [];

	return (
		<div
			ref={ref}
			className={cn("absolute inset-0 overflow-hidden", className)}
			aria-hidden="true"
		>
			{columns && rows ? (
				<svg
					width={width}
					height={height}
					className="absolute inset-0 h-full w-full"
					aria-hidden="true"
				>
					{dots.map((dot) => (
						<circle
							key={dot.key}
							cx={dot.cx}
							cy={dot.cy}
							r={radius}
							fill="currentColor"
						/>
					))}
				</svg>
			) : null}
		</div>
	);
}
