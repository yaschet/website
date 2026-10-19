# Engineering Review — October 18, 2026

## Decision

Keep the portfolio in its independent public repository. Keep the private
application independent. Share brand principles and adopt proven engineering
rules, while preserving each product's typography scale, palette, density,
navigation, and component ownership. No repository move is needed.

Both already use Space Grotesk, Space Mono, sharp geometry, and Swiss layout
principles. Their runtime token values are not automatically synchronized.
A small versioned public brand package may make sense after repeated work
establishes stable shared needs. Extracting the whole private UI system would
couple different products and increase publication/release risk.

## Baseline Evidence

The checkout contained five pre-existing edited files; preserve them separately
from this maintenance work. The initial read-only checks found:

- TypeScript passed; Biome reported 3 errors and 12 warnings.
- Registry audit reported 90 advisories: 3 critical, 36 high, 39 moderate, 12 low.
  These are dependency findings, not evidence of exploitation or deployment state.
- Next.js was 16.2.3 and React was 19.2.5.
- No checked-in GitHub Actions workflow existed.
- `verify` silently rewrote source; pre-push tests could use an old build.
- README and agent guidance described Contentlayer although runtime uses `@next/mdx`.
- Performance tests returned successfully for an empty sitemap and treated a
  missing LCP measurement as zero. They did not verify HTTP status per visual route.
- `globals.css` contained approximately 3,000 lines and was excluded from Biome.
  Media gallery and Swiss grid canvas each exceeded 1,000 lines; video playback
  exceeded 2,200 and the topographic field exceeded 1,400. These need
  responsibility reviews, not arbitrary splitting.

## Maintenance Scope

Update compatible dependencies, correct contributor guidance, make verification
read-only, add CI and dependency update proposals, enforce known public import
and filename boundaries, ignore generated output, and repair false-positive
performance passes. Preserve the existing interface during this foundation work.
Correct repeated document-title suffixes and give icon-only navigation links
accessible names, as confirmed during the browser review.

