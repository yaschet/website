import type { ReactNode } from "react";
import { IconChamber } from "@/src/components/ui/icon-chamber";
import styles from "./figure-node.module.css";

export type FigureTone = "neutral" | "info" | "warning" | "success";

/** Shared native geometry for authored diagrams: 224 × 72, with a 40px chamber. */
export function FigureNode({
	id,
	title,
	detail,
	icon,
	tone = "neutral",
	active,
	x = 0,
	y = 0,
}: {
	id?: string;
	title: string;
	detail: string;
	icon: ReactNode;
	tone?: FigureTone;
	active: boolean;
	x?: number;
	y?: number;
}) {
	return (
		<div
			className={styles.node}
			data-figure-node
			data-architecture-node={id}
			data-active={active}
			data-tone={tone}
			style={{ left: x, top: y }}
		>
			<IconChamber size="default" className={styles.icon} aria-hidden="true">
				{icon}
			</IconChamber>
			<div>
				<strong>{title}</strong>
				<span>{detail}</span>
			</div>
		</div>
	);
}
