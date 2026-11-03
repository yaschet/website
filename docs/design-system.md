# Portfolio Design System

## Brand And Product Boundary

Yaschet has one identity and distinct products. The portfolio uses Space Grotesk,
Space Mono, sharp geometry, neutral tonal planes, and aligned keylines. It owns
its editorial hierarchy, spacing, navigation, components, and release lifecycle.
Private Office and this portfolio now use locally owned copies of the same
Yaschet Foundation. Controls, palette, glyphs and motion are reused from the
actual implementation; product layouts and release lifecycles stay independent.
The portfolio builds without access to Office or a shared package. See
[Foundation provenance](foundation-provenance.md) for scope and adaptations.

## Sources Of Truth

| Source | Owns |
| --- | --- |
| `src/styles/foundation/` | Yaschet Foundation palette, semantic materials, control geometry, typography, focus and motion |
| `src/styles/tokens.css` | Portfolio editorial type, spacing, canvas/panel/code roles and compatibility aliases to Foundation |
| `src/app/globals.css` | Runtime base styles, editorial layout roles, component treatments |
| `src/lib/fonts.ts` and `src/components/layout/portfolio-type-styles.tsx` | Font families, metrics, Capsize alignment |
| `src/styles/foundation/motion.css` and `src/lib/physics.ts` | Foundation UI motion and portfolio editorial transitions |
| `src/components/ui/button-styles.ts` | Server-safe button appearance shared by native links and client buttons |
| Storybook stories beside components | Supported examples, states, and interaction assertions |

Keep primitive → semantic → component responsibilities clear. Use semantic
roles for foreground, surfaces, borders, and focus. Choose paired foreground
and background shades together; a palette index alone does not prove contrast.
Do not recreate a component's styles at a call site or add another competing
palette in global CSS.

## Portfolio Rules

| Property | Contract |
| --- | --- |
| Typography | Space Grotesk for reading, labels, dates, and counts; Space Mono for project category lines, code, identifiers, shortcuts, and true system metadata |
| Hierarchy | One page-level heading; profile identity and metadata do not introduce competing `h1` elements |
| Geometry | Square default; component-specific exceptions must have a functional reason |
| Structure | Responsive Swiss grid, registered keylines, stable media dimensions |
| Spacing | 10px rhythm; 20px structural step; named 10 / 20 / 30 / 40 / 80px roles |
| Controls | 28 / 36 / 40 / 44 / 48px Foundation scale; 32px compact / 40px video menu rows |
| Color | OKLCH primitives and light/dark semantic roles; neutral editorial hierarchy |
| Depth | Flat editorial planes and hairlines; restrained popup depth |
| Focus | Neutral 2px inset control focus; native fallback for other interactive content |
| Motion | Stable control geometry; contained press feedback; owned overlay focus and dismissal; shared motion presets and reduced-motion support |

Hairlines and small optical clearances are separate measurements, not a second
spacing system. Functional focus rings, autofill paint, and inset keylines may
use CSS shadow mechanics. Editorial surfaces and project cards remain flat during
interaction; their keylines and action materials communicate state.
Avoid vibrant or multi-color gradients. Restrained monochromatic background
fields are permitted and must not obscure essential content.

## Components And Semantics

Use native links for navigation. `ButtonLink` provides the complete Foundation
appearance attributes and shared styles without adding client JavaScript.
`buttonVariants` alone supplies classes, not the material attributes.
Use `Button` for actions, including
its disabled, loading, focus, and reduced-motion behavior.

Controls use Foundation's `xs` / `sm` / default / `lg` / `xl` geometry:
28 / 36 / 40 / 44 / 48px. The portfolio's existing `md` prop means default.
Use default or larger controls for primary actions; media touch controls use
48px. Control text is 14/20px Space Grotesk. Glyphs default to 16px independently
of their hit area. Compact menu rows are 32px; video settings use 40px rows with a centered 24px selection chamber and even 8px insets.

Buttons use Foundation's press, hover and keyboard behavior. Use solid for the
primary commitment, soft for secondary actions, outline for a quiet keyline,
and plain for tertiary actions. Legacy `outlined` and `ghost` props resolve to
these same recipes. Status colors carry meaning,
not decoration. The workshop's showcase demonstrates hierarchy rather than
every color and size permutation.

Inline feedback follows Foundation's joined chamber composition. StatusDisplay uses a 48px semantic rail, a 20px glyph with a 14px top/side inset,
and 16px text padding. The glyph center aligns with the first 16px text line;
wrapping extends the rail without vertically recentering the glyph. Routine
status text is 12/16px medium. Optional sentence-case titles are 13/16px medium,
with a 4px gap and 12/16px regular supporting copy. Add a title only when it
communicates different information. Compact standalone chamber Alerts use a
44px rail and 12px text padding.

Floating notifications use the owned IconChamber and Base UI manager, live
announcements, stack and swipe dismissal. Their heading follows the modal
composition: equal 40px icon and soft close chambers, centered 16px glyphs,
16px outer insets and gaps. The title/supporting-copy block is vertically
centered between the chambers, including when it wraps. Notification titles
are 14/20px medium; supporting text is 12/16px regular with a 4px gap.
Actions occupy a separate row below the copy. Notifications enter 16px over
250ms and leave over 150ms, without blur; keyboard dismissal and reduced
motion are immediate. Inline StatusDisplay rails remain a separate composition.

Modal headers use the same paired 40px chambers and 16px gaps. The close
control participates in the heading row instead of being pinned to the top of
wrapped copy. Default modal widths remain 384/480/640px, with 16px viewport
clearance. Base UI retains focus ownership and dismissal.

Default 40px buttons use equal 12px horizontal insets and 8px icon gaps. The
`icon` slot owns one glyph chamber, at `iconPosition="start"` or `"end"`.
Loading replaces that glyph with the Foundation spinner using `StateSwap`.
Each icon layer fills the same centered grid cell, including nested state swaps;
inline text baselines must not add height to the glyph chamber.
Text-only actions expand one chamber and its adjoining gap over the 300ms
resize token; neither a hidden counterweight nor a second spinner is added.
Slots inherit the size's own glyph and gap, including 14px compact glyphs.
Icon-only actions remain square. Native and composed pending controls use
the same layout. Loading uses `aria-busy` and `aria-disabled`, blocks activation,
retains focus and material contrast, and takes precedence over disabled styling.
An unavailable action still uses native `disabled`; an unavailable composed link
leaves the tab order. Press feedback preserves label contrast: 80ms compression,
150ms release, using the existing interruptible Foundation transitions. Busy
controls do not compress or respond to hover/press. Keyboard and reduced-motion
state changes are immediate. The existing Foundation spinner is retained.
For changing labels, compose `StateSwap kind="text" sizing="content"` and supply
the button's current accessible name. Its persistent layers retain the Foundation
crossfade while CSS transitions the active label's natural width without scaling
type. A scoped ResizeObserver tracks active copy and font changes, disconnects
when the state changes or unmounts, and does no per-frame React work. The default
`sizing="stable"` remains available where a fixed rail needs its longest label.
Contact uses the same text transition and replaces its trailing arrow with the
spinner; Copy Markdown uses this shared path for progress, success and retry.
Password fields use the owned
input-group frame around both the text field and a square, full-height reveal
control; masking changes immediately and the icon swap respects keyboard and
reduced-motion preferences.

Small labels above headings use sentence-case 13/20px medium Space Grotesk,
normal tracking and readable semantic ink. They are labels, not uppercase
monospace identifiers. Avoid slash-separated numbering in Foundation specimens.
Editorial element defaults live in the base cascade layer and yield to explicit
component typography.

