# Yaschet Foundation reuse

The owner authorized copying the reusable Foundation from Private Office into
this public portfolio on 19 October 2026. The products remain separate, with
independent dependencies, builds and releases. There is no shared package,
private repository import, symlink or sibling-checkout requirement.

## Reviewed scope

The local UI components reuse the owner's Foundation button styles, Base UI
input, textarea, label, badge, alert, dialog, dropdown menu and toast. Supporting
icon chambers, StatusDisplay, overlay headings, menu feedback, Mineral/Zinc palette, control
geometry, focus states and motion styles are copied with them. Remix icons are
statically imported from the selected icon library; the private icon workshop
and its runtime catalog are excluded.

`foundation-source.json` records the source paths and SHA-256 fingerprints of
the reviewed upstream inputs. These are provenance records, not a claim that
adapted local files are byte-identical. Future updates are explicit local
changes with visual and interaction review; neither product updates the other.

## Local adaptations

- Imports resolve inside this repository. Private feature and workshop imports
  are removed. No business screens, personal records or internal documentation
  are copied.
- CSS base rules precede state rules; keyboard menu feedback suppresses the
  pressed transform as well as transitions.
- Foundation theme selectors apply to the document root in both the website and
  Storybook. Font aliases resolve the website’s generated local font names and
  Storybook’s local Fontsource families. The palette and component state values remain owned by Foundation.
- The portfolio preserves its native button/link composition and existing props;
  their styling resolves through the copied button recipe. Legacy `md` is the
  Foundation default 40px control. The portfolio also supports labeled 48px
  controls using the existing Foundation extra-large geometry.
- Input compatibility includes existing size and validation props. Password
  reveal keeps both Remix glyphs mounted and uses Foundation's icon-swap motion.
- Dropdown portals accept an owning overlay/fullscreen container and collision padding. Their
  compact rows remain 32px; video settings use a local comfortable 40px variant
  with the same 24px selection chamber.
- Alert body text keeps the full semantic ink opacity to pass small-text contrast
  checks on the soft status surfaces. The palette itself is unchanged.
- The toast replaces the previous Sonner implementation with Foundation's
  Base UI manager, IconChamber and soft button. The local floating composition
  follows modal headers: paired 40px chambers, 16px padding/gaps, a centered
  14/20px title and 12/16px body block. It no longer uses an inline status rail.
  Entry/exit use a restrained 16px translation with 250/150ms clocks and no blur.
  Preview-only portal hosts keep specimens contained. The historical module
  filename is retained to avoid incidental path churn.
- Local control corrections apply the written geometry contract: 12px default
  button insets, stable pending slots, one continuous password input-group frame,
  a row-aligned modal close control, and sentence-case sans-serif heading labels.
  Keyboard-initiated dialog/menu changes bypass decorative interpolation.
- Status rails stretch their material through multiline copy while holding
  glyphs at the first-line inset. Compact chamber Alerts use the same principle
  with 12px glyph insets in their 44px rail. Titles use the documented 13px status role.
  These local corrections reconcile the copied CSS with the owner's geometry
  contract; they do not modify the upstream product.
- Editorial heading and paragraph defaults live in the base cascade layer,
  allowing component typography to win without per-story overrides.
- The established gallery lightbox keeps its focus ownership and fullscreen
  behavior. Media chrome uses inverse Foundation palette aliases for legibility
  over footage; the settings popup uses the current theme.
- Storybook follows Office's Foundation-first navigation, composed examples,
  real component states and local fonts. Only public fixtures are used. The
  portfolio's natural-height Docs and isolated transport tests are preserved.
- Public project listings compose the local Foundation card materials, button
  recipe and loader. Their editorial type and spacing remain portfolio-owned.
  The initial poster and enhanced gallery share one play control, preserving
  geometry while loading instead of introducing a separate media-button design.

## Chrome And State Follow-up (21 October 2026)

The additional source fingerprints record reviewed inputs for the reusable
masked digit-column recipe and document-level theme transition. Only these
presentation mechanisms are adapted: stable clock positions, feathered masking,
short digit travel and an interruptible scene crossfade. No workspace charts,
reporting features, records, private copy or internal documentation are copied.
The portfolio retains next-themes and its existing clock semantics.

The local StateSwap composes the already copied Foundation icon and text motion.
The header now lives in the persistent root layout; its spacing, solid keylines
and canvas/card ownership are portfolio composition rules. All 436 palette and
Foundation custom-property declarations match the reviewed Office source after
case and whitespace normalization. The correction removes competing legacy
surface owners rather than introducing new colors.

## Shared Tooltip Motion Reference (21 October 2026)

At the owner's request, the portfolio dock adapts an owner-authorized editor
tooltip reference: one retained, measured shell, a 440/40 damped spring for
position and dimensions, and a 120ms text crossfade without glyph stretching.
The local implementation supports only plain-text hints above the navigation;
it does not copy editor features, customer content, private copy or dependencies.
The two repositories remain independent and the reference repository is unchanged.
The portfolio owns its square geometry and inverse Foundation materials.

## Ownership

`src/styles/foundation/` owns the copied visual foundation. `src/styles/tokens.css`
retains portfolio editorial tokens and compatibility aliases; it must not define
another primitive palette. `docs/design-system.md` owns the public usage rules.
Private Office remains the reference for intentional future ports, not a build
or deployment dependency.
