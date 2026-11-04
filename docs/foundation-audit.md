# Portfolio Foundation Audit — 19 October 2026

Scope: consolidate the portfolio foundations, preserve the cleaner editorial
design, align Yaschet branding, and improve the workshop. Private Office edits and
production releases are outside this change. The later owner-authorized reuse
pass copies reviewed Foundation source into the portfolio; see provenance below.

## Findings And Consolidation

| Before | After | Why |
| --- | --- | --- |
| Active tokens, Tailwind mappings, layout CSS, and overridden palette experiments mixed together | Tokens have one owner in `src/styles/tokens.css`; runtime layout remains in `globals.css`; inactive palette blocks removed | Make actual values discoverable without changing the established palette |
| Documentation claimed a 4px baseline while runtime used 10px spacing | Documented the existing 10px rhythm, 20px structural step, and control sizes | Keep the written contract consistent with rendered components |
| Hero links duplicated button treatments | Server-safe button styles shared by native links and client buttons | Prevent visual drift while preserving server-rendered navigation |
| Decorative shadows, global outline suppression, low-contrast secondary text | Tonal planes/keylines, visible focus fallback, corrected text/background pairs | Preserve the visual direction while improving keyboard and reading access |
| Profile identity introduced a second page heading | Identity retains its appearance without a competing `h1` | Preserve meaningful document hierarchy |
| Stories included missing image paths and outdated project descriptions | Reviewed public fixtures and actual hero, profile, project gallery, fields, and empty-state components | Review the interface that the portfolio actually renders |
| No browser story gate; workshop config omitted from TypeScript | Typed workshop configuration plus light/dark interaction and accessibility tests | Catch broken states and contracts before release |
| Shared workshop query state and competing theme configuration | Per-story caches and persisted theme keys, synchronized theme controls, separate test cache | Keep examples independent and reproducible |
| Contact workshop had no production-form state coverage | Isolated transport mock and validation, pending, success, rejection, retry, and failure stories | Exercise public UI outcomes without sending mail or importing server credentials |
| Retained visual experiments mixed with active components | Explicit Experiments group | Avoid presenting unused code as current portfolio behavior |

The initial token extraction was compared against 200 computed dark-theme
custom properties in the local browser; the values matched. Targeted contrast
and semantic fixes intentionally change the affected foregrounds and markup.
Automated story checks cover both themes and fail accessibility violations.
The exact verification results belong in the change report, not a permanent
claim that a repository can never regress.

## Verification On 19 October 2026

The first pass below verified stories and production routes, but missed the
actual Docs layout. Its all-pass result did not establish workshop readiness:
globally disabled inline rendering left large components in 100px iframes.
The owner's subsequent review identified that gap.

### Workshop Correction

| Before | After | Why |
| --- | --- | --- |
| Large components clipped into 100px Docs frames | Inline, natural-height previews with one document scroll | Make the complete component readable |
| Default light Docs chrome around differently themed previews | Docs theme follows toolbar globals; local font families applied without Next font-mock variable overrides | Review typography and color in a coherent environment |
| Repeated primary preview followed by a large API table | Primary appears once, states follow, API controls remain in a disclosure | Put the rendered interface first |
| Overview showed only a few buttons and badges | Production actions, fields, validation, status/icon treatment, type, and a truthful scope statement | Show how the current foundations compose |
| Long-metadata gallery fixture also used the missing-media fallback | Public media, production date formatting, and disciplined image treatment | Isolate the state under review |
| Fixed navigation inherited another iframe's theme defaults | One contained inline viewport | Keep fixed positioning visible and theme controls synchronized |
| Inline field fixtures would reuse IDs | Per-instance IDs and associated errors | Preserve meaningful labels in multi-example Docs |
| Active dropdown primitive had no workshop review | Non-modal selection, open, disabled-option, Escape, and focus-return examples; consistent geometry and motion | Begin testing actual interaction contracts |