Video menus are non-modal radio selections. They preserve selected state,
return focus to their trigger, and portal into the owning lightbox or fullscreen player.
Players narrower than 760px, or used with a coarse primary pointer, use one
transport row and a seek strip. Play, mute, settings and fullscreen have 48px square
targets; speed and quality share one grouped settings menu with 44px rows.
The panel is 84px tall, including its 24px seek target and 12px bottom inset, without internal
dividers at the default root text size. Below 240px of available player width,
mute and fullscreen move into settings; elapsed time is available through the
seek control. The stage has enough minimum height for the controls when text
is enlarged. Wide fine-pointer players retain the volume control and separate
48px-high triggers and 40px-row settings menus. All gallery and player actions
share a 12px stage inset, so expand, close and fullscreen retain the same right
edge. The elapsed/duration display uses tabular numbers, an 8px gap and contrasting
text tones and a visible “of” connector, without a background box or slash. Transport
buttons remain transparent at rest and share neutral hover, focus and pressed surfaces. Quality menus pair exact resolutions with familiar badges (HD, Full HD,
QHD, 4K); the 2160p trigger reads 4K. Auto remains explicit.
Menus open in 150ms and close in 80ms, without blur;
keyboard selection is immediate. Opaque inverse media controls stay legible over
changing footage in either page theme.

On touch screens, tapping playing footage reveals or hides controls; the play
button pauses playback. Hidden controls and covered posters are inert. Closing
inline playback restores focus to the poster's play button without scrolling.
The poster's Play action stays pending until a decoded frame is available, rather
than disappearing when metadata arrives. Buffering reuses that same control with
Foundation's icon-to-spinner swap. Hover or keyboard focus warms the playback
engine; unplayed film streams remain deferred until Play. Hidden chrome becomes
invisible as well as transparent and inert after its 150ms fade. The timeline's
native input fills its seek strip absolutely, avoiding inline baseline offsets
inside article typography.
In landscape viewports up to 32.5rem high, inline video stages fit within the
viewport height minus 5rem and contain the complete frame. Fullscreen fills the
viewport, restores prior scroll locks on exit, and uses the native video element
for the iOS fullscreen fallback. Control fades respect reduced motion.

The lightbox owns its focus scope and keyboard shortcuts. Initial focus goes
to Close; dismissal restores the owning gallery, or the opener for a standalone
viewer. Nested menus consume Escape before
fullscreen exits, then the dialog closes. Player sliders and nested controls
retain their arrow keys. The zoom gesture engine is a separate component.

The expanded gallery keeps square geometry throughout. Header and footer are
attached full-width regions with sharp edges and a single complete 1px perimeter. All four
content insets are 24px (16px on mobile, 8px in short landscape), with 48px
icon/action chambers. Mobile prioritizes a two-line title within the same 48px
row and omits the visible description to keep the header's insets equal.
The viewer covers the full viewport, including the page's reserved scrollbar
gutter, while keeping the article's width and scroll position stable underneath.
Previous and next sit at the artwork's left and right, centered within its stage;
on narrow screens their protected glass surfaces overlap the media edges to
preserve viewing space. The footer contains only the centered preview strip and
is omitted for a single item. Image zoom sits in a separate centered control
above the footer, with simple minus/fit/plus actions and equal separation from
the artwork and footer. Video uses that space for its native media instead.
Previews use consistent 88×64px frames (72×56px on mobile) and 12px gaps. Keep
the original thumbnail colors, with no gray wells or opacity wash. A single 2px
ink frame belongs to the displayed item; never sweep a filled selection block
beneath unrelated previews. Keep title and description
separate, omit decorative dividers and visible slide counters, and preserve the
main media's native aspect ratio when video metadata arrives.

The gallery is a scoped glass exception to opaque media chrome. White and black
anchor the stage. One stationary 96×54px canvas blends actual media light in 240ms,
in premultiplied linear color. A new selection starts from the currently painted
light, including an interrupted blend. Diffuse the light at its 96×54px resolution
with three separable box passes approximating an 80 CSS-pixel Gaussian spread;
do not re-filter the full viewport on every light update. Blend already diffused
linear light so retargeting does not progressively blur the field. Never attach light or opaque background
planes to traveling artwork; the same field stays behind the media and glass.
There is no procedural drift or per-item color preset;
achromatic content is removed so a white interface cannot wash the stage gray.
Reuse the decoded image already on stage instead of delaying its light for a
second thumbnail request. Only the poster fallback makes a small image request.
Video light follows `requestVideoFrameCallback`, with a frame-aware animation
fallback, rather than a wall-clock sampling interval. Pause, visibility, seek,
slide changes and disposal cancel or refresh the same frame loop. Anonymous
video requests allow sampling; unreadable streams retain their poster light.
Reduced motion uses the poster. The light spill uses 18% strength in light and
38% in dark. Header, footer, zoom and side controls share a 48px backdrop blur,
without shadows, bevels or grain. Every region keeps a complete, single 1px perimeter. Never feather the panes
or add gradient masks, bevels or a second outline.
White at 78% density and black at 64% density reveal defocused media. Dark glass
reduces backdrop exposure to 30% before compositing to protect contrast over
bright zoomed artwork.
Matching tonal wells hold the header icon and close glyph. Close and zoom keep
their glyphs centered, with shared hover/press feedback; directional navigation
uses the same full-chamber ReelIcon as the hero CTA. Zoom uses persistent decimal
reels with an interruptible 180ms transition inside a fixed-width control; the
percent sign stays still. Deliberate selections prepare the destination's responsive
image and decode it before changing the displayed item. Hover intent and keyboard
focus prepare the same bounded PhotoSwipe cache; never load the whole gallery at
full size. Reserve 25% resolution headroom for the first zoom step.
Images retain their exact decoded candidate during departure; only video stills
and ambient fields use canvases. A sine ease-in-out traversal takes
`clamp(220, round(200 + viewportWidth / 18), 280)` milliseconds for
both adjacent and distant selections, following index direction without displaying
intermediate items. Retargeting flattens only the visible scene pieces and keeps
the most recent destination. Carry screen velocity into a retargeted traversal;
reverse by braking rather than resetting velocity or instantly changing direction.
All artwork stays opaque, within a clipped viewport.
The incoming and outgoing animations share a resolved document-timeline start,
never the unresolved start time of a pending animation. Horizontal Gaussian
exposure follows the travel curve's instantaneous derivative at the same
animation time, approximating a 5.2ms shutter with a maximum 16px sigma, and
clears at rest. This is a directional Gaussian approximation, not temporal
accumulation or a neuroscience-validated model. The filter is updated directly;
never write an inherited root CSS variable each frame for instrumentation. Apply it only to artwork, not the full stage or ambient field;
do not switch on a fixed blur independent of velocity. Native swipes and pinch stay under
PhotoSwipe's gesture engine. Drag position follows the pointer directly; release
uses its critically damped spring (natural frequency 30, damping ratio 1), carrying
release velocity. Its duration depends on remaining distance and velocity, not
the click-navigation duration. Grabbing arriving artwork transfers its current
screen offset to the gesture engine before pointer tracking starts; never snap
the artwork to center first. Player inputs and gallery controls keep their own
interaction and do not cancel an in-flight selection.
The preview strip keeps native touch scrolling. Its centering uses an
interruptible, critically damped spring; hover moves only the image
inside its fixed hit area. Hover, press, keyboard focus and delayed preparation
feedback remain distinct. Exposure follows scroll velocity and is capped at 1.5px.
Keyboard and reduced-motion paths retain immediate geometry changes.
Disabled controls mute their glyph while preserving their protective surface.
Verify text and enabled controls at 7:1 or better against black and white media
at enlarged zoom, including backdrop exposure in the composite, in both themes.
Reduced motion keeps a still ambient frame and immediate controls.

`Badge` has four treatments: opaque `solid`, tinted `soft`, keyline
`outlined`, and text-only `plain`. Project technology metadata uses a joined
logo rail and a complete text list rather than badge controls. The badge `interactive` flag provides
appearance only; callers still own
semantic controls and keyboard behavior.

