# Design System

> **Single Source of Truth for UI/UX decisions.**

## Relationship To Other Yaschet Products

The public portfolio and Private Office are different products in one brand.
Keep their repositories, runtime components, and releases independent. The
website must build from its own checkout without access to private packages.

| Foundation | Portfolio application |
| --- | --- |
| Space Grotesk | Public copy and editorial hierarchy; owned by `src/lib/fonts.ts` |
| Space Mono | Code and technical metadata; not a substitute for readable body copy |
| Sharp geometry and 4px spacing baseline | Shared visual principles, adapted to public page composition |
| Swiss grid and aligned keylines | Responsive editorial layout, rather than dense workspace chrome |
| Contrast, focus, keyboard access, reduced motion | Required interaction principles in both products |
| Palette, type scale, density, navigation | Portfolio-owned; do not copy private application defaults |

The existing website already shares the two type families and geometric
principles. This is deliberate brand alignment, not automatic token
synchronization. Runtime colors and component APIs remain independent.

`src/app/globals.css` owns the current website tokens and layout roles;
`src/lib/physics.ts` owns motion presets; Storybook renders the same runtime
styles. Review these implementations alongside this document. Do not import a
private stylesheet or reproduce application controls across public pages.

If repeated work demonstrates a stable need, extract a small, reviewed public
brand package containing only fonts/assets and foundational tokens. Version it
and update consumers explicitly. A shared component library or repository move
is not a prerequisite for improving the portfolio.

## Portfolio Principles

The design follows a **minimalist, grid-based** approach.

- **Swiss Grid**: Strict adherence to the 12-column grid.
- **Motion**: Animations use the spring and duration/easing presets in `src/lib/physics.ts`.
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
- **Implementation**: Use the existing presets in `src/lib/physics.ts`. Springs
  serve physical movement; existing duration/easing presets serve reveals and
  color changes. Respect reduced motion and keep essential content visible.

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
