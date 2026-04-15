"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	computeGridAxis,
	type DotGridLength,
	type DotGridOrigin,
	resolveLength,
} from "./dot-grid-metrics";

/**
 * Props for TopographicDotField.
 *
 * @param className - Optional CSS class on the root container.
 * @param step - Grid step size (CSS length or px number).
 * @param minInset - Minimum inset from container edges.
 * @param radius - Dot square half-size in CSS px.
 * @param origin - Grid alignment strategy.
 * @param speed - Animation speed multiplier.
 */
interface TopographicDotFieldProps {
	className?: string;
	step?: DotGridLength;
	minInset?: DotGridLength;
	radius?: number;
	origin?: DotGridOrigin;
	speed?: number;
}

type RGB = [number, number, number];

interface Tone {
	alpha: number;
	color: RGB;
}

interface Palette {
	base: Tone;
	/** 4 dot brightness levels. */
	levels: Tone[];
	/** 4 topographic underlay bands (visible fill between dots). */
	underlay: Tone[];
}

interface VoidConfig {
	baseX: number;
	baseY: number;
	coreRadius: number;
	haloRadius: number;
	orbitX: number;
	orbitY: number;
	outerRadius: number;
	phase: number;
	speedX: number;
	speedY: number;
	strength: number;
}

interface Metrics {
	dpr: number;
	height: number;
	minInset: number;
	step: number;
	width: number;
}

// ---------------------------------------------------------------------------
// Void field configs
// ---------------------------------------------------------------------------

const DARK_VOID_CONFIGS: VoidConfig[] = [
	// Top-left wing — primary ring mass
	{
		baseX: 0.14,
		baseY: 0.08,
		coreRadius: 0.082,
		haloRadius: 0.2,
		orbitX: 0.046,
		orbitY: 0.036,
		outerRadius: 0.48,
		phase: 0.0,
		speedX: 0.84,
		speedY: 0.74,
		strength: 1.38,
	},
	// Top-right wing — primary ring mass
	{
		baseX: 0.86,
		baseY: 0.08,
		coreRadius: 0.082,
		haloRadius: 0.2,
		orbitX: 0.046,
		orbitY: 0.036,
		outerRadius: 0.48,
		phase: 1.57,
		speedX: 0.9,
		speedY: 0.78,
		strength: 1.38,
	},
	// Lower-left accent ring
	{
		baseX: 0.06,
		baseY: 0.74,
		coreRadius: 0.062,
		haloRadius: 0.15,
		orbitX: 0.028,
		orbitY: 0.038,
		outerRadius: 0.32,
		phase: 3.14,
		speedX: 0.72,
		speedY: 0.86,
		strength: 0.96,
	},
	// Lower-right accent ring
	{
		baseX: 0.94,
		baseY: 0.74,
		coreRadius: 0.062,
		haloRadius: 0.15,
		orbitX: 0.028,
		orbitY: 0.038,
		outerRadius: 0.32,
		phase: 4.71,
		speedX: 0.86,
		speedY: 0.72,
		strength: 0.96,
	},
];

const LIGHT_VOID_CONFIGS: VoidConfig[] = [
	// Top-left wing — primary ring mass
	{
		baseX: 0.14,
		baseY: 0.08,
		coreRadius: 0.07,
		haloRadius: 0.18,
		orbitX: 0.04,
		orbitY: 0.032,
		outerRadius: 0.42,
		phase: 0.0,
		speedX: 0.8,
		speedY: 0.72,
		strength: 1.04,
	},
	// Top-right wing — primary ring mass
	{
		baseX: 0.86,
		baseY: 0.08,
		coreRadius: 0.07,
		haloRadius: 0.18,
		orbitX: 0.04,
		orbitY: 0.032,
		outerRadius: 0.42,
		phase: 1.57,
		speedX: 0.86,
		speedY: 0.76,
		strength: 1.04,
	},
	// Lower-left accent ring
	{
		baseX: 0.06,
		baseY: 0.74,
		coreRadius: 0.052,
		haloRadius: 0.13,
		orbitX: 0.028,
		orbitY: 0.036,
		outerRadius: 0.26,
		phase: 3.14,
		speedX: 0.7,
		speedY: 0.84,
		strength: 0.74,
	},
	// Lower-right accent ring
	{
		baseX: 0.94,
		baseY: 0.74,
		coreRadius: 0.052,
		haloRadius: 0.13,
		orbitX: 0.028,
		orbitY: 0.036,
		outerRadius: 0.26,
		phase: 4.71,
		speedX: 0.84,
		speedY: 0.7,
		strength: 0.6,
	},
];

