"use client";

/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const vertexShader = `
precision highp float;
varying vec2 vUv;

void main() {
	vUv = uv;
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * viewPosition;
}
`;

const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform float alphaStrength;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
uniform float colorNum;
uniform float pixelSize;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 p) {
	vec4 pi = floor(p.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
	vec4 pf = fract(p.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
	pi = mod289(pi);
	vec4 ix = pi.xzxz;
	vec4 iy = pi.yyww;
	vec4 fx = pf.xzxz;
	vec4 fy = pf.yyww;
	vec4 i = permute(permute(ix) + iy);
	vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
	vec4 gy = abs(gx) - 0.5;
	vec4 tx = floor(gx + 0.5);
	gx = gx - tx;
	vec2 g00 = vec2(gx.x, gy.x);
	vec2 g10 = vec2(gx.y, gy.y);
	vec2 g01 = vec2(gx.z, gy.z);
	vec2 g11 = vec2(gx.w, gy.w);
	vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
	g00 *= norm.x;
	g01 *= norm.y;
	g10 *= norm.z;
	g11 *= norm.w;
	float n00 = dot(g00, vec2(fx.x, fy.x));
	float n10 = dot(g10, vec2(fx.y, fy.y));
	float n01 = dot(g01, vec2(fx.z, fy.z));
	float n11 = dot(g11, vec2(fx.w, fy.w));
	vec2 fadeXY = fade(pf.xy);
	vec2 nX = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);
	return 2.3 * mix(nX.x, nX.y, fadeXY.y);
}

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 1.0;
	float frequency = 1.0;

	for (int i = 0; i < 4; i++) {
		value += amplitude * abs(cnoise((p * waveFrequency) * frequency));
		amplitude *= waveAmplitude;
		frequency *= 1.85;
	}

	return value;
}

float pattern(vec2 p) {
	vec2 drift = vec2(time * waveSpeed, time * waveSpeed * 0.65);
	return fbm(p + fbm(p - drift));
}

const float bayerMatrix8x8[64] = float[64](
	0.0 / 64.0, 48.0 / 64.0, 12.0 / 64.0, 60.0 / 64.0, 3.0 / 64.0, 51.0 / 64.0, 15.0 / 64.0, 63.0 / 64.0,
	32.0 / 64.0, 16.0 / 64.0, 44.0 / 64.0, 28.0 / 64.0, 35.0 / 64.0, 19.0 / 64.0, 47.0 / 64.0, 31.0 / 64.0,
	8.0 / 64.0, 56.0 / 64.0, 4.0 / 64.0, 52.0 / 64.0, 11.0 / 64.0, 59.0 / 64.0, 7.0 / 64.0, 55.0 / 64.0,
	40.0 / 64.0, 24.0 / 64.0, 36.0 / 64.0, 20.0 / 64.0, 43.0 / 64.0, 27.0 / 64.0, 39.0 / 64.0, 23.0 / 64.0,
	2.0 / 64.0, 50.0 / 64.0, 14.0 / 64.0, 62.0 / 64.0, 1.0 / 64.0, 49.0 / 64.0, 13.0 / 64.0, 61.0 / 64.0,
	34.0 / 64.0, 18.0 / 64.0, 46.0 / 64.0, 30.0 / 64.0, 33.0 / 64.0, 17.0 / 64.0, 45.0 / 64.0, 29.0 / 64.0,
	10.0 / 64.0, 58.0 / 64.0, 6.0 / 64.0, 54.0 / 64.0, 9.0 / 64.0, 57.0 / 64.0, 5.0 / 64.0, 53.0 / 64.0,
	42.0 / 64.0, 26.0 / 64.0, 38.0 / 64.0, 22.0 / 64.0, 41.0 / 64.0, 25.0 / 64.0, 37.0 / 64.0, 21.0 / 64.0
);