The new built-Docs regression suite checks both themes, phone and desktop
gallery layouts, narrow foundation pages, field associations, one contact
form per document, and fixed-navigation bounds. Story tests remain necessary
for interactions and accessibility; neither replaces a visual or assistive
technology review.

The correction passed the complete storage-wrapped `pnpm quality` sequence:
repository checks, Biome, TypeScript, dependency audit (no known advisories),
14 policy/adapter tests, production build, 24 production E2E tests, Storybook
build, 86 story tests in each theme, and 16 built-Docs layout tests. After
capping local workers at two (one in CI), verification, policy tests, both
story themes, and the Docs suite passed again without another build.

The owner reloaded the restored workshop for visual inspection. The overview
and gallery were reviewed in both themes, including live toolbar switching;
the long-metadata gallery was also inspected at phone width. The continuing
review uses the current static artifact on port 6006 without a file watcher.
It must be rebuilt after source edits. The website development preview remains
on port 3000; no other project's server was stopped.

### Component Contract Correction

| Before | After | Why |
| --- | --- | --- |
| Player menus duplicated tiny type, selection marks, and modal behavior | One production non-modal radio menu, 32px rows, selected-state semantics, trigger focus return, fullscreen portal ownership | Preserve readable controls and nested overlay behavior |
| Video controls shrank at narrow widths | 40px controls and 16px glyphs; rows wrap instead | Preserve hit areas and reading size |
| Lightbox listened for keys on `window` and had no explicit opener restoration | Scoped shortcuts, explicit initial Close focus, stable gallery/opener restoration, announced slide state; nested menus and sliders own their keys | Keep focus and dismissal predictable |
| Lightbox dialog presence and zoom gestures mixed in one large module | Radix owns dialog presence/focus; zoom gestures have a separate production owner | Reduce competing lifecycle responsibilities |
| Input, menu, and button size aliases disagreed; direct menu children flexed down to text height | Foundation 28 / 36 / 40 / 44 / 48px controls and independent non-shrinking 32px menu rows, tested against rendered bounds | Make the sizing contract real |
| Buttons used a JavaScript press spring and a large permutation wall | Native button/Slot, contained press feedback, neutral inset focus, quieter secondary surfaces, purposeful hierarchy showcase | Reduce runtime work and demonstrate intended use |
| Toasts used uppercase titles, monospace copy, boxed icons, and a hidden tiny close control | Sentence-case reading text, regular status glyphs, shared actions, visible 36px dismissal; examples visible on mount | Make feedback readable and reviewable |

Shared Yaschet principles were compared read-only against the private product's
written standards and representative controls. The public implementation stays
independent; no private features, records or internal document were copied. This is an owned
public contract, not an automatic token synchronization mechanism.

The retained component bank still needs deliberate usage and API review. These
corrections cover the named active components; they do not establish maturity
or full coverage for every retained primitive. Browser tests block remote media
to verify control behavior without consuming video bandwidth or decoder work.
Actual streaming, physical-device gestures, and assistive technology still need
separate verification when those areas change.

### Initial Foundation Verification

`PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm quality` passed: repository
boundaries, Biome, TypeScript, dependency audit (no known vulnerabilities),
14 unit tests, production build, 24 production E2E tests, static Storybook
build, and 83 browser stories in each theme. Production E2E covers desktop
Chromium, mobile Chromium, and mobile WebKit, including reduced-motion
preferences, heading structure, overflow, and contact navigation.

The local browser review covered the home page in both themes, a 390px mobile
layout, focused contact fields, and the composed Storybook foundation in both
themes. The overview's accessibility panel reports zero violations and one
inconclusive contrast rule affecting 11 elements: axe cannot determine the
background beneath the grid's keyline pseudo-elements. The rendered foreground
and background pairs were inspected in both themes; the pseudo-elements draw
perimeters/dividers rather than covering the text. Keep this manual finding
visible and revisit it when those treatments change. No rule was disabled.

