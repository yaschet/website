"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { InstrumentField } from "./topographic-dot-field";

interface InstrumentActionBandProps {
	children: ReactNode;
	className?: string;
	contentClassName?: string;
}

export function InstrumentActionBand({
	children,
	className,
	contentClassName,
}: InstrumentActionBandProps) {
	return (
		<div className={cn("relative isolate overflow-hidden", className)}>
			<InstrumentField
				className="pointer-events-none opacity-66 dark:opacity-78"
				interactive={false}
				step={18}
				minInset={12}
				origin="inset"
				radius={1}
				speed={0.18}
				surface="band"
				variant="pulse"
			/>
			<div
				className={cn(
					"portfolio-action-band relative z-[1] min-h-[calc(var(--portfolio-rhythm)*5)]",
					contentClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}
