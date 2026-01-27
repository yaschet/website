# AI Engineering Guidelines

> Single Source of Truth for AI coding standards.

## Core Directives

1.  **Technical Language Only**: Keep comments and PR descriptions functional. Avoid flowery or emotive language.
2.  **Strict Documentation**: All exported code must have TSDoc comments (`@param`, `@returns`).
3.  **Verification**: Run `pnpm verify` after every change. Ensure no linting or type errors.
4.  **Resource Management**: Use `tsc --noEmit` for validation. Only run `pnpm dev` if necessary.
5.  **Design System**: Follow `docs/design-system.md` strictly. No magic numbers for styling or motion.
6.  **Complete Code**: Always write full file contents. No placeholders or `// ... rest of code`.

## Technology Stack

-   **Framework**: Next.js 16.1+ (App Router)
-   **Language**: TypeScript 5+ (Strict Mode)
-   **Styling**: Tailwind CSS v4, OKLCH colors
-   **State**: Zustand, TanStack Query v5
-   **Content**: Contentlayer2
-   **Tooling**: Biome, pnpm

## Project Structure

-   `src/components/ui`: Design system primitives.
-   `src/components/layout`: Structural components.
-   `src/components/features`: Domain logic.
-   `src/lib`: Utilities and shared logic.

## Workflow

1.  Edit files.
2.  Run `pnpm verify`.
3.  Fix errors.
4.  Report success.
