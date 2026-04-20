"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRevealState } from "@/src/components/providers/reveal-provider";
import { tweens } from "@/src/lib/index";
import {
	computeGridAxis,
	type DotGridLength,
	type DotGridOrigin,
	resolveLength,
} from "./dot-grid-metrics";

export type InstrumentFieldVariant = "terrain" | "pulse" | "ray";
export type InstrumentSurface = "hero" | "header" | "band" | "strip";
export type InstrumentFieldTone = "auto" | "light" | "dark" | "inverted";

interface InstrumentFieldProps {
	className?: string;
	interactive?: boolean;
	step?: DotGridLength;
	minInset?: DotGridLength;
	radius?: number;
	origin?: DotGridOrigin;
	speed?: number;
	surface?: InstrumentSurface;
	variant?: InstrumentFieldVariant;
	tone?: InstrumentFieldTone;
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

interface AlphaTone {
	alpha: number;
}

interface AlphaPalette {
	active: [AlphaTone, AlphaTone, AlphaTone, AlphaTone];
	underlay: [AlphaTone, AlphaTone, AlphaTone, AlphaTone];
}

const DARK_ALPHA_PALETTE: AlphaPalette = {
	active: [{ alpha: 0.16 }, { alpha: 0.28 }, { alpha: 0.44 }, { alpha: 0.64 }],
	underlay: [{ alpha: 0.12 }, { alpha: 0.18 }, { alpha: 0.2 }, { alpha: 0.24 }],
};

const LIGHT_ALPHA_PALETTE: AlphaPalette = {
	active: [{ alpha: 0.26 }, { alpha: 0.4 }, { alpha: 0.6 }, { alpha: 0.78 }],
	underlay: [{ alpha: 0.02 }, { alpha: 0.14 }, { alpha: 0.2 }, { alpha: 0.25 }],
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
uniform float uVariant;
uniform float uSurface;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform vec3  uBG;

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

float terrainFieldValue(vec2 uv, float time) {
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  mat2 orient = mat2(0.951, -0.309, 0.309, 0.951);
  vec2 base = orient * p;
  vec2 shaped = vec2(base.x * 0.56 + base.y * 0.18, base.y * 1.42 - base.x * 0.08);

  vec2 warp = vec2(
    snoise(vec3(shaped * 0.48 + vec2(1.2, -0.8), time * 0.070)),
    snoise(vec3(shaped * 0.44 + vec2(-3.7, 2.4), time * 0.070))
  );

  vec2 q = shaped * 1.12 + vec2(warp.x * 0.10, warp.y * 0.075);

  float coarse = snoise(vec3(q * 0.58, time * 0.086));
  float middle = snoise(vec3(q * 0.90 + vec2(2.7, -1.6), time * 0.108));
  vec2 seamQ = vec2(q.x * 1.26 + q.y * 0.32, q.y * 0.68 - q.x * 0.10);
  float seamSeed = snoise(vec3(seamQ * 0.98 + vec2(-4.4, 3.1), time * 0.094));
  float seam = smoothstep(0.10, 0.62, 1.0 - abs(seamSeed));
  float detail = snoise(vec3(q * 1.30 + vec2(1.3, -2.1), time * 0.120));
  float plane = q.x * 0.36 + q.y * 0.10;

  float field = coarse * 0.60 + middle * 0.08 + (seam - 0.5) * 0.24 + plane * 0.14 + detail * 0.01;
  field = field * 0.5 + 0.5;
  field = sm3(0.16, 0.88, field);

  float topLift = (1.0 - sm3(0.04, 0.30, uv.y)) * 0.04;
  float rightLift = sm3(0.56, 0.96, uv.x) * 0.06;
  float lowerLift = sm3(0.70, 0.98, uv.y) * 0.03;

  field = clamp(field + topLift + rightLift + lowerLift, 0.0, 1.0);

  return clamp(field, 0.0, 1.0);
}

float pulseFieldValue(vec2 uv, float time) {
  vec2 carrierAxis = normalize(vec2(1.0, -0.16));
  vec2 supportAxis = normalize(vec2(1.0, 0.08));

  float carrier = dot(uv, carrierAxis);
  float support = dot(uv, supportAxis);

  float primary = sin(carrier * 8.5 - time * 0.88) * 0.5 + 0.5;
  float secondary = sin(support * 3.8 - time * 0.34 + 0.7) * 0.5 + 0.5;

  float field = mix(primary, secondary, 0.14);
  field = mix(0.5, field, 0.52);
  field = sm3(0.24, 0.76, field);

  return clamp(field, 0.0, 1.0);
}

float rayFieldValue(vec2 uv, float time) {
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 source = vec2(0.5, 1.08);
  vec2 rel = (uv - source) * vec2(aspect * 0.28, 1.0);

  float angle = atan(rel.y, rel.x);
  float dist = length(rel);

  float f1 = sin(angle * 8.0 + dist * 15.0 - time * 1.20) * 0.30;
  float f2 = sin(angle * 13.0 + dist * 8.0 - time * 0.82 + 0.7) * 0.40;
  float f3 = sin(angle * 21.0 + dist * 4.0 - time * 1.48 + 1.1) * 0.30;

  float field = (f1 + f2 + f3) * 0.5 + 0.5;
  float seamLift = exp(-pow((uv.x - 0.5) / 0.05, 2.0)) * exp(-pow((uv.y - 1.0) / 0.16, 2.0));
  float outwardWindow = 1.0 - sm3(0.88, 1.58, dist);

  field = mix(0.5, field, 0.62);
  field = mix(0.5, field + seamLift * 0.16, outwardWindow);

  return clamp(field, 0.0, 1.0);
}

float fieldValue(vec2 uv, float time) {
  if (uVariant < 0.5) {
    return terrainFieldValue(uv, time);
  }

  if (uVariant < 1.5) {
    return pulseFieldValue(uv, time);
  }

  return rayFieldValue(uv, time);
}

float contentShield(vec2 uv) {
  if (uSurface > 2.5) {
    return 0.0;
  }

  if (uSurface > 1.5) {
    float desktopTitle = gauss2(uv, vec2(0.18, 0.54), vec2(0.24, 0.22)) * 1.34;
    float desktopControls = gauss2(uv, vec2(0.84, 0.54), vec2(0.18, 0.20)) * 1.42;
    float mobileTitle = gauss2(uv, vec2(0.22, 0.36), vec2(0.28, 0.18)) * 1.18;
    float mobileControls = gauss2(uv, vec2(0.22, 0.72), vec2(0.24, 0.14)) * 1.18;
    float mobileBlock = gauss2(uv, vec2(0.30, 0.50), vec2(0.42, 0.38)) * 0.76;
    float shield = max(max(desktopTitle, desktopControls), max(mobileTitle, max(mobileControls, mobileBlock)));
    return sm3(0.08, 0.92, shield);
  }

  if (uSurface > 0.5) {
    float title = gauss2(uv, vec2(0.25, 0.28), vec2(0.28, 0.18)) * 1.18;
    float body = gauss2(uv, vec2(0.28, 0.48), vec2(0.30, 0.24));
    float meta = gauss2(uv, vec2(0.22, 0.62), vec2(0.18, 0.14));
    float mobile = gauss2(uv, vec2(0.34, 0.42), vec2(0.36, 0.34)) * 0.70;
    float shield = max(max(title, body), max(meta, mobile));
    return sm3(0.08, 0.90, shield);
  }

  float title = gauss2(uv, vec2(0.29, 0.34), vec2(0.26, 0.19)) * 1.18;
  float body = gauss2(uv, vec2(0.29, 0.50), vec2(0.29, 0.22));
  float cta = gauss2(uv, vec2(0.20, 0.73), vec2(0.20, 0.14));
  float mobile = gauss2(uv, vec2(0.30, 0.46), vec2(0.34, 0.34));
  float shield = max(max(title, body), max(cta, mobile * 0.66));
  return sm3(0.08, 0.90, shield);
}

float resolvedField(vec2 uv, float time) {
  vec2 clampedUv = clamp(uv, vec2(0.0), vec2(1.0));
  float sampleField = fieldValue(clampedUv, time);
  float sampleShield = contentShield(clampedUv);
  float sampleMouseInfluence =
    uMouseStrength > 0.001 ? gauss2(clampedUv, uMouse, vec2(0.12, 0.12)) : 0.0;
  float mouseSignedLift = mix(1.0, -1.0, uDark);
  float terrainVariant = 1.0 - step(0.5, uVariant);
  float terrainSurface = (1.0 - step(2.5, uSurface)) * terrainVariant;
  float shieldFade = mix(mix(0.78, 0.74, uDark), mix(0.90, 0.86, uDark), terrainSurface);
  float shieldInteraction = mix(1.0, mix(0.36, 0.56, terrainSurface), sampleShield);

  sampleField *= mix(1.0, shieldFade, sampleShield);
  sampleField = clamp(
    sampleField + sampleMouseInfluence * uMouseStrength * mouseSignedLift * 0.24 * shieldInteraction,
    0.0,
    1.0
  );

  return sampleField;
}

void main() {
  vec2 cssCoord = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = cssCoord / uRes;
  bool insideGridBounds =
    cssCoord.x >= uGridMin.x && cssCoord.x <= uGridMax.x &&
    cssCoord.y >= uGridMin.y && cssCoord.y <= uGridMax.y;

  float field = resolvedField(uv, uTime);
  float shield = contentShield(uv);
  float terrainVariant = 1.0 - step(0.5, uVariant);
  float terrainSurface = (1.0 - step(2.5, uSurface)) * terrainVariant;

  float mouseInfluence = uMouseStrength > 0.001 ? gauss2(uv, uMouse, vec2(0.12, 0.12)) : 0.0;

  vec2 center = vec2(uStep * 0.5);
  vec2 cellDist = abs(mod(cssCoord - uOff + center, uStep) - center);
  bool inDot = insideGridBounds && cellDist.x <= uDotRadius && cellDist.y <= uDotRadius;

  float u0 = mix(mix(0.46, 0.10, uDark), mix(0.42, 0.08, uDark), terrainSurface);
  float u1 = mix(mix(0.58, 0.18, uDark), mix(0.57, 0.18, uDark), terrainSurface);
  float u2 = mix(mix(0.70, 0.30, uDark), mix(0.74, 0.33, uDark), terrainSurface);
  float u3 = mix(mix(0.82, 0.46, uDark), mix(0.88, 0.52, uDark), terrainSurface);

  float d0 = mix(0.50, 0.30, uDark);
  float d1 = mix(0.64, 0.46, uDark);
  float d2 = mix(0.78, 0.63, uDark);
  float d3 = mix(0.89, 0.80, uDark);

  float pulseVariant = step(0.5, uVariant);
  vec2 fieldGradientVec = vec2(dFdx(field), dFdy(field));
  float fieldGradient = length(fieldGradientVec);
  float contourWidth = mix(1.05, 0.92, uDark) * mix(1.0, 0.95, terrainSurface);
  float contour0 = contourBand(field, u0, fieldGradient, contourWidth) * mix(1.0, 0.05, terrainSurface);
  float contour1 = contourBand(field, u1, fieldGradient, contourWidth) * mix(1.0, 0.26, terrainSurface);
  float contour2 = contourBand(field, u2, fieldGradient, contourWidth) * mix(1.0, 0.58, terrainSurface);
  float contour3 = contourBand(field, u3, fieldGradient, contourWidth) * mix(1.0, 0.84, terrainSurface);
  float contour = max(max(contour0, contour1), max(contour2, contour3));

  float e0 = max(0.0, u0 - mix(0.0, mix(0.030, 0.016, uDark), terrainSurface));
  float e1 = max(e0 + 0.012, u1 - mix(0.0, mix(0.016, 0.008, uDark), terrainSurface));
  float e2 = u2;
  float e3 = u3;

  vec4 underlay = vec4(0.0);
  int underlayBand = 0;
  if      (field >= e3) { underlay = vec4(uUC3, uUA3); underlayBand = 4; }
  else if (field >= e2) { underlay = vec4(uUC2, uUA2); underlayBand = 3; }
  else if (field >= e1) { underlay = vec4(uUC1, uUA1); underlayBand = 2; }
  else if (field >= e0) { underlay = vec4(uUC0, uUA0); underlayBand = 1; }

  vec4 dots = vec4(0.0);
  if (inDot) {
    vec2 cellCenter = (floor((cssCoord - uOff) / uStep + 0.5) * uStep + uOff) / uRes;
    vec2 cellKernel = (vec2(uStep) / uRes) * mix(0.34, 0.12, uDark);
    vec2 dominantKernel =
      abs(fieldGradientVec.x) >= abs(fieldGradientVec.y) ?
        vec2(cellKernel.x, 0.0) :
        vec2(0.0, cellKernel.y);
    float dotField =
      resolvedField(cellCenter, uTime) * 0.5 +
      resolvedField(cellCenter + dominantKernel, uTime) * 0.25 +
      resolvedField(cellCenter - dominantKernel, uTime) * 0.25;
    if (uDark < 0.5) {
      dotField = min(dotField, field);
      float dotStructure = sm3(0.003, 0.016, fieldGradient);
      if (underlayBand == 2) {
        float bandEnter = sm3(e1 + 0.002, e2 - 0.060, dotField);
        float bandExit = 1.0 - sm3(e2 - 0.010, e2 + 0.018, dotField);
        float bandReveal = pow(max(0.0, bandEnter * bandExit), 1.16);
        vec3 bandRgb = mix(uLC1, uLC2, 0.38 + bandReveal * 0.24);
        float bandAlpha = uLA1 * 0.50 * bandReveal * mix(0.72, 1.0, dotStructure);
        dots = vec4(bandRgb, bandAlpha);
      } else if (underlayBand == 3) {
        float bandEnter = sm3(e2 + 0.000, e3 - 0.056, dotField);
        float bandExit = 1.0 - sm3(e3 - 0.012, e3 + 0.018, dotField);
        float bandReveal = pow(max(0.0, bandEnter * bandExit), 1.08);
        vec3 bandRgb = mix(uLC2, uLC3, 0.18 + bandReveal * 0.38);
        float bandAlpha =
          mix(uLA1, uLA2, bandReveal) * 0.52 * bandReveal * mix(0.80, 1.0, dotStructure);
        dots = vec4(bandRgb, bandAlpha);
      } else if (underlayBand == 4) {
        float peakReveal = sm3(
          e3 - 0.012,
          min(0.995, e3 + 0.088),
          dotField
        );
        float peakAlpha =
          mix(uLA2, uLA3, peakReveal) * 0.74 * pow(peakReveal, 1.02);
        vec3 peakRgb = mix(uLC2, uLC3, peakReveal);
        dots = vec4(peakRgb, peakAlpha * mix(0.90, 1.0, dotStructure));
      }
    } else {
      float dotT01 = sm3(d0, d1, dotField);
      float dotT12 = sm3(d1, d2, dotField);
      float dotT23 = sm3(d2, d3, dotField);
      float dotReveal = sm3(
        d0 + 0.010,
        min(0.995, d3 + 0.015),
        dotField
      );

      vec3 dotRgb = mix(uLC0, uLC1, dotT01);
      dotRgb = mix(dotRgb, uLC2, dotT12);
      dotRgb = mix(dotRgb, uLC3, dotT23);

      float dotAlpha = mix(uLA0, uLA1, dotT01);
      dotAlpha = mix(dotAlpha, uLA2, dotT12);
      dotAlpha = mix(dotAlpha, uLA3, dotT23);

      dots = vec4(dotRgb, dotAlpha * pow(dotReveal, 1.35));
    }
  }

  vec3 contourRgb = mix(uLC2, uLC3, mix(0.42, 0.58, uDark));
  contourRgb = mix(contourRgb, uBG, (1.0 - uDark) * mix(0.12, 0.04, terrainSurface));
  vec4 contourStroke = vec4(
    contourRgb,
    contour * mix(mix(0.74, 0.48, uDark), 0.0, pulseVariant) * mix(1.0, mix(0.92, 0.72, uDark), terrainSurface)
  );

  contourStroke.a *= 1.0 - terrainSurface;

  underlay.a *= mix(1.0, mix(mix(0.20, 0.28, uDark), mix(0.12, 0.18, uDark), pulseVariant), shield);
  dots.a *= mix(1.0, mix(mix(0.18, 0.24, uDark), mix(0.14, 0.18, uDark), pulseVariant), shield);
  contourStroke.a *= mix(1.0, mix(0.22, 0.52, uDark), shield);
  underlay.a *= mix(1.0, mix(1.08, 1.05, uDark), terrainSurface);
  vec2 fillAxisA = normalize(vec2(0.951, -0.309));
  vec2 fillAxisB = normalize(vec2(-0.218, 0.976));
  float fillA = clamp(0.5 + dot(uv - vec2(0.44, 0.58), fillAxisA) * 0.92, 0.0, 1.0);
  float fillB = clamp(0.5 + dot(uv - vec2(0.60, 0.40), fillAxisB) * 0.58, 0.0, 1.0);
  float atmosT = clamp(mix(fillA, fillB, 0.28), 0.0, 1.0);
  float upperBandWeight = smoothstep(1.5, 3.5, float(underlayBand));
  vec3 fillLow = mix(uBG, underlay.rgb, mix(0.82, 0.72, uDark));
  vec3 fillHigh = mix(uBG, underlay.rgb, mix(0.96, 0.88, uDark));
  vec3 fillColor = mix(fillLow, fillHigh, atmosT);
  underlay.rgb = mix(underlay.rgb, fillColor, terrainSurface * mix(0.12, 0.44, upperBandWeight));
  dots.a *= 1.0 + mouseInfluence * uMouseStrength * mix(0.16, 0.28, uDark);
  contourStroke.a *= 1.0 + mouseInfluence * uMouseStrength * mix(0.46, 0.72, uDark) * mix(1.0, 0.72, terrainSurface);

  if (uDark < 0.5) {
    vec4 lightBase = vec4(uBG, 1.0);
    float lightMix = underlay.a * mix(0.62, 0.72, terrainSurface);
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

function mixRgb(from: RGB, to: RGB, amount: number): RGB {
	const t = Math.min(1, Math.max(0, amount));

	return [
		clampInt(Math.round(from[0] + (to[0] - from[0]) * t), 0, 255),
		clampInt(Math.round(from[1] + (to[1] - from[1]) * t), 0, 255),
		clampInt(Math.round(from[2] + (to[2] - from[2]) * t), 0, 255),
	];
}

function srgbChannelToByte(value: number) {
	const clamped = Math.min(1, Math.max(0, value));
	const encoded = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
	return clampInt(Math.round(encoded * 255), 0, 255);
}

function parseHexColor(value: string): RGB | null {
	const normalized = value.trim().replace(/^#/, "");
	if (![3, 6].includes(normalized.length)) return null;

	const expanded =
		normalized.length === 3
			? normalized
					.split("")
					.map((part) => `${part}${part}`)
					.join("")
			: normalized;

	const channels = [0, 2, 4].map((index) =>
		Number.parseInt(expanded.slice(index, index + 2), 16),
	);
	if (channels.some((channel) => Number.isNaN(channel))) return null;

	return channels as RGB;
}

function parseOklchColor(value: string): RGB | null {
	const match = value.match(/oklch\(([^)]+)\)/i);
	if (!match) return null;

	const [lightnessRaw, chromaRaw, hueRaw] = match[1]
		.split(/[\s/]+/)
		.filter(Boolean)
		.slice(0, 3);

	if (!lightnessRaw || !chromaRaw || !hueRaw) return null;

	const lightness = lightnessRaw.endsWith("%")
		? Number.parseFloat(lightnessRaw) / 100
		: Number.parseFloat(lightnessRaw);
	const chroma = Number.parseFloat(chromaRaw);
	const hue = Number.parseFloat(hueRaw);

	if ([lightness, chroma, hue].some((part) => Number.isNaN(part))) return null;

	const hueRadians = (hue * Math.PI) / 180;
	const a = chroma * Math.cos(hueRadians);
	const b = chroma * Math.sin(hueRadians);

	const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
	const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
	const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;

	const l = lPrime ** 3;
	const m = mPrime ** 3;
	const s = sPrime ** 3;

	const rLinear = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	return [srgbChannelToByte(rLinear), srgbChannelToByte(gLinear), srgbChannelToByte(bLinear)];
}

function tryParseColor(value: string): RGB | null {
	const hex = parseHexColor(value);
	if (hex) return hex;

	const oklch = parseOklchColor(value);
	if (oklch) return oklch;

	const match = value.match(/rgba?\(([^)]+)\)/i);
	if (!match) return null;

	const channels = match[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.slice(0, 3)
		.map((part) => Number.parseFloat(part));

	if (channels.length !== 3 || channels.some((part) => Number.isNaN(part))) {
		return null;
	}

	return [
		clampInt(Math.round(channels[0]), 0, 255),
		clampInt(Math.round(channels[1]), 0, 255),
		clampInt(Math.round(channels[2]), 0, 255),
	];
}

function cssColorToRgb(value: string, fallback: RGB): RGB {
	if (typeof document === "undefined") {
		return tryParseColor(value) ?? fallback;
	}

	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d", { willReadFrequently: true });
	if (!context) {
		return tryParseColor(value) ?? fallback;
	}

	context.clearRect(0, 0, 1, 1);
	context.fillStyle = "#010203";
	context.fillStyle = value;
	context.fillRect(0, 0, 1, 1);
	const pixel = context.getImageData(0, 0, 1, 1).data;

	return [pixel[0], pixel[1], pixel[2]];
}

function readResolvedCustomProperty(
	node: HTMLElement,
	css: string,
	seen = new Set<string>(),
): string | null {
	const match = css.match(/^var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)$/);
	if (!match) return css.trim() || null;

	const [, property, fallback = ""] = match;
	if (seen.has(property)) {
		return fallback ? readResolvedCustomProperty(node, fallback, seen) : null;
	}
	seen.add(property);

	const nodeStyles = getComputedStyle(node);
	const rootStyles = getComputedStyle(document.documentElement);
	const candidates = [
		nodeStyles.getPropertyValue(property).trim(),
		rootStyles.getPropertyValue(property).trim(),
	].filter(Boolean);

	for (const candidate of candidates) {
		if (candidate === css) continue;
		if (candidate.startsWith("var(")) {
			const resolved: string | null = readResolvedCustomProperty(node, candidate, seen);
			if (resolved) return resolved;
			continue;
		}

		return candidate;
	}

	return fallback ? readResolvedCustomProperty(node, fallback, seen) : null;
}

function resolveCssColor(node: HTMLElement, css: string, fallback: RGB): RGB {
	const resolvedCustomProperty = readResolvedCustomProperty(node, css);
	if (resolvedCustomProperty) {
		return cssColorToRgb(resolvedCustomProperty, fallback);
	}

	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.color = css;
	node.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	node.removeChild(probe);
	return cssColorToRgb(resolved, fallback);
}

function resolveSurfaceTone(node: HTMLElement, tone: number, fallback: RGB) {
	return resolveCssColor(
		node,
		`var(--surface-color-${tone}, var(--surface-${tone}, var(--color-surface-${tone})))`,
		resolveCssColor(
			node,
			`var(--surface-${tone}, var(--color-surface-${tone}, var(--surface-color-${tone})))`,
			fallback,
		),
	);
}

function resolvePalette(node: HTMLElement, isDark: boolean): Palette {
	const alphaPalette = isDark ? DARK_ALPHA_PALETTE : LIGHT_ALPHA_PALETTE;
	const neutralFallback: RGB = isDark ? [255, 255, 255] : [0, 0, 0];
	const baseSurface = resolveSurfaceTone(node, 500, neutralFallback);
	const resolveTone = (tone: number) => resolveSurfaceTone(node, tone, baseSurface);
	const lightBaseUnderlay = resolveCssColor(
		node,
		"var(--instrument-field-bg-auto)",
		[255, 255, 255],
	);
	const lightBandOneUnderlay = mixRgb(resolveTone(200), resolveTone(300), 0.18);
	const lightBandTwoUnderlay = mixRgb(resolveTone(300), resolveTone(400), 0.34);
	const lightPeakUnderlay = mixRgb(resolveTone(400), resolveTone(500), 0.14);
	const darkBandTwoUnderlay = mixRgb(resolveTone(900), resolveTone(800), 0.34);
	const darkPeakUnderlay = mixRgb(resolveTone(800), resolveTone(700), 0.16);

	return {
		active: [
			{
				color: resolveTone(isDark ? 700 : 400),
				alpha: alphaPalette.active[0].alpha,
			},
			{
				color: resolveTone(isDark ? 500 : 500),
				alpha: alphaPalette.active[1].alpha,
			},
			{
				color: resolveTone(isDark ? 300 : 600),
				alpha: alphaPalette.active[2].alpha,
			},
			{
				color: resolveTone(isDark ? 100 : 700),
				alpha: alphaPalette.active[3].alpha,
			},
		],
		underlay: [
			{
				color: isDark ? resolveTone(950) : lightBaseUnderlay,
				alpha: alphaPalette.underlay[0].alpha,
			},
			{
				color: isDark ? resolveTone(900) : lightBandOneUnderlay,
				alpha: alphaPalette.underlay[1].alpha,
			},
			{
				color: isDark ? darkBandTwoUnderlay : lightBandTwoUnderlay,
				alpha: alphaPalette.underlay[2].alpha,
			},
			{
				color: isDark ? darkPeakUnderlay : lightPeakUnderlay,
				alpha: alphaPalette.underlay[3].alpha,
			},
		],
	};
}

function resolveVariantValue(variant: InstrumentFieldVariant) {
	switch (variant) {
		case "pulse":
			return 1;
		case "ray":
			return 2;
		default:
			return 0;
	}
}

function resolveSurfaceValue(surface: InstrumentSurface) {
	switch (surface) {
		case "header":
			return 1;
		case "band":
			return 2;
		case "strip":
			return 3;
		default:
			return 0;
	}
}

function resolveBackgroundPaint(tone: InstrumentFieldTone) {
	switch (tone) {
		case "dark":
			return "var(--surface-950)";
		case "light":
			return "var(--surface-50)";
		case "inverted":
			return "var(--instrument-field-bg-inverted)";
		default:
			return "var(--instrument-field-bg-auto)";
	}
}

function resolveBackgroundFallback(tone: InstrumentFieldTone, isDark: boolean): RGB {
	switch (tone) {
		case "dark":
			return [9, 9, 11];
		case "light":
			return [250, 250, 250];
		case "inverted":
			return isDark ? [250, 250, 250] : [9, 9, 11];
		default:
			return isDark ? [24, 24, 27] : [255, 255, 255];
	}
}

function resolveInteractionHost(container: HTMLDivElement) {
	let candidate = container.parentElement;

	while (candidate) {
		const position = window.getComputedStyle(candidate).position;
		if (position !== "absolute" && position !== "fixed") {
			return candidate;
		}
		candidate = candidate.parentElement;
	}

	return container.parentElement;
}

export function InstrumentField({
	className,
	interactive = true,
	step = 18,
	minInset = 12,
	radius = 1.15,
	origin = "center",
	speed = 1,
	surface = "hero",
	variant = "terrain",
	tone = "auto",
}: InstrumentFieldProps) {
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

	const shouldReduceMotion = useReducedMotion();
	const { environment } = useRevealState();
	const [documentIsDark, setDocumentIsDark] = useState(false);
	const [isCanvasReady, setIsCanvasReady] = useState(false);
	const [isInViewport, setIsInViewport] = useState(surface !== "band");
	const [paletteSignature, setPaletteSignature] = useState("");
	const [metrics, setMetrics] = useState<Metrics>({
		dpr: 1,
		height: 0,
		minInset: typeof minInset === "number" ? minInset : 12,
		step: typeof step === "number" ? step : 18,
		width: 0,
	});
	const shouldFreezeField = environment !== "normal" || shouldReduceMotion;

	useEffect(() => {
		let cancelled = false;
		const fallbackTimer = window.setTimeout(() => {
			if (!cancelled) {
				setIsCanvasReady(true);
			}
		}, 800);

		return () => {
			cancelled = true;
			clearTimeout(fallbackTimer);
		};
	}, []);

	useLayoutEffect(() => {
		if (typeof window === "undefined") return;

		const readPaletteSignature = () => {
			const root = getComputedStyle(document.documentElement);
			return [
				root.getPropertyValue("--surface-color-100").trim() ||
					root.getPropertyValue("--surface-100").trim() ||
					root.getPropertyValue("--color-surface-100").trim(),
				root.getPropertyValue("--surface-color-200").trim() ||
					root.getPropertyValue("--surface-200").trim() ||
					root.getPropertyValue("--color-surface-200").trim(),
				root.getPropertyValue("--surface-color-300").trim() ||
					root.getPropertyValue("--surface-300").trim() ||
					root.getPropertyValue("--color-surface-300").trim(),
				root.getPropertyValue("--surface-color-400").trim() ||
					root.getPropertyValue("--surface-400").trim() ||
					root.getPropertyValue("--color-surface-400").trim(),
				root.getPropertyValue("--surface-color-500").trim() ||
					root.getPropertyValue("--surface-500").trim() ||
					root.getPropertyValue("--color-surface-500").trim(),
				root.getPropertyValue("--surface-color-600").trim() ||
					root.getPropertyValue("--surface-600").trim() ||
					root.getPropertyValue("--color-surface-600").trim(),
				root.getPropertyValue("--surface-color-700").trim() ||
					root.getPropertyValue("--surface-700").trim() ||
					root.getPropertyValue("--color-surface-700").trim(),
				root.getPropertyValue("--surface-color-800").trim() ||
					root.getPropertyValue("--surface-800").trim() ||
					root.getPropertyValue("--color-surface-800").trim(),
				root.getPropertyValue("--surface-color-900").trim() ||
					root.getPropertyValue("--surface-900").trim() ||
					root.getPropertyValue("--color-surface-900").trim(),
				root.getPropertyValue("--surface-color-950").trim() ||
					root.getPropertyValue("--surface-950").trim() ||
					root.getPropertyValue("--color-surface-950").trim(),
			].join("|");
		};

		const syncTheme = () => {
			setDocumentIsDark(document.documentElement.classList.contains("dark"));
			setPaletteSignature((current) => {
				const next = readPaletteSignature();
				return current === next ? current : next;
			});
		};

		syncTheme();
		const observer = new MutationObserver(syncTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme", "data-accent", "style"],
		});

		return () => {
			observer.disconnect();
		};
	}, []);

	const isDark =
		tone === "dark"
			? true
			: tone === "light"
				? false
				: tone === "inverted"
					? !documentIsDark
					: documentIsDark;
	const backgroundPaint = resolveBackgroundPaint(tone);

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

		const container = containerRef.current;
		if (!container || !("IntersectionObserver" in window)) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				const nextIsInViewport = entry?.isIntersecting ?? false;
				setIsInViewport(nextIsInViewport);
				if (!nextIsInViewport) {
					mouseRef.current.targetStrength = 0;
					mouseRef.current.currentStrength = 0;
				}
			},
			{ rootMargin: surface === "band" ? "320px 0px" : "160px 0px" },
		);

