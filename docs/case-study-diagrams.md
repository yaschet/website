# Case-Study Diagrams

One canonical `CaseStudyDiagram` frame with several authored layouts. Nothing
here is integrated into a public MDX route or released. The superseded renderer
has been removed; its two public case-study narratives remain covered.

## Direction

Share the frame and interaction conventions, not one compulsory diagram layout.
A validation loop, a fan-out, a sequence and a system map explain different things.
The drawing should make one specific claim before a reader touches a control.

`CaseStudyDiagram` owns reader-controlled steps, an expanded view, stable caption
space and a complete text explanation. Each example owns its composition and
mobile arrangement. The reconstruction story preserves the public Verto example. Program Matching
preserves its schema, ordered import, resume and explained-score narrative.
The neutral evidence module has no dependency on an older diagram engine.
The one-to-many story is an explicitly illustrative pattern, not client evidence.
The Verto architecture story is authored from `content/projects/verto.mdx`,
Architecture A–C and Infrastructure. It summarizes those published responsibilities;
it does not add production metrics, unseen services or runtime status.

## Visual And Interaction Contract

- Consume existing Foundation color pairs; no independent palette. Use semantic
  fills and labels, not colored strips on card edges.
- Give each region an explicit material: Foundation surface for the heading
  and reading area, Foundation canvas for the drawing, control surface for disclosure,
  surface for neutral nodes, and paired semantic fills/inks for meaningful roles.
  Neutral nodes must remain distinct from the canvas in both themes.
- Headings and disclosures use paired 40px chambers, centered 16px glyphs,
  16px internal gaps and 16px outer insets. Drawing, reading and disclosure
  regions share their outer edges. The perimeter paints above full-bleed children
  so it remains continuous. Disclosure rows have their own equal 16px insets.
- Reuse the Office navigation geometry: 40px step controls, 32px icon chambers,
  16px glyphs, equal 4px insets and 4px between controls. A single surface-colored
  selection moves beneath ink labels; it does not invert into a competing primary action.
  The active label is semibold. Semantic chambers retain their roles across steps. Hover and inset
  keyboard focus remain visible without decorative control outlines.
  Narrow layouts retain the chambers and use two columns instead of clipping labels.
- Figure, caption, disclosure and explanation headings use 16/24 semibold type;
  descriptions use 14/20 regular type. Their text columns share the same edge.
- All four examples reuse `FigureNode`: 224 × 72px, 16px equal padding,
  a 40px icon chamber, 12px text gap and 16/24 semibold titles. Simple drawings
  are capped at native size instead of scaling their cards up to fill a wide story.
  Each simple figure caps its frame at its native drawing width plus the owned
  16px insets, avoiding extra side gutters. The architecture camera can zoom
  this shared geometry explicitly.
- Keep the canvas inset equal on all sides. The loop uses equal node widths,
  balanced outer column gaps and 16px system-boundary insets. Geometry, readable labels and routing
  take precedence over squeezing a desktop map onto a phone.
- Use a system boundary only when it explains ownership or a processing loop.
- Trace a relevant connection once after reader input. No autoplay or idle loops.
  Reduced motion switches states immediately.
- Reserve caption height across steps. Center the active title/description block
  beside its icon, including when a shorter explanation occupies the reserved space.
  Keep controls and focus stable. Explanation rows use the same block alignment.
- Move the selection on the Foundation tab clock. Keep one caption icon chamber
  mounted and use Foundation StateSwap for its glyphs; crossfade reserved text
  layers on the shared text clock. Trace the selected connection once. Do not translate
  captions vertically. The Base UI disclosure uses the shared accordion duration,
  and its direction icon uses Foundation's existing state swap. Keyboard changes
  and reduced motion bypass interpolation. Theme materials change together.
- Use the existing dialog for expansion, dismissal and focus restoration.
- Keep interaction tests separate from visible showcase stories, so opening a
  preview never automatically opens a dialog or advances the explanation.
- Provide meaningful SVG descriptions and an ordinary text explanation. Color
  and animation must never be the only way to understand a relationship.

## References And Their Roles

- [Brilliant](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/):
  sequenced visual explanations, hands-on exploration and immediate feedback.
  This reference governs the reading experience, not a decorative style imitation.
