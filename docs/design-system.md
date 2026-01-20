# Design System Philosophy

> **This document is the Single Source of Truth for all UI/UX decisions.**
> Any AI agent making changes to the interface MUST read and strictly follow this document.

---

## Core Philosophy

This project follows a **Modern Swiss Design** philosophy with **Interaction Engineered Motion**.
The aesthetic is inspired by:

- **Stripe**: For mesh gradients, premium feel, and density of information.
- **Linear**: For pixel-perfect precision, typography, and monochromatic elegance.
- **iOS**: For physics-based 2D motion that feels natural and responsive.

The aesthetic is the **OPPOSITE** of:

- **Google Material Design**: Feels cheap, uses shadows for fake depth.
- **Google Cloud Console**: Grayish, low-contrast, overwhelming.

---

## Non-Negotiables (Absolute Bans)

> [!CAUTION]
> Violating any of these rules requires **explicit user override**. Do not assume.

### 1. NO SHADOWS

- **BANNED**: `box-shadow`, `drop-shadow`, `shadow-*` Tailwind utilities.
- **WHY**: Shadows feel fake. They attempt to simulate 3D depth in a 2D interface, which is a lie. They feel cheap, like early Material Design.
- **EXCEPTION**: Only with explicit user permission for a specific use case (e.g., a floating action button designed to look "lifted").

### 2. DEPTH VIA BACKGROUND, NOT SHADOWS

- **CORRECT**: Use layered background colors to create depth. A modal should have a slightly different `bg-surface-*` color than its parent, not a shadow.
- **EXAMPLE**: `bg-surface-50` (base) → `bg-surface-100` (card) → `bg-surface-200` (popover).

### 3. NO GRAYISH / WASHED-OUT COLORS

- **BANNED**: Low-contrast, desaturated color palettes.
- **CORRECT**: Use high-contrast, intentional color. Black on white. White on black. OKLCH for precision.
- **WHY**: Grayish UIs feel lifeless and unconfident. This project demands visual authority.

### 4. NO FLASHY / RAINBOW GRADIENTS

- **BANNED**: Linear gradients with clashing, vibrant colors (e.g., `from-pink-500 to-cyan-500`).
- **CORRECT**: Use **mesh gradients** or very subtle, monochromatic gradients.
- **EXAMPLE BENCHMARK**: Stripe's landing pages.

### 5. 2D PHYSICS, NOT FAKE 3D

- **CORRECT**: Motion should feel like objects in a 2D plane with physical properties (mass, spring, friction). Use `src/lib/physics.ts` for all animation constants.
- **WRONG**: Motion that attempts to make flat elements look like they are popping out of the screen.
- **EXAMPLE BENCHMARK**: iOS interactions (spring-based, tactile).

---

## Architectural Standards

| Property | Value | Rationale |
| --- | --- | --- |
| **Border Radius** | `0px` (default) | Sharp, precise, engineered. |
| **Border Width** | `1px` or `2px` | High-contrast definition. |
| **Spacing** | `4px` baseline grid (`gap-1`, `p-2`, etc.) | Mathematical consistency. |
| **Typography** | Sans-serif (Geist/Inter), Monospace for data | Clean, readable, objective. |
| **Color System** | OKLCH, `surface-*` tokens | Perceptually uniform, themeable. |

---

## Visual Language Principles

### 1. Modern Swiss Design

- Strong grid systems.
- Asymmetric, but balanced, layouts.
- Typography is the primary visual element.
- Objectivity over decoration.

### 2. Precision Engineering

- Zero rounded corners.
- Pixel-perfect alignment. If something is 1px off, it's wrong.
- Elements are "cut", not "smoothed".

### 3. Interaction Engineered Motion

- All motion must have a purpose. It guides the eye or provides feedback.
- Use spring physics from `src/lib/physics.ts`.
- Staggered reveals should feel like a choreographed sequence, not random fading.

### 4. Monochromatic Aesthetic

- Impact through contrast and structure, not hue.
- Color is semantic: success, error, warning, primary action.
- Avoid decorative color.

---

## The Multi-Disciplinary Mindset

When designing or evaluating any interface, the AI must think from four perspectives simultaneously:

1. **Psychologist**: What is the user feeling? What is their cognitive load? Am I reducing friction or adding it?
2. **Product Engineer**: Does this feature solve a real user problem? Is it maintainable? Is it performant?
3. **Design Engineer**: Is this pixel-perfect? Does the visual hierarchy guide the eye correctly? Is the typography balanced?
4. **Interaction Engineer**: Does the motion feel natural? Does the feedback loop make sense? Is the physics right?

If the interface fails any of these four checks, it is not ready.

---

## Component Implementation Stack

- **Radix UI**: Accessible, headless primitives.
- **Tailwind CSS v4**: Utility-first styling with OKLCH.
- **Framer Motion**: Physics-based animation.
- **Vaul**: Drawer primitives.
- **Sonner**: Toast primitives.
