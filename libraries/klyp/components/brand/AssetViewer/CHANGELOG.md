# AssetViewer — changelog

## 2026-07-02 23:05 — send-arrow nav glyphs + fully-blurred ambient backdrop

- What: (1) the gallery-strip nav buttons swapped `ArrowLeft/RightOutline` for
  the composer's send-arrow family — `BackArrowOutline` (prev) + `SendArrowOutline`
  (next), same round-cap stroke recipe as the composer submit button. (2) The
  ambient `__bg` backdrop is now the enlarged, FULLY blurred active photo:
  `opacity: 1` (was `--opacity-60`), `scale(1.3)`, `blur(64px)`; the neutral
  scrim dropped 78%→55% root so the blurred image reads as the whole background
  instead of a dim wash.
- Why: Val — the viewer's nav arrows should match the send arrow; the modal
  background should be the enlarged blurred photo covering everything behind.

## 2026-07-02 21:56 — video items actually play — DS VideoPlayer as the main media

- What: an `AssetViewerItem` can now carry **`videoUrl`** — when present on a
  video item, the main media renders the branded **`<VideoPlayer>`** (own
  poster, play overlay, controls, timeline preview) instead of the static
  `<img>` + decorative badge, keyed per item so playback resets on switch.
  Scoped overrides make the player **fill the media box and letterbox any
  aspect** (its default is fixed 16:9 + cover, which would crop portrait
  clips), transparent bg over the ambient backdrop, 18px corner like the img
  path. Presses starting inside the player **never begin a swipe** (a seek-bar
  drag >40px was going to switch items mid-scrub) and the player carries
  `data-main-media` so clicks on it don't close the overlay. `videoUrl`-less
  video items keep the poster + aria-hidden badge. Mock: the three video items
  got public sample clips (gtv-videos-bucket); Library passes `row.videoUrl`
  through.
- Why: Val — "внутри этого компонента я не могу нажать плей, видеоплеера
  внутри нет" (Library, video item).

## 2026-07-02 21:47 — footer trio label-only at md; one --r-chip radii family

