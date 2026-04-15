"use client";

import { useReducedMotion } from "framer-motion";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	computeGridAxis,
	type DotGridLength,
	type DotGridOrigin,
	resolveLength,
} from "./dot-grid-metrics";

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
	active: [Tone, Tone, Tone, Tone];
	underlay: [Tone, Tone, Tone, Tone];
}

interface Metrics {
	dpr: number;
	height: number;
	minInset: number;
	step: number;
	width: number;
}

interface MouseState {
	currentStrength: number;
	currentX: number;
	currentY: number;
	targetStrength: number;
	targetX: number;
	targetY: number;
}

const FALLBACK_DARK_PALETTE: Palette = {
	active: [
		{ color: [0, 127, 79], alpha: 0.22 },
		{ color: [0, 168, 104], alpha: 0.42 },
		{ color: [0, 194, 122], alpha: 0.68 },
		{ color: [46, 217, 153], alpha: 0.94 },
	],
	underlay: [
		{ color: [0, 31, 20], alpha: 0.08 },
		{ color: [0, 59, 37], alpha: 0.13 },
		{ color: [0, 91, 57], alpha: 0.19 },
		{ color: [0, 127, 79], alpha: 0.27 },
	],
};

const FALLBACK_LIGHT_PALETTE: Palette = {
	active: [
		{ color: [174, 248, 214], alpha: 0.22 },
		{ color: [116, 238, 187], alpha: 0.34 },
		{ color: [46, 217, 153], alpha: 0.52 },
		{ color: [0, 194, 122], alpha: 0.7 },
	],
	underlay: [
		{ color: [217, 255, 240], alpha: 0.08 },
		{ color: [174, 248, 214], alpha: 0.14 },
		{ color: [116, 238, 187], alpha: 0.22 },
		{ color: [46, 217, 153], alpha: 0.32 },
	],
};

const VERT_SRC = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform vec2  uOff;
uniform vec2  uGridMin;
uniform vec2  uGridMax;
uniform float uTime;
uniform float uStep;
uniform float uDotRadius;
uniform float uDark;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uTransitionPulse;

uniform vec3  uLC0; uniform float uLA0;
uniform vec3  uLC1; uniform float uLA1;
uniform vec3  uLC2; uniform float uLA2;
uniform vec3  uLC3; uniform float uLA3;

uniform vec3  uUC0; uniform float uUA0;
uniform vec3  uUC1; uniform float uUA1;
uniform vec3  uUC2; uniform float uUA2;
uniform vec3  uUC3; uniform float uUA3;

out vec4 oColor;

float sm3(float e0, float e1, float v) {
  float t = clamp((v - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float gauss2(vec2 p, vec2 c, vec2 r) {
  vec2 d = (p - c) / r;
  return exp(-dot(d, d));
}

float contourBand(float field, float threshold, float gradient, float width) {
  float dist = abs(field - threshold) / max(gradient, 0.0001);
  return 1.0 - smoothstep(0.0, width, dist);
}

vec4 alphaOver(vec4 top, vec4 bottom) {
  float outAlpha = top.a + bottom.a * (1.0 - top.a);
  if (outAlpha <= 0.0) {
    return vec4(0.0);
  }

  vec3 outColor =
    (top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a)) / outAlpha;

  return vec4(outColor, outAlpha);
}

vec4 permute(vec4 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2  C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;

  return 105.0 * dot(
    m * m,
    vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))
  );
}

float fieldValue(vec2 uv, float time) {
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 warp = vec2(
    snoise(vec3(p * 0.85 + vec2(1.2, -0.8), time * 0.09)),
    snoise(vec3(p * 0.85 + vec2(-3.7, 2.4), time * 0.09))
  );

  vec2 q = p * 1.05 + warp * 0.28;

  float coarse = snoise(vec3(q * 0.85, time * 0.11));
  float middle = snoise(vec3(q * 1.75 + vec2(2.7, -1.6), time * 0.15));
  float detail = snoise(vec3(q * 3.3 + vec2(-4.4, 3.1), time * 0.21));

  float field = coarse * 0.58 + middle * 0.28 + detail * 0.14;
  field = field * 0.5 + 0.5;
  field = sm3(0.16, 0.88, field);

  float topLift = (1.0 - sm3(0.04, 0.30, uv.y)) * 0.04;
  float rightLift = sm3(0.56, 0.96, uv.x) * 0.06;
  float lowerLift = sm3(0.70, 0.98, uv.y) * 0.03;

  field = clamp(field + topLift + rightLift + lowerLift, 0.0, 1.0);

  return clamp(field, 0.0, 1.0);
}

