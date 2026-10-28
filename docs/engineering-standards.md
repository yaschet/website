# Engineering Standards

## Purpose

The portfolio demonstrates product engineering through clear public proof, readable source, accessible interactions, and reproducible verification. Enforce mechanical rules with tools and review judgment calls. Standards are not a promise of zero defects.

## Toolchain And Ownership

`package.json` and `pnpm-lock.yaml` own versions. Use pinned pnpm and `pnpm install --frozen-lockfile`. CI uses Node 24. Biome owns formatting and lint; TypeScript runs in strict mode. Preserve existing tabs until a separate formatting migration. Do not add a competing formatter or change frameworks to resemble another product.

| Location | Responsibility |
| --- | --- |
| `src/app/` | Routes, layouts, metadata, generated responses, Server Actions |
| `src/components/layout/` | Public shell and editorial composition |
| `src/components/ui/` | Reusable controls, media, and interactions |
| `src/components/forms/` | Form presentation and validation integration |
| `src/content/` | Server content loading, contracts, Markdown serialization |
| `content/` | Authored MDX and public case-study evidence |
| `src/lib/` | Shared helpers, schemas, fonts, motion contracts |
| `e2e/` | Browser and HTTP regression tests |
| `scripts/` | Repository and maintenance tooling |

Keep framework entrypoints thin. Group new feature logic by responsibility as it grows; avoid unrelated tree reorganizations. Review mixed modules above roughly 500 lines. Stylesheets and declarative data require separate judgment; line count alone is not a quality score.

## Types And Documentation

Use configured aliases, explicit type imports, named reusable exports, and kebab-case filenames. Default exports are appropriate for framework entrypoints. Use `unknown` with runtime validation at untrusted boundaries. Do not add `any`, non-null assertions, or casts to conceal broken contracts.

Document public helpers and non-obvious invariants with accurate TSDoc: units, missing values, failure, cancellation, and returns when useful. File overviews use ordinary block comments. Do not manufacture documentation coverage through redundant comments.

## Requests And Mutations

Prefer server content and local state. Add TanStack Query for real asynchronous interactions. Keys contain every result-affecting criterion; forward cancellation, bound retries, choose freshness intentionally, and avoid unnecessary polling or focus refetches. Measure request counts when changing fetch behavior.

Validate Server Action input independently of UI state. Public contact submission uses the shared limits, failure policy, and configuration in `docs/contact-form.md`. Prevent duplicate submits, retain failed drafts, and do not automatically retry writes without idempotency. Return safe errors and keep provider details and credentials out of browser responses and application logs. A real delivery test requires explicit authorization.

## Public And Design Boundaries

The website and private application have independent source, dependency, and release boundaries. Never import private UI packages, records, or local sibling paths. The owner-authorized Foundation copy is locally owned and documented in `foundation-provenance.md`. No shared package is part of this implementation. Any future package needs an explicit version contract and separate review.

Keep generated output, environment files, private keys, and research captures out of Git. Review media for publication rights and private information. The filename/import checker is narrow; repository-host secret scanning and public diff review remain necessary.

## Verification

| Command | Evidence |
| --- | --- |
| `pnpm check:repository` | Forbidden filenames, generated output, known private/local imports |
| `pnpm lint` | Biome lint/format checks without source writes |
| `pnpm typecheck` | Regenerate ignored Next.js declarations, then check TypeScript contracts |
| `pnpm verify` | All three checks above |
| `pnpm audit:dependencies` | Registry advisories; all low-or-higher findings fail |
| `pnpm build` | Production compilation and route generation |
| `pnpm test:unit` | Contact security policy and installed-adapter tests with intercepted transports |
| `pnpm test:e2e` | Browser/HTTP checks against a built production server |
| `pnpm build-storybook` | Component workshop compilation |
| `pnpm test:storybook` | Chromium story interactions/accessibility in both themes, then built-Docs layout checks |
| `pnpm quality` | Complete release-candidate sequence |

Local tests can reuse a server; CI starts a fresh production server. CI uses an inert build-only email-key fixture, never production email credentials. Tests must not submit a deliverable contact message. Endpoint checks do not prove email delivery. Lab LCP/CLS checks are regression signals, not field Core Web Vitals or a complete accessibility audit.

The checked-in Quality workflow runs on PRs and pushes to main/staging branch names. Its presence does not enable branch protection or prove a staging deployment exists. Dependabot proposes reviewed updates. Before release inspect actual protection, checks, deployment mapping, public diff, and preview behavior. Preserve an identifiable rollback commit and report deployed status separately.

The workflow also runs a separate Gitleaks secret-scan job with full checkout
history. PR comments and finding-artifact uploads are disabled. Secret scanners
detect known patterns; they do not prove the absence of private information.
Host branch protection must require the relevant checks before they gate merges.

Follow `docs/version-control.md` for scoped conventional commit/PR titles,
factual descriptions, branch names, and coherent checkpoints. Local hooks and
CI check syntax; review must still assess the meaning and evidence.

See `docs/storybook.md` for workshop authoring, isolation, and coverage boundaries.