Forms use labeled inputs, associated validation messages, explicit pending
states, and safe errors. Failed submissions retain drafts. Workshop examples
must use the isolated contact-action mock and never send email.

Keep content and primary navigation server-rendered. Defer heavy effects and
interactive galleries. Storybook renders the same production components,
fonts, tokens, and layout roles; it is not a parallel implementation.

## Homepage And Project Listings

The homepage keeps its proof-first sequence and authored project claims. Its hero
uses 32/40px type on compact phones, 36/44px from 360px, and 48/56px from
640px, with matching Capsize
metrics. The decorative field stays subordinate to the reading layer.
The joined profile and hero own one density-aware perimeter. Their dedicated
surface stays white in light mode and uses Neutral 925 in dark mode, between
the Neutral 900 canvas and Neutral 950 project panels. Mineral 400 / Neutral 700
keylines define the complete plane against bright full-bleed previews. The
field and its fallback inherit that same surface; outer rails, content insets,
and media dimensions remain fixed.
The selected-work section retains a visually hidden heading for the document outline.
Project cards use the same full content width as the hero and closing CTA.
Only the page gutters surround them; there is no additional listing inset or
connecting frame. A 40px canvas gap separates the cards. No visible section label
or introductory band displaces the first preview.

Project cards use locally owned surface roles from the Foundation neutral palette
and a density-aware Neutral 300/700 perimeter. The preview owns one bottom
boundary, including after the deferred gallery mounts. Cards without assigned
media render only the content and technology footer, with no empty preview panel.
The caption uses white in Light and Neutral 925 in Dark.
Supporting facts sit beneath the title, inside the same reading panel. At card
widths of 720px and above, product type and primary capability align left while
role and one timing fact align right. Narrower cards use one left-aligned wrapping
group. The facts use the shared Foundation Badge
with the technology footer's surface: 28px height, 10px horizontal padding and 10px
gaps. Whole badges wrap without shrinking or truncation. There is no extra
metadata band above the title.

Product type, capability, role and timing use uppercase 12/16px
Space Mono at regular 400 weight, with normal tracking and tabular figures.
Every badge uses the technology footer's fill and muted label ink, with an
inset hairline. Its thickness and idle color match the card perimeter, footer
seams and title action; the action retains its own hover, press and focus states.
The badges are read-only, with no icons, arbitrary color variants or fake hover states.
The role badge reads `Product Engineer`, sourced from the same project metadata
as the full case study. The narrative explains the complete ownership from design
through delivery. Generic status labels are omitted.

Verto shows “Built in 3 months”; its October 2025–January 2026 build period
remains in the article. Portal records 4 September–16 October 2025, six weeks.
Phoenix uses the approximate duration “About 14 weeks” in 2025. Agency CRM &
Billing uses “Ongoing development” because an initial build was extended through
client-requested features. These facts remain an accessible definition list,
with one value for each term.

The title shares a row with the compact 40px square arrow chamber. The arrow
uses the technology footer's fill and primary logo ink at rest, with the existing directional reel
and loading feedback. No separate name, subtitle or prominent text CTA precedes
the copy. The title, challenge and response share one uninterrupted white /
Neutral 925 surface, with one equal 20px outer inset on phones and 30px from
640px. Titles use 24/32px and 28/36px respectively. A 20px vertical gap separates
the title and each story group; no internal seam or alternate fill divides them.

The challenge and response remain in a single column at every width. Each has
a quiet 12/16px mono label, a 5px label-to-paragraph gap and complete 16/26px
foreground prose with a 720px reading measure. The challenge states the real
business difficulty; the response credits the complete product and the decisions
that address it. A film's example does not define the whole product. The flush
technology footer supplies the main material contrast beneath this reading area.

Use `Product Engineer` as the role, and describe end-to-end ownership explicitly.
Dates come from typed delivery metadata, independently of the article's publication
date. Keep approximate durations approximate, and distinguish an ongoing
engagement from one fixed build. The full article and generated Markdown retain
the same role and delivery record.
The MDX owns this copy; component and page stories import it rather than keeping
a second version. No outcomes or metrics are inferred from demonstration footage.

One native title link extends its hit area across the overview. The preview
and technology footer remain separate interaction zones. Hover changes the frame
and action material; keyboard focus appears immediately, without moving the card.
Cards without an overview retain their index/date and description fallback.
Overview paragraphs remain complete and unclamped at every width.

The shared `GalleryPlayButton` uses one dark, content-width, 48px-high control with two flush
chambers, no outer padding and no internal gap. A 48px square chamber holds the
20px play glyph or 16px spinner. The triangle's painted height balances the label;
the loading glyph retains Foundation's standard size. The adjacent text
chamber centers Play and its
natural-width duration as one group, with a shared baseline, an 8px gap
and equal 14px padding on all four sides. Without a duration, Play centers in
the content-width text chamber. The icon chamber
uses Neutral 900 and the text chamber uses Neutral 950, with one shared hairline
perimeter and no separate internal borders. The whole button activates as one
target; hover and press brighten both chambers. The play glyph scales gently
on fine-pointer hover and press; reduced motion keeps it still. Geometry stays fixed. The label stays steady;
no letter stagger delays recognition.
Keyboard focus uses one immediate white perimeter. The existing
16px loading spinner occupies that same chamber without changing button size.
The static poster and deferred gallery render this same component.

`ProjectTechnologyRail` owns the full-width 64px footer, using Mineral 200 in
Light and Neutral 950 in Dark. One top hairline and joined vertical seams define
five logo cells when the caption is at least 640px wide, and three below
that width. The disclosure shares their column grid: all six desktop cells or
four compact cells have equal widths and a fixed 64px height, with the same 8px
insets, 28px symbol chamber, caption styling and resting surface as the logo
cells. Its grid symbol and “Stack” caption identify the complete technology list;
hover, press, open and keyboard focus supply its interactive states without
changing geometry.
Its accessible name and popup heading include the technology count. It exposes the complete
stack immediately, keeping the rail's core-first order before the supporting technologies.
Every technology uses one symbol above one 12/16px name
caption, with a shared 28px square chamber and 4px gap. Full-name wordmarks are
excluded: PHP uses the letter-free elephant, MySQL its dolphin and Stripe its
single-letter symbol. Captions never disappear to accommodate different artwork.
Supabase and PostgreSQL occupy separate cells. Original proportions, centered
view boxes and reviewed optical sizes balance dense and thin symbols without
stretching. Unknown marks keep the same caption baseline and reserve the chamber
without inventing a logo. Asset sources and licensing live in
`docs/technology-assets.md`.

The shared top hairline is painted above the cells, so disclosure hover and open
fills cannot erase it. Interactive states preserve the cell seams and geometry.