// ---------------------------------------------------------------------------
// Fallback palettes (used when CSS vars cannot be resolved)
// ---------------------------------------------------------------------------

const FALLBACK_DARK_PALETTE: Palette = {
	base: { color: [0, 80, 80], alpha: 0.1 },
	levels: [
		{ color: [0, 160, 160], alpha: 0.2 }, // level 0
		{ color: [0, 210, 210], alpha: 0.4 }, // level 1
		{ color: [0, 255, 255], alpha: 0.6 }, // level 2
		{ color: [160, 255, 255], alpha: 0.9 }, // level 3 — peak
	],
	// 3 topographic underlay bands with dramatic alpha steps
	// so each layer reads as visually distinct:
	underlay: [
		{ color: [0, 40, 40], alpha: 0.12 }, // band 0
		{ color: [0, 60, 60], alpha: 0.25 }, // band 1
		{ color: [0, 90, 90], alpha: 0.4 }, // band 2
		{ color: [0, 120, 120], alpha: 0.55 }, // band 3
	],
};

const FALLBACK_LIGHT_PALETTE: Palette = {
	base: { color: [219, 234, 254], alpha: 0.03 },
	levels: [
		{ color: [191, 219, 254], alpha: 0.08 },
		{ color: [147, 197, 253], alpha: 0.17 },
		{ color: [96, 165, 250], alpha: 0.32 },
		{ color: [59, 130, 246], alpha: 0.5 },
	],
	underlay: [
		{ color: [210, 228, 255], alpha: 0.04 },
		{ color: [180, 212, 254], alpha: 0.11 },
		{ color: [140, 190, 253], alpha: 0.2 },
		{ color: [100, 160, 250], alpha: 0.28 },
	],
};

// ---------------------------------------------------------------------------
// GLSL shaders
// ---------------------------------------------------------------------------

/** Vertex shader: emits a fullscreen clip-space quad. */
const VERT_SRC = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * Fragment shader.
 *
 * Architecture:
 *   1. Remap gl_FragCoord to CSS top-left UV [0,1].
 *   2. Evaluate scalar field at UV (identical math to the JS sampleField).
 *   3. Test dot lattice membership via modulo coordinate masking.
 *   4. In dot: render brightness level color (base → level 0-3).
 *   5. Out of dot: render underlay contour band color (or discard).
 *
 * Only uTime changes per frame; all other uniforms are stable across animation.
 */
