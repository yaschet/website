"use client";

import { cn } from "@/src/lib/utils";
import {
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_ORIGIN,
	INSTRUMENT_GRID_STEP,
} from "./instrument-field-metrics";
import { InstrumentField } from "./topographic-dot-field";

interface VanishingPointBandProps {
	className?: string;
	side: "top" | "bottom";
}

export function VanishingPointStrip({ className, side }: VanishingPointBandProps) {
	const flipClassName = side === "bottom" ? "[transform:scaleY(-1)]" : undefined;

	return (
		<div
			className={cn(
				"relative isolate w-full overflow-hidden bg-surface-50 dark:bg-surface-950",
				className,
			)}
		>
			<InstrumentField
				className={cn(
					"pointer-events-none bg-surface-50 opacity-100 dark:bg-surface-950 dark:opacity-100",
					flipClassName,
				)}
				interactive={false}
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				origin={INSTRUMENT_GRID_ORIGIN}
				radius={INSTRUMENT_DOT_RADIUS}
				speed={0.42}
				surface="strip"
				variant="ray"
			/>
			<div className="relative z-10 min-h-[7.5rem] w-full sm:min-h-[9.5rem]" />
		</div>
	);
}
