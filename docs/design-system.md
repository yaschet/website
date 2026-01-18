# Design System Philosophy

This document outlines the core design principles and "Swiss Design" philosophy that governs the user interface of this project.

## Core Principles

1.  **Swiss Design Influence**: The interface emphasizes cleanliness, readability, and objectivity. It uses strong grid systems, asymmetric layouts, and sans-serif typography (Inter/Geist) to achieve a "International Typographic Style" aesthetic.
2.  **Precision Engineering ("The Blade")**: A metaphor for the design system's focus on sharp, 0px rounded corners, high-contrast borders (usually 2px), and exact alignment. Elements are designed to feel "cut" and precise, rather than soft or organic.
3.  **Interaction Design**: Motion is used to convey physics and weight. Animations should be synchronized (e.g., via Framer Motion) to feel responsive and grounded, not decorative.
4.  **Monochromatic Aesthetic**: The visual language creates impact through contrast and structure rather than hue. Color is used semantically and sparingly.

## Architectural Standards

*   **Geometry**: Default border radius is 0px.
*   **Borders**: Primary borders are 2px solid.
*   **Typography**: Monospace fonts are used for technical data; Sans-serif for navigation and content.
*   **Spacing**: Strict adherence to a 4px baseline grid.

## Component Implementation

Components are built using:
*   **Radix UI**: For accessible, headless primitives.
*   **Tailwind CSS**: For utility-first styling.
*   **Framer Motion**: For complex, physics-based animations.
*   **React Hook Form / TanStack Form**: For type-safe form validation.
