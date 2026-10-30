# Performance

Measure the production build with a cold browser cache. Development includes
compilation, diagnostics and hot reload; its timings do not represent delivery.
The performance tests run in the existing Quality browser jobs.

## Loading boundaries

- Listing routes import `src/content/project-summaries.ts`. It reads validated
  metadata without importing the MDX module graph. `src/content/registry.ts` owns
  full article loading; keep it out of listing routes.
- Keep Next.js route prefetching enabled. Prefetching an article must not
  download or initialize its playback engine or diagram renderer. Those libraries
  load from their mounted client components. Video streams wait for playback
  intent; a poster remains visible while the engine loads.
- Server-render headings, prose and the first project poster. Preserve image
  dimensions and responsive sources. Do not hide primary content behind an
  entrance animation, a client fetch or a whole-page loading screen.
- Effects already pause outside their observation region and honor reduced
  motion. Profile shaders on real devices before increasing their resolution or
  complexity. A headless software renderer cannot establish GPU frame rates.

## Regression budgets

`e2e/script-budget.spec.ts` checks fresh visits to Home and Case Studies after
idle enhancements and automatic prefetching settle. Same-origin JavaScript must
stay below **550 KiB compressed** and **1.7 MiB decoded**. It also checks that
prefetching does not register the video engine or request a video stream.
These are local regression budgets, not industry thresholds or total-page size.
Review added functionality and its import graph before raising them.

The existing `e2e/performance.spec.ts` checks public routes for lab LCP below
2.5 seconds and observed layout shift below 0.1. Run against a retained production
build with one worker, for example:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 pnpm exec playwright test \
  e2e/script-budget.spec.ts e2e/performance.spec.ts --project=mobile-chrome --workers=1
```

For comparisons, hold viewport, device scale, cache state, network and CPU
throttling constant; run at least three samples and report the median. Distinguish
JavaScript bytes, render timing and interaction latency: fewer bytes alone do not
prove better LCP or INP. Do not promise a fixed frame rate across devices.

## Bundle analysis and field data

The installed Next.js CLI provides `pnpm exec next analyze` for the Turbopack
module graph. Inspect unexpected client imports, large libraries and duplicate
dependencies. Verify the resulting network transfers in a production browser;
an import that leaves initial HTML can still download during route prefetching.

Vercel Speed Insights collects production field data. Assess LCP, INP and CLS at
the 75th percentile, separately for mobile and desktop. The good thresholds are
2.5 seconds, 200 milliseconds and 0.1 respectively. Local browser tests cannot
establish field Core Web Vitals or conversion improvements.

References: [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist),
[lazy loading](https://nextjs.org/docs/app/guides/lazy-loading),
[package bundling](https://nextjs.org/docs/app/guides/package-bundling),
[Core Web Vitals](https://web.dev/articles/vitals).
