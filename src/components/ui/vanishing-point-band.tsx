"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";

const VERT_SRC = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uSide;
uniform float uDark;

out vec4 oColor;

const float TAU = 6.28318530718;

float sm3(float e0, float e1, float v) {
  float t = clamp((v - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float gauss2(vec2 p, vec2 c, vec2 r) {
  vec2 d = (p - c) / r;
  return exp(-dot(d, d));
}

float hash11(float p) {
  return fract(sin(p * 127.1 + 311.7) * 43758.5453123);
}

float packetTrain(float x, float width) {
  float d = abs(fract(x) - 0.5);
  return exp(-(d * d) / width);
}

float rayFan(vec2 uv, vec2 vanishingPoint, float count, float thickness, float phase) {
  vec2 rel = uv - vanishingPoint;
  float angle = atan(rel.y, rel.x);
  float dist = length(rel);

  float rayCoord = ((angle / TAU) + 0.5) * count;
  float rayIndex = floor(rayCoord);
  float lineCell = abs(fract(rayCoord) - 0.5);
  float line = 1.0 - smoothstep(thickness, thickness * 1.9, lineCell);

  float seedA = hash11(rayIndex + phase * 23.0 + uSide * 131.0);
  float seedB = hash11(rayIndex + 41.7 + uSide * 17.0);

  float speedA = mix(3.6, 7.4, seedA);
  float speedB = mix(2.1, 4.8, seedB);
  float spacingA = mix(8.5, 13.5, seedB);
  float spacingB = mix(5.5, 9.0, seedA);

  float packetA = packetTrain(dist * spacingA + uTime * speedA + seedA * 5.0, 0.0030);
  float packetB = packetTrain(dist * spacingB + uTime * speedB + seedB * 7.0, 0.0065);
  float carrier = mix(0.06, 0.16, seedA);
  float focus = exp(-pow((uv.x - 0.5) / 0.034, 2.0)) * exp(-dist * 3.9);

  return line * (carrier + packetA * 0.92 + packetB * 0.48) + focus * 0.28;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 vanishingPoint = vec2(0.5, mix(-0.08, 1.08, uSide));
  float energy = rayFan(uv, vanishingPoint, 168.0, 0.024, mix(0.0, 1.3, uSide));

  float centerColumn = exp(-pow((uv.x - 0.5) / 0.042, 2.0));
  float boundaryGlow = centerColumn * exp(-pow((uv.y - mix(0.0, 1.0, uSide)) / 0.20, 2.0));
  float cornerGlow =
    gauss2(uv, vec2(0.10, mix(0.10, 0.90, uSide)), vec2(0.18, 0.20)) * 0.32 +
    gauss2(uv, vec2(0.90, mix(0.10, 0.90, uSide)), vec2(0.18, 0.20)) * 0.32;

  float bloom = clamp(boundaryGlow * (0.62 + 0.38 * sin(uTime * 0.85)) + cornerGlow, 0.0, 1.2);
  vec3 color = vec3(0.0);

  if (uDark > 0.5) {
    color = vec3(0.014);
    color += vec3(0.84) * energy * 0.15;
    color += vec3(0.42) * bloom * 0.12;
    color += vec3(0.92) * energy * bloom * 0.05;
  } else {
    color = vec3(0.985);
    color -= vec3(0.70) * energy * 0.14;
    color -= vec3(0.34) * bloom * 0.10;
    color -= vec3(0.18) * energy * bloom * 0.04;
  }

  color = clamp(color, 0.0, 1.0);

  oColor = vec4(color, 1.0);
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

function VanishingPointField({ className, side }: { className?: string; side: "top" | "bottom" }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const shouldReduceMotion = useReducedMotion();
	const sideValue = side === "bottom" ? 1 : 0;
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const syncTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		syncTheme();
		const observer = new MutationObserver(syncTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme", "style"],
		});

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return;

		const gl = canvas.getContext("webgl2", {
			alpha: true,
			antialias: true,
			powerPreference: "high-performance",
		});
		if (!gl) return;

		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
		const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
		const program = linkProgram(gl, vertexShader, fragmentShader);
		const vao = gl.createVertexArray();
		const buffer = gl.createBuffer();
		if (!vao || !buffer) return;

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
			gl.STATIC_DRAW,
		);

		const positionLocation = gl.getAttribLocation(program, "aPos");
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		gl.bindVertexArray(null);

		const resolutionLocation = gl.getUniformLocation(program, "uRes");
		const timeLocation = gl.getUniformLocation(program, "uTime");
		const sideLocation = gl.getUniformLocation(program, "uSide");
		const darkLocation = gl.getUniformLocation(program, "uDark");

		const resize = () => {
			const rect = container.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const width = Math.max(1, Math.round(rect.width * dpr));
			const height = Math.max(1, Math.round(rect.height * dpr));

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}

			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;
			gl.viewport(0, 0, width, height);
		};

		const observer = new ResizeObserver(resize);
		observer.observe(container);
		resize();

		let frameId = 0;
		const startTime = performance.now();

		const render = (now: number) => {
			const elapsed = shouldReduceMotion ? 0 : (now - startTime) / 1000;

			const runProgram = gl.useProgram.bind(gl);
			runProgram(program);
			gl.bindVertexArray(vao);
			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.uniform1f(timeLocation, elapsed);
			gl.uniform1f(sideLocation, sideValue);
			gl.uniform1f(darkLocation, isDark ? 1 : 0);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			if (!shouldReduceMotion) {
				frameId = window.requestAnimationFrame(render);
			}
		};

		frameId = window.requestAnimationFrame(render);
		if (shouldReduceMotion) {
			render(startTime);
		}

		return () => {
			window.cancelAnimationFrame(frameId);
			observer.disconnect();
			gl.deleteBuffer(buffer);
			gl.deleteVertexArray(vao);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
		};
	}, [isDark, shouldReduceMotion, sideValue]);

	return (
		<div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
		</div>
	);
}

interface VanishingPointBandProps {
	className?: string;
	side: "top" | "bottom";
}

export function VanishingPointStrip({ className, side }: VanishingPointBandProps) {
	return (
		<div
			className={cn(
				"relative isolate w-full overflow-hidden bg-surface-50 dark:bg-surface-950",
				className,
			)}
		>
			<VanishingPointField className="[--vp-side:0]" side={side} />
			<div className="relative z-10 min-h-[7.5rem] w-full sm:min-h-[9.5rem]" />
		</div>
	);
}
