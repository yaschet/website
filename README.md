# Yaschet's Website

Yassine Chettouch's public portfolio: selected work, case studies, writing, and contact paths. Built with Next.js App Router, React, strict TypeScript, Tailwind CSS v4, and MDX compiled through `@next/mdx`.

Server-rendered content and metadata, generated Markdown resources, Space Grotesk/Space Mono typography, and a responsive Swiss grid form the foundation. Storybook is the component workshop. Exact versions live in [`package.json`](package.json) and the lockfile.

## Development

Use Node 24 (the CI baseline) and the pinned pnpm version.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Configure local application URL; see docs/contact-form.md for delivery setup.
pnpm dev
```

Environment files stay local. `NEXT_PUBLIC_*` values appear in browser output. CI uses an inert email-key fixture for compilation; it does not send messages or verify delivery.

```sh
pnpm verify          # Read-only repository, lint/format, and type checks
pnpm fix             # Apply safe Biome fixes; inspect the diff
pnpm test:unit       # Contact policy/adapter tests with intercepted transports
pnpm quality         # Verify, audit, unit tests, build, browser tests, Storybook
pnpm storybook       # Component workshop on port 6006
pnpm test:storybook  # Light/dark browser interactions and accessibility
```

`pnpm test:e2e` expects a production build and starts `next start` on port 3000. Install browsers with `pnpm exec playwright install chromium webkit`.

## Source And Contracts

- [`AGENTS.md`](AGENTS.md): contributor and agent entry point.
- [`Engineering standards`](docs/engineering-standards.md): ownership and verification.
- [`Design system`](docs/design-system.md): portfolio foundations and brand boundaries.
- [`Storybook`](docs/storybook.md): real component states, isolation, browser/accessibility tests.
- [`Foundation audit`](docs/foundation-audit.md): findings, consolidation, and remaining design work.
- [`Version control`](docs/version-control.md): branches, commits, PR titles, and descriptions.
- [`Staging`](docs/staging.md): protected review deployments and production separation.
- [`Contact form`](docs/contact-form.md): abuse policy, configuration, and tests.
- `src/app/`: routes, metadata, generated text responses.
- `src/components/`: layout, UI, forms, MDX rendering.
- `src/styles/tokens.css`: portfolio palette, semantic roles, typography, geometry.
- `src/content/`: server content pipeline and Markdown serialization.
- `content/projects/`: case studies; source of truth for generated Markdown.
- `e2e/`: browser and HTTP checks.
- `tests/`: isolated policy and transport tests.

This is an independent public repository with no runtime dependency on a private application. It reuses a reviewed local copy of Yaschet Foundation and owns its public experience and release lifecycle. See [Foundation provenance](docs/foundation-provenance.md).

Local checks, CI, preview acceptance, and production deployment are separate evidence. See [LICENSE](LICENSE) for licensing.
