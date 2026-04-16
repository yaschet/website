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
				className="pointer-events-none opacity-52 dark:opacity-68"
				interactive={false}
				step={24}
				minInset={16}
				origin="inset"
				radius={1}
				speed={0.18}
				surface="band"
				variant="pulse"
			/>
			<div className={cn("portfolio-action-band relative z-[1]", contentClassName)}>
				{children}
			</div>
		</div>
	);
}