const FRAG_SRC = `#version 300 es
precision highp float;

// --- frame ---
uniform vec2  uRes;       // physical canvas size (px)
uniform float uTime;      // elapsed seconds × speed

// --- grid ---
uniform float uStep;      // physical step (px)
uniform float uDotHalf;   // half dot-square size (px)
uniform vec2  uOff;       // grid offset from top-left (physical px)

// --- theme ---
uniform float uDark;      // 1.0 = dark, 0.0 = light

// --- palette: base dot ---
uniform vec3  uBCol;  uniform float uBAlpha;

// --- palette: dot levels ---
uniform vec3  uLC0;  uniform float uLA0;
uniform vec3  uLC1;  uniform float uLA1;
uniform vec3  uLC2;  uniform float uLA2;
uniform vec3  uLC3;  uniform float uLA3;

// --- palette: underlay bands (4 topographic fills) ---
uniform vec3  uUC0;  uniform float uUA0;
uniform vec3  uUC1;  uniform float uUA1;
uniform vec3  uUC2;  uniform float uUA2;
uniform vec3  uUC3;  uniform float uUA3;

// --- void field configs (JS selects theme set, passes 4 at a time) ---
uniform vec4  uVPos[4];    // (baseX, baseY, orbitX, orbitY)
uniform vec4  uVRad[4];    // (coreRadius, haloRadius, outerRadius, phase)
uniform vec4  uVSpd[4];    // (speedX, speedY, strength, _)

out vec4 oColor;

const float TAU  = 6.28318530718;
const float LOOP = 18.0;

// ---------- utilities ----------

float sm3(float e0, float e1, float v) {
  float t = clamp((v - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float gauss2(vec2 p, vec2 c, vec2 r) {
  vec2 d = (p - c) / r;
  return exp(-dot(d, d));
}

// ---------- scalar field ----------
// Ring-based scalar field -- restores topographic contour shapes.
//
// The ring formula max(0, halo - core * k) creates a peak at
// haloRadius distance from each void center, not at the center itself.
// Multiple overlapping rings produce organic interference patterns
// with complex ridges, valleys and saddle points -- a genuine scalar field.
// Ridge + turbulence add fine-grain topographic striations.


float evalField(vec2 uv, float phase) {
  float aspect = uRes.x / uRes.y;
  float ds = mix(0.84, 1.0, uDark);

  // Domain warp — same coefficients as the original Canvas sampleField.
  float dX = 0.022 * ds * (
    sin(TAU * (uv.y * 0.84 + uv.x * 0.24) + phase * 0.84) +
    0.55 * cos(TAU * (uv.x * 1.32 - uv.y * 0.42) - phase * 1.06)
  );
  float dY = 0.02 * ds * (
    cos(TAU * (uv.x * 0.78 - uv.y * 0.18) + phase * 0.72) +
    0.5  * sin(TAU * (uv.y * 1.06 + uv.x * 0.34) - phase * 0.94)
  );
  vec2 p = uv + vec2(dX, dY);
  float val = 0.0;

  // Ring-based void attractors.
  // Each config contributes a donut-shaped ring of high field values,
  // with a suppressed core and a wide outer envelope.
  for (int i = 0; i < 4; i++) {
    float cx = uVPos[i].x + uVPos[i].z * sin(phase * uVSpd[i].x + uVRad[i].w);
    float cy = uVPos[i].y + uVPos[i].w * cos(phase * uVSpd[i].y + uVRad[i].w * 1.17);

    float ex = (p.x - cx) * aspect;
    float ey =  p.y - cy;
    float d2 = ex * ex + ey * ey;

    float cR  = uVRad[i].x;
    float hR  = uVRad[i].y;
    float oR  = uVRad[i].z;
    float str = uVSpd[i].z;

    float core = exp(-d2 / (cR * cR)) * 1.2;
    float halo = exp(-d2 / (hR * hR));
    float otr  = exp(-d2 / (oR * oR));

    // Ring: peak at haloRadius distance, void at center.
    float ring = max(0.0, halo - core * 0.74) * mix(1.28, 1.3, uDark);
    float env  = otr * mix(0.34, 0.3, uDark);

    val += (ring + env - core * mix(0.88, 1.04, uDark)) * str;
  }

  // Ridge: organic topographic texture, creates contour-line striations.
  float ridge =
    0.18 * sin(TAU * (p.x * 0.94 + p.y * 0.19) + sin(phase * 0.72) * 0.85) +
    0.15 * cos(TAU * (p.y * 0.68 - p.x * 0.26) - cos(phase * 0.88) * 1.05) +
    0.08 * sin(TAU * ((p.x + p.y) * 0.62)       + phase * 0.56);

  // Turbulence: fine-grain variation on mid-range field values only.
  float turb =
    0.09 * sin(TAU * (p.x * 2.24 - p.y * 1.76) + phase * 1.42) +
    0.06 * cos(TAU * (p.x * 3.08 + p.y * 2.42) - phase * 1.18);

  // Combine: base offset + ring sum + ridge.
  val = mix(0.17, 0.165, uDark)
      + val   * mix(0.50, 0.52, uDark)
      + ridge * mix(0.90, 1.08, uDark);

  // Turbulence only modulates mid-range values to avoid clipping.
  val += turb * sm3(0.18, 0.74, clamp(val, 0.0, 1.0)) * mix(0.14, 0.22, uDark);

  // Symmetric corner activation blooms — replace the old right-side directional blooms.
  float bTL = gauss2(uv, vec2(0.12, 0.14), vec2(0.30, 0.26));
  float bTR = gauss2(uv, vec2(0.88, 0.14), vec2(0.30, 0.26));
  float bBL = gauss2(uv, vec2(0.07, 0.82), vec2(0.22, 0.18));
  float bBR = gauss2(uv, vec2(0.93, 0.82), vec2(0.22, 0.18));

  val += bTL * mix(0.22, 0.20, uDark);
  val += bTR * mix(0.22, 0.20, uDark);
  val += bBL * mix(0.13, 0.11, uDark);
  val += bBR * mix(0.13, 0.11, uDark);

  // Text quiet zone — reduces field where hero copy sits.
  // Softer suppression than before (0.68 not 0.82) so some animation
  // remains visible behind text, matching the reference behaviour.
  float tQ = gauss2(uv, vec2(0.44, 0.46), vec2(0.28, 0.26));
  val *= 1.0 - tQ * mix(0.68, 0.72, uDark);

  float norm = clamp(val, 0.0, 1.0);
  float sm0  = mix(0.08, 0.07, uDark);
  float sm1  = mix(0.68, 0.90, uDark);
  float ep   = mix(0.94, 1.04, uDark);
  return pow(max(sm3(sm0, sm1, norm), 0.0001), ep);
}

// ---------- main ----------

void main() {
  // Remap to CSS top-left origin (WebGL origin is bottom-left).
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = fc / uRes;

  // Infinite, non-looping, faster phase. No mod = no jumps.
  float phase = uTime * 0.9;
  float fv    = evalField(uv, phase);

  // ---------- dot lattice membership ----------
  // Dot centers at: uOff + n * uStep  (per axis).
  // Shift so that mod(shifted, uStep) == uStep/2 when at a dot center.
  vec2 shifted  = fc - uOff + vec2(uStep * 0.5);
  vec2 cellDist = abs(mod(shifted, uStep) - vec2(uStep * 0.5));
  bool inDot    = cellDist.x <= uDotHalf && cellDist.y <= uDotHalf;

  if (inDot) {
    // --- dot color: base or brightness level ---
    float t0 = mix(0.18, 0.15, uDark);
    float t1 = mix(0.34, 0.30, uDark);
    float t2 = mix(0.50, 0.52, uDark);
    float t3 = mix(0.66, 0.76, uDark);

    if      (fv >= t3) { oColor = vec4(uLC3, uLA3); }
    else if (fv >= t2) { oColor = vec4(uLC2, uLA2); }
    else if (fv >= t1) { oColor = vec4(uLC1, uLA1); }
    else if (fv >= t0) { oColor = vec4(uLC0, uLA0); }
    else               { oColor = vec4(uBCol, uBAlpha); }

  } else {
    // --- underlay: 3 topographic fill bands between dots ---
    // Band 0: atmospheric base — broad, barely visible, sets color mood.
    // Band 1: topographic shapes — clearly visible, the main visual layer.
    // Band 2+3: inner glow — hot zones at field peaks, brightest fill.
    // Thresholds start at 0.08 so the fill covers nearly the entire
    // active field area, not just the bright core.
    float u0 = mix(0.10, 0.08, uDark);  // atmospheric edge
    float u1 = mix(0.28, 0.24, uDark);  // shaped mid-field
    float u2 = mix(0.50, 0.46, uDark);  // bright inner zone
    float u3 = mix(0.68, 0.64, uDark);  // core peak

    if      (fv >= u3) { oColor = vec4(uUC3, uUA3); }
    else if (fv >= u2) { oColor = vec4(uUC2, uUA2); }
    else if (fv >= u1) { oColor = vec4(uUC1, uUA1); }
    else if (fv >= u0) { oColor = vec4(uUC0, uUA0); }
    else               { oColor = vec4(0.0); }
  }
}`;

