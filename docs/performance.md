# Performance Engineering Guide

We use a standardized performance infrastructure to prevent regressions in production.

## 1. CI Enforcement (Prevention)

We enforce hard limits on performance metrics using **Playwright**. This runs in a headless browser and measures real Web Vitals.

### Command
```bash
pnpm test:e2e
```
*   **Prerequisite**: Run `pnpm build` first.
*   **What it does**: Checks `LCP < 2.5s` and `CLS < 0.1` on key routes.
*   **When to run**: Before every push.

## 2. Bundle Analysis

We visualize the JavaScript bundle to ensure no heavy dependencies (like `moment.js` or full `lodash`) are included.

### Command
```bash
pnpm analyze
```
*   **What it does**: Opens an interactive treemap in your browser.
*   **What to look for**:
    *   **Large Blocks**: Heavy libraries.
    *   **Duplicate Packages**: Different versions of the same lib.
    *   **Unexpected Code**: Server code leaking into the client bundle.

## 3. Development Monitoring

While developing, we inject a real-time HUD to warn you if you break thresholds.

### Usage
1.  Run `pnpm build && pnpm start` (Production Simulation).
2.  Browse your site.
3.  **Watch the toast notifications**:
    *   ✅ **Green**: All good.
    *   ⚠️ **Yellow**: Borderline.
    *   🚨 **Red**: You broke the 2.5s LCP limit.

---

## Performance Thresholds (Google Core Web Vitals)

| Metric | Good (Target) | Poor (Fail) | What it measures |
| :--- | :--- | :--- | :--- |
| **LCP** | < 2.5s | > 4.0s | **Loading Speed** (Largest Content) |
| **INP** | < 200ms | > 500ms | **Interactivity** (Click delay) |
| **CLS** | < 0.1 | > 0.25 | **Visual Stability** (Jumping content) |
