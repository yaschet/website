# AGENTS.md

## Project Overview

Personal portfolio for Yassine Chettouch, built with Next.js App Router, React, TypeScript, MDX content, Tailwind CSS, and Vercel-oriented performance guardrails.

## Setup Commands

- Install dependencies: `pnpm install`
- Start development server: `pnpm dev`
- Build production app: `pnpm build`
- Run production server after build: `pnpm start`
- Run lint and type checks: `pnpm verify`
- Run performance and endpoint tests: `pnpm test:e2e`

## Code Style

- Use TypeScript strict patterns and existing local abstractions.
- Prefer Server Components and server-only utilities for content, metadata, and generated text routes.
- Keep client components small and interaction-focused.
- Use existing UI primitives from `src/components/ui` and layout primitives from `src/components/layout`.
- Do not introduce broad visual redesigns while making infrastructure or content changes.

## Content Rules

- Public case studies live in `content/projects/*.mdx`.
- Do not manually duplicate public case-study prose into generated Markdown routes.
- AI-readable Markdown surfaces must be generated from the MDX source of truth.
- If a new custom MDX component is added to case studies, update the AI Markdown serializer or keep the generated route failing closed.

## Verification

- Run `pnpm verify` after code changes.
- Run `pnpm build` before testing production performance.
- Run `pnpm test:e2e` when changing routes, sitemap behavior, public content, or performance-sensitive UI.
- Verify browser-facing UI on `localhost:3000` when changing visible components.

## Performance Constraints

- Keep LCP-sensitive content server-rendered.
- Do not ship full Markdown bodies to the browser for copy features; fetch them only after user intent.
- Avoid adding generated Markdown routes to the visual sitemap performance loop unless tests are updated to treat text routes separately.
- Keep media lazy-loading and layout dimensions stable.