// ---------------------------------------------------------------------------
// WebGL utilities
// ---------------------------------------------------------------------------

/**
 * Compiles a GLSL shader stage.
 *
 * @param gl - Active WebGL2 context.
 * @param type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param src - GLSL source string.
 * @returns Compiled shader.
 * @throws If compilation fails.
 */
function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
	const shader = gl.createShader(type);
	if (!shader) throw new Error("gl.createShader failed");
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Shader compile error:\n${log}`);
	}
	return shader;
}

/**
 * Links a WebGL program from compiled vertex and fragment shaders.
 *
 * @param gl - Active WebGL2 context.
 * @param vert - Compiled vertex shader.
 * @param frag - Compiled fragment shader.
 * @returns Linked program.
 * @throws If linking fails.
 */
function linkProgram(
	gl: WebGL2RenderingContext,
	vert: WebGLShader,
	frag: WebGLShader,
): WebGLProgram {
	const program = gl.createProgram();
	if (!program) throw new Error("gl.createProgram failed");
	gl.attachShader(program, vert);
	gl.attachShader(program, frag);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Program link error:\n${log}`);
	}
	return program;
}

// ---------------------------------------------------------------------------
// CSS color utilities
// ---------------------------------------------------------------------------

function clampInt(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function parseRgb(value: string, fallback: RGB): RGB {
	const match = value.match(/rgba?\(([^)]+)\)/i);
	if (!match) return fallback;
	const ch = match[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.slice(0, 3)
		.map((v) => Number.parseFloat(v));
	if (ch.length !== 3 || ch.some((v) => Number.isNaN(v))) return fallback;
	return [
		clampInt(Math.round(ch[0]), 0, 255),
		clampInt(Math.round(ch[1]), 0, 255),
		clampInt(Math.round(ch[2]), 0, 255),
	];
}

function resolveCssColor(node: HTMLElement, css: string, fallback: RGB): RGB {
	const probe = document.createElement("div");
	probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
	probe.style.color = css;
	node.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	node.removeChild(probe);
	return parseRgb(resolved, fallback);
}

function resolvePalette(node: HTMLElement, isDark: boolean): Palette {
	const fb = isDark ? FALLBACK_DARK_PALETTE : FALLBACK_LIGHT_PALETTE;
	const rc = (css: string, fallback: RGB) => resolveCssColor(node, css, fallback);

	return {
		base: {
			color: rc(
				isDark ? "var(--color-accent-300)" : "var(--color-accent-100)",
				fb.base.color,
			),
			alpha: fb.base.alpha,
		},
		levels: [
			{
				color: rc(
					isDark ? "var(--color-accent-400)" : "var(--color-accent-200)",
					fb.levels[0].color,
				),
				alpha: fb.levels[0].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-500)" : "var(--color-accent-300)",
					fb.levels[1].color,
				),
				alpha: fb.levels[1].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-300)" : "var(--color-accent-400)",
					fb.levels[2].color,
				),
				alpha: fb.levels[2].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-200)" : "var(--color-accent-500)",
					fb.levels[3].color,
				),
				alpha: fb.levels[3].alpha,
			},
		],
		underlay: [
			{
				color: rc(
					isDark ? "var(--color-accent-900)" : "var(--color-accent-200)",
					fb.underlay[0].color,
				),
				alpha: fb.underlay[0].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-800)" : "var(--color-accent-300)",
					fb.underlay[1].color,
				),
				alpha: fb.underlay[1].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-700)" : "var(--color-accent-400)",
					fb.underlay[2].color,
				),
				alpha: fb.underlay[2].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-600)" : "var(--color-accent-500)",
					fb.underlay[3].color,
				),
				alpha: fb.underlay[3].alpha,
			},
		],
	};
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * GPU-accelerated topographic dot field using raw WebGL 2.
 *
 * Rendering model:
 * - One fullscreen quad, one draw call, one fragment shader per frame.
 * - The shader evaluates the scalar field per-pixel on the GPU.
 * - Dot lattice membership is tested via modulo coordinate masking.
 * - Pixels inside a dot receive a brightness-level color.
 * - Pixels outside a dot receive an underlay contour band color.
 * - Only uTime uniform changes per frame — zero CPU scalar field evaluation.
 */
