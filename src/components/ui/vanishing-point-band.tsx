"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
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

float rayFan(vec2 uv, vec2 vanishingPoint, float count, float thickness, float phase) {
  vec2 rel = uv - vanishingPoint;
  float angle = atan(rel.y, rel.x);
  float dist = length(rel);

  float lineCell = abs(fract((angle / TAU) * count) - 0.5);
  float line = 1.0 - smoothstep(thickness, thickness * 1.9, lineCell);

  float flow = 0.5 + 0.5 * sin(dist * 24.0 - uTime * 1.45 + angle * 5.0 + phase);
  float focus = exp(-pow((uv.x - 0.5) / 0.045, 2.0));

  return line * (0.28 + 0.72 * flow) + focus * exp(-dist * 3.4) * 0.30;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;

  float topMask = 1.0 - sm3(0.17, 0.39, uv.y);
  float bottomMask = sm3(0.61, 0.83, uv.y);

  vec2 vanishingPoint = vec2(0.5, 0.5);
  float top = rayFan(uv, vanishingPoint, 150.0, 0.028, 0.0) * topMask;
  float bottom = rayFan(uv, vanishingPoint, 150.0, 0.028, 1.2) * bottomMask;

  float centerColumn = exp(-pow((uv.x - 0.5) / 0.05, 2.0));
  float topBloom = centerColumn * topMask * (0.36 + 0.64 * sin(uTime * 0.55 + uv.y * 10.0));
  float bottomBloom = centerColumn * bottomMask * (0.34 + 0.66 * sin(uTime * 0.52 + uv.y * 9.0 + 1.2));

  float cornerGlow =
    gauss2(uv, vec2(0.12, 0.12), vec2(0.20, 0.16)) * 0.55 +
    gauss2(uv, vec2(0.88, 0.12), vec2(0.20, 0.16)) * 0.55 +
    gauss2(uv, vec2(0.12, 0.88), vec2(0.20, 0.16)) * 0.55 +
    gauss2(uv, vec2(0.88, 0.88), vec2(0.20, 0.16)) * 0.55;

  float energy = clamp(top + bottom, 0.0, 1.0);
  float bloom = clamp(topBloom + bottomBloom + cornerGlow, 0.0, 1.4);

  vec3 color = vec3(0.02, 0.02, 0.02);
  color += vec3(0.08, 0.10, 0.10) * energy;
  color += vec3(0.20, 0.26, 0.27) * bloom * 0.42;
  color += vec3(0.10, 0.14, 0.15) * energy * bloom * 0.22;

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

function VanishingPointField({ className }: { className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const shouldReduceMotion = useReducedMotion();

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

			const activateProgram = gl.useProgram.bind(gl);
			activateProgram(program);
			gl.bindVertexArray(vao);
			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.uniform1f(timeLocation, elapsed);
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
	}, [shouldReduceMotion]);

	return (
		<div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
		</div>
	);
}

interface VanishingPointBandProps {
	children: ReactNode;
	className?: string;
	contentClassName?: string;
}

export function VanishingPointBand({
	children,
	className,
	contentClassName,
}: VanishingPointBandProps) {
	return (
		<div
			className={cn(
				"dark relative isolate w-full overflow-hidden bg-surface-950 text-surface-50",
				className,
			)}
		>
			<VanishingPointField />
			<div
				className={cn(
					"relative z-10 flex min-h-[22rem] w-full flex-col items-center justify-center px-[var(--portfolio-box-pad-mobile)] py-[var(--portfolio-space-5)] text-center sm:min-h-[24rem] sm:px-[var(--portfolio-box-pad-desktop)]",
					contentClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}
