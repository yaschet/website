import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { DeferredInstrumentField } from "./deferred-instrument-field";
import {
	ACTION_BAND_MIN_HEIGHT,
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_ORIGIN,
	INSTRUMENT_GRID_STEP,
} from "./instrument-field-metrics";
import type { InstrumentFieldTone, InstrumentFieldVariant } from "./topographic-dot-field";

interface InstrumentActionBandProps {
	children: ReactNode;
	className?: string;
	contentClassName?: string;
	fieldSpeed?: number;
	fieldVariant?: InstrumentFieldVariant;
	tone?: InstrumentFieldTone;
}

export function InstrumentActionBand({
	children,
	className,
	contentClassName,
	fieldSpeed = 0.28,
	fieldVariant = "terrain",
	tone = "auto",
}: InstrumentActionBandProps) {
	const toneClassName =
		tone === "inverted"
			? "bg-surface-950 dark:bg-surface-50"
			: tone === "dark"
				? "bg-surface-950"
				: tone === "light"
					? "bg-surface-50"
					: "";

	return (
		<div
			className={cn(
				"portfolio-action-band-shell relative isolate w-full overflow-hidden",
				toneClassName,
				className,
			)}
			data-tone={tone}
		>
			<DeferredInstrumentField
				className="pointer-events-none opacity-100 dark:opacity-100"
				interactive
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				origin={INSTRUMENT_GRID_ORIGIN}
				radius={INSTRUMENT_DOT_RADIUS}
				speed={fieldSpeed}
				surface="band"
				variant={fieldVariant}
				tone={tone}
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