export function TopographicDotField({
	className,
	step = 18,
	minInset = step,
	radius = 2,
	origin = "center",
	speed = 1,
}: TopographicDotFieldProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// WebGL objects — kept in refs, not state, to avoid triggering re-renders.
	const glRef = useRef<WebGL2RenderingContext | null>(null);
	const programRef = useRef<WebGLProgram | null>(null);
	const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
	const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

	const shouldReduceMotion = useReducedMotion();
	const [isDark, setIsDark] = useState(false);
	const [metrics, setMetrics] = useState<Metrics>({
		dpr: 1,
		height: 0,
		minInset: typeof minInset === "number" ? minInset : 12,
		step: typeof step === "number" ? step : 18,
		width: 0,
	});

	// 1. Dark mode observer.
	useEffect(() => {
		if (typeof window === "undefined") return;
		const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
		sync();
		const obs = new MutationObserver(sync);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		return () => obs.disconnect();
	}, []);

	// 2. Container size observer.
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const update = () => {
			const rect = container.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const s = Math.max(1, resolveLength(container, step, 18));
			const mi = Math.max(0, resolveLength(container, minInset, 12));
			setMetrics((prev) =>
				prev.width === Math.round(rect.width) &&
				prev.height === Math.round(rect.height) &&
				prev.step === s &&
				prev.minInset === mi &&
				prev.dpr === dpr
					? prev
					: {
							dpr,
							height: Math.round(rect.height),
							minInset: mi,
							step: s,
							width: Math.round(rect.width),
						},
			);
		};

		const obs = new ResizeObserver(update);
		obs.observe(container);
		update();
		window.addEventListener("resize", update, { passive: true });
		return () => {
			obs.disconnect();
			window.removeEventListener("resize", update);
		};
	}, [minInset, step]);

	// 3. WebGL 2 init (once per mount).
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let gl: WebGL2RenderingContext | null = null;
		let program: WebGLProgram | null = null;
		let vao: WebGLVertexArrayObject | null = null;
		let buf: WebGLBuffer | null = null;

		try {
			gl = canvas.getContext("webgl2", {
				alpha: true,
				premultipliedAlpha: false,
				antialias: false,
				depth: false,
				stencil: false,
			});
			if (!gl) return;

			const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
			const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
			program = linkProgram(gl, vert, frag);
			gl.deleteShader(vert);
			gl.deleteShader(frag);

			// Fullscreen quad as triangle strip: BL → BR → TL → TR (clip space).
			buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
				gl.STATIC_DRAW,
			);

			vao = gl.createVertexArray();
			gl.bindVertexArray(vao);
			const aPos = gl.getAttribLocation(program, "aPos");
			gl.enableVertexAttribArray(aPos);
			gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
			gl.bindVertexArray(null);

			// Cache all uniform locations.
			const glSafe = gl;
			const programSafe = program;
			const g = (n: string) => glSafe.getUniformLocation(programSafe, n);
			locsRef.current = {
				uRes: g("uRes"),
				uTime: g("uTime"),
				uStep: g("uStep"),
				uDotHalf: g("uDotHalf"),
				uOff: g("uOff"),
				uDark: g("uDark"),
				uBCol: g("uBCol"),
				uBAlpha: g("uBAlpha"),
				uLC0: g("uLC0"),
				uLA0: g("uLA0"),
				uLC1: g("uLC1"),
				uLA1: g("uLA1"),
				uLC2: g("uLC2"),
				uLA2: g("uLA2"),
				uLC3: g("uLC3"),
				uLA3: g("uLA3"),
				uUC0: g("uUC0"),
				uUA0: g("uUA0"),
				uUC1: g("uUC1"),
				uUA1: g("uUA1"),
				uUC2: g("uUC2"),
				uUA2: g("uUA2"),
				uUC3: g("uUC3"),
				uUA3: g("uUA3"),
				// Array uniforms: index via [0] notation for cross-driver safety.
				uVPos: g("uVPos[0]"),
				uVRad: g("uVRad[0]"),
				uVSpd: g("uVSpd[0]"),
			};

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.clearColor(0, 0, 0, 0);

			glRef.current = gl;
			programRef.current = program;
			vaoRef.current = vao;
		} catch (_err) {
			// WebGL 2 not available — canvas renders nothing.
		}

		return () => {
			if (gl) {
				gl.deleteVertexArray(vao);
				gl.deleteBuffer(buf);
				gl.deleteProgram(program);
			}
			glRef.current = null;
			programRef.current = null;
			vaoRef.current = null;
		};
	}, []);

	// 4. Upload all uniforms + run the render loop.
	//    Restarts whenever any input (theme, size, speed) changes.
	//    Per-frame cost: one gl.uniform1f(uTime) + one gl.drawArrays.
	useEffect(() => {
		const gl = glRef.current;
		const program = programRef.current;
		const vao = vaoRef.current;
		const locs = locsRef.current;
		const container = containerRef.current;
		const canvas = canvasRef.current;

		if (!gl || !program || !vao || !container || !canvas) return;
		if (metrics.width <= 0 || metrics.height <= 0) return;

		// Resize canvas to physical resolution.
		const physW = Math.round(metrics.width * metrics.dpr);
		const physH = Math.round(metrics.height * metrics.dpr);
		canvas.width = physW;
		canvas.height = physH;
		gl.viewport(0, 0, physW, physH);

		// Activate program and VAO for all draw calls in this effect.
		// Named via local alias to avoid Biome's hook-naming heuristic on "useProgram".
		const activateProgram = gl.useProgram.bind(gl);
		activateProgram(program);
		gl.bindVertexArray(vao);

		const L = (k: string) => locs[k] ?? null;

		// Resolution.
		gl.uniform2f(L("uRes"), physW, physH);

		// Grid metrics in physical pixels.
		const physStep = metrics.step * metrics.dpr;
		const effectiveRadius = isDark ? radius : radius + 2;
		const dotHalfPhys = (effectiveRadius / 2) * metrics.dpr;
		gl.uniform1f(L("uStep"), physStep);
		gl.uniform1f(L("uDotHalf"), dotHalfPhys);

		// Grid offset in physical pixels.
		const cols = computeGridAxis(metrics.width, metrics.step, metrics.minInset, origin);
		const rows = computeGridAxis(metrics.height, metrics.step, metrics.minInset, origin);
		gl.uniform2f(L("uOff"), cols.offset * metrics.dpr, rows.offset * metrics.dpr);

		// Theme flag.
		gl.uniform1f(L("uDark"), isDark ? 1.0 : 0.0);

		// Color palette (convert 0-255 RGB to 0.0-1.0).
		const palette = resolvePalette(container, isDark);
		const rgb = (c: RGB) => [c[0] / 255, c[1] / 255, c[2] / 255] as const;

		gl.uniform3fv(L("uBCol"), rgb(palette.base.color));
		gl.uniform1f(L("uBAlpha"), palette.base.alpha);

		gl.uniform3fv(L("uLC0"), rgb(palette.levels[0].color));
		gl.uniform1f(L("uLA0"), palette.levels[0].alpha);
		gl.uniform3fv(L("uLC1"), rgb(palette.levels[1].color));
		gl.uniform1f(L("uLA1"), palette.levels[1].alpha);
		gl.uniform3fv(L("uLC2"), rgb(palette.levels[2].color));
		gl.uniform1f(L("uLA2"), palette.levels[2].alpha);
		gl.uniform3fv(L("uLC3"), rgb(palette.levels[3].color));
		gl.uniform1f(L("uLA3"), palette.levels[3].alpha);

		gl.uniform3fv(L("uUC0"), rgb(palette.underlay[0].color));
		gl.uniform1f(L("uUA0"), palette.underlay[0].alpha);
		gl.uniform3fv(L("uUC1"), rgb(palette.underlay[1].color));
		gl.uniform1f(L("uUA1"), palette.underlay[1].alpha);
		gl.uniform3fv(L("uUC2"), rgb(palette.underlay[2].color));
		gl.uniform1f(L("uUA2"), palette.underlay[2].alpha);
		gl.uniform3fv(L("uUC3"), rgb(palette.underlay[3].color));
		gl.uniform1f(L("uUA3"), palette.underlay[3].alpha);

		// Void field configs: pack 4 × vec4 into contiguous Float32Arrays.
		const configs = isDark ? DARK_VOID_CONFIGS : LIGHT_VOID_CONFIGS;
		const vPos = new Float32Array(16);
		const vRad = new Float32Array(16);
		const vSpd = new Float32Array(16);
		for (let i = 0; i < 4; i++) {
			const c = configs[i];
			vPos.set([c.baseX, c.baseY, c.orbitX, c.orbitY], i * 4);
			vRad.set([c.coreRadius, c.haloRadius, c.outerRadius, c.phase], i * 4);
			vSpd.set([c.speedX, c.speedY, c.strength, 0], i * 4);
		}
		gl.uniform4fv(L("uVPos"), vPos);
		gl.uniform4fv(L("uVRad"), vRad);
		gl.uniform4fv(L("uVSpd"), vSpd);

		// Render loop.
		let frameId = 0;
		let startTime = 0;

		const paint = (now: number) => {
			if (startTime === 0) startTime = now;
			const t = shouldReduceMotion ? 0.0 : ((now - startTime) / 1000) * speed;
			gl.uniform1f(L("uTime"), t);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			if (!shouldReduceMotion) {
				frameId = requestAnimationFrame(paint);
			}
		};

		frameId = requestAnimationFrame(paint);
		return () => cancelAnimationFrame(frameId);
	}, [isDark, metrics, origin, radius, shouldReduceMotion, speed]);

	return (
		<div ref={containerRef} className={cn("absolute inset-0", className)}>
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
		</div>
	);
}