		observer.observe(container);

		return () => observer.disconnect();
	}, [surface]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !interactive) {
			mouseRef.current.targetStrength = 0;
			return;
		}

		const host = resolveInteractionHost(container);
		if (!host) return;

		const clearPointerTarget = () => {
			mouseRef.current.targetStrength = 0;
		};

		const updatePointerTarget = (clientX: number, clientY: number, strengthBoost = 0) => {
			if (!supportsHoverRef.current || shouldFreezeField) return;

			const rect = container.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return;

			const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
			const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
			const edgeDistance = Math.min(x, 1 - x, y, 1 - y);
			const edgeStrength = Math.min(1, Math.max(0, (edgeDistance - 0.06) / 0.18));

			mouseRef.current.targetX = x;
			mouseRef.current.targetY = y;
			mouseRef.current.targetStrength = Math.min(1, edgeStrength + strengthBoost);
		};

		const handlePointerEnter = (event: PointerEvent) => {
			if (event.pointerType === "touch") return;
			updatePointerTarget(event.clientX, event.clientY);
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (event.pointerType === "touch") return;
			updatePointerTarget(event.clientX, event.clientY);
		};

		const handlePointerDown = (event: PointerEvent) => {
			if (event.pointerType === "touch") return;
			updatePointerTarget(event.clientX, event.clientY, 0.12);
		};

		const handlePointerUp = (event: PointerEvent) => {
			if (event.pointerType === "touch") return;
			updatePointerTarget(event.clientX, event.clientY);
		};

		const handlePointerLeave = () => {
			clearPointerTarget();
		};

		host.addEventListener("pointerenter", handlePointerEnter);
		host.addEventListener("pointermove", handlePointerMove);
		host.addEventListener("pointerdown", handlePointerDown);
		host.addEventListener("pointerup", handlePointerUp);
		host.addEventListener("pointerleave", handlePointerLeave);
		host.addEventListener("pointercancel", handlePointerLeave);

		return () => {
			host.removeEventListener("pointerenter", handlePointerEnter);
			host.removeEventListener("pointermove", handlePointerMove);
			host.removeEventListener("pointerdown", handlePointerDown);
			host.removeEventListener("pointerup", handlePointerUp);
			host.removeEventListener("pointerleave", handlePointerLeave);
			host.removeEventListener("pointercancel", handlePointerLeave);
		};
	}, [interactive, shouldFreezeField]);

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
				uVariant: getUniform("uVariant"),
				uSurface: getUniform("uSurface"),
				uMouse: getUniform("uMouse"),
				uMouseStrength: getUniform("uMouseStrength"),
				uBG: getUniform("uBG"),
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
		void paletteSignature;
		const container = containerRef.current;
		const canvas = canvasRef.current;
		const gl = glRef.current;
		const program = programRef.current;
		const vao = vaoRef.current;
		const uniforms = uniformRef.current;

		if (!container || !canvas || !gl || !program || !vao) return;
		if (!isInViewport) return;
		if (metrics.width <= 0 || metrics.height <= 0) return;

		const physicalWidth = Math.round(metrics.width * metrics.dpr);
		const physicalHeight = Math.round(metrics.height * metrics.dpr);

		canvas.width = physicalWidth;
		canvas.height = physicalHeight;
		gl.viewport(0, 0, physicalWidth, physicalHeight);

		const clearColor = resolveCssColor(
			container,
			backgroundPaint,
			resolveBackgroundFallback(tone, isDark),
		);
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
		gl.clearColor(clearColor[0] / 255, clearColor[1] / 255, clearColor[2] / 255, 1);
		gl.uniform2f(uniforms.uRes, physicalWidth, physicalHeight);
		gl.uniform2f(uniforms.uOff, columns.offset * metrics.dpr, rows.offset * metrics.dpr);
		gl.uniform2f(uniforms.uGridMin, gridMinX, gridMinY);
		gl.uniform2f(uniforms.uGridMax, gridMaxX, gridMaxY);
		gl.uniform1f(uniforms.uStep, metrics.step * metrics.dpr);
		gl.uniform1f(uniforms.uDotRadius, halfDot);
		gl.uniform1f(uniforms.uDark, isDark ? 1 : 0);
		gl.uniform1f(uniforms.uVariant, resolveVariantValue(variant));
		gl.uniform1f(uniforms.uSurface, resolveSurfaceValue(surface));
		gl.uniform2f(uniforms.uMouse, 0.5, 0.5);
		gl.uniform1f(uniforms.uMouseStrength, 0);
		if (uniforms.uBG) {
			gl.uniform3f(
				uniforms.uBG,
				clearColor[0] / 255,
				clearColor[1] / 255,
				clearColor[2] / 255,
			);
		}

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

		const shouldAnimate = isInViewport && !shouldFreezeField;
		let frameId = 0;
		let hasMarkedReady = false;
		let startTime = 0;
		let lastFrameTime = 0;

		const render = (now: number) => {
			if (startTime === 0) startTime = now;
			if (lastFrameTime === 0) lastFrameTime = now;
			const deltaSeconds = (now - lastFrameTime) / 1000;
			lastFrameTime = now;

			const elapsed = shouldAnimate ? ((now - startTime) / 1000) * speed : 0;
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
			gl.uniform1f(uniforms.uMouseStrength, shouldAnimate ? mouse.currentStrength : 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			if (!hasMarkedReady) {
				hasMarkedReady = true;
				setIsCanvasReady(true);
			}

			if (shouldAnimate) {
				frameId = requestAnimationFrame(render);
			}
		};

		frameId = requestAnimationFrame(render);

		return () => cancelAnimationFrame(frameId);
	}, [
		backgroundPaint,
		isDark,
		isInViewport,
		metrics,
		origin,
		paletteSignature,
		radius,
		shouldFreezeField,
		speed,
		surface,
		tone,
		variant,
	]);

	return (
		<div
			ref={containerRef}
			className={cn(
				className,
				"pointer-events-none absolute inset-0 overflow-hidden transition-[background-color]",
			)}
			style={{ backgroundColor: backgroundPaint }}
		>
			<canvas
				ref={canvasRef}
				className="pointer-events-none absolute inset-0 h-full w-full transition-[opacity,background-color]"
				style={{
					backgroundColor: backgroundPaint,
					opacity: isCanvasReady ? 1 : 0,
					transitionDuration: `${tweens.field.duration}s`,
					transitionTimingFunction: `cubic-bezier(${tweens.field.ease.join(",")})`,
				}}
			/>
		</div>
	);
}

export { InstrumentField as TopographicDotField };
