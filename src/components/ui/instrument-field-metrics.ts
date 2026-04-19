import type { DotGridOrigin } from "./dot-grid-metrics";

// Dot matrices follow the interior rhythm cadence; larger band heights use the structural grid step.
export const INSTRUMENT_GRID_STEP = "var(--portfolio-rhythm)";
export const INSTRUMENT_GRID_MIN_INSET = "var(--portfolio-space-1)";
export const INSTRUMENT_GRID_ORIGIN: DotGridOrigin = "inset";
export const INSTRUMENT_DOT_RADIUS = 1;
export const ACTION_BAND_MIN_HEIGHT = "calc(var(--portfolio-grid-step) * 4)";