Three core technologies lead the first frame and remain fixed on desktop.
The final two desktop cells exchange supporting technologies as one ordered
window. Compact rails exchange all three cells, starting with the same core
technologies. Each new window follows the authored supporting order, wrapping
without duplicating a technology within the frame. If every technology already
fits, the rail stays still. The full stack is available from the final disclosure cell
without waiting for an exchange or adding another footer row.
Project highlights are presentation data, included only when they
exist in the authored stack. Windows advance every 2.2 seconds: a contained 400ms
fade, 6px vertical travel and 2px blur, phased by 50ms from the rightmost changing
cell inward. The final cell settles within 500ms on compact rails and 450ms on wide rails,
leaving at least 1.7 seconds with every symbol at rest. This cadence is a presentation choice, not a claim
about attention spans. No card dimensions
animate. Hover, keyboard focus and opening the disclosure pause rotation; its
pause control can retain that state after dismissal. An exchange already
underway settles before holding. Offscreen and
hidden-document rails stop their timer and CSS motion, then resume the remaining
hold. Reduced motion uses a static strip. A stable
semantic text list exposes the full stack to assistive technology independently
of the decorative exchanges. The disclosure follows the context-panel structure:
a filled header with matching 40px symbol and close chambers, a flush two-column
stack grid, and a separate full-width rotation control when cells can rotate and
motion is available.
The header keeps its equal 12px insets. The grid meets the panel edges without a
second frame or surrounding inset. Each cell has equal 12px insets and a 40px square symbol chamber separated from
the name by 12px. The chambers match the header icon and close control; the first
column names align with the header title. The artwork retains its reviewed
optical size and center. A subtle
chamber fill separates it from the name surface. Colored panel symbols reuse
the local vectors with source-backed colors, adjusted for contrast in each
theme; neutral brands stay neutral. The rail is monochrome at rest. Each reviewed
technology is a native link to a curated official product or project landing
page, opening in a new tab with an accessible announcement. Destinations explain
the product's value to visitors; API references and implementation guides are
excluded. Unknown fixture names remain unlinked. Pointer hover reveals reviewed
brand color over a neutral cell fill in 140ms; panel symbol wells receive a
restrained brand tint. Hover-out settles in 180ms. Press deepens the fill in
80ms and compresses only the glyph to 0.96; the chamber stays fixed. Keyboard
focus inverts the existing cell surface and ink, without adding a second ring
or changing the hairlines. Reduced motion makes these changes immediate. Hover, focus and
touch press hold the rail's timer so a link cannot change destination during an
interaction. Shared hairline
seams define chamber, column and row joins once. Perimeters use inset frames
with the same hairline token as the drawn seams, avoiding native border
rounding differences at fractional zoom. These lines paint above every cell
fill and keep their color and thickness during hover, press and keyboard focus.
An odd last item completes the final row; names wrap and rows grow together
when needed. The header, close and rotation footer retain their geometry. In a
short viewport, only the grid scrolls; the frame, header and footer stay fixed.
The panel aligns to the card edge and cannot exceed its width. Its frame fades
in over 250ms without scale, travel or blur. Only the text and glyphs reveal
with 4px travel, 2px blur and 220ms movement; row pairs follow at 24ms intervals,
capped at 72ms. Interruptible CSS transitions retarget from the current state.
Dismissal removes the stagger, settling the content in 120ms and the frame in
150ms. Reduced motion removes these transitions. Close and Escape return focus
to the disclosure cell.
The preview, title and explanation retain the visual emphasis.

Cards stay on their plane with one structural hairline and no blurred shadow,
lift or media zoom. Hovering the caption strengthens that hairline and changes
only the square action to the primary neutral material. Its arrow exits towards
the destination as an identical arrow enters the same full square chamber.
Hovering the preview does not advertise navigation. The 40px action chamber
rests in Foundation's soft neutral material with an inset hairline. Pointer press compresses
only that chamber. A delayed navigation uses the existing LinkFeedback icon
swap without changing its dimensions or accessible name. Keyboard focus adds
an immediate contrasting 2px inset caption frame. Reduced
motion removes the reel and compression. The gallery remains a separate
interaction; the card is not a second, nested navigation target. Restricted
cards do not advertise navigation.

The hero's `ArrowButtonLink` composes the existing `ButtonLink` and pending
feedback. Its 40px frame holds a label with 12px inline insets and a square,
slightly inset-tone arrow chamber. On pointer hover, characters roll through a
clipped 20px text window with a 60-degree tilt and 2px blur. Both text layers stay
opaque, so the exchange reads as continuous travel rather than a fade. Text and
arrow share one 520ms finish: each character travels for 400ms within a bounded
120ms stagger, regardless of label length. Entry runs in reading order; exit
mirrors that order with the same duration and symmetric easing. Interrupted
transitions retarget their current position without queued replay. CSS transitions
own the decorative exchange without React hover state or per-frame JavaScript.
The arrow travels 80% of its full chamber; the clipping aperture preserves
visible travel throughout the exchange. `arrowDirection="right" | "left" | "up-right" | "down"`
matches glyph and trajectory; `arrowBlur={false}` removes only the arrow blur.
Project actions reuse the same `ReelIcon`, with rightward, leftward or diagonal
travel across 80% of their full square chamber. Clip at the chamber perimeter,
never at the glyph's bounds, and keep the pending spinner centered at glyph size.
Its owning control declares
`data-reel-trigger`. The hero's display choreography remains separate from
immediate surface and press feedback, retaining Yaschet's sharp geometry and
monochrome materials.
Only the visual layers move;
the label is announced once, and the control never changes width or height.
Keyboard focus is immediate. Touch and reduced motion keep the resting label
and arrow; pending navigation retains the existing centered spinner and material.

The hero title reveals text through a moving sharp/blur boundary. Stable
word boxes hold a sharp layer and an aria-hidden blurred frontier, with a 3em
feather and 0.3em blur. Their masks travel in reading order at a 45ms character
cadence, including spaces; word boundaries preserve natural line wrapping.
Initial HTML uses `@starting-style`, so hydration never hides already-painted
copy. Route entry animates the same live masks after native capture is ready,
rather than flattening the two layers into a snapshot. There is no title
translation, scale or frame animation. Reduced motion and keyboard navigation
show clear text immediately; theme changes do not replay entry.

Confidential work is a standalone card with the original paragraph and inline
“in a call” contact link. It shares the project cards' full-width rails, surface,
hairline, title scale and equal 20px/30px content insets. The title and explanation
remain stacked on one left rail at every width, with the same 20px content gap
and readable description measure. A 40px canvas gap separates this box from its
neighbors; no divider or surrounding frame joins them. The inline link
keeps a visible underline and immediate keyboard focus. No separate button
competes with the homepage's hero and footer CTA areas.

Both the initial poster and enhanced gallery use `GalleryPlayButton`: the same
content-width, 48px-high dark Foundation control, 20px play glyph, 16px loader and 14/20px sans-serif
label and duration. Loading disables repeat activation and
keeps the control's dimensions and label stable. It adds no outer-frame zoom,
shadow, blur or separate spinner recipe.

## Case-Study Reading

Case-study introductions use the production `CaseStudyHeader`. One outer inset
owns all four sides: 20px on phones and 32px from 640px. Case-study and blog-post
frames reach the page edges below 640px, using `PageContainer`'s `mobileBleed`
option so the frame's 20px content inset is the only mobile gutter. Article text,
the opening and the closing CTA share that edge; evidence can use the complete
frame width. Ordinary page containers keep their existing gutters. The toolbar,
introduction and utilities have 20px between groups on phones, 24px from 640px. The back link
uses the existing directional reel and square glyph chamber. Publication metadata
is a compact label/date pair. Descriptions use 16/26px and 18/30px reading type.
Reading time is a passive 40px framed display; Copy Markdown is a separate 40px
Foundation outline action with the same chamber geometry. Loading begins only on
activation and retains pending, success and recoverable-error feedback.

`CaseStudyFacts` owns semantic fact/value pairs above `ProjectTechnologyRail`.
Phones use aligned label/value rows with 20px inline and 12px block insets;
single-line facts are 44px high before their shared boundary. From 640px the
stacked rows return to 20px on all sides. From 768px, available
facts fill one, two or three equal columns, each with 24px on all four sides and
an 8px label/value gap. Labels use 13/20px medium, values 14/20px on phones and
16/24px medium on desktop. Content wraps without clipping or shrinking the type.
The full-width 64px technology footer reuses the cards' actual logo, rotation,
reference-link and Stack-popover implementation, including equal-width cells,
project-specific highlights, pause-on-interaction and reduced motion. No separate
text stack or second animation implementation is maintained.

