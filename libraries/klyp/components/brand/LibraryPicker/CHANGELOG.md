# LibraryPicker — changelog

## 2026-06-30 05:03 — inline footer; drop SelectionFooter component

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss` (+ removed
  `packages/brand/src/SelectionFooter/**`, its brand-barrel export, and its
  `/components` registry entry; updated `ModalToolbar` doc comment).
- What: the footer's `<SelectionFooter>` is inlined directly into `__footer` —
  a `<p aria-live="polite">` summary + a primary `Button`. `__footer` now owns
  the flex row itself (summary left + action right); the new `__footerLabel`
  keeps the `aria-live` announcement, label truncation, and `flex-shrink:0` on
  the button. No behaviour change.
- Why: `SelectionFooter` was a thin presentational wrapper (label + primary
  Button, zero logic) with a single consumer — premature extraction. Removed
  to cut DS surface; the footer is local to LibraryPicker again.

## 2026-06-30 03:46 — mobile-sheet: stop full-reload on tab switch + compact layout

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss`, and the Convex host
  `apps/web/src/features/chat/components/library-picker-modal.tsx`.
- What:
  - **Section switch no longer blanks the sheet.** The host now keeps the
    previously-resolved rows on screen while the new section's Convex query
    re-resolves (stale-while-revalidate) — the full-body spinner shows only on
    the FIRST open. New `isRefetching` prop dims the grid subtly during the
    switch (`[data-refetching]`) instead of swapping the whole body to a spinner.
  - **Close button sized to the control ladder.** `__sheetClose` 40px →
    `--control-size-md` (36px) so it matches the iconOnly TabSwitcher + filter
    button exactly (was a visibly bigger outlier); hover bg aligned to
    `surface-solid`.
  - **Mobile dropzone is compact + collapses on scroll.** Resting band is now a
    ~64px row strip (was a fixed 96px stacked block) and collapses to a 40px
    strip on grid scroll, same as desktop. Removing the phone gate alone wasn't
    enough: the picker swaps its whole shell at the phone↔desktop boundary
    (vaul sheet ⇄ Dialog), so the grid is a different DOM node per shell and the
    old `[open,isPhone]` scroll effect re-attached to the wrong (unmounted) node
    on mobile → it never collapsed there (desktop has no swap, so it worked,
    masking the bug). Fixed by moving the scroll listener onto a **callback ref**
    on the grid (node-lifecycle driven, immune to the shell swap + the
    loading→ready flip). Footer band tightened (16 side / 8 bottom). Reclaims
    vertical space for the grid.
- Why: on the mobile vaul sheet, switching the TabSwitcher section re-ran the
  backend query → `useQuery` returned `undefined` → `isLoading` flipped → the
  grid + dropzone + footer all blanked to a centered spinner, which read as "the
  whole sheet reloaded". Plus the close button, dropzone, and footer wasted
  vertical space, leaving a tiny grid window (Val 2026-06-30).

## 2026-06-29 04:23 — type-source-axes-to-multiselect-dropdown

- What: Converted the Type and Source filter axes from single-select <BrandSelect>/<StatusDot> to multiselect <Dropdown> pills: props renamed mediaType/source -> mediaTypes/sources (arrays, empty = all), defaultMediaType/defaultSource -> defaultMediaTypes/defaultSources ([]), and onMediaTypeChange/onSourceChange -> onMediaTypesChange/onSourcesChange; each desktop axis now renders as its own labelled <AdvancedFilterPopover> pill with a count badge, dropping the typeAll/sourceAll 'All' copy. Net -80 lines across .tsx/.scss/.stories.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-27 23:31 — fix: dropband collapse-on-scroll re-armed after async load

- Files: `LibraryPicker.tsx`
- What: the scroll-collapse listener (band shrinks to a 40px strip on grid
  scroll) wasn't attaching — added `isLoading` to the effect deps + an
  `if (isLoading) return` guard so it re-runs on the loading→ready flip and
  binds to the now-mounted grid.
- Why: the grid node mounts only after the async Convex query resolves (a
  spinner shows while loading). On a fresh open `gridRef.current` was null, the
  effect bailed, and deps `[open, isPhone]` never changed again → the listener
  never attached → the band stopped collapsing on scroll. Re-arming on
  `isLoading` fixes it. (Regression surfaced after the resting-size flex-shrink
  fix, but the cause is the async-mount timing, not flex-shrink.)

## 2026-06-27 13:25 — fix: resting dropband collapsed (flex-shrink)

- Files: `LibraryPicker.scss`
- What: added `flex-shrink: 0` to `.klyp-LibraryPicker__dropband`. The resting
  upload band was collapsing to a sliver (icon clipped, no copy/border) instead
  of its 144px height.
- Why: the 2026-06-26 redesign switched `__main` from `display: grid` (rows held
  the band's height) to `display: flex; flex-direction: column`. A flex item with
  a fixed height still shrinks (default `flex-shrink: 1`) once the sibling
  `__grid` (`flex: 1 1 auto`) claims the space, so the band got squeezed and
  `overflow: hidden` clipped its contents. Pinning it restores the resting band;
  `[data-empty]` keeps its `flex: 1 1 auto` full-screen override.

## 2026-06-26 17:05 — selected-check on Type / Source selects

- Files: `LibraryPicker.tsx`
- What: enabled `showSelectedCheck` on the Type and Source `BrandSelect`s — the
  active option now shows a trailing tick in the open list.
- Why: these axes read as menu-style selects (the open list is the primary
  surface); the explicit per-row marker aids scanning. Opt-in via the BrandSelect
  prop added when the old Select primitive was consolidated.

## 2026-06-26 13:49 — single-select axes + header toolbar + full-screen empty dropzone

- What: 3-part redesign. (1) Type + Source are now SINGLE-select with an
  explicit "All" default — the array props `mediaTypes`/`defaultMediaTypes`/
  `onMediaTypesChange` + `sources`/`defaultSources`/`onSourcesChange` are
  replaced by single optionals `mediaType`/`defaultMediaType` (default
  `undefined` = all)/`onMediaTypeChange` + the same trio for `source`. Each
  axis renders as a `<BrandSelect>` (trigger shows the selected value; "All"
  resets it) with an accent corner `<StatusDot>` + subtle border accent only
  when narrowed off "All". New copy keys `typeAll`/`sourceAll` (both brands).
  (2) DESKTOP shell rebuilt from `@klyp/ui/Dialog` primitives with a custom
  banded header `[ title ][ toolbar ][ divider ][ ✕ ]` — the toolbar moved out
  of the body into the header (mobile vaul sheet keeps it in the body). (3)
  EMPTY state is now a FULL-SCREEN dropzone (no `<EmptyState>`, no grid, no
  scroll, no footer) that fills the body; with items the layout is unchanged.
- Why: the picker opened with Image pre-selected (host defaulted to `['image']`)
  and the multiselect popover idiom was heavier than the one-of-N reality;
  single-select + "All" default fixes the pre-filtered open, the header toolbar
  reclaims body height, and the empty dropzone makes "upload your first asset"
  the obvious primary action.

## 2026-06-25 08:14 — Type+Source collapsed into one multiselect filter popover

- What: the two Type + Source `<BrandSelect>`s are replaced by ONE
  `<AdvancedFilterPopover>` filter button (popover on BOTH desktop + mobile)
  holding two multiselect `<CheckboxGroup>` card rows (Type: image/video/audio;
  Source: series/chat/canvas, each with a leading 16px icon). The trigger shows
  an activity DOT (StatusDot via `indicator="dot"`), not a number. Section
  TabSwitcher is `iconOnly` on both devices and `fullWidth` on mobile (the
  filter button pins flush to its right, `flex-shrink:0`). Desktop search is
  pinned to 256px on the right. **BREAKING:** the single-value props
  `mediaType`/`defaultMediaType`/`onMediaTypeChange` + `source`/`defaultSource`/
  `onSourceChange` are replaced by array props `mediaTypes`/`defaultMediaTypes`
  (default `[]`)/`onMediaTypesChange` + `sources`/`defaultSources` (default
  `[]`)/`onSourcesChange`; the `'all'` member is removed from
  `LibraryPickerMediaType` + `LibraryPickerSource` (empty array = "all").
- Why: collapse the two filter axes into a single compact control with the same
  popover idiom on every device, and let users pick multiple types/sources.

## 2026-06-24 20:32 — filters unified to one idiom (Variant C)

- What: the three filter controls now speak one language. Section stays a
  labelled segmented `<TabSwitcher>` (dropped `iconOnly`); Type + Source are two
  identical labelled `<BrandSelect>`s. Source is de-iconned — removed the
  chameleon trigger icon + the count Badge (and the custom `renderTrigger` /
  `showChevron={false}` / wrapper div / `advancedFilterCount`). Both selects show
  the axis name in the default state via a `short` tag on the `all`/`Anywhere`
  option ("Type" / "Source"), then the chosen value + its icon after a pick. On
  mobile the section row scrolls horizontally (no wrap/clip) with Type + Source as
  two equal columns beneath it.
- Why: three different idioms (segmented + dropdown + icon-only-with-badge) for the
  same action — filtering the grid — read as three unrelated things; the numeric
  badge on the Source icon looked like a notification, not a filter count.

## 2026-06-24 15:11 — dropzone collapses immediately on scroll

- Files: `LibraryPicker.tsx`
- What: lowered the dropzone collapse threshold — was `scrollTop > 96` (you had to
  scroll ~96px before it went compact), now `> 8` so it collapses as soon as the
  grid scrolls. Re-expands only when scrolled back to the top (`scrollTop === 0`);
  the post-toggle lock still guards the flicker.
- Why: design-lead — it wasn't becoming compact right after scroll.
- Verified live: at 40px scroll the band is the compact strip (icon-left + short
  copy).

## 2026-06-24 14:57 — Source dynamic icon · badge no-clip · body top 12 · dropzone scroll-flicker fix

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss`
- What: (1) the Source select icon now reflects the selection (Anywhere → panels,
  Series → video, Chat → messages, Canvas → frame). (2) The picker root keeps
  `overflow: clip` but gains `overflow-clip-margin: var(--space-8)` so the Source
  count badge (and focus rings) near the toolbar edge aren't shaved off. (3) Modal
  body top padding 24 → 12 for this picker. (4) Dropzone scroll-collapse no longer
  flickers — a post-toggle lock-out ignores the layout-induced scroll (scrollTop
  clamp) during the band's height transition, so it settles compact after scroll
  instead of toggling open/closed.
- Why: design-lead batch.
- Verified live: Series shows the video glyph; badge "1" fully visible; body top 12.

## 2026-06-24 13:45 — Source = direct icon-select (DS Badge) · revert mobile bleed

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss`
- What: (1) Source filter de-nested — was `AdvancedFilterPopover` (icon button →
  popover) wrapping a `BrandSelect` (→ another dropdown), a double menu. Now it's
  a single `BrandSelect` with a custom icon-only trigger (`PanelsOutline`,
  `showChevron={false}`) styled as a 40px button via `__sourceSelect`; clicking
  opens the Source menu (Anywhere/Series/Chat/Canvas) directly. The active-count
  badge is now the shared DS `Badge` (`intent="gray" variant="subtle" size="sm"`,
  number only, no icon) — replaces the bespoke `klyp-AdvancedFilterPopover__badge`.
  (2) Reverted the mobile toolbar edge-to-edge bleed from 13:03 — the toolbar sits
  back within the sheet's 16px gutter.
- Why: design-lead — kill the popover-then-select double-nesting, use a Source-
  meaning glyph + the DS Badge, and keep the mobile toolbar within the frame.
  (LibraryPicker no longer imports `AdvancedFilterPopover`; that component is
  unchanged and still used by the `/library` route.)
- Verified live: desktop — 40px Source icon button opens the menu directly;
  picking "Series" shows a gray/subtle/sm Badge "1" (no icon). Mobile — toolbar
  insets 16px (within frame).

## 2026-06-24 13:03 — mobile toolbar edge-to-edge · sheet header bottom 12

- Files: `LibraryPicker.scss`
- What: on the mobile sheet the toolbar now bleeds the `__main` 16px gutter so the
  filter row + search bar span EDGE-TO-EDGE; the sheet header (`__sheetTitleRow`)
  bottom padding `8 → 12`. (The controls↔search column gap `8 → 12` lives in
  ModalToolbar.) Toolbar controls confirmed all-DS (SearchField / TabSwitcher /
  BrandSelect / AdvancedFilterPopover) — nothing to swap.
- Why: design-lead — restore the full-bleed mobile toolbar + tidy the header/gap
  spacing.
- Verified live (390px): toolbar + search span 0→390; column gap 12; header
  bottom 12.

## 2026-06-24 12:43 — toolbar → shared ModalToolbar · dropzone label clip fix

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss`
- What: (1) the toolbar row now uses the shared `<ModalToolbar>` — filter controls
  (section tabs + type + funnel) on the LEFT, search pinned RIGHT at 400px on
  desktop; on mobile the controls stack on top and the search drops full-width
  below (ModalToolbar's container query owns the flip). The search is pulled out
  of the control cluster into the toolbar's `search` slot. `__toolbar` is now a
  thin wrapper (grid placement + `data-vaul-no-drag`); the old `__toolbarControls`
  flex rules + the mobile control-arrangement rules are gone.
  (2) Dropzone label clip on mobile fixed — the sheet's upload band was a fixed
  96px flex column too short for icon + copy line-box + padding (101px), so flex
  compressed the copy below its line-height and clipped descenders. The band now
  grows to fit (`block-size: auto; min-block-size: 96px`).
- Why: design-lead — flip the toolbar (filters left / search right 400px), extract
  it as a reusable piece (the toolbar counterpart to SelectionFooter), and fix the
  clipped dropzone text on phones.
- Verified live: desktop (`/components/library-picker`) controls-left / search-400
  right; mobile sheet (390px) controls-top / search-full-below; dropzone copy
  renders at full 21px line-height (was 14px), no clip.

## 2026-06-24 12:07 — header = Modal title + close · toolbar is a controls band

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss`
- What: the Modal header (title "Library" + close ✕) is no longer sr-only — it
  shows as the standard Modal header band. Removed the now-dead machinery that
  was stale after the Modal refactor: the floating outside-panel ✕ (it targeted
  `.klyp-Dialog__close`, which Modal renamed to `.klyp-Modal__close` inside the
  header), the 640–1200px inline-✕ / two-row toolbar logic, and the inline
  `__toolbarTitle` + `__inlineClose`. The toolbar is now a controls-only band
  below the header (search fills the left, filters pin right) inset 24 sides /
  12 top-bottom via the Modal body band + main-grid gap.
- Why: design-lead — Library was inconsistent with Modal (hidden header + a stale
  custom close). Header keeps title + close; the toolbar moves below.
- Verified live (`/components/library-picker`): header band 24/24/12 with "Library"
  + secondary close; toolbar controls band below; no stale title/inline-close.

## 2026-06-24 10:26 — footer → shared SelectionFooter (primary action)

- Files: `LibraryPicker.tsx`, `LibraryPicker.scss`
- What: the bespoke footer (`__selectionLabel` + a `variant="default"` Button)
  is replaced by the shared `<SelectionFooter>` (count + label + primary action).
  The action button is now `variant="primary"` (was `default`) per the modal
  footer rule. `__footer` keeps only the band styling (border-top + spacing); the
  row layout moved into SelectionFooter. `data-vaul-no-drag` preserved on the
  wrapper for the mobile sheet.
- Why: design-lead — Library = `Modal full` + toolbar + the reusable
  SelectionFooter; one footer pattern across multi-select pickers. Verified live:
  "Nothing selected" (disabled) → "1 selected" / "Use 1" (enabled).

## 2026-06-18 00:00 — added to /components catalog (dual-iframe preview + refreshed summary)

- What: LibraryPicker now presents properly on `/components/library-picker`. (1) Registry summary + tags rewritten — the old copy described the pre-rework design ("two-section modal … Right: a Dropzone upload rail" + "ExpandingSearch"), now: "Modal-or-sheet media picker … upload band under the filters … desktop React-Aria Modal (two-row toolbar ≤1200px); mobile vaul bottom-sheet" + tags `sheet`/`bottom-sheet`/`media`/`vaul`. (2) A `*.snapshot.tsx` renders `<LibraryPicker open>`, embedded by a per-slug custom preview in `ComponentPage.tsx` (AGENTS.md §2 escape hatch) as TWO `SnapshotIframe`s — Desktop 1440 (the Modal) + Mobile 390 (the vaul sheet) — from ONE snapshot (the picker's matchMedia reads each iframe's viewport). The overlay is fully CONTAINED + visible in-frame (the iframe owns its document.body), solving the "overlays show only a trigger button / empty frame" problem. The 4 trigger CSF3 stories stay for interactive demo + Source.
- Why: the catalog page showed only empty trigger-button frames + a stale summary; owner asked to add it "properly", with a working mobile-sheet iframe preview. Catalog-side only (registry + a snapshot + a ComponentPage custom-preview hook); component code untouched. typecheck (`tsc -b`) / biome lint / catalog:lint / catalog:audit all clean; Playwright-verified both iframes render (Desktop hasModal, Mobile hasSheet, console 0 errors). Team-Lead multi-agent audit cross-checked the registry accuracy + the custom-preview convention.

## 2026-06-17 23:09 — narrow-modal two-row toolbar + sheet handle/✕/footer polish (Playwright-verified)

- What: Owner pass on the narrow-modal toolbar + the vaul sheet chrome; every change live-verified via Playwright at 1280/1100/770 (modal) and 390/600/844 (sheet), console clean (0/0).
  - **Narrow-modal (640–1200px) toolbar → TWO rows**: row 1 = title (`Library`) left + inline ✕ right; row 2 = Search + section tabs + type + funnel. Moved `__inlineClose` out of `__toolbarControls` onto the `__toolbar` row (sibling after the title); `@media(≤1200)` reveals it with `margin-inline-start:auto` (pins it right) and sets the controls `flex:1 1 100%` (wrap to row 2). The search keeps its 320px cap but gets `margin-inline-end:auto` so the fixed controls hug the right edge with no dead gap — and it still shrinks on tight rows so everything stays ONE controls row (uncapping it regressed to 3 rows, caught in the browser). >1200 stays one row + floating ✕; the sheet still hides title + inline ✕.
  - **Sheet ✕ 48 → 40px** — reverted the AAA-48 bump; it read as an oversized outlier next to the 40px control family (still ≥ WCAG 2.5.5 AA 24px).
  - **Drag handle** thinner (`--space-2`=2px), wider (`--space-48`=48px), fainter (`--opacity-40`=0.4). Scoped `.klyp-LibraryPicker__sheet .klyp-LibraryPicker__sheetHandle` (0,2,0) to override vaul's injected `[data-vaul-handle]` defaults (0,1,0: 32×5px / 0.7) — without the prefix vaul's runtime `<style>` won on size+opacity (confirmed via computed styles: was 32/5/0.7, now 48/2/0.4).
  - **Sheet top corners** `--r-section`(16) → `--r-panel`(20).
  - **Tighter handle→title gap**: handle `margin-block` 12/4 → 10/2, title-row `padding-top` 4 → 2.
  - **Footer breathing room**: `.klyp-LibraryPicker__sheet` base `padding-bottom: calc(var(--space-16) + safe-area + kb-offset)` so the "Use selection" row never jams the sheet's bottom edge (owner read the flush look as "clipped"; measured 16px gap, footer NOT clipped at 600/844, grid shrinks 212–454px instead).
  - **Horizontal scrollbar killed**: the grid's `overflow-y:auto` implied `overflow-x:auto`, so the masonry being ~scrollbar-width over the content box leaked an h-scrollbar at the grid's bottom. `__grid { overflow-x:hidden }` + root `.klyp-LibraryPicker { overflow:clip }` (contains without being a scroll container; dropped the Safari-unsupported `overflow-clip-margin`). Verified grid/body overflowX 0 at 1280/1100/770.
  - **Owner +1**: mobile dropzone band 112 → **~96px** (`--space-96`). Verified `bandHeight: 96` live.
  - **Audit pass applied** (from the multi-agent review): bounded the narrow-modal media block to `(min-width:640px) and (max-width:1200px)` and the tablet-sizing block to `(640–720px)` so neither leaks onto the ≤639.98 sheet (kills two equal-specificity cascade ties); raised the vaul-handle override to `…__sheetHandle[data-vaul-handle]` (0,3,0) so it beats any future vaul (0,2,0) handle rule; swapped `blur(var(--blur-3))` → semantic `var(--fx-glass-blur-soft)`; keyed the drag SR live-region span so an accept→reject flip re-announces; restored `data-vaul-no-drag` on the relocated inline ✕ (latent sheet-drag guard); fixed a stale dropband comment.
- Why: owner iteration on the narrow-modal header + sheet affordances; the toolbar wrapping was visibly broken and the ✕ overlapped filters. SCSS-heavy + two small JSX touches (inlineClose relocation + keyed SR span); typecheck/biome clean. A senior multi-agent code audit (4 lenses + synthesis) cross-checked the cascade/spec/a11y against these Playwright measurements; its real P1 (cascade fragility) + the worthwhile P2s were applied and re-verified. Verdict: ship.

## 2026-06-17 21:29 — sheet audit fixes (type-select fill, ✕ 48px, reduced-motion)

- What: Post-audit fixes from the cross-checked senior review of the vaul sheet (correctness/a11y/spec all PASSed; css-visual found one P1 + two P2).
  - **P1** — the mobile type `<BrandSelect>` now actually fills the toolbar row: the wrapper grew (`flex:1 1 auto`) but the inner `.klyp-BrandSelect__trigger` chip sized to content (documented BrandSelect gotcha), so added `inline-size: 100%` on the trigger in the phone block.
  - **P2** — sheet close ✕ bumped 40 → 48px (`--space-48`) to clear the WCAG 2.5.5 (AAA) 44px touch target on phone.
  - **P2** — added a `prefers-reduced-motion` guard that zeroes vaul's injected slide-open/close keyframe on `.klyp-LibraryPicker__sheet` (it has no internal guard) so the package is self-contained, not only covered by the app's global reset.
  - Left as-is (optional / pattern-consistent / runtime-only): vaul `autoFocus=false` (matches MobilePanelSheet), handle width, footer-pinning under keyboard/short-landscape, one-row fit at ~320px — flagged for the live phone check.
- Why: senior audit (vaul 1.1.2 source-verified) — the type-select dead-gap was the one real visual defect; the ✕ + reduced-motion are a11y polish. SCSS-only; typecheck/biome unaffected.

## 2026-06-17 21:20 — mobile = real vaul bottom-sheet (drag handle, drag-down dismiss, scrolling grid)

- What: On phones (`isPhone`, ≤639.98px) the picker now renders as a real **vaul bottom-sheet** instead of the CSS-faked full-screen Modal. Desktop is byte-for-byte unchanged (still `<Modal size="full">`).
  - **New local `LibraryPickerSheet`** (vaul `Drawer.Root/Portal/Overlay/Content/Handle/Title`, single-detent — no snapPoints → opens full, drag-down dismisses). Surface mirrors `MobilePanelSheet` / the model-picker family (glass `color-mix(--color-bg-surface 92%)` + `--fx-glass-blur`, `--r-section` top corners, `--color-bg-modal-backdrop` scrim + `--blur-3`, safe-area padding). Drag-**handle** bar (neutral `--color-fg-subtle`) + a **title row** ("Library" + a real `<button>` ✕).
  - **Shared body** — toolbar/band/grid/footer + the react-dropzone root + drag overlay + srLive extracted into one `const body` fragment rendered by BOTH shells (zero duplicated logic; both controlled by the same `open` + `handleOpenChange`).
  - **Drag vs scroll vs tap**: `data-vaul-no-drag` on the grid (vertical swipes scroll the masonry), the toolbar controls, and the footer (tap "Use selection" fires onPick, not a drag). `overscroll-behavior: contain` on the grid. Drag-to-dismiss lives on the handle/title/toolbar area.
  - **Footer pinned** (last grid row of `__main`, which flexes inside the sheet); the **grid is the scroll region**.
  - **One-row mobile toolbar**: tabs + type (grows) + funnel on a single row, search full-width below. The body's redundant inline title + inline ✕ are CSS-hidden in the sheet (the sheet header owns both). `fullWidth` dropped from the TabSwitcher.
  - **Dropzone band −20%** on phone (`--_dropband-h: calc(--space-96 + --space-16)` ≈ 112px vs 144).
  - Retired the dead `@media(≤639.98)` Modal-sheet sizing rules.
- Why: design-lead asked for a proper bottom-sheet (fixed bottom, drag-down dismiss, middle scrolls, grab-handle on top) rather than a CSS-faked full-screen modal. Cross-checked multi-agent research: the project already ships `vaul` (via `MobilePanelSheet`) → no new dependency; a thin single-detent local sheet is the contained, desktop-untouched move. typecheck (brand + web) + biome pass. Runtime drag/scroll/footer-tap + file-drop-inside-vaul still need a live phone check.

## 2026-06-17 19:39 — modal radius 20px, thin band border, close-fix, mobile filter layout

- What:
  - **Modal card radius → 20px** (`--r-panel`), scoped to this picker (overrides the Modal base 16px). Phone sheet still resets to 0.
  - **Band border → 1px** (`--bw-default`, was 2px) — the 2px dashed read as heavy/cheap. Radius stays `--r-card` (12px).
  - **Close ✕ was disappearing at ≤1200px** — base `.klyp-LibraryPicker__inlineClose { display:none }` sat LATER in the file than the `@media(≤1200){ display:inline-flex }`, so equal-specificity source-order made `none` win everywhere → neither the floating ✕ (hidden ≤1200) nor the inline ✕ showed. Fixed by bumping the show-rule to a `(0,2,0)` child selector (`__toolbarControls > __inlineClose`) so it wins regardless of order.
  - **Mobile filter layout reworked.** The filter controls now sit ABOVE the search and span full width: the section `<TabSwitcher>` gets `fullWidth={isPhone}` (equal-width slots across the row) and goes full-width on top; the type `<BrandSelect>` grows + funnel + inline ✕ share the next row; the search drops full-width BELOW them (order/flex in the ≤639.98 block).
  - **Mobile band↔footer gap** matched to the grid↔band gap — dropped the footer's `margin-top`/`padding-top`/`border-top` on phones so both gaps are the grid's uniform 12px (was ~36px below the band vs 12px above).
- Why: design-lead polish pass. The disappeared close was a real source-order cascade bug. On phones, full-width stacked filters above the search read cleaner and are thumb-friendly; the asymmetric footer gap looked unbalanced under the bottom-pinned band. typecheck (brand + web) + biome pass.

## 2026-06-17 19:04 — band radius matches overlay + toolbar controls wrap (no clip)

- What: Two small SCSS tweaks.
  - **Band radius**: the resting upload band dropped from `--r-section` (16px, the card's own radius → too round for an inset element) to `--r-card` (12px), one step down the radius ramp — consistent with the grid tiles and the drag overlay.
  - **Toolbar controls no longer clip.** `.klyp-LibraryPicker__toolbarControls` switched from `flex-wrap: nowrap` to `flex-wrap: wrap`. It has no `overflow` of its own; the cut-off came from the picker root's `overflow: hidden` (kept for grid-scroll containment) clipping the nowrap row when the controls + inline ✕ couldn't fit at a tight width. Wrapping lets them drop to a second row instead of being cut; the flexible search keeps it a single line whenever everything fits.
- Why: 16px on an inset band read as too round; 12px matches the nested-radius relationship. The nowrap toolbar could clip its rightmost control (the inline ✕) at narrow widths — wrapping is the non-destructive fix (root overflow can't be removed without the toolbar spilling out of the modal). SCSS-only; typecheck/biome unaffected.

## 2026-06-17 18:59 — collapsed copy width fix + white drop-overlay border/radius

- What: Two small fixes.
  - **Collapsed band: icon no longer floats far from the text.** The copy was two stacked lines (full + compact) crossfaded in one grid cell, so the cell sized to the WIDER (full) line (~243px) and the visible compact text centred inside it — pushing the icon far left. Reverted to a SINGLE line whose text is swapped in JS by `bandCollapsed` (`__dropbandLine` markup + crossfade rules removed), so the box sizes to the actually-shown text and the icon sits right next to it. (The collapse already changes column→row layout, so the crossfade's smoothness gain was moot.)
  - **Big drag overlay: white border + concentric radius.** The full-cover drop overlay's border was gold (`--color-accent`) — read as cheap; switched to white (`--color-fg-primary`, theme-aware). Radius dropped from `--r-section` (16px, same as the card → too round for an inset element) to `--r-card` (12px), one step down the radius ramp in relation to the outer section (a strict concentric value is ≤0 since the 24px modal padding exceeds the card's 16px radius, so a soft 12px is the clean choice).
- Why: the grid-stacked two-line copy inherited the wider line's width; one JS-swapped line fixes the gap with less code. The gold overlay frame looked cheap; a white dashed frame at a properly-stepped radius reads premium. typecheck (brand + web) + biome pass (SCSS-only for the overlay).

## 2026-06-17 18:33 — inline close at narrow widths + collapsed icon moves left

- What: Two follow-ups from design-lead testing.
  - **Close ✕ no longer overlaps the filters at narrow widths.** Instead of inset-floating the ✕ over the toolbar (which crowded the filter funnel), it now ADAPTS: above 1200px the floating Dialog ✕ stays outside the panel (the look Val likes); at ≤1200px that floating ✕ is CSS-hidden and a new INLINE ✕ (`klyp-LibraryPicker__inlineClose`, `XOutline`, same rounded-square chrome) appears as the last control in the filter row — a real flex item, so it can never overlap. Dropped the old inset position + the toolbar `padding-right` reserve. New brand-aware `closeAria` copy (EN/RU).
  - **Collapsed band: icon moves to the LEFT of the text** (was a tiny icon stacked on top, which read as small/ugly). Expanded stays a column (big 40px icon above the copy); collapsed now switches to a row — icon `--space-24` (24px) to the left of the compact line, `--space-8` gap. (Mobile stays the always-expanded column bottom-bar.)
- Why: an absolutely-positioned inset ✕ kept reading as "floating on top of" the filters; making it an inline flex control on the filter row is bulletproof at every width. The collapsed icon-on-top at 18px looked cramped/ugly; moving it left at 24px reads as a proper compact strip. typecheck (brand + web) + biome pass.

## 2026-06-17 18:09 — band: icon-above-text column, tighter collapse, taller, mobile bottom-bar

- What: Layout refinement of the upload band (design-lead feedback).
  - **Expanded layout → vertical column**: the icon is now bigger (`--space-40`, 40px) and sits ABOVE the copy, centred (`flex-direction: column`), instead of beside it. Resting height bumped to `calc(--space-128 + --space-16)` (~144px) via a local `--_dropband-h` var.
  - **Collapse gap fix**: the icon was visually "too far" from the text when collapsed — the cause was a fixed 28px icon box scaled to 18px (≈10px phantom space) plus a 12px row gap. Reworked: the icon BOX itself shrinks 40→18px (`width`/`height` transition, the svg fills it → no phantom space) and the column `gap` tightens `--space-8`→`--space-2`. Both animate on the same `--duration-fast`/`--easing-standard` curve as the height, so the collapse stays smooth (no flex-direction flip — column at both states).
  - **Mobile (≤639.98px) → fixed bottom bar**: the band reorders to AFTER the grid (above the footer) via grid `order`, and never collapses — it stays at the expanded ~144px height (gated off in JS via the existing `isPhone` flag + a CSS safety override). So on phones it reads as a persistent full-width "drop or upload" bar pinned to the bottom of the sheet.
  - **a11y**: the band button's `aria-label` now uses `dropzoneTitle` (the resting visible copy) so the accessible name matches the visible text (WCAG 2.5.3 Label-in-Name), instead of the shorter `uploadCta`.
- Why: at 128px a centred icon-beside-text row read as a generic empty dropzone and left the collapsed icon floating far from the text; icon-above-text fills the taller band with intent and the box-resize + tight gap make the collapsed strip read as one compact unit. On phones a bottom-pinned, always-expanded bar is the easier, thumb-reachable upload target. typecheck (brand + web) + biome pass.

## 2026-06-17 17:59 — band-as-button + smooth collapse + duo-tone icon + close-fix + landing anim

- What: Second-pass polish on the top upload band (design lead + ui-ux-pro-max senior pass).
  - **Whole band = one `<button>`** (`LibraryPicker.tsx` + `.scss`): the separate "Upload an image" Button is gone — the entire band is now a single clickable button (`onClick={openFileDialog}`, `aria-label`), with a quiet hover **fill** (`--color-bg-surface-solid`, "one tone up" from the modal surface), the dashed border going solid on hover, a `translateY(1px)` press (DS convention, not scale), and a `--color-ring` focus-visible ring. Dropping anywhere still works (the band is a child of the react-dropzone `noClick` root; only the band's own click opens the dialog).
  - **Resting height doubled** to `--space-128` (128px); collapsed stays 40px. Scroll hysteresis bumped (collapse past 96px, expand under 8px) to suit the taller band.
  - **Smooth 150ms collapse** (was an abrupt jump): the icon now scales via `transform: scale(0.643)` (28→18 interpolated) inside a fixed 28px box instead of swapping pixel size; the copy crossfades between TWO pre-rendered lines stacked in one grid cell (`__dropbandCopy` / `__dropbandLine[data-line]`) instead of swapping a text node. Height + transform + opacity all run on one `--duration-fast`/`--easing-standard` curve → no reflow, no jerk.
  - **New duo-tone document-upload icon** at 50% opacity: design-lead-supplied glyph shipped as a local inline `UploadDocGlyph` (`currentColor`; no Iconsax outline equivalent + the bulk pack is deprecated — same precedent as `SwapGlyph`/`FrameRatioGlyph`). The 50% opacity is on the WRAPPER (`--opacity-50`), lifting to 0.7 on hover, per the icon-opacity rule.
  - **Close ✕ responsive fix**: the inset↔outside threshold moved 1080→**1200px** (so the outside ✕ keeps a comfortable ~60px margin, robust to zoom/scrollbar), the toolbar reserve bumped 32→**40px** (the real cause of the ✕ overlapping the filter cluster — the 40px ✕ at right:8px needs 48px cleared), and the top/right position swap is now animated so a resize glides.
  - **Attachment landing animation** (`video-reference-slots.scss`): picked/uploaded reference tiles enter with `scale(0.92)→1` + fade (`--duration-normal`) instead of popping; one keyframe, fires once on mount, reduced-motion gated.
  - **Drag overlay** fades in (`--duration-fast`) instead of hard-popping.
- Why: the separate Upload button read as a confusing second affordance; making the whole 128px band the button is one clear "drop or upload" target. The collapse jerk was an instant SVG-size + text-node swap fighting a CSS height animation — moving to transform-scale + opacity-crossfade puts everything on one GPU timeline. The ✕ overlap at narrow widths was a too-small toolbar reserve, not just a threshold issue. Upload-IN-PROGRESS feedback was scoped to the existing slot spinner (the modal closes on drop and `onUploadFiles` is fire-and-forget — true in-band progress needs a composer-pipeline change, tracked as follow-up). All tokens verified to exist; typecheck (brand + web) + biome pass.

## 2026-06-17 17:18 — top dropzone band + whole-modal drop + square close + SearchField + single-select

- What: Major layout rework of the picker.
  - **Dropzone moved from the right rail to a horizontal BAND under the toolbar** (`LibraryPicker.tsx` + `.scss`). The two-column grid is gone — the body is a single column (toolbar / band / scrollable grid / footer). The band is dashed, full-width.
  - **Sticky-collapse**: on grid scroll the band collapses to a 40px strip (`data-collapsed`, rAF scroll listener on `__grid`) so it stays visible — the icon shrinks 28→18px and the copy swaps to the compact line; expands back at the top. CSS `height`/`padding` transition.
  - **Whole-modal drop**: the picker root is now a `react-dropzone` root (`useDropzone`, `noClick`/`noKeyboard`) — dragging a file ANYWHERE over the modal paints a full-cover overlay (`__dropOverlay`, `pointer-events:none`, accent dashed; danger tint on `isDragReject`) and accepts the drop. The Upload button calls the dropzone `open()` (the only click that opens the OS dialog). Replaces the brand `<Dropzone>` wrapper (which doesn't expose `open()`).
  - **Square close button**: the floating ✕ override switched `border-radius: var(--radius-full)` → `var(--r-chip)` (rounded square).
  - **Search**: `ExpandingSearch` → `@klyp/ui` `SearchField` (size `lg`, `outline`, always-visible) as the flexible toolbar item (capped width on desktop, full row on phone).
  - **Single-select**: new `maxSelect` prop — `1` = clicking a card replaces the selection and the modal returns one pick (used by the composer Start/End video-frame slot pickers); upload runs single-file. Multi-select stays the default.
  - **Adaptive**: removed the obsolete right-rail / 2-col→1-col / dropzone-below-grid rules; kept the ≤1080 close inset, ≤720 fill-overlay, ≤639.98 full-screen sheet + toolbar wrap (now targeting `__search`), and the JS masonry 180→150 phone density.
  - New brand-aware copy `dropOverlayTitle` (EN/RU); `dropzoneTitleCompact` reworded for the collapsed band.
- Why: (1) the right rail wasted horizontal space and hid the grid; a top band keeps the grid wide and the upload affordance always visible (collapsing so it never eats scroll height). (2) Whole-modal drop matches the expectation that dragging anywhere = drop. (3) Square ✕, a real search field, and single-select were requested for the composer Start/End frame pickers, which now open this same modal (`features/chat/components/composer.tsx` + `video-reference-slots.tsx`: `onPickFromLibrary(mode)` — frames → single-select + image-only upload, reference → multi). Shared Modal/Dialog/MediaGrid untouched; `@klyp/ui` SearchField + react-dropzone are existing deps.

## 2026-06-05 — phone polish: toolbar wrap, footer fit, 2-col grid, compact dropzone

- What: Mobile (≤639.98px) refinements on top of the same-day full-screen-sheet fix.
  - **Toolbar** (`LibraryPicker.scss`): wraps to two rows — title keeps row 1 (clear of the absolute close ✕), the filter cluster (`__toolbarControls`) drops to its own full-width row, `justify-content: flex-start`, `flex-wrap: wrap`; the ExpandingSearch keeps grow but loses shrink on mobile (`flex: 1 0 auto`) so a slightly-too-wide row can't squeeze the closed square from 36 → ~29px. Fixes the desktop `flex-end` cluster overflowing LEFT — which had clipped the title + search off-screen and slid the funnel under the close button.
  - **Footer fit** (`LibraryPicker.scss`): root cause was `__main` having an implicit `auto` grid column sized to the widest child (the nowrap toolbar), which stretched the footer row off-screen → added `grid-template-columns: minmax(0, 1fr)`. Also made `__selectionLabel` `flex: 1 1 auto; min-width: 0` + ellipsis and pinned the confirm button `flex-shrink: 0`.
  - **Grid density** (`LibraryPicker.tsx`): masonry `minItemWidth` is now responsive — `150` on phones (via a `matchMedia('(max-width: 639.98px)')` hook), `180` otherwise — so two columns still fit at ~380px (180 forced a single column).
  - **Dropzone** (`LibraryPicker.tsx` + `.scss`): on phones the right-rail Dropzone now renders a compact variant — no Upload button and no icon, copy "Click to upload an image" / "PNG, JPG, WEBP up to 10 MB" (brand-aware) — since the whole zone is the tap target. Desktop/tablet keep the full button-led variant. Toggled via CSS at the same 639.98px breakpoint.
- Why: On phones the full-screen picker's header was unusable (title/search clipped, close ✕ overlapping the filter funnel), the footer's right button was pushed off-screen, the grid collapsed to one column, and the dropzone's button was redundant when the whole surface is tappable. Shared components (Dropzone, MediaGrid, Modal, Dialog) untouched — all changes live in LibraryPicker; no imports/API changed. Verified at 380px: title + close clear, controls wrap cleanly, footer button fits, 2 grid columns, compact dropzone.

## 2026-06-05 — fix phone top+right gap (full-screen sheet)

- What: Reworked the responsive modal sizing in `LibraryPicker.scss`. The `≤720px` rule no longer hardcodes `max-width: calc(100vw − 32px)` / `height: calc(100svh − 32px)` — it now fills the overlay (`max-width/width: 100%`, `height: min(720px, 100%)`) so margins come from the Dialog overlay's own padding. Added a `≤639.98px` rule (matching the base Dialog's bottom-sheet breakpoint) that makes the picker a true full-screen sheet: `align-self: stretch` + `height: auto` + `max-height: none` (lifts Modal.scss's base `max-height: calc(100svh − 4rem)` cap) + `border-radius: 0`.
- Why: On phones the base Dialog (`@klyp/ui`) switches the overlay to an edge-to-edge bottom sheet (`padding:0; align-items:flex-end`), but LibraryPicker's `calc(100vw−32px)` re-imposed a 32px-narrower, shorter panel over it. Since the overlay no longer centred, the leftover size pooled into a gap on the TOP and RIGHT. The base `max-height: calc(100svh − 4rem)` cap further shrank it. New approach fills the overlay exactly → no gaps. Verified across desktop (centred 1080×720, unchanged), 640–720 (centred card, symmetric 16px margins), and phone 375px (full-screen, 0 gap all sides). Base Dialog/Modal untouched; SCSS-only.

## 2026-05-30 01:03 — sparkles "Generated" icon + leftward-fill search toolbar

- What: (a) the "Generated" section icon swapped crown → `SparklesOutline`
  (crown was removed from the icon set); (b) reworked `__toolbarControls` so
  the search opens LEFTWARD and fills the available width WITHOUT wrapping —
  `flex-wrap: nowrap; justify-content: flex-end`, search `flex: 1 1 auto;
  min-width: 0`, fixed siblings (section TabSwitcher / Type BrandSelect /
  AdvancedFilterPopover trigger) `flex: 0 0 auto`. Removed the earlier
  `:has()` + capsule `width: 100%` overrides (dead after ExpandingSearch
  moved `data-open` to its root and took ownership of square↔fill).
- Why: owner 2026-05-30 — opening the search pushed the controls onto a
  second row; it must expand into the free space, never wrap or squish the
  filter button.

## 2026-05-29 22:52 — library-parity filter toolbar

- What: Replaced the single "All" `<BrandSelect>` filter with the full
  `/library` shell toolbar — iconOnly section `<TabSwitcher>` (All /
  Generated / Uploaded / Favourites), a Type `<BrandSelect>` (All types /
  Image / Video / Audio), and an `<AdvancedFilterPopover>` holding Source
  (Anywhere / Series / Chat / Canvas). Search unchanged. New controlled/
  uncontrolled props `mediaType` + `source` alongside the existing `filter`
  (now typed `LibraryPickerSection`, adds `'uploaded'`); removed the
  `filterOptions` override. Convex wrapper (`library-picker-modal.tsx`)
  wires all three axes into `listForMediaLibrary` (Type defaults to `image`
  for the chat-composer reference flow).
- Why: Val — picker filters должны быть такими же, как на странице
  `/library`, а не одиноким дропдауном «All».

## 2026-06-25 10:24 — filter rows → menu-row style

- What: the Type/Source filter checkboxes switched from `data-variant="card"` to the new `data-variant="menu-row"` (leading glyphs bumped 16→20px); removed the picker-local icon-layout SCSS (the leading-glyph + label layout now lives in the DS `menu-row` variant in CheckboxGroup.scss).
- Why: menu-unification — the filter popover reads as a DropdownMenu-style menu; composition-only here (the variant + layout are DS).

## 2026-06-26 09:50 — filter icon + responsive Type/Source multiselects

- What: the filter trigger now uses `FilterOutline` (was the cog default). The toolbar is responsive: on desktop it shows TWO labelled multiselect pills (Type, Source — each opens its own menu-row checkbox list); on mobile it keeps ONE filter-icon button collapsing both axes (as before). The two checkbox groups are defined once and shared between layouts so they can't drift.
- Why: design lead — on desktop the two axes read clearer as separate labelled selects; mobile stays compact with the single button.

## 2026-06-26 14:32 — header/footer bands + fixed-width selects + 24 padding

- What: Type/Source axis selects now have a FIXED width (`calc(--space-128 + --space-12)` = 140px, both equal) so they never reflow when the value changes. The desktop header toolbar cluster (sections + selects + search) packs to the RIGHT next to the search (title owns the left). The footer is now its OWN band (sibling of `__main`, like the header) instead of living inside the scrolling body. Padding scheme reworked to a 24px perimeter: header `24/24/12`, `__main` `12` top-bottom + `24` sides, footer `12/24/24`, and the empty-state `__main:last-child` gets `24` bottom — so every element has 24px breathing room, with 24px gaps between bands (12+12).
- Why: design lead — selects must not jump on selection; controls belong next to search; bands should be distinct like the header; consistent 24px rhythm around everything.

## 2026-06-26 15:19 — mobile flat single-select menu + root padding fix

- What: on mobile the one filter button now opens a single flat menu — `Type` / `Source` headings with their options (All types/Image/Video/Audio · Any source/Series/Chat/Canvas) directly under each as single-select `RadioGroup` menu-rows (no nested BrandSelect dropdowns). Desktop keeps the two inline BrandSelect pills. Also zeroed the inherited Dialog body padding on the `.klyp-LibraryPicker` root (the Dialog primitive auto-pads non-header/footer children) so the header/main/footer bands alone give the 24px perimeter.
- Why: design lead — mobile filter should be one flat menu, not nested selects; and the doubled root padding pushed content off the 24px grid.