The Storybook build still reports upstream bundler warnings about client
directives and large chunks; the Node 26 test runtime also reports a deprecated
loader API. Those are tooling follow-ups, not evidence of a production
performance assessment. Screen-reader review and field performance remain
separate work.

## Remaining Design Work

- Refine portfolio composition and case-study presentation through actual page
  review. This foundation pass is not a complete redesign.
- Evaluate the retained component bank before retiring unused primitives. The
  three explicitly grouped experiments remain available for deliberate review.
- Continue narrow-layout, keyboard, reduced-motion, and assistive-technology
  review as components change. A passing axe run is not a complete audit.
- Add targeted stories when introducing a new real state or interactive flow;
  do not add redundant examples just to increase a count.
- Keep public brand alignment deliberate. No automatic synchronization with
  private application source was introduced.

No release or deployment is part of this audit. See [the design contract](design-system.md)
and [Storybook guide](storybook.md) for the continuing workflow.

## Foundation Reuse Correction

The earlier public implementation was visually different from the owner's
Foundation. The current port replaces the relevant palette, button recipe,
fields, badge, alert, dialog, dropdown and toast with the actual owned source.
Remix glyphs and the Foundation motion styles are used by those components.
No shared package is introduced. Office is read-only; the portfolio owns its
local implementation and editorial layout. See
[Foundation provenance](foundation-provenance.md) for the reviewed inputs,
source fingerprints, local adaptations and manual update boundary.

The previous verification counts above describe earlier snapshots, not a
current all-pass guarantee. Current verification results are reported with the
change. The small-text alert opacity correction and generated menu focus-guard
scan exception are documented explicitly in provenance and the Storybook guide.

### Feedback Geometry And Typography Correction

The toast review exposed an actual cascade defect: unlayered editorial paragraph
styles overrode compact component type, making the description 17/28px. Editorial
defaults now live in the base layer so component typography owns its rendering.
The toast composes the owned Alert and IconChamber with StatusDisplay geometry:
48px rail, 20px glyph, 14px insets, 13/16px medium title, 12/16px regular body,
and a 4px title/body gap. Its 40px dismiss button aligns with the first text line
and glyph. Long copy stretches the material without recentering the glyph;
title-only feedback retains the 48px minimum. Compact Alerts use a 44px rail
and 12px glyph insets with the same first-line principle. Error glyphs inherit
the semantic chamber ink instead of overriding it with the destructive fill.

Toast previews now have their own portal host and manager. StatusDisplay is
the owned component with local imports and public fixtures. New geometry checks
cover short, titled and multiline feedback in both themes at 390px and 1280px.
They check the 2x hairline token; Chromium emulation can quantize computed border
lengths, so this is not a claim of physical-display raster equivalence.

The lightbox now owns its video-menu portal. Escape dismisses the nested menu
before the lightbox, and leaving the player cannot hide a keyboard-open menu
during a fullscreen transition. Focus, selection, fullscreen ownership and
dismissal are covered by the component suite without loading remote streams.

The storage-wrapped full `pnpm quality` run passed repository checks, Biome,
TypeScript, dependency audit (no known vulnerabilities), 14 unit tests, production
build, 24 production E2E tests, Storybook build, 109 stories per theme, and 40
Docs/component tests. After the final compact-alert and error-glyph refinements,
`pnpm verify`, the Storybook build, all 109 stories in each theme and all 40
Docs/component tests passed again. The preview remains local on port 6006;
the website development server remains on port 3000. Builds and browser suites
run serially with bounded workers. No Office edit, shared package, commit, push
or release is part of this correction. The earlier tooling warnings and manual
review limitations above remain applicable.

### Control And Heading Precision

