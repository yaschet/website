# Version Control

## Branches And Checkpoints

Use `type/short-purpose`, for example `fix/contact-form-abuse-controls` or
`chore/website-maintenance`. Use lowercase kebab-case and describe the work.
Reserve `release/*` for an actual release process. Existing published branch
names and history remain valid; do not rewrite them for cosmetic consistency.

GitButler manages this checkout. Its checked-out `gitbutler/workspace` branch is
an integration view; commits belong to the named branches shown by `but status`.
Use GitButler for branch, commit, and push operations. A stacked branch depends
on the branches beneath it; review and merge those dependencies in order.

Commit one coherent change at a time, including its tests and documentation.
Inspect the selected diff and preserve unrelated drafts. A local commit is a
checkpoint, not a deployment. Do not push, merge, or deploy without that scope.

## Commit And PR Titles

Use Conventional Commits with a scope:

```text
fix(contact): reject submissions when abuse controls are unavailable
```

Allowed types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`,
`chore`, and `revert`. Use a short lowercase kebab-case scope such as `contact`,
`website`, `deps`, or `git`. Add `!` only for a breaking change and explain it
with a `BREAKING CHANGE:` footer. Keep the subject within 72 characters.

Use an imperative verb, factual language, and a concrete result. Avoid
superlatives, personal commentary, vague cleanup claims, and claims of delivery
that were not verified. Match the type to the actual change: moving code without
new behavior is `refactor`, not `feat`.

Separate the subject and body with a blank line. Explain the problem, resulting
behavior, meaningful validation, and remaining limitations when they matter.
Small self-explanatory changes can omit the body. Do not include secrets,
private records, or copied internal conversation. Commit signing is optional;
commit messages do not prove cryptographic identity.

PR titles follow the same format and describe the final diff. PR descriptions
state the problem, resulting behavior, verification, and any release requirement.
Use the checked-in template. Squash titles must retain the conventional format.

## Enforcement And Release

The `commit-msg` hook checks message syntax in clients that run Git hooks. The
Quality workflow checks PR titles, including title edits. Grammar, scope,
truthfulness, and checkpoint boundaries still require review. Older commits are
not retroactively rejected. Repository-host settings must require CI checks
before these checks can gate a merge.

Before release, inspect current remote refs, CI, protection rules, deployment
mapping, and the public diff. Verify a production build and browser behavior.
Keep an identifiable rollback commit; report commit, push, and deployment state
separately. Never rewrite published history just to standardize its tone.
