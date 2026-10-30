# Portfolio Storybook

Storybook is the portfolio's component workshop and browser-test harness. It
renders production components against the production design foundations.
Examples belong beside their components and describe supported states; they
are not a separate gallery of aspirational designs.

## Run And Verify

```sh
pnpm storybook        # Workshop at http://localhost:6006
pnpm build-storybook  # Static artifact; does not deploy it
pnpm test:storybook   # Chromium stories in both themes, then built Docs regressions
pnpm test:storybook:docs # Built Docs and component contracts against the current artifact
pnpm quality          # Full repository and production regression sequence
```

Install test browsers with `pnpm exec playwright install chromium webkit`.
Storybook browser tests use Chromium; the production E2E suite also covers
WebKit. The existing Quality CI workflow runs `pnpm quality`, so interaction and
accessibility failures participate in the same gate when these changes are
reviewed and released.

Build Storybook before running the complete workshop suite. Interaction tests
render stories; the separate Docs suite inspects the built documentation pages.
It checks natural preview heights, scrolling, fonts, narrow layouts, unique
field associations, contact isolation, and contained fixed navigation. It also
measures control sizes and verifies real player menus inside the lightbox,
fullscreen menu ownership, slider isolation, focus return, and narrow toast
dismissal. Feedback contracts measure the 48px status rail, 20px glyph, 14px
glyph insets, first-line alignment, 13/16 title and 12/16 description, and
40px toast dismissal. Compact Alerts keep a 44px rail and 12px glyph insets.
These checks run at phone and desktop widths in both themes with a 2x density
token check; they do not establish raster accuracy on every physical display.
Media network requests are blocked in these UI tests; they do not
verify stream delivery or decoding. A passing
story test does not prove that its Docs presentation is usable.

Browser and policy suites use at most two workers locally and one in CI. Keep
the quality sequence serial so builds and browser suites do not compete with
other local projects. For a light review of an already built workshop, stop its
development server first, then run
`pnpm exec vite preview --outDir storybook-static --port 6006 --host 127.0.0.1 --strictPort`.
This serves the current artifact without a file watcher; rebuild it after edits.

Keep a running development preview separate from production E2E tests:
`PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm quality` starts the production
server on 3100 while the normal website preview remains on 3000.

## Navigation And Coverage

| Group | Purpose |
| --- | --- |
| Overview | One documentation entry explaining navigation, implementation status and review paths. |
| Foundation | Brand overview, primitive/semantic colors, typography, spacing and motion. |
| Components | Actions, Feedback, Forms, Overlays, Navigation, Media and Content. Each entry owns its supported states. |
| Pages | Case-study composition and error, loading and not-found screens. |
| Lab | Retained alternative ProjectCard, MeshGradient and SwissGridCanvas examples without current production consumers. |

Component labels use readable words. Story titles organize the catalog; they do
not require renaming implementation exports. Existing unrelated component IDs
are explicit so bookmarks and regression tests survive the navigation cleanup.
The diagram family has one canonical ID: `case-study-diagram`.

`CaseStudyDiagram` is the only diagram frame. System Architecture, Validation
Loop, One To Many and Program Matching are authored views of it, not competing
implementations. The separate Pages / Case Study / In Context story verifies the
same diagram within the actual article shell. It disables inapplicable Controls
and Actions panels. See [Case-study diagrams](case-study-diagrams.md) for ownership
and the public-integration boundary.

The earlier diagram renderer and its global styles have been removed. Its public
Verto and Program Matching explanations are preserved in a neutral evidence
module. Program Matching now shares the same walkthrough, expanded view, node
geometry, motion and text alternative as the other compositions. Test-only
interaction stories remain outside the visible sidebar and Docs; opening an
example does not automatically change its state.

Contact stories exercise validation, pending/duplicate-submit protection,
success, rate limiting, retry identity, and transport failure. Assert what a
visitor sees and what happens to the draft. Server abuse-policy and adapter
tests remain in `tests/`; workshop mocks do not verify real delivery or Redis.

Foundation examples expose real CSS measurements and themes. Long metadata,
missing previews, confidential work, disabled/read-only/invalid fields, and
button hierarchy, control dimensions, and badge variants expose edge cases
alongside the default states. Toaster examples show a notification on mount,
use isolated Base UI toast managers, and make dismissal and action outcomes observable.
Media settings stories render the production menu without loading a stream.
The component bank is larger than the active portfolio; this workshop does
not claim complete coverage of every retained primitive.

CaseStudySummary renders the actual case-study header and facts, including long
descriptions and technology names. Its Docs checks cover natural heights and
reflow at 320px, 390px and 1280px in both themes. Production route tests cover
both public case studies, the contents dialog and wide rail, table insets,
whole-pixel reading type, image-viewer focus return and recoverable Markdown copy.

## Runtime Isolation

- Each story receives its own QueryClient, cleared on unmount, with retries and
  focus refetch disabled. One example must not seed another example's cache.
- The theme toolbar and native theme controls use the same next-themes provider.
  Backgrounds follow actual app tokens. `VITE_STORYBOOK_THEME` selects the
  initial test theme; both themes are required by the script. Persisted theme
  keys include the stable story ID so parallel examples cannot change each
  other's theme through storage events.
- Contact actions resolve through a Vite alias to
  `.storybook/mocks/contact-action.ts`. It imports only the result type from
  the production contract. Server environment, Redis, and email modules must
  never enter the workshop bundle. A safe unavailable response is the default;
  each interaction story resets its mock and supplies its own result.
- Use reviewed public images and fictional `.test` contact data. `staticDirs`
  serves those assets in Storybook and the test addon. Vite bundles static
  image imports. Tests have a separate dependency cache.
- Fonts use local Fontsource copies of the same families as production. The
  workshop does not depend on a font CDN at runtime.