The next visual review corrects the floating notification composition described
above. Toasts now use a padded heading with matching 40px icon and soft close
chambers, centered 16px glyphs, equal 16px outside insets and gaps, and a vertically
centered title/description block. Titles use 14/20px medium and supporting copy
12/16px regular with a 4px gap. Explicit Foundation border and popup-depth tokens
prevent the legacy default border from becoming nearly white in dark mode.
The joined rail remains appropriate for inline StatusDisplay and Alert; it is
not the floating notification recipe. Toast entry moves 16px over 250ms, exit
takes 150ms, and keyboard dismissal and reduced motion remove the transition.

Default dialog headers use the same paired chambers. The close control occupies
the heading grid row and centers with wrapped copy instead of using an absolute
top offset. Headerless dialogs retain their close fallback. Video menus use
40px rows with centered 24px selection chambers, 8px equal insets, aligned label
and metadata columns, and opaque popup materials. Their triggers use contextual
16px glyphs, 12px horizontal insets and 8px gaps. Keyboard opening, including
Enter-generated clicks, bypasses menu and dialog motion; focus ownership and
Escape dismissal remain with the underlying primitives.

Default buttons share 40px height, 12px insets and 8px gaps. Pending buttons
reserve matching side slots and keep their label stable. The contact submit
button retains its label and dimensions while busy. Password fields use one
continuous input-group frame around the field and full-height square reveal
control; keyboard focus, invalid state and the entered value survive reveal.

Heading labels use sentence-case 13/20px medium Space Grotesk with normal
tracking and semantic muted ink. The Foundation examples no longer introduce
slash-prefixed numbering, and the public page labels and contact action no
longer contain literal all-caps labels.

Regression coverage measures chamber and glyph dimensions, centers, opposed
insets, copy gaps, pending width, native link composition, password reveal,
keyboard focus restoration and reduced motion in both themes at 390px and
1280px with a 2x device scale. Real-browser review also covers a 320px Storybook
viewport, desktop controls in both themes, and the contact page's field focus
and button in both themes. Pixel measurements describe CSS geometry; they do
not establish equivalence across all physical display rasterization.

The workshop root now paints the active canvas material and reserves a native
scrollbar lane only when content overflows. This removes the unused white gutter
seen in dark, narrow component previews without changing the website's stable
page gutter or hiding functional scrollbars.

Verification passed: repository boundaries, Biome, TypeScript, dependency audit
(no known vulnerabilities), 14 unit tests, production build, 24 production E2E
tests, Storybook build, 112 stories in each theme, and 44 Docs/component tests.
After the workshop gutter correction, the static build, all 44 Docs/component
tests and `pnpm verify` passed again. The unchanged Office baseline matched all
1,755 recorded file hashes. Existing unfinished portfolio changes remain in the
checkout. Verification ran serially with at most two workers, reused the checkout
and existing previews, and used the workspace storage wrapper for the production
sequence. No Office edits, shared package, commit, push or release were made.

### Homepage And Project Card Precision

The actual homepage now uses measured responsive hero type: 32/40px below 360px,
36/44px on larger phones and 48/56px from 640px. The restrained background field
supports the copy, and the selected-work section has its own named heading.
Native navigation uses the server-rendered ButtonLink, including the Foundation
material attributes required for outline frames and focus treatment.

Project cards use equal 20px copy insets on mobile and 30px from 640px, 20px
group gaps, 24/32px and 28/36px title scales, and a centered 40px action chamber.
Summaries remain complete; technology lists wrap without overflowing. Preview
and card borders have separate owners. A shared 48px poster action keeps its
label, icon slot and width stable when the Foundation spinner replaces play.
The poster remains server-rendered and rich media still loads on intent.

Real-browser review covered desktop and 390px mobile in both themes, plus the
compact 320px layout. Regression coverage checks equal insets, title/action
centers, complete summaries, long unbroken metadata, keyboard focus, stable
preview dimensions and pending controls. These are CSS geometry and emulated
browser checks, not physical-device or field-performance guarantees.

