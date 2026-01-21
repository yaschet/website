"use client";

import { shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { cn } from "@/lib/utils";

// ... (skipping unchanged lines)

import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import SunCalc from "suncalc";
import * as THREE from "three";

// --- Configuration ---
// Coordinates for Fes, Morocco
const LAT = 34.0333;
const LON = -5.0;

// --- Helper Functions ---
const getSunDirection = (sunPos: number): THREE.Vector3 => {
	// Convert 0..1 sunPos cycle (same logic as before) to approximations
	// 0.25 = sunrise (east), 0.5 = noon (up), 0.75 = sunset (west), 0.0/1.0 = midnight (down)
	// We want a normalized direction vector.
	// Noon: (0, 1, 0)
	// Sunrise: (1, 0, 0) - Approximated
	const theta = (sunPos - 0.5) * 2.0 * Math.PI; // -PI to PI
	const x = Math.sin(theta);
	const y = Math.cos(theta);
	return new THREE.Vector3(x, y, 0).normalize();
};

const getSolarState = () => {
	const now = new Date();
	try {
		const times = SunCalc.getTimes(now, LAT, LON);
		const t = now.getTime();
		const midnight = new Date(times.solarNoon);
		midnight.setHours(0, 0, 0, 0);

		let pos = 0.5;
		// Simple mapping consistent with previous reliable iteration
		if (t < times.sunrise.getTime()) {
			const d = times.sunrise.getTime() - midnight.getTime();
			pos = 0.0 + ((t - midnight.getTime()) / d) * 0.25;
		} else if (t < times.solarNoon.getTime()) {
			const d = times.solarNoon.getTime() - times.sunrise.getTime();
			pos = 0.25 + ((t - times.sunrise.getTime()) / d) * 0.25;
		} else if (t < times.sunset.getTime()) {
			const d = times.sunset.getTime() - times.solarNoon.getTime();
			pos = 0.5 + ((t - times.sunset.getTime()) / d) * 0.25;
		} else {
			// After sunset
			const nextMidnight = new Date(midnight);
			nextMidnight.setDate(midnight.getDate() + 1);
			const d = nextMidnight.getTime() - times.sunset.getTime();
			pos = 0.75 + ((t - times.sunset.getTime()) / d) * 0.25;
		}
		return pos;
	} catch {
		return 0.5;
	}
};

// --- Shader Definition ---
const AtmosphereShader = shaderMaterial(
	{
		uTime: 0,
		uResolution: new THREE.Vector2(),
		uSunDirection: new THREE.Vector3(0, 1, 0),
		uThemeState: 0, // 0: Light, 1: Dark
	},
	// Vertex Shader
	`varying vec2 vUv;
   varying vec3 vViewDir;
   void main() {
     vUv = uv;
     // Calculate view direction in world space for parallax/sky
     vec4 worldPos = modelMatrix * vec4(position, 1.0);
     vViewDir = normalize(worldPos.xyz - cameraPosition);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
	// Fragment Shader
	`
  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform float uThemeState; // 0=Light, 1=Dark
  varying vec2 vUv;
  varying vec3 vViewDir;

  // Constants
  const float PI = 3.14159265359;
  
  // --- Noise Functions (Gradient Noise for smooth transitions) ---
  vec3 hash( vec3 p ) {
      p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
                dot(p,vec3(269.5,183.3,246.1)),
                dot(p,vec3(113.5,271.9,124.6)));
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
  }

  float noise( in vec3 p ) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f*f*(3.0-2.0*f);
    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
  }

  float fbm(vec3 p) {
    float f = 0.0;
    float amp = 0.5;
    for(int i=0; i<5; i++) {
        f += amp * noise(p);
        p *= 2.02;
        amp *= 0.5;
    }
    return f;
  }

  // --- Mie Scattering (Henyey-Greenstein) ---
  // g: anisotropy factor (0.7-0.9 for clouds/silver lining)
  // costh: dot(view, sun)
  float hg(float costh, float g) {
      return (1.0 - g*g) / (4.0 * PI * pow(1.0 + g*g - 2.0*g*costh, 1.5));
  }

  void main() {
    float sunY = uSunDirection.y; // -1 (midnight) to 1 (noon)
    vec3 viewDir = normalize(vViewDir);
    float cosTheta = dot(viewDir, uSunDirection);
    
    // --- Dynamic Sky Gradient (Rayleigh Approximation) ---
    // Deep blue zenith, lighter horizon.
    // Dusk/Dawn shifts to localized oranges.
    
    // Base Colors
    vec3 dayZenith = vec3(0.0, 0.4, 0.9);
    vec3 dayHorizon = vec3(0.6, 0.8, 1.0);
    vec3 nightZenith = vec3(0.02, 0.03, 0.08);
    vec3 nightHorizon = vec3(0.05, 0.08, 0.15);
    vec3 sunsetColor = vec3(1.0, 0.6, 0.3); // Golden/Orange
    
    // Day/Night Mix Factor (0=Night, 1=Day)
    float dayFactor = smoothstep(-0.2, 0.2, sunY);
    
    // Base Sky Interpolation
    vec3 zenith = mix(nightZenith, dayZenith, dayFactor);
    vec3 horizon = mix(nightHorizon, dayHorizon, dayFactor);
    
    float horizonFactor = pow(1.0 - max(viewDir.y, 0.0), 2.5);
    vec3 skyColor = mix(zenith, horizon, horizonFactor);

    // Add Sunset Glow
    float sunGlow = exp(-max(0.0, 1.0 - cosTheta) * 5.0) * smoothstep(0.2, -0.2, abs(sunY)); 
    skyColor += sunsetColor * sunGlow * 0.8;

    // --- Parallax Clouds ---
    // 3 Layers separate by speed and 'depth' (scale)
    float totalCloud = 0.0;
    float totalLight = 0.0;
    
    // Layer 1 (Far, Slow, Large)
    vec3 p1 = vec3(vUv * 2.0, uTime * 0.02);
    float n1 = smoothstep(0.0, 0.8, fbm(p1) + 0.3);
    
    // Layer 2 (Mid, Medium)
    vec3 p2 = vec3(vUv * 3.5 + 5.0, uTime * 0.04);
    float n2 = smoothstep(0.0, 0.8, fbm(p2) + 0.2);
    
    // Layer 3 (Close, Fast, Detailed)
    vec3 p3 = vec3(vUv * 6.0 + 10.0, uTime * 0.07);
    float n3 = smoothstep(0.1, 0.9, fbm(p3));
    
    // Combine Layers (Parallax Mix)
    // Darker clouds at bottom (simulated thickness)
    float density = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    density = smoothstep(0.3, 1.0, density); // Threshold to form discrete shapes

    // --- Cloud Lighting (Mie/Silver Lining) ---
    // Forward scattering when looking near sun
    float phase = hg(cosTheta, 0.7); // 0.7 gives nice silver lining
    
    // Beer's Law approximation for absorption
    float absorption = exp(-density * 2.0); 
    
    // Final cloud color
    // Lit side is white + phase, dark side is slightly grey/blue
    vec3 cloudBase = vec3(0.95);
    vec3 cloudShadow = mix(skyColor, vec3(0.4, 0.45, 0.5), 0.5);
    
    // Lighting term: Ambient + Sun * Phase * Transmittance
    vec3 lightColor = mix(vec3(1.0), sunsetColor, 1.0 - dayFactor); // Clouds turn orange at sunset
    vec3 cloudLit = lightColor * (0.2 + phase * 2.0 * absorption);
    
    vec3 finalCloudColor = mix(cloudShadow, cloudLit, density);
    
    // --- Stars (Night Only) ---
    float starDensity = 0.0;
    if (dayFactor < 0.5) {
        vec2 starUV = vUv * 30.0;
        vec2 id = floor(starUV);
        vec2 f = fract(starUV);
        // Simple Voronoi center
        float k = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
        if (k > 0.96) {
             float starSize = (k - 0.96) / 0.04; // 0..1
             // Twinkle
             float twinkle = 0.5 + 0.5 * sin(uTime * 5.0 + k * 100.0);
             starDensity = starSize * twinkle * smoothstep(0.5, -0.2, sunY);
        }
    }

    // --- Final Composition ---
    vec3 finalColor = skyColor + vec3(starDensity);
    
    // Alpha blend clouds
    finalColor = mix(finalColor, finalCloudColor, density * clamp(dayFactor + 0.5, 0.0, 1.0)); // Clouds invisible at deep night? No, mostly dark.

    // Dither to prevent banding
    float dither = fract(sin(dot(vUv, vec2(12.9898,78.233))) * 43758.5453) * 0.02;
    finalColor += dither;

    gl_FragColor = vec4(finalColor, 1.0);
  }`,
);

extend({ AtmosphereShader });

// --- TypeScript Declarations ---
declare module "@react-three/fiber" {
	interface ThreeElements {
		atmosphereShader: {
			attach?: string;
			// biome-ignore lint/suspicious/noExplicitAny: R3F generic pass-through
			args?: any[];
			ref?: React.Ref<THREE.ShaderMaterial>;
			key?: React.Key;
			uTime?: number;
			uResolution?: THREE.Vector2;
			uSunDirection?: THREE.Vector3;
			uThemeState?: number;
		};
	}
}

// --- Component ---
const Scene = ({ initialSunPos, theme }: { initialSunPos: number; theme: string | undefined }) => {
	const materialRef = useRef<THREE.ShaderMaterial>(null);
	const { resolvedTheme } = useTheme();

	// Initialize state refs to avoid re-calculating on every frame
	const stateRef = useRef({
		sunPos: initialSunPos,
		sunDir: getSunDirection(initialSunPos),
		themeState: theme === "dark" ? 1.0 : 0.0,
	});

	useFrame((state) => {
		if (!materialRef.current) return;

		const shader = materialRef.current;

		// Update Time
		// @ts-expect-error
		shader.uTime = state.clock.getElapsedTime();

		// Target States
		const targetSunPos = getSolarState(); // Recalculate precisely
		const targetTheme = resolvedTheme === "dark" ? 1.0 : 0.0; // 1=Dark, 0=Light

		// Lerp for smoothness (prevent jumps)
		const lerpSpeed = 0.02; // Very slow, natural drift
		stateRef.current.sunPos = THREE.MathUtils.lerp(
			stateRef.current.sunPos,
			targetSunPos,
			lerpSpeed,
		);
		stateRef.current.themeState = THREE.MathUtils.lerp(
			stateRef.current.themeState,
			targetTheme,
			0.05,
		); // Faster theme switch

		// Update Derived Uniforms
		stateRef.current.sunDir.copy(getSunDirection(stateRef.current.sunPos));

		// Apply to Shader
		// @ts-expect-error
		shader.uSunDirection.copy(stateRef.current.sunDir);
		// @ts-expect-error
		shader.uThemeState = stateRef.current.themeState;
	});

	return (
		<mesh scale={[2, 2, 1]}>
			<planeGeometry />
			<atmosphereShader
				ref={materialRef}
				uTime={0}
				uThemeState={stateRef.current.themeState}
				uSunDirection={stateRef.current.sunDir}
			/>
		</mesh>
	);
};

export const AtmosphereCanvas = ({ className }: { className?: string }) => {
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme } = useTheme();

	// Instant pre-calc for SSR/Hydration match (prevents red flash)
	const initialSunPos = useMemo(() => getSolarState(), []);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Avoid hydration mismatch by rendering a static bg first, then canvas
	if (!mounted) {
		return (
			<div
				className={cn(
					"absolute inset-0 -z-20 h-full w-full bg-slate-100 dark:bg-slate-950",
					className,
				)}
			/>
		);
	}

	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 -z-20 h-full w-full overflow-hidden",
				className,
			)}
		>
			<Canvas
				camera={{ position: [0, 0, 1] }}
				dpr={0.25} // Low resolution for performance (Parallax noise is heavy)
				gl={{
					antialias: false,
					powerPreference: "high-performance",
					alpha: true,
					depth: false,
					stencil: false,
				}}
				orthographic
			>
				<Scene initialSunPos={initialSunPos} theme={resolvedTheme} />
			</Canvas>
		</div>
	);
};