- What: Duplicate / Download / Delete are now **label-only** (icons dropped for
  now — Val's call) at **size `md`**, so they carry the same box and the same
  **`--r-chip` (10px)** radius as the Edit CTA — the previous `sm` step was the
  whole mystery of the "small border-radius": Button's `sm`/`icon-sm` sizes
  drop to `--radius-sm` (6px) by design. The row keeps slot-based widths
  (`flex: 1 1 auto`) and scopes `padding-inline` 16→12 so three md labels fit
  the 272px inner width of the 320px-min modal. The header close ✕ steps up
  `icon-sm` → **`icon`** (md box, `--r-chip`) — same radii family as the rest
  of the panel; it stays the DS `Button variant="secondary"` + `XOutline`.
- Why: Val — the trio and the close read as an alien radius next to Edit; make
  them normal-size DS buttons with Edit's radius, no icons for now.

## 2026-07-02 21:38 — footer trio de-squeezed via Button's real icon slot + XOutline close

- What: the Duplicate / Download / Delete row no longer clips its labels. The
  icons now go through **Button's own `iconLeft` prop** instead of raw svg
  children — that engages the slot's `data-icon-left` optical padding, wraps
  each label in `__text` (ellipsis, vertically centred with the icon by the
  primitive itself), and drops the bespoke markup. Trio size `md` → **`sm`**
  (shorter box, tighter padding, same 14px label). The row's equal-thirds
  `flex: 1` → **`flex: 1 1 auto`** — slot-based widths, so the longer
  "Duplicate" takes the room it needs inside the 320-380px modal. Trio icons
  read at **~50% strength** via a SOLID `color-mix` against the surface (never
  alpha on an outline glyph — overlapping strokes double-composite; labels stay
  full-strength). The header close ✕ swaps the inlined `CloseGlyph` svg for the
  DS **`XOutline`** from `@klyp/icons` (the light-close glyph the icon set
  designates for this).
- Why: Val — the three action buttons were squeezed/clipped and looked
  hardcoded; make every control a real DS Button with proper props, keep the
  icons, dim them ~50%, align icon+label vertically.

## 2026-07-02 21:06 — bug pass after cherry-pick into main line (11 fixes, zero visual change)

- What: multi-agent audit (6 lenses → adversarial verify) of the component as
  cherry-picked from PR #20; confirmed bugs fixed, pixels untouched. (P1) a
  click/tap on the main photo — or a completed mouse swipe — closed the whole
  overlay: pointer capture on `__viewer` retargets the trailing click to the
  capture element, so the `[data-main-media]` guard in `onSceneClick` could
  never match; a `press` ref now records where the gesture started (+ whether
  it swiped) and the click consumes it — engine-agnostic, capture kept. (P2)
  loop/scroll mode now ALSO engages on measured overflow (single-set width vs
  the wrap, arithmetic — no clone feedback), not just item count, so 5-6 thumbs
  on a squeezed desktop stage (~521-816px) are no longer centre-clipped and
  unreachable. (P2) the stage wheel-hijack is skipped in the ≤520px stacked
  layout — it was converting deltaY into strip scroll and dead-zoning vertical
  page scroll for mouse users. (P2) width-reflow ResizeObserver re-observes the
  prompt/refs nodes on item switch (was mount-once → watched detached nodes).
  (P2) SR: video items announced as video (dialog / media alt / thumb labels —
  the play badge is aria-hidden); "Copied" announced via an sr-only
  `role="status"` live region; Esc/arrows ignored while a host keeps the
  overlay mounted but hidden (`checkVisibility` guard). (P3) copy failures are
  now diagnosable (`console.warn`, explicit non-secure-context error) and the
  1.5s "Copied" reset timer is managed (rapid re-copy restarts it; cleared on
  unmount). (P3) settings rows with empty values (and a model-less Model row)
  are dropped. (P3) aria-hidden loop clones no longer take click-focus
  (`onMouseDown` preventDefault). (P3) nav-arrow smooth scroll respects
  `prefers-reduced-motion` ('instant'). Stories: raw `<button>` reopen
  affordance → DS `<Button variant="primary">` (repo rule). Lab: closed state
  adds delayed `visibility: hidden` so the invisible aria-modal dialog leaves
  the a11y tree / tab order; registry "Open live →" now points at the real
  `/asset-viewer-lab` route (was a dead `/asset-viewer` → 404) and its
  description drops the retired ToolButton mention.
- Why: Val — merge the component from pbekasov's PR #20 via cherry-pick, then
  re-verify and fix bugs carefully while keeping the visuals exactly as
  delivered.

## 2026-07-01 14:17 — ring repaint fix + secondary nav + conditional loop

- What: (1) the active ring is now a **bordered `::after`** (not `outline`) —
  `outline` is painted in a phase that a CSS-masked scroll container (the strip's
  edge fade) fails to invalidate on a `data-active` flip, so the ring only appeared
  after a forced repaint (the reported "shows when I switch windows"). A border
  repaints with the element; plus a one-frame `will-change` nudge on select as
  belt-and-suspenders. The active thumb (whose image is in `data-main-media`) is
  always ringed. (2) The gallery **nav arrows are DS `Button variant="secondary"`**
  (were `ToolButton`). (3) The strip only **loops/scrolls when it would overflow** —
  ≥7 thumbs on desktop / ≥5 on mobile (width-driven via a root ResizeObserver);
  below that there are no clones, no scroll, no arrows and no edge-fade mask (thumbs
  just sit centred).
- Why: Val — active ring didn't paint until a window switch; arrows should be
  secondary buttons; few images shouldn't scroll/fade.

## 2026-07-01 13:41 — instant gallery ring + ref-tile fill + 18px corners

- What: the gallery active **ring now snaps on instantly** — removed the 160ms
  `outline-color` transition (the ring fading in while the strip instant-re-centres
  read as "no ring / blink" on a real click), and reordered so `[data-active]` wins
  over `:focus-visible` (a real click focuses the thumb, so the white active ring
  must beat the faint focus ring). Reference tiles: `__thumb` explicitly fills the
  tile (`object-fit: cover`, 100%/100%) so miniatures cover the full width edge-to-edge.
  Corner radii: `__modal` and the main media (`[data-main-media]`) are now **18px**
  (and the mobile sticky-footer bottom corners match).
- Why: Val — active gallery state didn't show its ring on click; refs should fill;
  18px corners.
- Note: 18px isn't a radii-ramp step (ramp is 16 `--radius-2xl` → 20 `--radius-3xl`);
  used as a raw value per Val's explicit spec.

## 2026-07-01 13:09 — gallery active-state fix + section spacing

- What: selecting a thumb now **instantly** centres it and keeps its ring — the
  active-thumb centre on select was `behavior:'smooth'`, but the same selection
  fires a re-render cascade (reset collapse + overflow re-measure) that silently
  cancelled the smooth scroll, so the strip never moved: the ring appeared on
  off-screen copies while the still-centred previous thumb faded out (the "blink").
  Switched to an instant `scrollTo` (a jump can't be cancelled) → the chosen image
  lands dead-centre with its ring every time. Section spacing: `__sec` inner gap
  8→**12px** (so section-head → content is 12px); the "Show more" toggle sits **8px**
  below its content (scoped negative margin against the 12px gap); `__rows` keeps its
  **8px** gap (settings rows), with 12px from the section head.
- Why: Val — active gallery state only flashed on click + didn't centre; section
  rhythm tweak.

## 2026-07-01 12:32 — Val design pass (modal / gallery / mobile)

- What (desktop): modal is a single **24px inset** (padding + 24px gap) with the
  header/footer **divider borders removed**; body gap 20→24; title now the
  **Heading XS** type token (`--type-heading-xs`); the close × is a DS **Button
  `variant="secondary"`** (`icon-sm`), not a ToolButton; each section label gets an
  **8px** icon→text gap and a **24px** icon (`--icon-size-lg`); the Copy button is
  **`secondary`**; both "Show more" toggles (prompt + references) are **`ghost`**;
  references now **fade** (mask) when they overflow one row instead of hard-cutting;
  the action trio is **size `md`**; the prompt fade is **dropped when the prompt
  fits** (`data-clamped` gates the mask). Gallery: **capped to ~7 thumbs and
  centred** (was full-width); the active thumb reliably **centres + rings** with no
  jank — replaced `scrollIntoView` (which scrolled every ancestor) with a
  gallery-scoped `scrollTo`, removed CSS `scroll-behavior: smooth` (it made
  `behavior:'auto'` animate), and re-centre via a **ResizeObserver** so the first
  centre isn't computed at the wrong (pre-layout) width.
- What (mobile): the strip now **finger-scrolls** (`touch-action: pan-x`); **swipe**
  is reliable (pointer capture on down + `pointercancel` reset, so pointerup still
  fires if the finger drifts off the image); active-thumb centring uses the same
  fixed path; the sticky **footer sits flush to the viewport bottom** (scene/modal
  bottom-padding 0 — no body content peeking below), **spans the full modal width**
  (margin-inline break-out, solid bg covers scrolled content) and carries the
  **bottom corner radii** + safe-area inset.
- Why: Val design review of the shipped component.

## 2026-07-01 11:25 — team-audit fixes (3×P1 + 4×P2/P3, senior-confirmed)

- What: (P1) mobile sticky footer now actually pins — the `@container` block adds
  `__modal { overflow: visible }` so the footer's scroll ancestor is the scrolling
  `__scene`, not the content-sized modal that was clipping it (was dropped from the
  prototype's `.modal{overflow:visible}`). (P1) window keydown handler guards
  `e.target instanceof Element` instead of an `as HTMLElement` cast that defeated `?.`
  and threw a TypeError (killing Esc/←/→) when focus was on window/document. (P1) raw
  `#000` in the four mask-gradient stops → the `black` keyword (no-hex rule, zero
  visual change). (P2) gallery strip is now a labelled `role="group"` (aria-label
  "Assets") of buttons with `aria-current` instead of an incomplete `role="tablist"`
  with no tabpanel. (P2) reference tiles' inner cell radius `--r-chip`→`--r-card` (12px)
  to match the gallery thumbs + main media + prototype. (P3) dropped the dead inline
  `width/height={24}` on the three section glyphs (SCSS `--icon-size-md` already owns
  them at 20px). (P3) corrected a stale root-overflow comment.
- Why: multi-agent review panel (fidelity + css-container-hygiene + ds-enforcement +
  a11y-react-aria + design-visual) → senior-auditor consolidation (34 raw → 11
  confirmed). Deferred to Val (flagged, not auto-applied): overlay focus-trap /
  scroll-lock / focus-restore (RAC Modal migration is architectural); the duotone
  section-glyph `opacity="0.4"` (Val-specified inlined bulk glyphs); and the raw
  `blur(64px)`/`blur(12px)` px which have no exact token (needs a token add/choice).

## 2026-07-01 10:35 — infinite-loop gallery + container-query mobile

- What: The gallery strip is now a true **infinite loop** — the thumbs render 3×
  (middle copy is the real tab; the flanking clones are `aria-hidden` +
  `tabIndex=-1` but still switch on click), the strip starts scrolled onto the
  middle set, and an idle **recenter** (140ms debounce) teleports back into the
  middle band once scrolling stops, so the strip never hits an end. Ported 1:1
  from the prototype's `oneSet`/`recenter`. Wheel over the stage now scrolls the
  strip horizontally (native non-passive listener). The ≤520px mobile switch is
  now a **container query** (`container: asset-viewer / inline-size` +
  `@container asset-viewer (max-width: 520px)`) instead of a viewport `@media` —
  adaptive-first compliant, and it lets a host constrain the overlay width to get
  the real mobile layout in-page. Active-thumb ring keyed on `data-active` (all
  copies) instead of `aria-selected` (middle only).
- Why: complete the 1:1 prototype port (the gallery was finite scroll-by-3) and
  power the new `/asset-viewer-lab` full-screen state-switching harness
  (`apps/web/src/routes/asset-viewer-lab.tsx`).

## 2026-07-01 10:30 — 1:1 prototype fidelity (verify-against-spec drifts)

- What: Asset-context CTA is now the gold **MeshButton** ("Recreate") instead of a
  plain primary Button (library keeps the DS primary "Edit"). Added prev/next
  **gallery arrows** (`ToolButton` ArrowLeft/Right, `variant="subtle"`) flanking the
  strip, scroll-by-~3-thumbs on press, hidden ≤520px (scoped under `__galleryWrap`
  to out-specify ToolButton's base display). Mobile **footer is sticky** to the
  page bottom (position:sticky, surface bg, safe-area padding).
- Why: verify-against-spec found 3 fidelity drifts vs
  `_prototypes/image-viewer-modal/AssetsViewer-prototype.html`; Val chose to bring
  all three to 1:1.

## 2026-07-01 10:05 — css-hygiene audit fixes (2×P1 + 3×P2, senior-confirmed)

- What: Gallery vertical padding `--space-4` → `--space-8` so the active thumb's
  outline (`--bw-emphasis` + 2px offset = 4px reach) + hover-scale bleed isn't
  sheared by `overflow-y:hidden` (P1). Hover `scale(1.04)` gated behind
  `@media (hover:hover) and (pointer:fine)` — kills sticky-hover on touch where the
  thumb is the switch control (P1). `__rowV` got `min-width:0` + `span` ellipsis
  (+ `__rowK` `flex:0 0 auto`) so a long model name truncates instead of distending
  the 320–380px row (P2). `__refs` gains `:focus-within { max-height:none }` so a
  keyboard-focused tile in the collapsed 2nd row isn't clipped (P2). Prompt/refs
  overflow re-measure now runs under a `ResizeObserver`, not just on active change,
  so "Show more" stays correct on width reflow (P2).
- Why: css-hygiene-audit (css-container-hygiene + ds-enforcement → senior-auditor);
  DS-enforcement gate was clean.

## 2026-07-01 09:20 — barrel export + token-hygiene pass

- What: Exported from the `@klyp/brand` barrel (was folder-only). Fixed a broken
  token `--color-fg-secondary` (does not exist) → `--color-fg-muted` (4 sites, was
  falling back to unset colour); migrated deprecated `--font-size-13` alias →
  `--font-size-14`; raw `1px` borders → `var(--bw-default)`, `2px` thumb outline →
  `var(--bw-emphasis)`. Modal body scroll region got a styled thin scrollbar +
  `scrollbar-gutter: stable` (was a raw OS bar that shifted content on appear).
- Why: finishing the component for the Asset viewer catalog page — reachable via
  `import { AssetViewer } from '@klyp/brand'` and DS-token clean.

## 2026-06-30 09:40 — new component (React port of the image-viewer prototype)

- What: New `@klyp/brand` molecule `AssetViewer` — the full-screen asset
  preview overlay, a 1:1 React port of `_prototypes/image-viewer-modal/ideal-prototype.html`.
  Composes DS pieces where they fit (`Button`/`ToolButton` actions,
  `AttachmentSlot` reference tiles) over a bespoke scene/fill-box/gallery/modal
  shell. Props-driven: `items[]` + `activeId` + `onActiveChange`; `context`
  branches the footer (`library` → "Edit" + Delete · `asset` → "Use Preset", no
  Delete); each item carries its own `mediaKind` + settings (image: Quality /
  Aspect · video: Duration / Aspect / Resolution / Audio) + references. Behaviours:
  blurred ambient backdrop of the active media, gallery select (click / ←→ / swipe),
  active-thumb white 2px ring (matches MediaCard selection), prompt clamp+fade with
  Show more, references one-row collapse with Show more, copy-to-clipboard, Esc /
  empty-space close, ≤520px vertical-stack mobile layout with page scroll.
- Why: Val — the HTML prototype had to become a real React component so the Library
  card-click and Library-picker expand can open it in-app (the old AssetModal is a
  different 2-layer drawer, not the agreed design). New component, AssetModal left
  intact for now.
- Note: Promt / Settings / References section icons are the iconsax **bulk** glyphs
  Val specified, inlined locally — `@klyp/icons` bulk is deprecated (renders null),
  so importing them would paint nothing.