Verification passed: repository boundaries, Biome, TypeScript, dependency audit
(no known vulnerabilities), 14 unit tests, production build, 24 production E2E
tests, Storybook build, 117 stories per theme and 52 Docs/component tests. The
final production run includes the compact heading and native-link corrections.
An existing field geometry assertion now waits for its settled CSS state rather
than sampling an initial transition. Earlier tooling warnings remain applicable.
All 3,366 recorded Office source hashes matched the task baseline. Existing
unfinished portfolio work stays in place. Checks ran serially with at most two
workers, reused the checkout and previews, and used the workspace storage wrapper
for production verification. No Office edit, package extraction, commit, push or
release is part of this pass.

### Case-Study Reading Precision

Both public case studies now render the production CaseStudyHeader and
CaseStudyFacts. Introductions use 32/40px and 36/44px title scales, separate
20px content groups, readable dates and a stable 40px Markdown control. Fact
columns fill the available width, including Verto's two-fact layout; technology
labels wrap on compact phones. Article type uses whole-pixel sizes and leading,
tables have equal 16px cell insets, and code has a separate, always-visible
copy control. Authored case-study content, metadata and project claims are retained.

The contents dialog uses the Foundation's matched header chambers and managed
focus lifecycle. Escape returns to its trigger; a section selection transfers
focus to the selected heading. The reading rail appears only where it fits
outside the article, from 1536px. Article images reuse the existing gallery
viewer and restore their actual opener on dismissal. Below-fold article media
is lazy. Markdown copy is intent-driven, deduplicated, cancellable and recoverable.

Real-browser review covered both case studies in light and dark at desktop and
mobile widths, including 320px, 390px and the 1600px reading rail. New regression
coverage checks typography, equal table insets, wrapping metadata, full-width
facts, contents focus, image focus return, and pending/error/success copy states.
Assertions wait for streamed markup and opening geometry to settle. These are
browser and CSS-geometry checks, not physical-device or field-performance evidence.

Storybook renders the same production introduction and facts, with natural-height
Docs checks at 320px, 390px and 1280px in both themes. The outer Docs preview
now lets the document own scrolling, removing fractional-zoom scrollbar lanes
without changing intentional code or component scrolling. The date formatter
is prebundled to prevent Vite from reloading the browser tests on first use.

Verification passed: repository boundaries, Biome, TypeScript, dependency audit
(no known vulnerabilities), 14 unit tests, production build, 41 production E2E
tests, Storybook build, 120 stories per theme and 58 Docs/component regressions.
Four desktop-only viewport checks are intentionally skipped on phone projects;
the same checks run in desktop Chromium. Existing Storybook directive and chunk-size
warnings and Node's module.register deprecation remain visible. All 3,366 Office
source hashes match the task baseline. Existing unfinished portfolio work is
preserved. Verification ran serially with at most two workers, reused the current
checkout and previews, and used the storage wrapper for Next.js checks. No Office
edit, package extraction, commit, push or release is part of this pass.

## About And Contact Precision (19 October 2026)

About now uses the same responsive introduction type as the homepage, plus real
section headings and a correctly nested principle hierarchy. `EditorialSection`
owns one boundary and equal insets; the reading measure, 30px group gaps,
whole-pixel type and two-column principle layout are shared by production and
Storybook. Removed the low-contrast numbered section labels and static-card
hover decoration. The duplicate Profile ID is removed. Authored prose and
project/engagement claims are retained.

Contact uses production `ContactMethods` and `ContactMessage` compositions.
Native Foundation links replace client button wrappers for navigation. Methods
stack before 1024px and align their action rows at desktop widths. Fields have
8px label gaps, 24px field gaps and 40px controls; the message area starts at
160px. Submit fills phones and retains its content width above that breakpoint.
Labels, controls, errors and the honeypot use per-instance identifiers. Name and
email expose autocomplete purposes. Server validation, quota, idempotency and
duplicate-submit guards are unchanged. Pending, failure/draft retention and
retry identity continue to pass the isolated action-mock stories. No email test
was performed against the real action.

