"use client";

import { type CSSProperties, type ReactNode, useId } from "react";
import styles from "./figure-drawing.module.css";
import { FigureNode, type FigureTone } from "./figure-node";

export function Drawing({
	mobile,
	width,
	height,
	label,
	children,
}: {
	mobile: boolean;
	width: number;
	height: number;
	label: string;
	children: ReactNode;
}) {
	return (
		<svg
			className={mobile ? styles.mobile : styles.desktop}
			data-figure-drawing
			viewBox={`0 0 ${width} ${height}`}
			style={{ maxWidth: width }}
			role="img"
			aria-label={label}
		>
			{children}
		</svg>
	);
}

export function Node({
	x,
	y,
	...props
}: Parameters<typeof FigureNode>[0] & { x: number; y: number }) {
	return (
		<foreignObject x={x} y={y} width={224} height={72}>
			<FigureNode {...props} />
		</foreignObject>
	);
}

export function Route({
	d,
	active,
	tone,
	label,
	labelAt,
	labelSurface = "canvas",
	order = 0,
	arrow = true,
}: {
	d: string;
	active: boolean;
	tone: FigureTone;
	label?: string;
	labelAt?: [number, number];
	labelSurface?: "canvas" | "control";
	order?: number;
	arrow?: boolean;
}) {
	const markerId = useId();
	return (
		<g
			className={styles.edge}
			data-active={active}
			data-tone={tone}
			style={{ "--edge-order": order } as CSSProperties}
		>
			<defs>
				<marker
					id={markerId}
					viewBox="0 0 8 8"
					refX="7"
					refY="4"
					markerWidth="8"
					markerHeight="8"
					orient="auto"
					markerUnits="userSpaceOnUse"
				>
					<path d="M2 1L6 4L2 7" fill="none" stroke="context-stroke" strokeWidth="1.25" />
				</marker>
			</defs>
			<path d={d} markerEnd={arrow ? `url(#${markerId})` : undefined} />
			{active && <path className={styles.trace} d={d} pathLength={1} />}
			{label && labelAt && (
				<g className={styles.edgeLabel} data-surface={labelSurface}>
					<rect x={labelAt[0] - 26} y={labelAt[1] - 11} width={52} height={22} />
					<text x={labelAt[0]} y={labelAt[1]} dominantBaseline="central">
						{label}
					</text>
				</g>
			)}
		</g>
	);
}
