import {
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_ORIGIN,
	INSTRUMENT_GRID_STEP,
} from "@/components/ui/instrument-field-metrics";
import { DeferredInstrumentField } from "@/src/components/ui/deferred-instrument-field";

const HERO_FIELD_SPEED = 0.28;

export function SiteHeroField() {
	return (
		<div className="absolute inset-0 opacity-100 dark:opacity-100" aria-hidden="true">
			<div className="pointer-events-none absolute inset-0 bg-white dark:bg-surface-900/80" />
			<DeferredInstrumentField
				interactive
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				origin={INSTRUMENT_GRID_ORIGIN}
				radius={INSTRUMENT_DOT_RADIUS}
				speed={HERO_FIELD_SPEED}
				surface="hero"
				variant="terrain"
			/>
		</div>
	);
}