float contentShield(vec2 uv) {
  float title = gauss2(uv, vec2(0.29, 0.34), vec2(0.26, 0.19)) * 1.18;
  float body = gauss2(uv, vec2(0.29, 0.50), vec2(0.29, 0.22));
  float cta = gauss2(uv, vec2(0.20, 0.73), vec2(0.20, 0.14));
  float mobile = gauss2(uv, vec2(0.30, 0.46), vec2(0.34, 0.34));
  float shield = max(max(title, body), max(cta, mobile * 0.66));
  return sm3(0.08, 0.90, shield);
}

void main() {
  vec2 cssCoord = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = cssCoord / uRes;

  if (
    cssCoord.x < uGridMin.x || cssCoord.x > uGridMax.x ||
    cssCoord.y < uGridMin.y || cssCoord.y > uGridMax.y
  ) {
    oColor = vec4(0.0);
    return;
  }

  float field = fieldValue(uv, uTime);
  float shield = contentShield(uv);
  field *= mix(1.0, mix(0.78, 0.74, uDark), shield);

  float mouseInfluence = gauss2(uv, uMouse, vec2(0.09, 0.09));
  float mouseSignedLift = mix(1.0, -1.0, uDark);
  field = clamp(
    field + mouseInfluence * uMouseStrength * mouseSignedLift * 0.14 * mix(1.0, 0.32, shield),
    0.0,
    1.0
  );

  vec2 center = vec2(uStep * 0.5);
  vec2 cellDist = abs(mod(cssCoord - uOff + center, uStep) - center);
  bool inDot = cellDist.x <= uDotRadius && cellDist.y <= uDotRadius;

  float u0 = mix(0.46, 0.10, uDark);
  float u1 = mix(0.58, 0.18, uDark);
  float u2 = mix(0.70, 0.30, uDark);
  float u3 = mix(0.82, 0.46, uDark);

  float d0 = mix(0.50, 0.30, uDark);
  float d1 = mix(0.64, 0.46, uDark);
  float d2 = mix(0.78, 0.63, uDark);
  float d3 = mix(0.89, 0.80, uDark);

  float fieldGradient = length(vec2(dFdx(field), dFdy(field)));
  float contourWidth = mix(1.05, 0.92, uDark);
  float contour = 0.0;
  contour = max(contour, contourBand(field, u0, fieldGradient, contourWidth));
  contour = max(contour, contourBand(field, u1, fieldGradient, contourWidth));
  contour = max(contour, contourBand(field, u2, fieldGradient, contourWidth));
  contour = max(contour, contourBand(field, u3, fieldGradient, contourWidth));

  vec4 underlay = vec4(0.0);
  if      (field >= u3) { underlay = vec4(uUC3, uUA3); }
  else if (field >= u2) { underlay = vec4(uUC2, uUA2); }
  else if (field >= u1) { underlay = vec4(uUC1, uUA1); }
  else if (field >= u0) { underlay = vec4(uUC0, uUA0); }

  vec4 dots = vec4(0.0);
  if (inDot) {
    if      (field >= d3) { dots = vec4(uLC3, uLA3); }
    else if (field >= d2) { dots = vec4(uLC2, uLA2); }
    else if (field >= d1) { dots = vec4(uLC1, uLA1); }
    else if (field >= d0) { dots = vec4(uLC0, uLA0); }
  }

  vec3 contourRgb = mix(uLC2, uLC3, 0.28);
  vec4 contourStroke = vec4(contourRgb, contour * mix(0.74, 0.30, uDark) * uTransitionPulse);

  underlay.a *= mix(1.0, mix(0.20, 0.16, uDark), shield);
  dots.a *= mix(1.0, mix(0.18, 0.34, uDark), shield);
  contourStroke.a *= mix(1.0, mix(0.22, 0.40, uDark), shield);

  if (uDark < 0.5) {
    vec4 lightBase = vec4(1.0);
    float lightMix = underlay.a * 0.62;
    vec4 lightUnderlay = vec4(mix(lightBase.rgb, underlay.rgb, lightMix), 1.0);
    vec4 contouredLight = alphaOver(contourStroke, lightUnderlay);
    oColor = alphaOver(dots, contouredLight);
    return;
  }

  vec4 contouredUnderlay = alphaOver(contourStroke, underlay);
  oColor = alphaOver(dots, contouredUnderlay);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) throw new Error("Failed to create shader");
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(log ?? "Shader compile error");
	}

	return shader;
}

