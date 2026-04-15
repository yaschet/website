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
	// Top-left wing — primary mass
	{
		baseX: 0.14,
		baseY: 0.08,
		coreRadius: 0.07,
		haloRadius: 0.2,
		orbitX: 0.048,
		orbitY: 0.038,
		outerRadius: 0.46,
		phase: 0.0,
		speedX: 0.82,
		speedY: 0.74,
		strength: 1.72,
	},
	// Top-right wing — primary mass
	{
		baseX: 0.86,
		baseY: 0.08,
		coreRadius: 0.07,
		haloRadius: 0.2,
		orbitX: 0.048,
		orbitY: 0.038,
		outerRadius: 0.46,
		phase: 1.57,
		speedX: 0.88,
		speedY: 0.78,
		strength: 1.72,
	},
	// Lower-left accent
	{
		baseX: 0.06,
		baseY: 0.72,
		coreRadius: 0.055,
		haloRadius: 0.15,
		orbitX: 0.034,
		orbitY: 0.044,
		outerRadius: 0.32,
		phase: 3.14,
		speedX: 0.72,
		speedY: 0.86,
		strength: 0.92,
	},
	// Lower-right accent
	{
		baseX: 0.94,
		baseY: 0.72,
		coreRadius: 0.055,
		haloRadius: 0.15,
		orbitX: 0.034,
		orbitY: 0.044,
		outerRadius: 0.32,
		phase: 4.71,
		speedX: 0.86,
		speedY: 0.72,
		strength: 0.92,
	},
];

const LIGHT_VOID_CONFIGS: VoidConfig[] = [
	// Top-left wing — primary mass
	{
		baseX: 0.14,
		baseY: 0.08,
		coreRadius: 0.065,
		haloRadius: 0.18,
		orbitX: 0.042,
		orbitY: 0.034,
		outerRadius: 0.4,
		phase: 0.0,
		speedX: 0.8,
		speedY: 0.72,
		strength: 1.3,
	},
	// Top-right wing — primary mass
	{
		baseX: 0.86,
		baseY: 0.08,
		coreRadius: 0.065,
		haloRadius: 0.18,
		orbitX: 0.042,
		orbitY: 0.034,
		outerRadius: 0.4,
		phase: 1.57,
		speedX: 0.86,
		speedY: 0.76,
		strength: 1.3,
	},
	// Lower-left accent
	{
		baseX: 0.06,
		baseY: 0.72,
		coreRadius: 0.05,
		haloRadius: 0.13,
		orbitX: 0.03,
		orbitY: 0.04,
		outerRadius: 0.28,
		phase: 3.14,
		speedX: 0.7,
		speedY: 0.84,
		strength: 0.72,
	},
	// Lower-right accent
	{
		baseX: 0.94,
		baseY: 0.72,
		coreRadius: 0.05,
		haloRadius: 0.13,
		orbitX: 0.03,
		orbitY: 0.04,
		outerRadius: 0.28,
		phase: 4.71,
		speedX: 0.84,
		speedY: 0.7,
		strength: 0.72,
	},
];

// ---------------------------------------------------------------------------
// Fallback palettes (used when CSS vars cannot be resolved)
// ---------------------------------------------------------------------------

const FALLBACK_DARK_PALETTE: Palette = {
	// Base: dim lattice visible across entire hero
	base: { color: [228, 228, 231], alpha: 0.042 },
	levels: [
		{ color: [113, 113, 122], alpha: 0.11 }, // level 0 — edge glow
		{ color: [71, 88, 153], alpha: 0.24 }, // level 1 — mid brightness
		{ color: [92, 141, 232], alpha: 0.48 }, // level 2 — bright
		{ color: [191, 219, 254], alpha: 0.74 }, // level 3 — peak
	],
	// Underlay: visible topographic fill between dots.
	// Each band is a flat color region — topographic map style.
	underlay: [
		{ color: [42, 40, 108], alpha: 0.09 }, // band 0 — outer edge
		{ color: [55, 70, 140], alpha: 0.16 }, // band 1 — mid
		{ color: [71, 118, 210], alpha: 0.24 }, // band 2 — inner
		{ color: [120, 170, 245], alpha: 0.33 }, // band 3 — core
	],
};

