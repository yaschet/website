"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import {
	ACTION_BAND_MIN_HEIGHT,
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_ORIGIN,
	INSTRUMENT_GRID_STEP,
} from "./instrument-field-metrics";
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
		<div className={cn("relative isolate w-full overflow-hidden", className)}>
			<InstrumentField
				className="pointer-events-none opacity-100 dark:opacity-100"
				interactive={false}
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				origin={INSTRUMENT_GRID_ORIGIN}
				radius={INSTRUMENT_DOT_RADIUS}
				speed={0.22}
				surface="band"
				variant="pulse"
			/>
			<div
				className={cn(
					"portfolio-action-band relative z-[1] min-h-[var(--portfolio-action-band-min-height)] w-full px-[var(--portfolio-box-pad-mobile)] py-[var(--portfolio-space-3)] sm:px-[var(--portfolio-box-pad-desktop)] sm:py-[var(--portfolio-space-4)]",
					contentClassName,
				)}
				style={{
					["--portfolio-action-band-min-height" as string]: ACTION_BAND_MIN_HEIGHT,
				}}
			>
				{children}
			</div>
		</div>
	);
}