- [Red Blob Games](https://www.redblobgames.com/): algorithm explanations in which
  controls and diagrams reveal cause and effect.
- [Bartosz Ciechanowski](https://ciechanow.ski/): carefully authored illustrations
  and small controls that explain a physical mechanism.
- [C4](https://c4model.com/diagrams): choose the level of architecture detail for
  the audience. Do not place every abstraction level into one diagram.
- [React Flow](https://reactflow.dev/learn/advanced-use/accessibility): candidate
  engine for large maps needing viewport controls and keyboard navigation. It
  supplies interaction infrastructure, not the portfolio's design language.

## Architecture Viewport

`FigureViewport` adds a bounded, read-only camera to authored diagrams. It does
not need a graph runtime, layout worker or new dependency. `systemArchitectureDiagram`
owns a compact 800px desktop map, a full vertical mobile map and three
complete mobile stage compositions. The shared figure frame caps at 864px,
so the desktop map retains native typography inside the case-study article. Nine nodes share 224 × 72 geometry, 16px equal insets, 40px chambers,
16px glyphs, 16/24 titles and 14/16 compact descriptions. Desktop edges run in
reserved corridors; mobile routes preserve the same relationships.

- The architecture walkthrough comes before the canvas in visual and keyboard
  order, so a phone reader chooses a step before inspecting its region.
- The canvas follows the wide diagram plus its 16px insets. Mobile stage height
  follows the visible cards and connectors, with equal clearance on all four sides.
  The full mobile map keeps a bounded 560px camera. Expansion uses the existing
  dialog. The artboard is clipped, not a nested scroll area. The canvas has no
  redundant inner perimeter; the figure frame owns the structural boundary.
- Wide Map starts fitted at native scale. The full mobile map starts at a readable
  90–100% scale; complete mobile stages fit their visible bounds. Fit always
  shows the complete artboard with equal clearance; a fitted mobile map is an
  overview, not a substitute for its readable walkthrough and text explanation.
- On mobile, selecting a narrative step shows its complete authored composition,
  including return and branch routes. Adjacent stages cannot peek through the
  edges. The wide map keeps its camera steady while highlighting the path.
  Fit and manual zoom do not
  change the selected explanation. The camera clamps panning to the artboard
  and zooming between whole-map fit and 200%.
- Ordinary wheel and touch scrolling remain browser-owned. Drag mode explicitly
  enables mouse/pen/touch panning and two-pointer pinch zoom around the gesture
  center. Escape exits drag mode; pointer cancellation clears gesture state.
  Drag is disabled when the whole artboard fits, with an explanation beside the
  controls. Fit exits drag mode. A selected drag control uses the information soft
  material and paired ink, with a distinct keyboard-only inset focus treatment.
- Keyboard users focus the named canvas: arrows pan, plus/minus zoom, Home or
  zero fits. The help text exposes these commands. Buttons provide zoom and fit
  without gesture requirements. Keyboard and reduced-motion camera changes
  are immediate.
- Semantic ink identifies paths and persistent node chambers: information
  for intake, warning for revision, success for accepted output. Neutral node
  surfaces and fine perimeters stay stable. Meaning is also expressed in the
  labels, arrows and ordinary text explanation.
- Next.js and Supabase use the installed Remix framework glyphs beside their
  ownership labels. Service names remain text; logos do not replace responsibilities
  or imply an undocumented integration. No extra asset or icon dependency is loaded.
- Connections reveal in order, each taking the Foundation fast duration (250ms).
  A serial connection begins when the preceding trace finishes; sibling fan-out
  branches reveal together because they do not imply a processing order.
  No autoplay, marching ants, simulation or idle animation loop.
  Step changes interrupt the sequence. Reduced motion shows the completed path.

Pointer movement updates a camera ref and schedules at most one transform write
per animation frame, without a React render per pointer event or repeated layout
reads. React receives the settled camera when the gesture ends. Temporary
`will-change` and pending frames are cleared after gestures and on unmount.
No animation loop runs at rest. The browser tests record local frame intervals
and long tasks; this is a diagnostic, not a promise of 240 FPS on every device.
The isolated timing sample sets Storybook's accessibility scanner to manual mode;
the separate story suite still requires accessibility checks in both themes.
Set `FIGURE_PERFORMANCE_TRACE=1` to attach a bounded Chromium timeline to this test.

## Page Context Preview

`Pages / Case Study / In Context` composes the real site header,
project shell, facts, media, contents rail, footer and floating navigation. It uses
Verto's public image and an explicitly abridged body. The figure sits within the article's media width, capped at 864px, while prose retains its reading measure. This is a Storybook
composition, not a replacement for the parallel case-study content or public MDX.
Both themes and mobile are covered alongside the isolated diagram stories.

## Ownership And Integration Boundary

- `case-study-diagram.tsx` owns the shared walkthrough, caption, full explanation
  and expanded view. It exports the canonical `CaseStudyDiagram` and its types.
- `case-study-diagram.examples.tsx`, `program-matching-diagram.tsx` and
  `verto-architecture.tsx` own authored layout props for that frame. They are
  compositions of the same component, not alternative diagram engines.
- `figure-viewport.tsx`, `figure-node.tsx` and `diagram-drawing.tsx` are internal
  camera, node and connector building blocks. They do not need separate catalog
  entries to claim a second diagram system.
- `case-study-diagram.data.ts` preserves the earlier public explanations without
  the removed engine's layout types. Case-study MDX remains the evidence owner.
- `Components / Content / Case Study Diagram` is the only component story family;
  `Pages / Case Study` is its separate in-page composition review.

These are authored explanations, not an editor or automatic graph layout system.
Before public MDX integration, confirm narrative against approved evidence, add
Markdown serializer support, and verify production bundle cost. No public route,
case-study prose or Private Office source is changed by this consolidation.

## Reading And Attention

The controls confirm selection immediately; the route animation explains the
relationship after that feedback. The page does not wait for the sequence.
Keep the overview stable so readers can compare steps without relearning positions.
On phones, use complete authored stage compositions instead of cropping through
neighboring cards or making every label tiny to fit the full map. The text explanation remains available
without panning. Perfect mirror symmetry is not a substitute for truthful topology:
align related edges and repeat insets while preserving branches and return paths.

These choices apply [W3C guidance on whitespace and grouping](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p10-whitespace/)
and [NN/g guidance on motion for comprehension](https://www.nngroup.com/articles/animation-usability/).
They are design decisions to review with readers, not evidence of guaranteed
engagement, comprehension or a universal neuroscience formula for visual taste.
