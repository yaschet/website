# Design System

> **Single Source of Truth for UI/UX decisions.**

## Core Principles

The design follows a **minimalist, grid-based** approach.

- **Swiss Grid**: Strict adherence to the 12-column grid.
- **Physics Motion**: Animations use spring physics constants from `src/lib/physics.ts`.
- **Monochromatic**: Emphasis on contrast and typography over color.

## Strict Rules

> [!CAUTION]
> Deviations require explicit user approval.

### 1. No Shadows
- **Rule**: Do not use `box-shadow` or `drop-shadow`.
- **Alternative**: Use background color layers to indicate depth (e.g., `surface-50` -> `surface-100`).

### 2. High Contrast
- **Rule**: Avoid low-contrast, washed-out grays.
- **Guideline**: Text must be legible. Use high-contrast tokens (`surface-900`, `surface-50`).

### 3. No Gradients
- **Rule**: Avoid multi-color or vibrant gradients.
- **Exception**: Subtle, monochromatic mesh gradients are permitted for backgrounds only.

### 4. 2D Motion
- **Rule**: Animations should feel like 2D objects with mass and friction.
- **Implementation**: Use `spring` transitions, not linear or ease-in-out duration-based animations.

## Architectural Standards

| Property | Value | Rationale |
| --- | --- | --- |
| **Border Radius** | `0px` (default) | Strict alignment. |
| **Border Width** | `1px` or `2px` | High definition. |
| **Spacing** | `4px` baseline (`gap-1`) | Consistency. |
| **Typography** | Sans-serif / Mono | Readability. |
| **Colors** | OKLCH / CSS Vars | Theming support. |

## Component Stack

- **Radix UI**: Headless primitives.
- **Tailwind CSS v4**: Styling.
- **Framer Motion**: Animation.
- **Vaul**: Drawers.
- **Sonner**: Toasts.