Article copy uses 16/28px on phones and 18/32px from 640px. Section headings use
20/28px and 24/32px, with whole-pixel spacing and a 100px anchor clearance.
Captions use 13/20px Space Grotesk. Tables keep native semantics, equal 16px cell
insets and wrapping 14/24px values. Code keeps 13/20px Space Mono and its own
horizontal scroll; an always-visible 40px copy action occupies a separate header.

These pixel equivalents describe the normal 16px root setting. Reading roles
and generated Capsize sizes use rem, so changing the reader's root size preserves
their hierarchy. The existing Space Grotesk / Space Mono pairing is retained.
The narrow-to-wide reading contract is:

| Role | Below 40rem | From 40rem | Measure |
| --- | --- | --- | --- |
| Page title | 2rem/2.5rem; 2.25rem/2.75rem from 22.5rem | 3rem/3.5rem | 24ch |
| Lead / opening summary | 1rem/1.625rem | 1.125rem/1.875rem | 62ch |
| Body and lists | 1rem/1.75rem | 1.125rem/2rem | 60ch |
| Article h2 | 1.25rem/1.75rem | 1.5rem/2rem | Reading column |
| Article h3 | 1.125rem/1.5rem | 1.25rem/1.75rem | Reading column |
| Captions / metadata labels | 0.8125rem/1.25rem | Same | Figure / fact column |
| Table values | 0.875rem/1.5rem | Same | Local table |
| Code | 0.8125rem/1.25rem, Space Mono | Same | Local horizontal scroll |

Titles and headings use weight 500; ordinary reading text uses 400. Body tracking
is -0.01em, h2 is -0.015em, and captions use normal tracking. Paragraphs have
20px after them; h2 uses 40px before and 16px after; h3 uses 30px before and
12px after. A 60ch text column sits inside the larger figure grid, so supporting
media can expand without lengthening prose lines. Long words wrap rather than
forcing page overflow. These values preserve this portfolio's measured hierarchy;
they are design decisions, not universal accessibility thresholds.

Contents use one top-centred 44px trigger once the article reaches the reading
band. A quiet outside rail appears only from 1536px wide and 768px tall. On
article layouts below 1024px or at most 520px high, the site dock stays in flow
after the footer, leaving one fixed reading control. Entries have a 44px minimum
hit area and wrap at 13/20px. The dialog fits the dynamic viewport, including
short landscape layouts. Escape restores the trigger; selecting an entry
closes the dialog, updates the fragment and moves focus to the section heading.
Reduced motion bypasses animated scrolling. Article images reuse the production
gallery viewer, including keyboard activation, Escape and focus return, rather
than owning a second lightbox. Below-fold article media remains lazy.

## About And Contact

`PageIntro` uses the same responsive title geometry as the homepage: 32/40px
on compact phones, 36/44px from 360px and 48/56px from 640px, including matching
Capsize metrics. Introductions and About prose use 16/28px reading type on phones
and 18/32px from 640px. Space Grotesk remains the reading face.

About sections use `EditorialSection`: one boundary and equal perimeter insets,
with a 30px heading-to-body gap. Section headings are real `h2` elements at
20/28px or 24/32px from 640px. Principle headings sit below them as `h3` elements
at 18/24px, with 14/24px descriptions and 10px title/copy gaps. The grid has 30px
row/column gaps, one column on phones and two from 640px. Static principles do
not acquire button-like hover frames. Existing authored claims remain intact.

`ContactMethods` renders native Foundation links and complete, wrapping copy.
Methods stack until 1024px, then use three equal columns with aligned action
rows. The page owns the outer inset. The launch page keeps email and booking
available while the server-only `CONTACT_FORM_ENABLED` gate defaults to false.
When enabled after delivery verification, `ContactMessage` gives the real form
a visible heading and introduction, separated from its fields by 30px.
Fields use 8px label/control gaps, 24px field/column gaps and 40px controls;
below 640px, inputs and the submit action have a 44px minimum height, and
inputs use 1rem text to avoid small-text focus zoom on iOS.
Name/email share a row from 640px. The message field starts at 160px and grows
with its content. Submit spans phones and keeps its content width on larger
screens; pending retains its height and equal insets while the active label's
width changes smoothly. Its mobile full-width frame remains fixed.

Every form instance owns unique label/control/error identifiers. Name and email
expose their browser autocomplete purpose. Required fields and errors remain
associated with their inputs. Draft retention, duplicate-submit guarding,
idempotent retry and server abuse controls remain in place. Real-page checks
stop at validation; submission states use the isolated Storybook action mock.

## Actions And Destinations

An action's label describes its destination. `Email` opens `mailto:`,
`Book a call` opens the shared scheduling URL, and project enquiries lead to
`/contact` with `Discuss a project`. Booking is an option, not a required step.

Closing action bands use 28/36px titles below 640px, with matching Space Grotesk
Capsize trims, 20px block insets and the existing 20px mobile inline inset.
From 640px they retain the 36/44px title and existing desktop spacing. The same
rule reaches article CTAs with nested content; control sizes are independent.
On phones, action labels wrap and grow vertically when text is enlarged. The
resting label supplies that flow instead of the desktop character reel. Header
toolbars can also wrap, and their grid tracks never force a wider article.

| Page | Reading or discovery action | Closing action |
| --- | --- | --- |
| Home | View my work, scrolling to the first project | Book a call |
| About | Read the engineering principles | Discuss a project |
| Case Studies | Open an individual case study | Discuss a project |
| Case study | Read the evidence and play its media | Discuss a project |
| Blog | Read a published article when available | View case studies |
| Blog post | Read the article | Get in touch |
| Contact | Choose message, email, or scheduling | Send message submits the form |

The hero and closing navigation actions use `ArrowButtonLink`: one shared
character reel, square glyph chamber, pending feedback and focus treatment.
The glyph follows the destination: down for an in-page section, right for a
page, and up-right for scheduling in a new tab. Appearance expresses priority;
the secondary hero action remains outline. Playback and form submission keep
their existing Foundation controls, with action-specific glyphs and feedback.

Fragment-only links use browser fragment navigation rather than a route
transition. Repeating the current fragment scrolls again without reloading or
adding duplicate history entries. CSS owns smooth scrolling and reduced motion.

## Listing Pages

Blog empty states use the Foundation `IconChamber`: 40px square, a centered
20px glyph and 10px clear space on every side. Caller-provided icon sizes do
not change that geometry. Closing navigation on Blog and Case Studies uses
`ArrowButtonLink` anchors with the existing action-band treatment.

Deferred project video previews must retain the first keyboard or touch
activation. Focus alone does not replace the poster button; touch waits for
activation before loading the video gallery. Only an explicit playback request
shows the pending button state. Gallery identity resets run before playback
requests are applied, so mounting a gallery cannot clear the requested video.

Article code remains 13/20px with a 40px copy action. Long lines scroll inside
the code block without widening the page. Syntax aliases use existing palette
steps that maintain at least 4.5:1 contrast against the enclosing code surface
in both themes, including comments and punctuation.

## Change And Review Workflow

Update the owning token or component first, then its stories and this contract
when behavior changes. Check light and dark themes, narrow layouts, keyboard
focus, motion preferences, and long content. Distinguish retained experiments
from components used by the portfolio.

`pnpm test:storybook` runs stories in Chromium in both themes, including play
functions and accessibility checks that fail the suite. `pnpm quality` also
checks repository boundaries, types, dependencies, server policies, production
routes, and the static Storybook build. These checks provide regression
coverage; they do not guarantee every accessibility or production condition.

See [Storybook](storybook.md) for authoring and coverage, and the
[foundation audit](foundation-audit.md) for the consolidation findings.

## Persistent Chrome And Material Hierarchy