Visual review covered light/dark About and Contact, desktop and compact phone
layouts, including 320px and 390px. The new stories render actual production
exports. Browser regressions check responsive type, uncut text, matched action
baselines, field associations, validation recovery, message height and submit
width. Route checks account for Next's hidden retained Activity trees after
native link navigation and inspect the rendered page's IDs.

Verification: repository boundaries, Biome, TypeScript, dependency audit (no
known advisories), 14 unit tests, production build, 41 existing production E2E
tests plus six new About/Contact route checks, Storybook build, 125 stories per
theme and 64 Docs/component regressions. Four desktop-only viewport checks are
intentionally skipped on phone projects. Existing Storybook directive/chunk-size
warnings and Node's module.register deprecation remain visible. Browser viewport
checks are not physical-device or field-performance evidence.

All 3,366 Office source hashes match the task baseline. No existing portfolio
source file was removed. Changes preserve the earlier Foundation, homepage and
case-study work. Checks ran serially with at most two workers, using the current
checkout, the Next.js storage wrapper and the existing previews. No package
extraction, Office edit, commit, push or release is included in this pass.

## Listing And Mobile Media Follow-up (21 October 2026)

The Blog empty state now composes the actual Foundation IconChamber: a 40px
square with a centered 20px glyph and equal 10px insets. Its unused decorative
plate styles are removed. The Blog and Case Studies closing actions now use
the server-safe ButtonLink directly, retaining their labels and materials.

Mobile review exposed a separate deferred-media activation defect. Keyboard
focus could replace the poster before activation, and the gallery's initial
reset could clear a pending playback request. Focus no longer starts that
replacement; video posters defer touch enhancement until activation, speculative
loading leaves Play available, and the gallery resets before applying playback
intent. A regression checks the first tap or Enter activation in both themes
across desktop Chromium, mobile Chromium and mobile WebKit. It blocks streams
deliberately; playback evidence below comes from a separate real-stream review.

Actual Phoenix gallery and article videos decoded frames and advanced their
playheads at mobile width in both themes, without media errors. Playback was
paused or allowed to finish after the bounded review. The article lightbox
initially focuses Close, dismisses with Close or Escape, and restores its actual
opener. Code copy announces success; automated clipboard isolation verifies the
exact copied text without relying on the host clipboard.

Mobile code review also found faint comments and punctuation. Syntax aliases now
use more readable steps from the existing palette; tested non-empty syntax tokens
meet 4.5:1 contrast against their rendered code surfaces in both themes. Code
retains 13/20px typography, a 40px copy control and local horizontal scrolling
without widening the document. Mobile screenshots cover both articles' code and
the Phoenix image lightbox in light and dark.

The video-menu keyboard story now waits for the popup to become visible before
interacting. The first Storybook run exposed a race with its opening lifecycle;
the assertion is retained and waits for the rendered state rather than an
arbitrary delay.

Verification passed: repository boundaries, Biome, TypeScript, production build,
23 targeted route/media browser tests, Storybook build, all 125 stories in each
theme and all 64 built-Docs/component regressions. Four desktop-only viewport
checks are intentionally skipped on phone projects. The production browser
matrix covers Chromium, mobile Chromium and mobile WebKit; the real-stream
review used the local Chromium browser at mobile width. These checks do not
establish physical-device, assistive-technology or field-performance behavior.
Existing upstream Storybook client-directive warnings and Node's loader
deprecation remain visible.

All 1,799 recorded Office source hashes match this task's baseline, and no
baseline portfolio file is missing. Existing unfinished work remains in place.
Production verification reused the checkout through the workspace storage
wrapper; builds used at most two workers and browser suites used one worker.
The updated static workshop remains on port 6006, with the website development
preview restored on port 3000. No shared package, Office edit, commit, push or
release is part of this follow-up.

