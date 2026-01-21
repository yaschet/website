"use client";

import { shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SunCalc from "suncalc";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { useSwissGrid } from "./swiss-grid-canvas";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Geographic coordinates for Fes, Morocco */
const LAT = 34.0333;
const LON = -5.0;

/** Raymarching quality settings */
const CLOUD_STEPS = 32;
const CLOUD_LIGHT_STEPS = 6;

// ═══════════════════════════════════════════════════════════════════════════
// SOLAR CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

interface SolarData {
	/** Sun altitude in radians (-PI/2 to PI/2) */
	altitude: number;
	/** Sun azimuth in radians */
	azimuth: number;
	/** Normalized sun position (0-1, 0.5 = noon) */
	normalizedPosition: number;
}

/**
 * Calculates real sun position using SunCalc library.
 * @returns Solar data including altitude, azimuth, and normalized position
 */
const getSolarData = (): SolarData => {
	const now = new Date();
	try {
		const sunPosition = SunCalc.getPosition(now, LAT, LON);
		const times = SunCalc.getTimes(now, LAT, LON);

		const t = now.getTime();
		const sunrise = times.sunrise.getTime();
		const sunset = times.sunset.getTime();
		const solarNoon = times.solarNoon.getTime();

		let normalizedPosition = 0.5;

		if (t < sunrise) {
			// Before sunrise (night -> dawn)
			const midnight = new Date(now);
			midnight.setHours(0, 0, 0, 0);
			const midnightTime = midnight.getTime();
			normalizedPosition = ((t - midnightTime) / (sunrise - midnightTime)) * 0.25;
		} else if (t < solarNoon) {
			// Morning (sunrise -> noon)
			normalizedPosition = 0.25 + ((t - sunrise) / (solarNoon - sunrise)) * 0.25;
		} else if (t < sunset) {
			// Afternoon (noon -> sunset)
			normalizedPosition = 0.5 + ((t - solarNoon) / (sunset - solarNoon)) * 0.25;
		} else {
			// After sunset (dusk -> night)
			const nextMidnight = new Date(now);
			nextMidnight.setDate(now.getDate() + 1);
			nextMidnight.setHours(0, 0, 0, 0);
			const nextMidnightTime = nextMidnight.getTime();
			normalizedPosition = 0.75 + ((t - sunset) / (nextMidnightTime - sunset)) * 0.25;
		}

		return {
			altitude: sunPosition.altitude,
			azimuth: sunPosition.azimuth,
			normalizedPosition: Math.max(0, Math.min(1, normalizedPosition)),
		};
	} catch {
		// Fallback for invalid dates or calculation errors
		return {
			altitude: Math.PI / 4, // 45 degrees
			azimuth: 0,
			normalizedPosition: 0.5,
		};
	}
};

/**
 * Converts solar position to a normalized 3D direction vector.
 * @param solarData - Solar position data
 * @returns Normalized Vector3 pointing toward the sun
 */
const getSunDirection = (solarData: SolarData): THREE.Vector3 => {
	const { altitude, azimuth } = solarData;
	// Convert spherical to Cartesian (Y-up coordinate system)
	const y = Math.sin(altitude);
	const horizontalRadius = Math.cos(altitude);
	const x = horizontalRadius * Math.sin(azimuth);
	const z = -horizontalRadius * Math.cos(azimuth);
	return new THREE.Vector3(x, y, z).normalize();
};

// ═══════════════════════════════════════════════════════════════════════════
// GLSL SHADER CODE
// ═══════════════════════════════════════════════════════════════════════════

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uSunDirection;
uniform float uSunAltitude;
uniform float uThemeState;

varying vec2 vUv;
varying vec3 vWorldPosition;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

#define PI 3.14159265359
#define TAU 6.28318530718

// Atmosphere parameters
#define ATMOSPHERE_RADIUS 6471000.0
#define EARTH_RADIUS 6371000.0
#define RAYLEIGH_SCALE_HEIGHT 8500.0
#define MIE_SCALE_HEIGHT 1200.0

// Scattering coefficients (wavelength-dependent for Rayleigh)
#define RAYLEIGH_COEFFICIENT vec3(5.8e-6, 13.5e-6, 33.1e-6)
#define MIE_COEFFICIENT 2.0e-5

// Cloud parameters
#define CLOUD_BASE 1500.0
#define CLOUD_TOP 4000.0
#define CLOUD_COVERAGE 0.45

// Raymarching
const int CLOUD_STEPS = ${CLOUD_STEPS};
const int CLOUD_LIGHT_STEPS = ${CLOUD_LIGHT_STEPS};

// ═══════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// High-quality 3D hash
vec3 hash33(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float hash31(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Gradient noise (Perlin-like)
float gradientNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(dot(hash33(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
          dot(hash33(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
      mix(dot(hash33(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
          dot(hash33(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(
      mix(dot(hash33(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
          dot(hash33(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
      mix(dot(hash33(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
          dot(hash33(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y),
    u.z
  );
}

// Worley noise for cloud detail
float worleyNoise(vec3 p) {
  vec3 id = floor(p);
  vec3 fd = fract(p);

  float minDist = 1.0;

  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      for (int z = -1; z <= 1; z++) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 h = hash33(id + offset) * 0.5 + 0.5;
        h += offset - fd;
        float d = dot(h, h);
        minDist = min(minDist, d);
      }
    }
  }

  return 1.0 - sqrt(minDist);
}

// FBM with domain warping for volumetric clouds
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * gradientNoise(p * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
    p += vec3(1.7, 9.2, 3.1); // Domain shift
  }

  return value / maxValue;
}

// Volumetric cloud noise (Perlin-Worley hybrid)
float cloudNoise(vec3 p) {
  float perlin = fbm(p * 0.5, 5);
  float worley = worleyNoise(p * 2.0);
  // Remap: clouds form in high-perlin, low-worley regions
  return perlin - worley * 0.3;
}

// ═══════════════════════════════════════════════════════════════════════════
// ATMOSPHERIC SCATTERING
// ═══════════════════════════════════════════════════════════════════════════

// Rayleigh phase function
float rayleighPhase(float cosTheta) {
  return (3.0 / (16.0 * PI)) * (1.0 + cosTheta * cosTheta);
}

// Mie phase function (Henyey-Greenstein)
float miePhase(float cosTheta, float g) {
  float gg = g * g;
  float denom = 1.0 + gg - 2.0 * g * cosTheta;
  return (1.0 - gg) / (4.0 * PI * pow(denom, 1.5));
}

// Cornette-Shanks Mie phase (more accurate)
float cornetteShanksPhase(float cosTheta, float g) {
  float gg = g * g;
  float num = 3.0 * (1.0 - gg) * (1.0 + cosTheta * cosTheta);
  float denom = 8.0 * PI * (2.0 + gg) * pow(1.0 + gg - 2.0 * g * cosTheta, 1.5);
  return num / denom;
}

// Calculate atmospheric color based on view direction and sun position
vec3 atmosphericScattering(vec3 viewDir, vec3 sunDir, float dayFactor) {
  float cosTheta = dot(viewDir, sunDir);
  float cosViewZenith = viewDir.y;

  // Rayleigh scattering creates blue sky
  vec3 rayleigh = RAYLEIGH_COEFFICIENT * rayleighPhase(cosTheta);

  // Mie scattering creates sun halo and horizon glow
  float miePhaseValue = cornetteShanksPhase(cosTheta, 0.76);
  vec3 mie = vec3(MIE_COEFFICIENT) * miePhaseValue;

  // Optical depth approximation
  float viewZenithAngle = acos(max(0.0, cosViewZenith));
  float opticalDepth = 1.0 / max(cos(viewZenithAngle), 0.01);
  opticalDepth = min(opticalDepth, 40.0);

  // Sun intensity based on altitude
  float sunZenithCos = sunDir.y;
  float sunOpticalDepth = 1.0 / max(sunZenithCos, 0.01);
  sunOpticalDepth = min(sunOpticalDepth, 40.0);

  // Calculate inscattering
  vec3 totalExtinction = (rayleigh + mie) * opticalDepth;
  vec3 inscattering = (rayleigh + mie) * (1.0 - exp(-totalExtinction));

  // Base sky colors
  vec3 dayZenith = vec3(0.15, 0.35, 0.75);
  vec3 dayHorizon = vec3(0.55, 0.70, 0.90);
  vec3 nightZenith = vec3(0.005, 0.01, 0.025);
  vec3 nightHorizon = vec3(0.02, 0.03, 0.06);

  // Sunset/sunrise colors
  vec3 sunsetZenith = vec3(0.25, 0.15, 0.35);
  vec3 sunsetHorizon = vec3(1.0, 0.45, 0.15);

  // Time-of-day transitions
  float sunsetFactor = smoothstep(0.3, 0.0, abs(sunDir.y)) * smoothstep(-0.2, 0.1, sunDir.y);

  // Interpolate colors
  vec3 zenith = mix(nightZenith, dayZenith, dayFactor);
  zenith = mix(zenith, sunsetZenith, sunsetFactor);

  vec3 horizon = mix(nightHorizon, dayHorizon, dayFactor);
  horizon = mix(horizon, sunsetHorizon, sunsetFactor);

  // Vertical gradient with Rayleigh falloff
  float horizonBlend = pow(1.0 - max(cosViewZenith, 0.0), 3.0);
  vec3 skyColor = mix(zenith, horizon, horizonBlend);

  // Sun disk
  float sunDisk = smoothstep(0.9997, 0.9999, cosTheta);
  vec3 sunColor = mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.6, 0.3), 1.0 - dayFactor);
  skyColor += sunDisk * sunColor * 3.0 * dayFactor;

  // Sun glow (Mie contribution)
  float sunGlow = pow(max(0.0, cosTheta), 8.0) * miePhaseValue;
  vec3 glowColor = mix(vec3(1.0, 0.9, 0.7), sunsetHorizon, 1.0 - dayFactor);
  skyColor += sunGlow * glowColor * 0.5 * dayFactor;

  return skyColor;
}

// ═══════════════════════════════════════════════════════════════════════════
// VOLUMETRIC CLOUDS
// ═══════════════════════════════════════════════════════════════════════════

// Cloud density function
float cloudDensity(vec3 pos) {
  // Height falloff within cloud layer
  float heightFraction = (pos.y - CLOUD_BASE) / (CLOUD_TOP - CLOUD_BASE);
  heightFraction = clamp(heightFraction, 0.0, 1.0);

  // Vertical density profile (round bottom, flat top)
  float heightFalloff = smoothstep(0.0, 0.15, heightFraction) *
                        smoothstep(1.0, 0.7, heightFraction);

  // Base cloud shape (large scale)
  vec3 windOffset = vec3(uTime * 15.0, 0.0, uTime * 5.0);
  vec3 samplePos = pos * 0.0003 + windOffset * 0.0001;

  float baseShape = cloudNoise(samplePos);

  // Detail noise (smaller scale)
  vec3 detailPos = pos * 0.002 + windOffset * 0.0003;
  float detail = fbm(detailPos, 4) * 0.3;

  // Combine with coverage
  float density = baseShape + detail;
  density = smoothstep(1.0 - CLOUD_COVERAGE, 1.0, density * heightFalloff);

  return max(0.0, density);
}

// Light marching for cloud illumination
float cloudLightMarch(vec3 pos, vec3 sunDir) {
  float stepSize = (CLOUD_TOP - CLOUD_BASE) / float(CLOUD_LIGHT_STEPS);
  float totalDensity = 0.0;

  for (int i = 0; i < CLOUD_LIGHT_STEPS; i++) {
    pos += sunDir * stepSize;

    if (pos.y < CLOUD_BASE || pos.y > CLOUD_TOP) break;

    totalDensity += cloudDensity(pos) * stepSize * 0.001;
  }

  return exp(-totalDensity * 8.0);
}

// Main cloud raymarching
vec4 raymarchClouds(vec3 rayOrigin, vec3 rayDir, vec3 sunDir, float dayFactor) {
  // Calculate ray-cloud layer intersections
  float tMin = (CLOUD_BASE - rayOrigin.y) / rayDir.y;
  float tMax = (CLOUD_TOP - rayOrigin.y) / rayDir.y;

  if (tMin > tMax) {
    float temp = tMin;
    tMin = tMax;
    tMax = temp;
  }

  tMin = max(0.0, tMin);
  tMax = max(0.0, tMax);

  if (tMin >= tMax) return vec4(0.0);

  float stepSize = (tMax - tMin) / float(CLOUD_STEPS);
  vec3 pos = rayOrigin + rayDir * tMin;

  vec3 cloudColor = vec3(0.0);
  float transmittance = 1.0;

  // Mie phase for silver lining
  float cosTheta = dot(rayDir, sunDir);
  float phase = cornetteShanksPhase(cosTheta, 0.8);

  // Sun color varies with altitude
  vec3 sunLightColor = mix(vec3(1.0, 0.5, 0.25), vec3(1.0, 0.95, 0.9), dayFactor);

  // Ambient sky light
  vec3 ambientLight = mix(vec3(0.05, 0.08, 0.15), vec3(0.4, 0.5, 0.7), dayFactor);

  for (int i = 0; i < CLOUD_STEPS; i++) {
    if (transmittance < 0.01) break;

    float density = cloudDensity(pos);

    if (density > 0.001) {
      // Light marching
      float lightTransmittance = cloudLightMarch(pos, sunDir);

      // Direct lighting with phase function
      vec3 directLight = sunLightColor * lightTransmittance * phase * 2.0;

      // Ambient lighting (scattered sky light)
      float heightFraction = (pos.y - CLOUD_BASE) / (CLOUD_TOP - CLOUD_BASE);
      vec3 ambient = ambientLight * (0.3 + 0.7 * heightFraction);

      // Multi-scattering approximation
      vec3 multiScatter = sunLightColor * 0.1 * (1.0 - lightTransmittance);

      // Combine lighting
      vec3 luminance = directLight + ambient + multiScatter;

      // Beer-Lambert absorption
      float absorption = exp(-density * stepSize * 0.01);
      float contribution = (1.0 - absorption) * transmittance;

      cloudColor += luminance * contribution;
      transmittance *= absorption;
    }

    pos += rayDir * stepSize;
  }

  return vec4(cloudColor, 1.0 - transmittance);
}

// ═══════════════════════════════════════════════════════════════════════════
// STAR FIELD
// ═══════════════════════════════════════════════════════════════════════════

float voronoiStars(vec2 uv, float time) {
  vec2 id = floor(uv);
  vec2 fd = fract(uv);

  float minDist = 1.0;
  vec2 nearestPoint = vec2(0.0);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 n = hash22(id + offset) * 0.5 + 0.5;

      vec2 point = offset + n - fd;
      float d = length(point);

      if (d < minDist) {
        minDist = d;
        nearestPoint = n;
      }
    }
  }

  // Star intensity based on hash
  float intensity = hash31(vec3(id, 0.0));

  // Only show ~15% of cells as stars
  if (intensity < 0.85) return 0.0;

  // Star brightness varies
  float brightness = smoothstep(0.85, 1.0, intensity);

  // Twinkle effect
  float twinkle = 0.7 + 0.3 * sin(time * 3.0 + intensity * 50.0);

  // Sharp star with soft falloff
  float star = smoothstep(0.1, 0.0, minDist) * brightness * twinkle;

  return star;
}

vec3 renderStars(vec2 uv, float nightFactor, float time) {
  if (nightFactor < 0.01) return vec3(0.0);

  // Multiple star layers at different scales
  float stars = 0.0;

  // Bright stars (sparse)
  stars += voronoiStars(uv * 15.0, time) * 1.0;

  // Medium stars
  stars += voronoiStars(uv * 35.0 + 100.0, time * 0.7) * 0.6;

  // Dim stars (dense)
  stars += voronoiStars(uv * 80.0 + 200.0, time * 0.5) * 0.3;

  // Star color (slight blue-white variation)
  vec3 starColor = mix(vec3(0.9, 0.9, 1.0), vec3(1.0, 0.95, 0.85), hash31(vec3(uv * 10.0, 0.0)));

  return stars * starColor * nightFactor;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

void main() {
  // Reconstruct view direction from UV
  vec2 centeredUv = vUv * 2.0 - 1.0;
  centeredUv.x *= uResolution.x / uResolution.y;

  // Spherical projection for sky dome effect
  float len = length(centeredUv);
  float elevation = (1.0 - len * 0.3) * PI * 0.5;
  float azimuth = atan(centeredUv.y, centeredUv.x);

  vec3 viewDir = normalize(vec3(
    cos(elevation) * cos(azimuth),
    sin(elevation),
    cos(elevation) * sin(azimuth)
  ));

  // Normalize sun direction
  vec3 sunDir = normalize(uSunDirection);

  // Day/night factor based on sun altitude
  float dayFactor = smoothstep(-0.15, 0.25, uSunAltitude);

  // Theme influence (dark theme pushes toward night)
  float themeNightBoost = uThemeState * 0.4;
  dayFactor = max(0.0, dayFactor - themeNightBoost);

  // === Atmospheric Sky ===
  vec3 skyColor = atmosphericScattering(viewDir, sunDir, dayFactor);

  // === Stars (night only) ===
  float nightFactor = 1.0 - dayFactor;
  nightFactor = smoothstep(0.0, 0.5, nightFactor);
  vec3 stars = renderStars(vUv, nightFactor, uTime);
  skyColor += stars;

  // === Volumetric Clouds ===
  // Camera position (high altitude observer)
  vec3 rayOrigin = vec3(0.0, 500.0, 0.0);

  vec4 clouds = raymarchClouds(rayOrigin, viewDir, sunDir, dayFactor);

  // Blend clouds with sky
  skyColor = mix(skyColor, clouds.rgb, clouds.a * (0.4 + 0.6 * dayFactor));

  // === Dark Theme Adjustments ===
  // Desaturate and darken for dark theme
  float desatAmount = uThemeState * 0.3;
  float luma = dot(skyColor, vec3(0.299, 0.587, 0.114));
  skyColor = mix(skyColor, vec3(luma), desatAmount);
  skyColor *= 1.0 - uThemeState * 0.25;

  // === Dithering (prevent banding) ===
  float dither = hash31(vec3(gl_FragCoord.xy, uTime * 0.01)) * 0.02 - 0.01;
  skyColor += dither;

  // === Tone mapping (subtle) ===
  skyColor = skyColor / (1.0 + skyColor * 0.1);

  // === Gamma correction ===
  skyColor = pow(skyColor, vec3(1.0 / 2.2));

  // Ensure no negative values
  skyColor = max(vec3(0.0), skyColor);

  gl_FragColor = vec4(skyColor, 1.0);
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// SHADER MATERIAL
// ═══════════════════════════════════════════════════════════════════════════

const AtmosphereShaderMaterial = shaderMaterial(
	{
		uTime: 0,
		uResolution: new THREE.Vector2(1, 1),
		uSunDirection: new THREE.Vector3(0, 1, 0),
		uSunAltitude: 0.5,
		uThemeState: 0,
	},
	vertexShader,
	fragmentShader,
);

extend({ AtmosphereShaderMaterial });

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DECLARATIONS
// ═══════════════════════════════════════════════════════════════════════════

declare module "@react-three/fiber" {
	interface ThreeElements {
		atmosphereShaderMaterial: {
			attach?: string;
			ref?: React.Ref<THREE.ShaderMaterial & AtmosphereUniforms>;
			key?: React.Key;
			uTime?: number;
			uResolution?: THREE.Vector2;
			uSunDirection?: THREE.Vector3;
			uSunAltitude?: number;
			uThemeState?: number;
		};
	}
}

interface AtmosphereUniforms {
	uTime: number;
	uResolution: THREE.Vector2;
	uSunDirection: THREE.Vector3;
	uSunAltitude: number;
	uThemeState: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SceneProps {
	initialSolarData: SolarData;
	theme: string | undefined;
}

const Scene = ({ initialSolarData, theme }: SceneProps) => {
	const materialRef = useRef<THREE.ShaderMaterial & AtmosphereUniforms>(null);
	const { resolvedTheme } = useTheme();
	const { size, viewport } = useThree();

	// Mutable refs for animation state (avoids React re-renders)
	const stateRef = useRef({
		solarData: initialSolarData,
		sunDirection: getSunDirection(initialSolarData),
		themeState: theme === "dark" ? 1.0 : 0.0,
		lastSolarUpdate: Date.now(),
	});

	// Update resolution uniform when viewport changes
	useEffect(() => {
		if (materialRef.current) {
			materialRef.current.uResolution.set(size.width, size.height);
		}
	}, [size.width, size.height]);

	useFrame((state) => {
		const material = materialRef.current;
		if (!material) return;

		const now = Date.now();
		const elapsed = state.clock.getElapsedTime();

		// Update time uniform
		material.uTime = elapsed;

		// Update solar position every 10 seconds (expensive calculation)
		if (now - stateRef.current.lastSolarUpdate > 10000) {
			stateRef.current.solarData = getSolarData();
			stateRef.current.lastSolarUpdate = now;
		}

		// Target values
		const targetSunDir = getSunDirection(stateRef.current.solarData);
		const targetThemeState = resolvedTheme === "dark" ? 1.0 : 0.0;

		// Smooth interpolation
		const sunLerp = 0.02;
		const themeLerp = 0.08;

		stateRef.current.sunDirection.lerp(targetSunDir, sunLerp);
		stateRef.current.themeState = THREE.MathUtils.lerp(
			stateRef.current.themeState,
			targetThemeState,
			themeLerp,
		);

		// Apply uniforms
		material.uSunDirection.copy(stateRef.current.sunDirection);
		material.uSunAltitude = stateRef.current.solarData.altitude;
		material.uThemeState = stateRef.current.themeState;
	});

	// Full-screen quad that covers viewport
	const scale = useMemo(() => {
		return [viewport.width, viewport.height, 1] as [number, number, number];
	}, [viewport.width, viewport.height]);

	return (
		<mesh scale={scale}>
			<planeGeometry args={[1, 1]} />
			<atmosphereShaderMaterial
				ref={materialRef}
				uTime={0}
				uResolution={new THREE.Vector2(size.width, size.height)}
				uSunDirection={stateRef.current.sunDirection}
				uSunAltitude={initialSolarData.altitude}
				uThemeState={stateRef.current.themeState}
			/>
		</mesh>
	);
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AtmosphereCanvasProps {
	/** Additional CSS classes */
	className?: string;
	/** Override hour for testing (0-24). Only used in development/Storybook. */
	debugHour?: number;
}

/**
 * Creates a mock SolarData object from a debug hour value.
 * @param hour - Hour of day (0-24)
 * @returns SolarData with approximate values for that time
 */
const createDebugSolarData = (hour: number): SolarData => {
	// Normalize hour to 0-24 range
	const h = ((hour % 24) + 24) % 24;

	// Approximate sun altitude based on hour
	// Sunrise ~6am, sunset ~18pm, noon = highest
	const solarNoon = 12;
	const hourFromNoon = Math.abs(h - solarNoon);
	const maxAltitude = Math.PI / 2.5; // ~72 degrees at noon

	let altitude: number;
	if (h >= 6 && h <= 18) {
		// Daytime: parabolic curve
		altitude = maxAltitude * (1 - (hourFromNoon / 6) ** 2);
	} else {
		// Nighttime: negative altitude
		const nightProgress = h >= 18 ? (h - 18) / 12 : (h + 6) / 12;
		altitude = (-Math.PI / 6) * Math.sin(nightProgress * Math.PI);
	}

	// Simple azimuth approximation (east to west)
	const azimuth = ((h - 6) / 12) * Math.PI;

	// Normalized position
	const normalizedPosition = h / 24;

	return {
		altitude,
		azimuth,
		normalizedPosition,
	};
};

/**
 * Photorealistic atmospheric sky background with volumetric clouds.
 *
 * Features:
 * - Physically-based Rayleigh and Mie scattering
 * - Volumetric raymarched clouds with Beer-Lambert lighting
 * - Procedural Voronoi star field at night
 * - Real sun position from SunCalc (Fes, Morocco)
 * - Theme-aware (syncs with next-themes)
 *
 * @param props - Component props
 * @returns Full-screen background canvas
 *
 * @example
 * <AtmosphereCanvas className="fixed inset-0 -z-20" />
 */
export const AtmosphereCanvas = ({ className, debugHour }: AtmosphereCanvasProps) => {
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme } = useTheme();
	const swissGrid = useSwissGrid();

	// Pre-calculate solar data for initial render (prevents hydration mismatch)
	const initialSolarData = useMemo(() => {
		if (debugHour !== undefined) {
			return createDebugSolarData(debugHour);
		}
		return getSolarData();
	}, [debugHour]);

	// Determine initial background color based on solar position
	const getInitialBgClass = useCallback(() => {
		const { altitude } = initialSolarData;
		// During day: light blue, during night: deep blue
		if (altitude > 0.1) {
			return "bg-sky-200 dark:bg-slate-900";
		}
		if (altitude > -0.1) {
			// Twilight
			return "bg-orange-100 dark:bg-slate-950";
		}
		// Night
		return "bg-slate-800 dark:bg-slate-950";
	}, [initialSolarData]);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Calculate container positioning from swiss grid bounds
	// Match the exact container dimensions - the grid draws ON TOP at z-[5]
	const containerStyle = useMemo(() => {
		if (!swissGrid?.containerBounds) return {};

		const { left, width } = swissGrid.containerBounds;

		// Use exact positions - no insets, no adjustments
		// The grid will naturally draw its borders on top
		return {
			left: `${left}px`,
			width: `${width}px`,
		};
	}, [swissGrid?.containerBounds]);

	// Server-side and initial client render: show static background
	if (!mounted) {
		return (
			<div
				className={cn(
					"absolute inset-y-0 z-[1] transition-colors duration-500",
					getInitialBgClass(),
					className,
				)}
				style={containerStyle}
				aria-hidden="true"
			/>
		);
	}

	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-y-0 z-[1] overflow-hidden",
				className,
			)}
			style={containerStyle}
			aria-hidden="true"
		>
			<Canvas
				camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
				dpr={[0.5, 1]} // Adaptive DPR for performance
				gl={{
					antialias: false,
					powerPreference: "high-performance",
					alpha: false,
					depth: false,
					stencil: false,
					preserveDrawingBuffer: false,
				}}
				orthographic
				frameloop="always"
				flat
				style={{ position: "absolute", inset: 0, zIndex: 1 }}
			>
				<Scene initialSolarData={initialSolarData} theme={resolvedTheme} />
			</Canvas>
		</div>
	);
};