Next.js partial prefetching remains explicitly disabled to retain existing
navigation semantics. Adoption needs a dedicated link/navigation review as
described in the [official migration guide](https://nextjs.org/docs/app/guides/adopting-partial-prefetching).

The framework update addresses a real maintenance requirement, including the
[October 14 security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026).
Use the lockfile and recorded check results for the final installed state.

## Next Product Work

1. Review the existing home → case study → contact journey on desktop and mobile.
   Prioritize clear contribution, evidence, honest outcomes, and a usable next step.
2. Audit light/dark contrast, keyboard focus, reduced motion, touch targets, and
   media behavior. Current performance/endpoint tests are not a full accessibility audit.
3. Consolidate portfolio tokens and repeated component states through its existing
   Storybook. Inspect the large stylesheet before changing global roles. Existing
   shadow utilities also diverge from the documented no-shadow rule; resolve that
   implementation drift during the component review.
4. Review gallery/canvas ownership and unused dependencies incrementally, with
   behavior preserved and focused checks. Avoid mixing formatting migrations in.
5. Verify actual GitHub branch protection/secret-scanning settings and deployment
   mappings before release. Workflow files do not configure those host settings.

The contact follow-up replaces the suppressed `any` types with a small field
contract and adds shared address/email/global quotas, a hidden bot trap, bounded
input and action bodies, same-origin checks, safe failures, and idempotent email
requests. See `docs/contact-form.md` for exact limits and tradeoffs. Preview and
production require Redis credentials and a hashing secret before release;
provider connectivity and delivery have not been verified. No real email was sent.

## Remaining Dependency Work

Compatible dependency updates and a narrowly scoped Rollup 4 security constraint
remove the baseline high and critical findings. The unused legacy Zod form
adapter was removed; current forms validate directly with Zod.

One low-severity KaTeX advisory remains through Mermaid 11
([GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7)).
It requires existing prototype pollution and unsafe insertion of rendered math;
this is a dependency finding, not evidence of those preconditions here.
Mermaid 12 is a separate migration: its default layout/appearance and browser
floor change. Do not force a cross-minor KaTeX override or hide the advisory.
Review the existing Verto diagram and browser support during that migration.

Storybook's transitive `tsconfck` still declares a TypeScript 5 peer while this
project uses TypeScript 6. Record Storybook build results rather than patching
the peer declaration to conceal the upstream mismatch. TypeScript 7 adoption
also needs a separate toolchain compatibility review.

## Verification Record

- Installed framework baseline: Next.js 16.4.2, React 19.3.1, TypeScript 6.0.3.
  Node 24 is the CI baseline and `@types/node` follows that major.
- `pnpm quality` passed on local Node 26.4.0 and, after aligning Node types,
  Node 24.22.0: repository checks, Biome, types, dependency audit, production
  build, 12 browser/HTTP tests, and Storybook build.
- Tests covered desktop Chromium, mobile Chromium, and mobile WebKit. Lab
  metrics are checked only when the browser exposes them; they are not field
  performance or a complete accessibility audit. Resume HTTP 200 and an unknown
  blog route's HTTP 404 were also checked separately.
- Manual browser review covered home, the case-study index, Verto, and contact,
  desktop/mobile layouts, and both themes. Correct document titles and accessible
  navigation names were verified in the browser. No contact message was sent.
- Gitleaks 8.30.1 found no matches across 638 locally available commits and the
  public candidate text files. This detects known patterns, not all private data.
- No high or critical dependency findings remain. One low KaTeX finding remains.
  The original Biome warning concerned the 2.3 MiB SVG removed in the follow-up
  below. Storybook builds with upstream directive warnings, and the TypeScript
  peer warning remains documented above.
- The five pre-existing edited files are byte-identical to their starting
  snapshot. No private application source was modified or copied.
- Maintenance is recorded in a local Git checkpoint. GitHub CI has not run these
  workflow files; nothing was pushed, merged, or deployed.

## Unused Icon Cleanup

`src/app/icon0.svg` contained a 1254 × 1254 PNG embedded as base64, totaling
2,414,063 bytes. No source/configuration/content references existed, and none
of the 16 prerendered HTML files linked to it. Although its filename generated
an icon route, the site's metadata selected `favicon.ico` and
`/images/avatar.png`. The unused SVG was removed; the active icon assets and
metadata configuration were preserved.

After removal, `pnpm verify` passed without warnings and the production build
passed on Node 24. All 16 generated HTML files retained identical icon links.
HTTP checks confirmed the seven public HTML routes still reference the active
icons, both icon assets return 200, and the removed SVG route returns 404.

## Contact And Version-Control Follow-Up

The contact policy now has 14 deterministic tests, including installed Upstash
and Resend adapters with every provider request intercepted. Tests cover input
and origin validation, each quota, hashed identifiers, trusted address handling,
missing configuration, timeout/outage rejection, safe errors, and retry keys.
No real email was sent and no live database was provisioned.

Production-browser checks verified draft retention after a mocked network error
and an actual missing-configuration response. Repeated submit events while
pending initially exposed a duplicate path; an explicit submit-event guard now
keeps one request pending. Exact manual retries retain their UUID. The hidden
bot-trap discard path verified successful UI reset without email delivery.
Keyboard order and error descriptions were checked. The form's existing styles
and layout remain unchanged; desktop/mobile captures in both themes were reviewed
with reduced motion enabled.

The final Node 24.22.0 quality run passed: repository checks, Biome, TypeScript,
dependency audit, 14 policy/adapter tests, production build, 12 browser/HTTP tests,
and Storybook compilation. The documented low KaTeX advisory and upstream
Storybook warnings remain. Gitleaks found no matches in the 223 candidate text
files before committing this follow-up. The five pre-existing drafts remain
byte-identical and excluded from these checkpoints.

`docs/version-control.md` now defines scoped conventional commit/PR titles,
imperative factual language, commit bodies, semantic branch names, and stack
dependencies. A commit-message hook, PR template, and CI title check cover syntax.
Current remote refs were checked: `main` is `00c48aa`, and `release/v2.06` is
`f4331f6`, three commits ahead. Existing published history was preserved. New work
uses separate local maintenance, Git-convention, and contact-fix branches stacked
above that release branch. These are local checkpoints; no push, merge, deployment,
or host protection change was performed. Redis configuration and deployed
connectivity/header verification remain release requirements.