## Persistent Chrome, Contrast And Shared Motion (21 October 2026)

The root layout now owns the location, highlights and clock rail. Navigation
retains its DOM and marquee animation instead of restarting them on each route.
All three controls are 40px high, with square flag/clock chambers, 20px gaps and
20px clearance above the first page card. Compact layouts keep location and time
on the first row and place highlights below. The clock uses masked digit columns;
the marquee pauses for hover, focus, explicit intent and hidden tabs, and stops
under reduced motion.

Portfolio sections use quiet card material over the canvas. The initial well
material made large wrappers too gray and weakened their hierarchy; that change
is removed. Structural boundaries remain solid hairlines. Confidential work has
a readable heading, appropriately nested on Home and the listing page, without
another nested panel. The topographic field's original tonal-band recipe is
restored while retaining the shared Foundation neutral ramp.

The floating dock is dark in light mode and light in dark mode. One clipped
feedback plane moves beneath the controls and returns to the current route when
hover or focus ends. Its stacking cannot obscure glyphs; `aria-current` continues
to identify the actual route independently of hover and optimistic feedback.
One retained, measured tooltip shell moves between anchors, with independently
transitioning text rather than scaled text. Opening, handoff, hover retention,
Escape/activation dismissal and unavailable-anchor cleanup share one lifecycle.
Keyboard and reduced-motion handoffs are immediate. The reusable motion reference
and public boundary are recorded in the Foundation provenance document.

Copy, playback, volume, fullscreen and theme controls use the Foundation state
swap pattern. Copy labels reserve their geometry and retain current accessible
names. The case-study reading-time row matches its adjacent 40px action. Theme
changes use the owner-authorized scene-transition pattern, with immediate
keyboard/reduced-motion behavior. Web Vitals no longer create visitor toasts;
development diagnostics and the existing production reporting remain separate.

Verification passed: repository boundaries, Biome, TypeScript, dependency audit
(no known advisories), 14 unit tests, production build, 74 production browser
tests, Storybook build, 127 stories per theme and 64 built-Docs/component tests.
Four desktop-only viewport checks are intentionally skipped on phone projects.
The initial production matrix caught the geometry test reading the streamed
loading state; it now waits for the actual first card and fonts before measuring,
without weakening the geometry assertions. The full matrix then passed. Video
menu assertions inspect the accessible current value and visible state layer;
tooltip accessibility checks wait for the completed transition.

Visual review covered desktop and mobile in both themes, including the dock,
shared hint, confidential-work section, header rail and restored field contrast.
Browser checks cover Chromium, mobile Chromium and mobile WebKit, keyboard focus,
fast pointer interruptions, retained route animation and reduced motion. Local
lab budgets passed; these are not field Core Web Vitals or physical-device data.
Existing upstream Storybook directive/chunk warnings and Node loader deprecation
remain visible.

All 3,372 recorded Office source hashes remain unchanged and none of the 387
baseline portfolio files is missing. Existing unfinished portfolio work remains
in place. The reference repository was read only. Heavy checks ran serially,
builds used at most two workers and browser suites used one. Verification reused
the current checkout through the storage wrapper; the development preview on
3000 and static Storybook on 6006 remain available. No shared package, Office
edit, commit, push or release is included.

## Perception, Material Hierarchy And Direct Manipulation (21 October 2026)

Portfolio material now has explicit canvas, content-panel and code roles using
the existing Foundation neutral ramp. White content sits on mineral-300 in light
mode; neutral-950 content sits on neutral-900 in dark mode. HTML and body agree.
Major frames, project bodies, context badges and shader fallbacks use the panel
role. Code has a separate quiet surface. The original topographic tonal bands
remain intact. Transparent warning controls use the existing deeper interaction
ink on the light canvas; the ordinary warning ink measured 4.48:1 there.

