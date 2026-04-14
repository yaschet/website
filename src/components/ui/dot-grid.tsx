"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DotGridProps {
	className?: string;
	step?: number;
	minInset?: number;
	radius?: number;
}

function computeGridAxis(size: number, step: number, minInset: number) {
	const usable = Math.max(size - minInset * 2, step);
	const count = Math.max(2, Math.floor(usable / step) + 1);
	const span = (count - 1) * step;
	const offset = (size - span) / 2;
	return { count, offset };
}

export function DotGrid({ className, step = 18, minInset = 12, radius = 1.15 }: DotGridProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const observer = new ResizeObserver(([entry]) => {
			const nextWidth = Math.round(entry.contentRect.width);
			const nextHeight = Math.round(entry.contentRect.height);
			setSize((current) =>
				current.width === nextWidth && current.height === nextHeight
					? current
					: { width: nextWidth, height: nextHeight },
			);
		});

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const { width, height } = size;
	const columns = width > 0 ? computeGridAxis(width, step, minInset) : null;
	const rows = height > 0 ? computeGridAxis(height, step, minInset) : null;
	const dots =
		columns && rows
			? Array.from({ length: rows.count * columns.count }, (_, index) => {
					const row = Math.floor(index / columns.count);
					const column = index % columns.count;
					const cx = columns.offset + column * step;
					const cy = rows.offset + row * step;
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