vec3 applyDither(vec2 fragCoord, vec3 color) {
	vec2 scaledCoord = floor(fragCoord / max(pixelSize, 1.0));
	int x = int(mod(scaledCoord.x, 8.0));
	int y = int(mod(scaledCoord.y, 8.0));
	float threshold = bayerMatrix8x8[(y * 8) + x] - 0.25;
	float levels = max(colorNum - 1.0, 1.0);
	float stepSize = 1.0 / levels;
	color += threshold * stepSize;
	return floor(color * levels + 0.5) / levels;
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec2 centered = uv - 0.5;
	centered.x *= resolution.x / resolution.y;
	centered *= 1.15;

	float field = pattern(centered);

	if (enableMouseInteraction == 1) {
		vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
		mouseNDC.x *= resolution.x / resolution.y;
		float dist = length(centered - mouseNDC);
		float influence = 1.0 - smoothstep(0.0, mouseRadius, dist);
		field -= 0.32 * influence;
	}

	field = smoothstep(0.05, 0.9, field);
	field = pow(clamp(field, 0.0, 1.0), 1.2);

	vec3 color = waveColor * field;
	color = applyDither(gl_FragCoord.xy, color);

	float alpha = clamp(field * alphaStrength, 0.0, 1.0);
	gl_FragColor = vec4(color, alpha);
}
`;

type DitherConfig = {
	waveSpeed: number;
	waveFrequency: number;
	waveAmplitude: number;
	waveColor: [number, number, number];
	colorNum: number;
	pixelSize: number;
	enableMouseInteraction: boolean;
	mouseRadius: number;
	alphaStrength: number;
	disableAnimation: boolean;
};

interface DitherProps {
	className?: string;
	waveSpeed?: number;
	waveFrequency?: number;
	waveAmplitude?: number;
	colorNum?: number;
	pixelSize?: number;
	mouseRadius?: number;
	disableAnimation?: boolean;
	enableMouseInteraction?: boolean;
}

function DitherPlane({ config }: { config: DitherConfig }) {
	const { viewport, size, gl } = useThree();
	const mouseRef = useRef(new THREE.Vector2(-9999, -9999));
	const lastColorRef = useRef<[number, number, number]>(config.waveColor);
	const uniformsRef = useRef({
		time: new THREE.Uniform(0),
		resolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
		waveSpeed: new THREE.Uniform(config.waveSpeed),
		waveFrequency: new THREE.Uniform(config.waveFrequency),
		waveAmplitude: new THREE.Uniform(config.waveAmplitude),
		waveColor: new THREE.Uniform(new THREE.Color(...config.waveColor)),
		alphaStrength: new THREE.Uniform(config.alphaStrength),
		mousePos: new THREE.Uniform(new THREE.Vector2(-9999, -9999)),
		enableMouseInteraction: new THREE.Uniform(config.enableMouseInteraction ? 1 : 0),
		mouseRadius: new THREE.Uniform(config.mouseRadius),
		colorNum: new THREE.Uniform(config.colorNum),
		pixelSize: new THREE.Uniform(config.pixelSize),
	});

	useEffect(() => {
		const dpr = gl.getPixelRatio();
		uniformsRef.current.resolution.value.set(
			Math.floor(size.width * dpr),
			Math.floor(size.height * dpr),
		);
	}, [gl, size.height, size.width]);

	useEffect(() => {
		if (!config.enableMouseInteraction) return;

		const handlePointerMove = (event: PointerEvent) => {
			const rect = gl.domElement.getBoundingClientRect();
			const dpr = gl.getPixelRatio();

			mouseRef.current.set(
				(event.clientX - rect.left) * dpr,
				(event.clientY - rect.top) * dpr,
			);
		};

		window.addEventListener("pointermove", handlePointerMove, { passive: true });
		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
		};
	}, [config.enableMouseInteraction, gl]);

	useFrame(({ clock }) => {
		const uniforms = uniformsRef.current;

		if (!config.disableAnimation) {
			uniforms.time.value = clock.getElapsedTime();
		}

		uniforms.waveSpeed.value = config.waveSpeed;
		uniforms.waveFrequency.value = config.waveFrequency;
		uniforms.waveAmplitude.value = config.waveAmplitude;
		uniforms.alphaStrength.value = config.alphaStrength;
		uniforms.enableMouseInteraction.value = config.enableMouseInteraction ? 1 : 0;
		uniforms.mouseRadius.value = config.mouseRadius;
		uniforms.colorNum.value = config.colorNum;
		uniforms.pixelSize.value = config.pixelSize;
		uniforms.mousePos.value.copy(mouseRef.current);

		if (
			lastColorRef.current[0] !== config.waveColor[0] ||
			lastColorRef.current[1] !== config.waveColor[1] ||
			lastColorRef.current[2] !== config.waveColor[2]
		) {
			uniforms.waveColor.value.setRGB(
				config.waveColor[0],
				config.waveColor[1],
				config.waveColor[2],
			);
			lastColorRef.current = config.waveColor;
		}
	});

	return (
		<mesh scale={[viewport.width, viewport.height, 1]}>
			<planeGeometry args={[1, 1]} />
			<shaderMaterial
				fragmentShader={fragmentShader}
				vertexShader={vertexShader}
				uniforms={uniformsRef.current}
				transparent
				depthTest={false}
				depthWrite={false}
			/>
		</mesh>
	);
}

export default function Dither({
	className,
	waveSpeed = 0.03,
	waveFrequency = 3.8,
	waveAmplitude = 0.04,
	colorNum = 3,
	pixelSize = 2,
	mouseRadius = 0.8,
	disableAnimation = false,
	enableMouseInteraction = true,
}: DitherProps) {
	const { resolvedTheme } = useTheme();
	const prefersReducedMotion = useReducedMotion();
	const [isCompactSurface, setIsCompactSurface] = useState(false);
	const shouldReduceMotion = Boolean(prefersReducedMotion);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
		const syncSurface = () => {
			setIsCompactSurface(mediaQuery.matches);
		};

		syncSurface();
		mediaQuery.addEventListener("change", syncSurface);
		return () => {
			mediaQuery.removeEventListener("change", syncSurface);
		};
	}, []);

	const isDark = resolvedTheme !== "light";
	const compactMultiplier = isCompactSurface ? 0.75 : 1;

	const config: DitherConfig = {
		waveSpeed: waveSpeed * (isCompactSurface ? 0.85 : 1),
		waveFrequency,
		waveAmplitude: waveAmplitude * compactMultiplier,
		waveColor: isDark ? [0.0627, 0.7255, 0.5059] : [0.0588, 0.2314, 0.1804],
		colorNum: isCompactSurface ? 2 : colorNum,
		pixelSize: isCompactSurface ? pixelSize + 1 : pixelSize,
		enableMouseInteraction: enableMouseInteraction && !isCompactSurface && !shouldReduceMotion,
		mouseRadius,
		alphaStrength: isDark ? (isCompactSurface ? 0.24 : 0.3) : 0.12,
		disableAnimation: disableAnimation || shouldReduceMotion,
	};

	return (
		<div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
			<Canvas
				className="h-full w-full"
				camera={{ position: [0, 0, 1] }}
				dpr={1}
				gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
				onCreated={({ gl }) => {
					gl.setClearColor(0x000000, 0);
				}}
			>
				<DitherPlane config={config} />
			</Canvas>
		</div>
	);
}