The Default Foundation palette is shared with Office. Portfolio material roles
in `tokens.css` deliberately differ from application elevation: `portfolio-canvas`
is mineral-300 in light mode and neutral-900 in dark mode; `portfolio-panel` is
mineral-0 and neutral-950 respectively. HTML and body resolve the same canvas.
Major frames, project bodies, header badges and shader fallback surfaces use
the panel role. Code uses `portfolio-code-surface` (mineral-100 / neutral-925),
with a quiet keyline separating it from prose. These are aliases to the existing
palette, not a second palette. Transparent warning badges and buttons use the
existing deeper warning interaction ink in light mode: the ordinary warning ink
falls below 4.5:1 on the portfolio canvas. Filled semantic surfaces retain their
Foundation recipes.
Selected work and the case-study listing do not add a gray `well` around repeated
cards. Whitespace, media and typography provide hierarchy without nested surface stacks.
`border` owns quiet physical-pixel keylines in the header and sections. Active
portfolio frames and dividers are solid; dashed structural decoration is not
part of this composition. The topographic shader retains its tonal band recipe,
resolving the shared neutral ramp rather than flattening bands into UI surface roles.

Instrument dots register to a fixed 10px inset on the 10px rhythm. The 20px and
40px content insets share that phase; resizing never recenters the dots. Any
sub-step remainder stays at the right/bottom edge rather than distorting the
pitch to force equal margins. This registers content anchors, not every glyph
or arbitrary trailing edge. Narrow hero fields blend to a mobile content shield;
the same theme palette, artwork opacity and terrain timing apply at every width.
Low-memory/low-core devices use DPR 1 and at most 30 rendered frames per second
without freezing time. Reduced motion, data saving, slow connections and the
existing reveal environment still select a static field; hidden fields pause.

### Artwork Color And Motion Direction

