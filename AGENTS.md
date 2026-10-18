# Website Agent Contract

This is Yassine Chettouch's public portfolio repository. Work stays inside this repository unless the owner expands the task. Preserve existing uncommitted work and inspect the diff before editing or committing.

## Read First

- `docs/engineering-standards.md`: source ownership, types, requests, and checks.
- `docs/design-system.md`: portfolio design and brand relationship.
- `docs/version-control.md`: branch names, commit/PR tone, and checkpoint rules.
- `package.json`: installed toolchain and executable commands.

These checked-in documents govern the work. Private skills are optional aids; contributors must be able to build and verify without them.

## Public Boundary

- Never copy private application source, personal records, credentials, client exchanges, or internal documentation into this repository.
- Do not import sibling repositories or add local `file:`/`workspace:` dependencies.
- Use reviewed public assets and evidence. Preserve confidential work boundaries.
- Keep secrets server-side; `NEXT_PUBLIC_*` values are public build output.
- `pnpm check:repository` checks filenames and imports, not arbitrary secret values or Git history. It does not replace secret scanning or human diff review.

## Working Rules

- Keep routes thin and content/metadata server-rendered. Put interactions in small client components; reuse existing UI and layout primitives.
- Use strict TypeScript, explicit type imports, named reusable exports, runtime validation at external boundaries, and kebab-case authored filenames.
- Follow Biome's existing tabs. Keep a formatting migration separate from behavior changes.
- Do not apply a broad redesign during infrastructure or content maintenance.
- MDX in `content/projects/` owns case-study prose. Generate Markdown from that source. New MDX components need serializer support or must fail closed.
- Keep LCP content server-rendered, media dimensions stable, and heavy effects deferred. Fetch full Markdown only after copy intent.
- Review production modules above roughly 500 lines for mixed responsibilities; do not split cohesive code at arbitrary line counts.

## Verification And Release

- `pnpm verify` checks boundaries, lint/format, and types without rewriting source.
- `pnpm fix` explicitly writes source; inspect its diff.
- Run `pnpm quality` for release candidates: verify, dependency audit, production build, browser/HTTP tests, and Storybook build.
- Review visible changes in a real browser on `localhost:3000`, including mobile, both themes, keyboard focus, and reduced motion where relevant.
- Never send a real contact email as a test without explicit authorization.
- Use the configured Git workflow (GitButler in a managed workspace). Keep changes scoped and review the public diff. Do not push, merge, or deploy incidentally during local maintenance. Inspect actual CI/deployment mappings before release.
- Report what passed, failed, remains, and whether anything was deployed. A build does not prove delivery, accessibility, or field performance.