The inverse dock uses one counter-inverse route indicator, with glyphs remaining
readable during partial coverage. Theme owns a separate soft interaction surface.
The entry is an 8px / 200ms fade and translation without a blur wash. One retained
tooltip has a 32px height, content-measured width and 12px clearance above the
outer dock. Fully hidden hints reanchor before opening; continuous handoffs move
the existing shell and crossfade its text. Keyboard and reduced-motion changes
are immediate. The header uses matching 40px chambers, 13/20px labels and 20px gaps.

Highlights now support direct pointer/touch dragging, bounded inertial release,
keyboard stepping and persistent pause. Sentence-case labels have equal 16px
spacing around separators, including the repeating seam. Autoplay uses the Web
Animations API at 24px/s; JavaScript animation frames run only during a bounded
release. Vertical touch scrolling and pinch zoom remain available. Hidden tabs
pause work; reduced motion preserves manual control without autoplay or inertia.
Pointer activation and keyboard activation account separately for focus pause.

The design-system document records the perceptual rationale, primary sources and
limits. Processing fluency informs grouping, repetition and figure-ground
clarity; neither a premium shade nor improved conversion is established by this
implementation. Local checks are not field Core Web Vitals measurements.

Verification: repository boundaries, Biome, TypeScript, dependency audit (no known
advisories), 14 unit tests and production build passed. The complete production
matrix passed 80 tests with four intentional desktop-only skips on phone projects.
After the final warning-ink and pointer-focus corrections, a new build and all
27 chrome browser checks passed across desktop Chromium, mobile Chromium and
mobile WebKit. Storybook built successfully and all 64 built Docs/component
checks passed. Each theme passed 128 of 130 story interaction/accessibility tests.
The two CaseStudyDiagram stories failed accessible-name checks because button
names omit visible metadata. Those files were being edited in parallel and were
left untouched; the full workshop suite is not green. Existing upstream
Storybook directive/chunk warnings and the Node loader deprecation remain visible.

Visual review covered both themes on desktop and a phone-sized viewport, including
direct marquee dragging and the shared dock hint. All 3,372 recorded Office files
retain their hashes; no recorded portfolio file is missing. No shared package,
dependency change, Office edit, commit, push or release was made in this pass.
Heavy checks ran serially with at most two build workers and one browser worker.
Verification reused the checkout through the workspace storage wrapper. The
temporary production server stopped; development on 3000 and static Storybook on
6006 remain available.

## Diagram Accessible Names (21 October 2026)

The parallel CaseStudyDiagram revision had already removed the title-only ARIA
name override when this follow-up began. Native button contents now supply both
the visible title and metadata as the accessible name. That component change was
preserved. Both stories now explicitly check the full names of all ten example
nodes, alongside the existing selection, relationship-copy and arrow-key checks.
Accessibility rules remain enabled and errors still fail the suite.

Repository boundaries, Biome, TypeScript and the Storybook build passed. All 130
stories passed in each theme; both diagram stories also passed focused reruns
after the final assertion typing correction. All 64 built Docs/component checks
passed. Both diagram examples were visually reviewed in light and dark mode.
Existing upstream module-directive warnings and the Node loader deprecation
remain visible. A production Next.js build was not repeated for this story-only
change.

The delivered component is an interactive diagram viewer with phase columns,
forward/return connectors, selectable steps, explanatory text and keyboard
navigation. Its two examples are available in Storybook; the component is not
yet registered in MDX or rendered by a case-study route.

Only the diagram stories and this audit entry changed in this pass. Component
logic, geometry, fixtures, styles and case-study prose retain their starting
hashes, as do all 3,372 recorded Office files. No baseline portfolio file is
missing. Checks ran serially with one browser worker and at most two build
workers. The existing static preview on 6006 was refreshed without another
persistent server. No dependency manifest change, commit, push or release was
made.