function linkProgram(
	gl: WebGL2RenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader,
) {
	const program = gl.createProgram();
	if (!program) throw new Error("Failed to create program");

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(log ?? "Program link error");
	}

	return program;
}

function clampInt(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function parseRgb(value: string, fallback: RGB): RGB {
	const match = value.match(/rgba?\(([^)]+)\)/i);
	if (!match) return fallback;

	const channels = match[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.slice(0, 3)
		.map((part) => Number.parseFloat(part));

	if (channels.length !== 3 || channels.some((part) => Number.isNaN(part))) {
		return fallback;
	}

	return [
		clampInt(Math.round(channels[0]), 0, 255),
		clampInt(Math.round(channels[1]), 0, 255),
		clampInt(Math.round(channels[2]), 0, 255),
	];
}

function resolveCssColor(node: HTMLElement, css: string, fallback: RGB): RGB {
	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.color = css;
	node.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	node.removeChild(probe);
	return parseRgb(resolved, fallback);
}

function resolvePalette(node: HTMLElement, isDark: boolean): Palette {
	const fallback = isDark ? FALLBACK_DARK_PALETTE : FALLBACK_LIGHT_PALETTE;
	const resolve = (css: string, base: RGB) => resolveCssColor(node, css, base);

	return {
		active: [
			{
				color: resolve(
					isDark ? "var(--color-accent-700)" : "var(--color-accent-200)",
					fallback.active[0].color,
				),
				alpha: fallback.active[0].alpha,
			},
			{
				color: resolve(
					isDark ? "var(--color-accent-600)" : "var(--color-accent-300)",
					fallback.active[1].color,
				),
				alpha: fallback.active[1].alpha,
			},
			{
				color: resolve(
					isDark ? "var(--color-accent-500)" : "var(--color-accent-400)",
					fallback.active[2].color,
				),
				alpha: fallback.active[2].alpha,
			},
			{
				color: resolve(
					isDark ? "var(--color-accent-400)" : "var(--color-accent-500)",
					fallback.active[3].color,
				),
				alpha: fallback.active[3].alpha,
			},
		],
		underlay: [
			{
				color: resolve(
					isDark ? "var(--color-accent-950)" : "var(--color-accent-100)",
					fallback.underlay[0].color,
				),
				alpha: fallback.underlay[0].alpha,
			},
			{
				color: resolve(
					isDark ? "var(--color-accent-900)" : "var(--color-accent-200)",
					fallback.underlay[1].color,
				),
				alpha: fallback.underlay[1].alpha,
			},
			{
				color: resolve(
					isDark ? "var(--color-accent-800)" : "var(--color-accent-300)",
					fallback.underlay[2].color,
				),
				alpha: fallback.underlay[2].alpha,
			},
			{
				color: resolve(
					isDark ? "var(--color-accent-700)" : "var(--color-accent-400)",
					fallback.underlay[3].color,
				),
				alpha: fallback.underlay[3].alpha,
			},
		],
	};
}

export function TopographicDotField({
	className,
	step = 18,
	minInset = 12,
	radius = 1.15,
	origin = "center",
	speed = 1,
}: TopographicDotFieldProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const glRef = useRef<WebGL2RenderingContext | null>(null);
	const programRef = useRef<WebGLProgram | null>(null);
	const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
	const uniformRef = useRef<Record<string, WebGLUniformLocation | null>>({});
	const mouseRef = useRef<MouseState>({
		currentStrength: 0,
		currentX: 0.5,
		currentY: 0.5,
		targetStrength: 0,
		targetX: 0.5,
		targetY: 0.5,
	});
	const supportsHoverRef = useRef(false);
	const transitionPulseRef = useRef(1);

	const shouldReduceMotion = useReducedMotion();
	const [isDark, setIsDark] = useState(false);
	const [metrics, setMetrics] = useState<Metrics>({
		dpr: 1,
		height: 0,
		minInset: typeof minInset === "number" ? minInset : 12,
		step: typeof step === "number" ? step : 18,
		width: 0,
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		const syncTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		syncTheme();
		const observer = new MutationObserver(syncTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const sync = () => {
			supportsHoverRef.current = mediaQuery.matches;
			if (!mediaQuery.matches) {
				mouseRef.current.targetStrength = 0;
				mouseRef.current.currentStrength = 0;
			}
		};

		sync();
		mediaQuery.addEventListener("change", sync);

		return () => mediaQuery.removeEventListener("change", sync);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleThemeToggled = () => {
			transitionPulseRef.current = 1.3;
		};

		window.addEventListener("theme-toggled", handleThemeToggled);
		return () => window.removeEventListener("theme-toggled", handleThemeToggled);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateMetrics = () => {
			const rect = container.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const nextStep = Math.max(1, resolveLength(container, step, 18));
			const nextMinInset = Math.max(0, resolveLength(container, minInset, 12));
			const nextWidth = Math.round(rect.width);
			const nextHeight = Math.round(rect.height);

			setMetrics((current) =>
				current.width === nextWidth &&
				current.height === nextHeight &&
				current.step === nextStep &&
				current.minInset === nextMinInset &&
				current.dpr === dpr
					? current
					: {
							dpr,
							height: nextHeight,
							minInset: nextMinInset,
							step: nextStep,
							width: nextWidth,
						},
			);
		};

		const observer = new ResizeObserver(updateMetrics);
		observer.observe(container);
		updateMetrics();
		window.addEventListener("resize", updateMetrics, { passive: true });

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateMetrics);
		};
	}, [minInset, step]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let gl: WebGL2RenderingContext | null = null;
		let program: WebGLProgram | null = null;
		let vao: WebGLVertexArrayObject | null = null;
		let buffer: WebGLBuffer | null = null;

		try {
			gl = canvas.getContext("webgl2", {
				alpha: true,
				antialias: false,
				depth: false,
				premultipliedAlpha: false,
				stencil: false,
			});
			if (!gl) return;

			const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
			const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
			program = linkProgram(gl, vertexShader, fragmentShader);

			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);

			buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
				gl.STATIC_DRAW,
			);

			vao = gl.createVertexArray();
			gl.bindVertexArray(vao);
			const attribute = gl.getAttribLocation(program, "aPos");
			gl.enableVertexAttribArray(attribute);
			gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
			gl.bindVertexArray(null);

			const glSafe = gl as WebGL2RenderingContext;
			const programSafe = program as WebGLProgram;
			const getUniform = (name: string) => glSafe.getUniformLocation(programSafe, name);
			uniformRef.current = {
				uRes: getUniform("uRes"),
				uOff: getUniform("uOff"),
				uGridMin: getUniform("uGridMin"),
				uGridMax: getUniform("uGridMax"),
				uTime: getUniform("uTime"),
				uStep: getUniform("uStep"),
				uDotRadius: getUniform("uDotRadius"),
				uDark: getUniform("uDark"),
				uMouse: getUniform("uMouse"),
				uMouseStrength: getUniform("uMouseStrength"),
				uTransitionPulse: getUniform("uTransitionPulse"),
				uLC0: getUniform("uLC0"),
				uLA0: getUniform("uLA0"),
				uLC1: getUniform("uLC1"),
				uLA1: getUniform("uLA1"),
				uLC2: getUniform("uLC2"),
				uLA2: getUniform("uLA2"),
				uLC3: getUniform("uLC3"),
				uLA3: getUniform("uLA3"),
				uUC0: getUniform("uUC0"),
				uUA0: getUniform("uUA0"),
				uUC1: getUniform("uUC1"),
				uUA1: getUniform("uUA1"),
				uUC2: getUniform("uUC2"),
				uUA2: getUniform("uUA2"),
				uUC3: getUniform("uUC3"),
				uUA3: getUniform("uUA3"),
			};

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.clearColor(0, 0, 0, 0);

			glRef.current = gl;
			programRef.current = program;
			vaoRef.current = vao;
		} catch {
			// Leave the SVG lattice in place when WebGL is unavailable.
		}

		return () => {
			if (gl) {
				if (vao) gl.deleteVertexArray(vao);
				if (buffer) gl.deleteBuffer(buffer);
				if (program) gl.deleteProgram(program);
			}
			glRef.current = null;
			programRef.current = null;
			vaoRef.current = null;
		};
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		const gl = glRef.current;
		const program = programRef.current;
		const vao = vaoRef.current;
		const uniforms = uniformRef.current;

		if (!container || !canvas || !gl || !program || !vao) return;
		if (metrics.width <= 0 || metrics.height <= 0) return;

		const physicalWidth = Math.round(metrics.width * metrics.dpr);
		const physicalHeight = Math.round(metrics.height * metrics.dpr);

		canvas.width = physicalWidth;
		canvas.height = physicalHeight;
		gl.viewport(0, 0, physicalWidth, physicalHeight);

		const palette = resolvePalette(container, isDark);
		const columns = computeGridAxis(metrics.width, metrics.step, metrics.minInset, origin);
		const rows = computeGridAxis(metrics.height, metrics.step, metrics.minInset, origin);
		const dotRadius = radius;
		const halfDot = dotRadius * metrics.dpr;
		const gridMinX = (columns.offset - dotRadius) * metrics.dpr;
		const gridMinY = (rows.offset - dotRadius) * metrics.dpr;
		const gridMaxX =
			(columns.offset + (columns.count - 1) * metrics.step + dotRadius) * metrics.dpr;
		const gridMaxY = (rows.offset + (rows.count - 1) * metrics.step + dotRadius) * metrics.dpr;
		const toVec3 = (color: RGB) =>
			new Float32Array([color[0] / 255, color[1] / 255, color[2] / 255]);
		const setUniform3 = (name: string, color: RGB) => {
			const location = uniforms[name];
			if (location) gl.uniform3fv(location, toVec3(color));
		};
		const setUniform1 = (name: string, value: number) => {
			const location = uniforms[name];
			if (location) gl.uniform1f(location, value);
		};

		const activateProgram = gl.useProgram.bind(gl);
		activateProgram(program);
		gl.bindVertexArray(vao);
		gl.uniform2f(uniforms.uRes, physicalWidth, physicalHeight);
		gl.uniform2f(uniforms.uOff, columns.offset * metrics.dpr, rows.offset * metrics.dpr);
		gl.uniform2f(uniforms.uGridMin, gridMinX, gridMinY);
		gl.uniform2f(uniforms.uGridMax, gridMaxX, gridMaxY);
		gl.uniform1f(uniforms.uStep, metrics.step * metrics.dpr);
		gl.uniform1f(uniforms.uDotRadius, halfDot);
		gl.uniform1f(uniforms.uDark, isDark ? 1 : 0);
		gl.uniform2f(uniforms.uMouse, 0.5, 0.5);
		gl.uniform1f(uniforms.uMouseStrength, 0);

		setUniform3("uLC0", palette.active[0].color);
		setUniform1("uLA0", palette.active[0].alpha);
		setUniform3("uLC1", palette.active[1].color);
		setUniform1("uLA1", palette.active[1].alpha);
		setUniform3("uLC2", palette.active[2].color);
		setUniform1("uLA2", palette.active[2].alpha);
		setUniform3("uLC3", palette.active[3].color);
		setUniform1("uLA3", palette.active[3].alpha);

		setUniform3("uUC0", palette.underlay[0].color);
		setUniform1("uUA0", palette.underlay[0].alpha);
		setUniform3("uUC1", palette.underlay[1].color);
		setUniform1("uUA1", palette.underlay[1].alpha);
		setUniform3("uUC2", palette.underlay[2].color);
		setUniform1("uUA2", palette.underlay[2].alpha);
		setUniform3("uUC3", palette.underlay[3].color);
		setUniform1("uUA3", palette.underlay[3].alpha);

		let frameId = 0;
		let startTime = 0;
		let lastFrameTime = 0;

		const render = (now: number) => {
			if (startTime === 0) startTime = now;
			if (lastFrameTime === 0) lastFrameTime = now;
			const deltaSeconds = (now - lastFrameTime) / 1000;
			lastFrameTime = now;
			
			// Decay transition pulse smoothly back to 1.0 over ~240ms (1.3 -> 1.0 is 0.3)
			if (transitionPulseRef.current > 1.0) {
				transitionPulseRef.current = Math.max(
					1.0,
					transitionPulseRef.current - deltaSeconds * (0.3 / 0.24)
				);
			}

			const elapsed = shouldReduceMotion ? 0 : ((now - startTime) / 1000) * speed;
			const mouse = mouseRef.current;
			const pointerTau = 0.1;
			const strengthTau = mouse.targetStrength > mouse.currentStrength ? 0.12 : 0.6;
			const pointerLerp = 1 - Math.exp(-deltaSeconds / pointerTau);
			const strengthLerp = 1 - Math.exp(-deltaSeconds / strengthTau);

			mouse.currentX += (mouse.targetX - mouse.currentX) * pointerLerp;
			mouse.currentY += (mouse.targetY - mouse.currentY) * pointerLerp;
			mouse.currentStrength += (mouse.targetStrength - mouse.currentStrength) * strengthLerp;

			gl.uniform1f(uniforms.uTime, elapsed);
			gl.uniform2f(uniforms.uMouse, mouse.currentX, mouse.currentY);
			gl.uniform1f(uniforms.uMouseStrength, shouldReduceMotion ? 0 : mouse.currentStrength);
			gl.uniform1f(uniforms.uTransitionPulse, transitionPulseRef.current);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			if (!shouldReduceMotion) {
				frameId = requestAnimationFrame(render);
			}
		};

		frameId = requestAnimationFrame(render);

		return () => cancelAnimationFrame(frameId);
	}, [isDark, metrics, origin, radius, shouldReduceMotion, speed]);

	const updateMouseTarget = (clientX: number, clientY: number) => {
		const container = containerRef.current;
		if (!container || !supportsHoverRef.current || shouldReduceMotion) return;

		const rect = container.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;

		const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
		const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
		const edgeDistance = Math.min(x, 1 - x, y, 1 - y);
		const edgeStrength = Math.min(1, Math.max(0, (edgeDistance - 0.06) / 0.18));

		mouseRef.current.targetX = x;
		mouseRef.current.targetY = y;
		mouseRef.current.targetStrength = edgeStrength;
	};

	const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.pointerType === "touch") return;
		updateMouseTarget(event.clientX, event.clientY);
	};

	const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.pointerType === "touch") return;
		updateMouseTarget(event.clientX, event.clientY);
	};

	const handlePointerLeave = () => {
		mouseRef.current.targetStrength = 0;
	};

	return (
		<div
			ref={containerRef}
			className={cn(
				"pointer-events-auto absolute inset-0 overflow-hidden bg-white transition-colors dark:bg-surface-900/80",
				className,
			)}
			onPointerEnter={handlePointerEnter}
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
		>
			<canvas
				ref={canvasRef}
				className="pointer-events-none absolute inset-0 h-full w-full bg-white transition-colors dark:bg-surface-900/80"
			/>
		</div>
	);
}