const FALLBACK_LIGHT_PALETTE: Palette = {
	base: { color: [219, 234, 254], alpha: 0.035 },
	levels: [
		{ color: [191, 219, 254], alpha: 0.09 },
		{ color: [147, 197, 253], alpha: 0.18 },
		{ color: [96, 165, 250], alpha: 0.34 },
		{ color: [59, 130, 246], alpha: 0.52 },
	],
	underlay: [
		{ color: [219, 234, 254], alpha: 0.04 },
		{ color: [191, 219, 254], alpha: 0.075 },
		{ color: [147, 197, 253], alpha: 0.115 },
		{ color: [96, 165, 250], alpha: 0.16 },
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
// Full-stage solid-blob field:
//   4 symmetric corner masses → organic topographic shapes.
//   Gentle domain warp. Minimal ridge for texture.
//   Centered radial quiet zone attenuates field where hero text lives.

float evalField(vec2 uv, float phase) {
  float aspect = uRes.x / uRes.y;

  // Gentle domain warp — gives the "breathing" organic quality.
  float dX = 0.016 * sin(TAU * (uv.y * 0.82 + uv.x * 0.28) + phase * 0.52);
  float dY = 0.012 * cos(TAU * (uv.x * 0.68 - uv.y * 0.22) + phase * 0.44);
  vec2 p = uv + vec2(dX, dY);

  float val = 0.0;

  // Solid Gaussian blobs — brightest at center, smooth falloff.
  // No ring/void subtraction: the blobs are solid topographic masses.
  for (int i = 0; i < 4; i++) {
    float cx = uVPos[i].x + uVPos[i].z * sin(phase * uVSpd[i].x + uVRad[i].w);
    float cy = uVPos[i].y + uVPos[i].w * cos(phase * uVSpd[i].y + uVRad[i].w * 1.17);

    float ex = (p.x - cx) * aspect;
    float ey =  p.y - cy;
    float d2 = ex * ex + ey * ey;

    float hR  = uVRad[i].y;  // halo radius — defines mid-brightness boundary
    float oR  = uVRad[i].z;  // outer radius — defines wide falloff
    float str = uVSpd[i].z;

    // Composite: tight halo peak + wide soft envelope.
    float halo = exp(-d2 / (hR * hR));
    float otr  = exp(-d2 / (oR * oR));
    val += (halo * 0.68 + otr * 0.32) * str;
  }

  // Topographic ridge — trace of organic texture, kept subtle.
  float ridge =
    0.09 * sin(TAU * (p.x * 1.08 + p.y * 0.34) + phase * 0.42) +
    0.06 * cos(TAU * (p.y * 0.84 - p.x * 0.26) + phase * 0.36);

  // Clamp raw blob sum before mixing ridge in.
  val = clamp(val, 0.0, 1.4);
  val = val * 0.90 + ridge * sm3(0.10, 0.90, clamp(val, 0.0, 1.0)) * 0.10;

  // Center quiet zone — elliptical attenuation where hero text lives.
  // Keeps animation active at edges and corners while text stays readable.
  float center = gauss2(uv, vec2(0.44, 0.46), vec2(0.30, 0.27));
  val *= 1.0 - center * mix(0.78, 0.82, uDark);

  float norm = clamp(val, 0.0, 1.0);
  // Smoothstep shaping: low threshold so even dim areas activate level 0.
  return pow(max(sm3(0.04, 0.88, norm), 0.0001), mix(0.88, 0.92, uDark));
}

// ---------- main ----------

void main() {
  // Remap to CSS top-left origin (WebGL origin is bottom-left).
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = fc / uRes;

  float phase = mod(uTime, LOOP) / LOOP * TAU;
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
    // --- underlay: topographic fill between dots ---
    // 4 discrete bands give a quantized topographic map appearance.
    // Thresholds start lower (0.12) so the fill covers a broad area
    // of the field — not just the bright core of the blobs.
    float u0 = mix(0.14, 0.12, uDark);  // outer edge
    float u1 = mix(0.32, 0.28, uDark);  // mid
    float u2 = mix(0.50, 0.46, uDark);  // inner
    float u3 = mix(0.66, 0.64, uDark);  // core

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
				isDark ? "var(--color-surface-200)" : "var(--color-accent-100)",
				fb.base.color,
			),
			alpha: fb.base.alpha,
		},
		levels: [
			{
				color: rc(
					isDark ? "var(--color-surface-500)" : "var(--color-accent-200)",
					fb.levels[0].color,
				),
				alpha: fb.levels[0].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-700)" : "var(--color-accent-300)",
					fb.levels[1].color,
				),
				alpha: fb.levels[1].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-500)" : "var(--color-accent-400)",
					fb.levels[2].color,
				),
				alpha: fb.levels[2].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-300)" : "var(--color-accent-500)",
					fb.levels[3].color,
				),
				alpha: fb.levels[3].alpha,
			},
		],
		underlay: [
			{
				color: rc(
					isDark ? "var(--color-accent-800)" : "var(--color-accent-200)",
					fb.underlay[0].color,
				),
				alpha: fb.underlay[0].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-700)" : "var(--color-accent-300)",
					fb.underlay[1].color,
				),
				alpha: fb.underlay[1].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-600)" : "var(--color-accent-400)",
					fb.underlay[2].color,
				),
				alpha: fb.underlay[2].alpha,
			},
			{
				color: rc(
					isDark ? "var(--color-accent-400)" : "var(--color-accent-500)",
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