- Docs render ordinary stories inline at their natural height. Do not force
  component examples into a fixed-height iframe. Documentation chrome follows
  the toolbar theme and uses the same locally loaded font families.
  The outer preview frame lets the document own scrolling, including at
  fractional zoom; code blocks and intentional component viewports retain their
  own overflow. New browser-only imports must be prebundled when Vite reports
  a dependency reload during tests; the production date formatter is included.
- Fullscreen examples still own outer clearance: `workshop-stage` supplies equal
  20px phone / 40px desktop insets. Route states use a contained 520px preview
  viewport; loading occupies the content region while its header and dock remain usable.
  This framing does not establish that the unfinished error or 404 page design is final.
- Mesh Gradient retains its January boxed-hero composition with current profile
  and action components. Swiss Grid Canvas demonstrates content-driven sections
  on the same centered 768px rail. Its canvas measures only its own host, not the
  Docs document, and leaves 10px for its 17px corner marks. Both experiments remain
  outside the public runtime. Canvas backing sizes are capped at 1.5 DPR.
- Pair responsive Capsize heading sizes with their weight and tracking role.
  `portfolio-hero-title` alone does not set a font size. Preview checks cover
  320px, 390px and desktop widths, including heading hierarchy, equal panel
  insets and alignment to the measured grid rail.
- Contact, Toaster, DropdownMenu, and FloatingNav Docs mount one primary example
  and link to their isolated Canvas states. Do not mount several live toast managers,
  global portals, or fixed navigation docks on one document. Navigation uses a
  CSS containing block to demonstrate fixed positioning without another frame.
- Toast stories use an isolated manager and an explicit portal host within the
  preview. StatusDisplay stories show actual states, title/body hierarchy, long
  messages and 48/64/80px line rhythm. Both render production feedback components.
- Field fixtures use React-generated IDs so inline examples keep unique labels
  and error descriptions. Controls remain available in a disclosure after the
  examples; the primary story is not repeated in the state list.
- The accessibility addon uses `test: "error"` globally. Dropdown stories cover
  a non-modal composition. Video-player menus, their custom chrome, and
  lightbox focus behavior still require their own interaction review.

Navigation stories use the framework's official pathname mock. This avoids
coupling a component story to private Next.js router-provider internals; actual
route navigation remains a production E2E responsibility.

## Authoring Contract

Use `satisfies Meta<typeof Component>` and `StoryObj<typeof meta>` for component
stories. Render the production export, reuse its supported props, and keep
fixtures public and truthful. Foundation compositions may use a component-less
Meta. Document meaningful limitations rather than inflating the coverage count.

Use args for supported variants. Use play functions for meaningful outcomes:
keyboard activation, validation, draft retention, completion, navigation state,
and stable geometry. Wait for returned responses and visible completion before
asserting or retrying. Reset timers, query state, and transport mocks. Do not
send a real request merely to make an example work.

Accessibility failures should be fixed in the owning component or fixture.
Do not globally disable a rule or skip a failing story to make CI green. Review
incomplete/manual findings in the interactive panel. Automated checks do not
replace screen-reader review, real route checks, responsive inspection, or
production performance evidence.

## Release Boundary

A static build is a local review artifact. Do not publish the workshop, push,
merge, or deploy as a side effect of foundation maintenance. Before any future
publication, review the generated artifact and public diff for private data and
server-only code, and follow `docs/version-control.md`.

The reusable implementation and its local adaptations are recorded in
[Foundation provenance](foundation-provenance.md). Dialog stories verify
keyboard dismissal and focus return; password stories verify masking, value
retention, pointer focus preservation and keyboard operation.

The open-menu story excludes only Base UI's generated focus sentinels from
automated accessibility scanning. Their hidden, tabbable redirect mechanism
triggers axe's `aria-hidden-focus` rule. Menu content remains scanned; keyboard
selection, Escape, Tab navigation and focus return remain interaction-tested.

About and Contact examples render `AboutPrinciples`, `EditorialSection`,
`ContactMethods`, `PageIntro` and `ContactMessage` from production. The form's
Page Section story includes its real heading and layout, using the same isolated
action mock as the existing validation/pending/failure/retry examples. Responsive
checks cover these compositions at 320px, 390px and 1280px in both themes,
including uncut text, equal contact-action baselines and submit widths.

`Components / Navigation / Context Rail` previews the production records treatment above
its real hero. New York, Dubai and Pacific time stories default to a 390px
viewport; Controls select nine markets. The shared panel uses 44px square control
chambers, uniform fact-row surfaces and a 150ms touch fade. Badges use compact
28px frames, shared 20px horizontal/row gaps and outer clearance, 44px hit areas,
uppercase highlights and one-step clock carries. Keyboard and reduced motion
remain immediate. There is no fixture-only styling
or alternate treatment. San Francisco shares the `America/Los_Angeles` timezone,
labeled "Pacific time" without changing its date-aware offset calculation.
Browser checks cover both themes at 320px and 390px, with previous and next
calendar dates, aligned values and repeated touch dismissal/reopening.


Use `pnpm storybook` when editing the live local workshop on port 6006. Serving
`storybook-static` while rebuilding it leaves open tabs pointing at removed hashed
modules. Static builds are for isolated verification or publication. ContextBadges
owns its mobile market stories and the above-hero example; the complete composition
keeps a 20px outer gutter, including below the hero.

Article Blocks exercise the production MDX code and table renderers independently
of authored case-study copy. Browser checks cover token contrast, exact clipboard
content, horizontal overflow and uniform table insets at phone and desktop widths
in both themes. A test-only Markdown Flowchart story retains coverage for fenced
Mermaid compatibility; it stays outside the public catalog of authored diagrams.