The adopted direction is a neutral engraved field: broad quiet tonal bands,
crisp registered dots, clear type and restrained continuous motion. The current
[Zecto reference](https://zecto.io/) demonstrates stronger shapes at the perimeter
with a quiet area for text. Transfer that composition principle, not its turquoise
accent or its text contrast. This is an art-direction choice, not an accessibility
requirement or a promise of identical appearance on different displays.

| Surface | Light | Dark | Artwork treatment |
| --- | --- | --- | --- |
| Body / gutters | mineral-300 | neutral-900 | No animated texture behind long-form reading |
| Framed intro / reading panel | mineral-0 | neutral-950 | Intro field only; prose stays plain |
| Project card body | mineral-0 | neutral-925 | Let screenshots supply color; no second ambient field |
| Project detail region | mineral-200 | neutral-950 | Quiet separation from card body |
| Code / technical inset | mineral-100 | neutral-925 | Plain surface with a quiet keyline |
| Hero and page-intro artwork | Shared neutral band/dot ramp | Shared neutral band/dot ramp | `--portfolio-artwork-opacity`: 0.88 light, 1.0 dark for hero/page intros |
| Action band | Canvas-grounded field | Canvas-grounded field | Existing full-strength field; local text shielding |
| Media / player | Media's own colors | Media's own colors | Keep the dark control material independent of page theme |

Hero and Contact use the same renderer and opacity token. Home's longer text
block and different panel aspect suppress more of the field; visual coverage is
not a separate color palette. Do not compensate with unrelated page-specific
colors. Preserve local shielding under text while allowing higher definition in
unoccupied areas. Preserve the continuous terrain: do not mask a rectangular copy block or
blank the mobile field. Existing soft composition shielding stays in place.
Only upper dot-alpha values receive a smooth highlight shoulder: the shoulder
begins at alpha 0.24 and reaches a 38% reduction at alpha 0.64. Lower values,
terrain fills, dot geometry and motion remain intact. This is an adopted visual
tuning decision rather than a universal contrast rule.
Opacity is a grading control, not a text-contrast guarantee.
Normal text must still meet 4.5:1 against its actual animated background, large
text 3:1, following [WCAG contrast requirements](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html);
inspect peaks as well as troughs before release.

Phones, tablets and desktops keep the same material roles. Adapt composition to
available aspect ratio and rendering cost to capability, never tint by device.
Maintain the 10px dot pitch and 1px radius in CSS pixels. No pointer interaction
is required to reveal the field on touch screens. Do not accelerate motion to
make it visible: preserve speed 0.28 and the existing noise recipe. The shader's
clock retains its phase across resize, theme changes and visibility pauses;
resuming does not restart the terrain. Reveal the first drawn canvas with a
900ms opacity-only ease-out, without delaying the page or moving/scaling the
grid. Readiness comes from an actual shader draw, never a loading timer. Reduced
motion shows the static field immediately when ready. Keep damped pointer response on fine
pointers and retain the static preference path.

Finish line for this treatment: Home and Contact visibly share the same material
in both themes; text remains readable through the animation; resizing does not
restart its phase; narrow layouts reveal terrain without requiring hover; and
physical iPhone smoothness is checked before claiming device performance.

All structural frames, control outlines and seams consume `--foundation-hairline`.
The document bootstrap sets it to `1 / devicePixelRatio` CSS pixels before paint;
`HairlineScale` follows resolution changes from browser zoom or display changes.
CSS resolution fallbacks retain hairlines without JavaScript. Storybook uses the
same synchronizer. This keeps native borders, inset frames and painted seams at
the same physical thickness at fractional scales, rather than switching abruptly
between 1px and 0.5px. The header, hero and project cards share the `border` color
role; functional control states retain their own material roles.

Project cards paint one inset perimeter above their content. Media fills the
whole card width beneath that frame, without reserving a fractional border
gutter. Preview and technology dividers each own one internal seam; neither adds
a second outer frame. The context flag's equal inset uses the same hairline,
with the chamber backed by its line color. Marquee phrases use the context
rail's 20px gap, including the join between repeated cycles, without dot separators.

The floating navigation is an intentional inverse material: neutral-950 in light
mode and neutral-50 in dark mode, with opposite ink. A counter-inverse 40px
indicator identifies the current route. A separate soft hover plane travels between
links and fades at its last position when the pointer leaves. After a full exit it
reanchors before appearing, rather than traveling across an empty rail. Theme is a
separate action after a divider, with its own soft hover surface.
`aria-current` always identifies the actual route. Both clipped planes live
below every glyph in one stacking context. Navigation controls use difference
blending against the planes, preserving glyph contrast during fast travel.
The dock is visible in the initial HTML and does not replay an entrance on hydration
or route changes. Its indicator uses an interruptible 150ms compositor transition.
One shared measured tooltip shell moves between anchors with unscaled text
crossfades, a 350ms first hover delay and 120ms handoff grace. Its 12/16px label
has the dock's same 10px inset on all four sides, making a 36px hint. That inset
also owns the gap above the dock. Width follows the content; the shell centers
on its trigger within the dock's outer edges, with 12px minimum viewport clearance.
Home aligns to the left edge and Theme to the right. A fully hidden hint reanchors before appearing; it does
not travel from the previously visited control. Continuous handoffs share a
250ms smooth-out position/size transition and 120ms text transition. Keyboard focus
opens immediately. Hovering the hint retains it across the trigger gap. Activation,
Escape, scrolling, viewport changes, hidden tabs and obscured anchors dismiss it.
Touch taps do not open hover hints.

The root layout owns the single SiteHeader. Route content must not render a
second header. Badge and marquee frames are 28px tall. One shared 20px spacing
token sets horizontal gaps, mobile row gaps and clearance above and below the
rail. The gap between badges must equal the gap from the rail to the first page
frame. Internal label padding and frame height remain independent. These are
local design decisions, not a universal ratio. Location and clock use 28px square
chambers, 14px glyphs and 12/16px Space Grotesk labels.
The flag fills its chamber inside an equal hairline inset on all four sides. The badge perimeter
owns its top, bottom and left frame; the chamber seam owns its right frame.
There is no additional flag border or empty inset.
Desktop gives location and time equal 160px widths; phones keep these equal on
the first row and put highlights on the second. Compact phones shorten the
location label to Rabat instead of compressing its chamber or overflowing.

Each 14px clock glyph has 7px clearance inside its square; 16px label line-height
leaves 6px above and below. Label insets are 10px. One outer perimeter and one
chamber seam share the same quiet hairline. The clock chamber has no competing border or separate
fill: hover strengthens the entire joined surface to primary-soft; open uses
primary-soft-hover and press uses primary-soft-active. The line never brightens
on hover. A neutral 2px inset focus frame is reserved for keyboard use. The flag
keeps its own colors, clear of the frame. All three hit areas extend 8px above
and below the visible badge, giving 44px without enlarging its frame. On phones,
the 20px row gap leaves 4px between these hit areas. Horizontal page gutters
stay aligned to the hero; the context rail does not change editorial spacing.

Location and time open non-modal context dialogs: 300px wide, bounded by 16px
viewport clearance, 8px below their trigger and aligned to its outside edge.
They flip above when necessary. Foundation popover surfaces, hairlines and
13/20px type carry through the heading, key/value rows and contact action.
One outer frame contains a 44px contrasting header, boxed horizontal records and a
44px contrasting action footer. Header and footer share the control surface.
The close control and footer arrow own matching 44px chambers with surface
feedback and no idle vertical separators. Facts use a 96px key column, no gaps and 12px vertical / 16px
horizontal cell padding. Each row
owns its top separator. The footer owns its top separator, so shared boundaries
are always one hairline. Keys and values share one continuous popover surface,
without a vertical divider or shaded label column. Keys and timezone metadata are
muted; values and actions use primary ink. Heading and action text align at 16px;
close and arrow glyph centers align 22px from the right. Joined controls use
surface feedback without press scaling, keeping their seams intact. A shared
Foundation popup shadow separates the overlay from the hero. Static badges have
no shadow. Location explains remote work worldwide and email with scheduled
calls; it never invents live availability, guaranteed regional overlap or response times.
Time compares Rabat with the visitor's device zone, shows dates when days differ,
and labels request-geolocation fallback as estimated. The US Pacific zone is
labeled "Pacific time" rather than implying the visitor is in Los Angeles; its
offset still follows the date-aware IANA rules. Contact actions lead to
the contact page without sending anything.

Pointer hover opens after 350ms with a 120ms close grace and a safe path into the
panel. Keyboard focus opens immediately. Click/tap or Enter/Space pins the panel;
repeat activation, Escape, outside press, focus leaving, scroll, resize and hidden
documents dismiss it. One panel per rail can be open. Tab reaches the close
control and contact action; Escape restores trigger focus without reopening.
Entry uses the Foundation 250ms fade and 0.99-to-1 scale from the measured trigger
origin; exit reverses in 150ms. No translation, blur, bounce or stagger. Both
transitions are interruptible. Touch uses a 150ms opacity-only fade in both
directions, with no scaling. Keyboard and reduced-motion feedback is immediate.
Storybook examples use real 20px padding, not collapsing margins,
and include the actual profile and hero composition for contextual review.

Clock offsets come from the generated IANA transition table in
`src/lib/time-zone-data.json`, currently 2026e, covering 2024–2035. This avoids
stale browser/Node timezone rules, including Morocco's September 2026 move to UTC.
`pnpm update:timezones` updates the pinned build-only data dependency and regenerates
the deduplicated table; Moment is not shipped to visitors. Review updated offsets
against [IANA release notes](https://data.iana.org/time-zones/tzdb/NEWS) and run the
timezone regression tests before release. Missing zones or out-of-range dates
show unavailable, never an invented zero offset. Explicit preview overrides take
precedence, then device timezone, then estimated request timezone.

The marquee keeps its compositor animation through route navigation. Uppercase
12/16px medium labels use 0.04em tracking. Copy names client work already described
in the hero: internal tools, billing systems, document workflows and AI integration.
It stays muted and secondary to proof and the primary hero action; no extra pill
frames or added technology inventory. Every label-to-dot and dot-to-label gap,
including the repeating seam, is 16px. Autoplay travels at 24px/s. Dragging maps
1:1 to horizontal movement; release settles with exponential velocity decay
over at most 700ms, then resumes at the current position. Vertical touch scrolling
and pinch zoom remain available. There is no idle JavaScript animation loop.
Activation toggles a persistent pause; keyboard focus pauses reading, and arrow
keys move 80px and retain a pause. Hover alone does not stop the track. Hidden
documents pause both marquee and clock work. Reduced motion disables autoplay,
inertia and rolling digits while preserving manual stepping and dragging.
Clock digits use fixed columns, a feathered mask and 180ms smooth-out easing.
Only changed digits move, one outgoing-to-incoming step even at 59 → 00;
the clock never scrubs through intermediate numbers. Initial hydration and
resuming a hidden tab reveal the current value immediately. The two-cell reels
animate only transforms, with no per-frame React updates or idle animation loop.

StateSwap keeps icon and label layers mounted. Stable sizing reserves the
largest state; content sizing transitions to the active text's natural width.
Use the Foundation icon-swap tokens and text crossfade for copy, theme and media
feedback; give the owning action its current accessible name. Keyboard and
reduced-motion changes are immediate. At the page origin, pointer theme changes
use one native 240ms page crossfade, with material interpolation suppressed.
Scrolled pages, embedded previews and live dialogs change immediately.
Reading-time metadata and Copy Markdown share a
40px row, 14/20px type and 16px glyphs.

Web Vitals are developer diagnostics, never visitor notifications. Development
logs use one stable callback; production Speed Insights retains its existing
telemetry role. Local geometry and browser checks do not establish field LCP,
INP or CLS results.

## Perception And Evidence

Readable figure-ground contrast, coherent grouping and repetition inform this
composition. [Processing-fluency research](https://psy2.ucsd.edu/~pwinkiel/reber-schwarz-winkielman-beauty-PSPR-2004.pdf)
provides a framework for aesthetic ease; it does not establish a premium shade,
prove this portfolio's effectiveness, or guarantee conversion. Choosing white
panels on a light canvas and near-black panels on charcoal is an editorial
judgment informed by the existing identity. Content, credible work and a clear
contact path remain the conversion proposition.

Normal text targets at least [WCAG's 4.5:1 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Quiet panel borders are grouping cues, not substitutes for control affordances
or text contrast. Surface contrast need not match text contrast. Test rendered
foreground/background pairs rather than comparing palette names.

[Apple's motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion)
informs brief, purposeful, interruptible feedback and direct manipulation.
Physics constants are product tuning, not a neuroscience prescription.
The marquee offers a [persistent pause mechanism](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html),
and essential actions remain available with reduced motion.


## Portfolio navigation and loading

The root keeps one header and one floating dock mounted, preserving the marquee's
position and pause state. Eligible pointer navigation uses a viewport-sized document
View Transition: the outgoing viewport fades over 150ms above the live incoming
page. The destination frame is never captured or resized.
Never capture the full-height PortfolioScene: a long case study changing into a
short page can stretch its captured raster or lose the scrolled portion entirely.
Viewport snapshots retain their natural pixel size and top-left alignment, with
`height: 100%` and `object-fit: none`. Never stretch snapshots or translate the whole page frame;
movement belongs to the individual title and copy groups.
The persistent header, dock and tooltip remain mounted. Their old appearance
stays in the outgoing viewport bitmap; extracting and hiding it would leave blank
areas above the live page. Their incoming DOM stays uncaptured, preserving pointer
input through the non-intercepting overlay. Capturing an incoming control prevents
native hit testing even when the overlay ignores input.
Desktop keeps its vertical scroll box on short pages as well as long ones, so
custom scrollbars cannot change the content width or rewrap text during navigation.
No cloned React trees or frozen router contexts are used.

Visible titles enter over 250ms in separate native word groups with a 3px blur and a 20ms stagger;
supporting copy gets its own groups. Controls, forms and media remain uncaptured
and interactive. Delays cap at 120ms, keeping the
sequence within 370ms. Groups are prepared after Next's route layout and scroll
commit, so returning to a retained page gets the same treatment as its first entry.
Use a task checkpoint here, never await an animation frame inside the document
update callback: capture suspends rendering until that callback resolves.
Capturing one image of an already-blurred heading would freeze that intermediate
frame; native text groups avoid that defect. Temporary capture names are removed
when the handoff finishes or is interrupted.

PortfolioLink retains Next Link's prefetching and browser semantics. Its onNavigate
adapter starts the viewport capture, then calls the public router inside a React
transition. LinkFeedback combines that transition's pending state with native
useLinkStatus. No outgoing-animation timer delays the router. A visible Suspense
fallback immediately abandons capture; otherwise a request still waiting after
150ms abandons it so Next's live loading UI can take over.
New navigation, theme changes, scroll input, viewport resizing, keyboard input and reduced motion
interrupt the snapshot without cancelling Next's navigation.
Rendered-pixel regressions leave a real case study for Home and About from the top,
middle and footer in both themes and mobile. Stable live-DOM rectangles alone do
not establish that a native snapshot is undistorted.

Unsupported engines and browser history use the live-DOM entry path: the frame stays
stationary and opaque, titles clear from a 4px blur, and supporting copy follows.
Initial HTML stays readable before hydration. Keyboard and reduced-motion paths
remain immediate. Geometry and semantic markup stay identical on mobile and desktop.
Browser automation exercises the same production motion as visitors.

At the page origin, pointer theme changes use the native document View Transition API.
Capture only the outgoing viewport, then remove the root's capture name inside the update callback.
The old image fades out over 240ms above the live new theme and holds its final
transparent frame until native teardown. Without that fill, the old bitmap can
reappear before removal. Regression checks record unpaused rendered frames through
teardown in both directions; stable DOM rectangles and paused midpoint captures
alone cannot detect a color reversal. This composition keeps the dock
interactive and bounds the bitmap to the opening viewport. After scrolling, change
theme atomically at the current reading position without attempting a native capture;
scrolled root snapshots are unreliable in the WebKit geometry checks. Do not capture
the full scrolling element: its raster can clip or rescale. Snapshot groups never
interpolate dimensions or transform the page. Scroll, resize and new pointer or
keyboard input interrupt the fade.
Component CSS transitions are suppressed through the first new-theme paint; the theme glyph
retains shared StateSwap motion. Rapid requests supersede the previous snapshot
and alternate against the requested destination. A rejected capture still applies
the requested theme without an unhandled error. Keyboard, reduced motion,
unsupported browsers, scrolled pages, embedded previews and live dialogs use an atomic change.

Next 16.4 Cache Components and Partial Prefetching supply cached route shells.
Visible case-study links also prefetch their cached URL-specific content. The
native Link/router owns navigation, prefetch, cancellation and history. Transient
context dialogs dismiss on route changes; persistent marquee state does not reset.
Automatic prefetching runs in production. Judge warm navigation against a production
build; development compilation and requests do not represent the cached experience.
Ready content renders directly without an intermediate skeleton or minimum loading time.

When a route really suspends, the original 32px drawing-square Architect's Loop
occupies only the content area below the header and above the dock's clearance.
The header and dock remain visible and interactive.
The mark fades in after 150ms so short requests do not flash a loading symbol;
the status is available to assistive technology immediately.
Reduced motion renders the complete square without rotation or drawing. Small
Foundation controls continue to use the Remix icon spinner. Loading is never
held open for a minimum duration.

`ButtonLink` reads the owning native Link or scoped router transition's pending state. Only its indicator
waits 150ms; the router never waits. Cached navigations show no loading flash.
Floating dock links reuse that feedback in their existing 16px glyph chambers.
Pending navigation does not resize the 40px controls, move the active route marker,
or disable another destination. Superseding a request clears the previous indicator.
Actions and links share the same icon-to-spinner chamber and balanced width
transition. Inverted editorial bands define normal, hover and pressed materials
together. Video controls and their portalled menus retain a dark material in both
page themes. Reading progress is a neutral 2px transform, updated once per scroll
frame without a React render for every scroll event.

The portfolio accent aliases Foundation's neutral primary material: dark ink in
light mode and light ink in dark mode. This includes legacy accent utilities,
native accent-color, selection, the reading indicator and portal controls.
Semantic success/error colors and the Moroccan flag retain their meaning.

### Hero terrain depth

Dark hero and page-intro fields share the technology footer's Neutral 950 ground.
Their canvas is opaque: broad terrain bands use Neutral 950, 925 and 900 rather
than lifting the whole surface toward mid-gray. Dot highlights retain their
independent neutral ramp and highlight shoulder. Light grading is unchanged.
These roles apply at every width; grid geometry, entrance and motion are unchanged.

Hero/page-intro dots use 65% of the graded alpha in dark and 80% in light,
keeping the ground and moving bands independent. Portrait terrain uses up to
1.65 times the spatial frequency, blending to the original scale between aspect
ratios 0.9 and 1.8. Dot pitch and motion timing do not change. These are visual
composition decisions, not accessibility thresholds.

### Floating navigation separation

The dock keeps its inverted surface and square geometry. A 16% ink inset
hairline defines the edge without changing layout or touch targets. A non-interactive elliptical halo extends 48px sideways, 28px above and 24px
below the dock. It fades from 32% black at 42% radius through 16% at 68% radius to transparent
at its edge, ending within the minimum 28px bottom clearance. This avoids
viewport clipping and a hard offset silhouette with no hard-edged drop shadow.
On initial mount the dock arrives over 420ms with a 6px upward settle and opacity
fade; no scale, bounce or scroll-triggered disappearance. Reduced motion removes
the entrance. The persistent dock does not replay on route changes. Light hero/page-intro broad fills use 65% of their previous
mix; dots and contour strokes retain their independent grading so the field
reads as structure rather than a gray wash. Home and Contact share these rules.

The dock alone uses dense frosted glass: 76% smoked-black fill on light pages and 97% near-white fill on dark pages,
28px backdrop blur and 0.65 saturation. Light pages receive smoked-black glass;
dark pages retain a crisp near-white dock with only a trace of transmission. Tooltips remain opaque. Unsupported blur
or a reduced-transparency preference keeps the solid surface; forced colors
uses the system canvas and outline without the decorative halo. The hairline,
icon contrast hierarchy, touch targets and entrance remain unchanged. Review
against media as well as plain backgrounds; the material is deliberately dense
so footage does not dominate the controls.

The cloud belongs to a separate frame behind the glass dock, not a negative
layer inside the backdrop-filter element. Mobile clearance is 112px, leaving
28px below the 56px dock. Its shadow reaches transparent at 24px. The entrance
uses backwards fill only, so no animation-held opacity or transform remains
on the frame after settling; the glass samples the scrolling page beneath it.

Navigation cells stay joined in one rail, with equal square targets, even outer
padding and the existing theme-control separator. Do not introduce gaps between
route cells: the moving active and hover underlays use this shared cell pitch.

### Dock touch feedback

Touch-down reveals the shared exploration underlay immediately and presses the
icon to 92%. Release, pointer cancellation and leaving the target clear that
feedback. A completed tap uses normal link navigation and the existing active
indicator slide. No pointer capture, prevented scrolling, drag-to-select or
hover tooltip is introduced. The theme control gets the same touch feedback.
`touch-action: manipulation` preserves pan/pinch while avoiding double-tap delay.
Reduced-motion and keyboard indicator rules remain in effect.
