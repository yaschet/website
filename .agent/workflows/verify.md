---
description: Verify codebase health (Format, Lint, Typecheck)
---

# Verification Workflow

Run this workflow after making changes to ensure the codebase remains in an elite state.

1.  **Format and Typecheck**
    -   Run the combined verification script.
    -   // turbo
    -   `pnpm verify`

2.  **Analyze Results**
    -   If `pnpm verify` fails, YOU MUST FIX THE ERRORS.
    -   Do not ask for permission to fix linting or type errors caused by your changes.
    -   Repeat step 1 until it passes.
