# DropdownMenu — changelog

## 2026-07-02 19:04 — content: ref + aside companion slot

- What: `DropdownMenuContent` now forwards a `ref` to the RAC Popover root and takes an opt-in `aside` node, rendered inside the popover as a sibling AFTER the menu (`data-has-aside` on the root). Zero effect when omitted.
- Why: the brand Dropdown's `renderDetail` side-card must live INSIDE the popover — RAC's modal popover makes everything outside `inert` (`ariaHideOutside({shouldUseInert:true})` in usePopover), so a body-portaled card is click-dead and stacks under sibling overlays (live repro, Val 2026-07-03).

## 2026-06-30 04:43 — neutral + square toggles + promote beta → stable

- What: (1) De-golded the checkbox/radio selection indicators — checked state was
  filled with `--color-accent` (currently gold), swapped to neutral
  `--color-fg-primary` (white box + dark check / white radio dot), matching the
  `@klyp/brand/Dropdown` look. (1b) Re-shaped the CHECKBOX indicator from the
  12px `--radius-sm` box (read as a radio-like circle) to an 18px IN-FLOW square
  (`--space-18`, `--radius-4`, 14px check) — same recipe as Dropdown's MultiSelect,
  so a checkbox now clearly reads as a square. Radio stays the compact 12px circle.
  (2) Tokenised the indicator hairline `border: 1px` → `var(--bw-default)` (the
  miss design-quality.md names). (3) Promoted `/components/dropdown-menu` `beta` →
  `stable` in the registry. (4) Dropped `defaultOpen` from the `Variants` /
  `Submenu` stories — the catalog page was rendering every menu auto-expanded
  (overlapping popovers); they now open on click.
- Why: Val — the accent-filled toggles read as "ugly yellow"; selection
  indicators should be neutral per the accent rule (styles.md: reserve accent for
  CTAs, not selection washes). The primitive had drifted onto accent while Dropdown
  was already neutral — aligned the primitive down. Blast radius: the only direct
  consumers of `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem` are this
  primitive's own stories (verified by grep); every production selection menu goes
  through `Dropdown`, which already overrode to neutral — so no production regression.

## 2026-06-29 04:23 — outline-icons-checkbox-sub-chevron

- What: Swapped bulk glyphs for outline icons — checkbox-item indicator CheckBulk → TickOutline and sub-trigger ChevronRightBulk → ChevronDownOutline rotated -90deg via CSS for the submenu affordance — and added stories.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-23 11:50 — surface + item recipe → shared menu-surface look

- What: surface aligned to the PopoverSurface contract — border `--color-border-default` (10%) → `--color-border-subtle` (5%), radius `--radius-md` (10) → `--r-card` (12), shadow `--shadow-soft` → `--shadow-panel`, pad zone `--space-2` → `--space-4`. Item recipe unified with ActionMenu (the reference row): icon `--icon-size-sm` (16) → `--icon-size-md` (20), padding `4/6` → `--space-8 / --space-12`, radius `--radius-sm` (6) → `--r-inner-section` (8, concentric with 12 − 4), gap `--space-4` → `--space-8` (icon→text), and a `min-height: --space-36` (36px row); the check/radio indicator (`left`), checkbox/radio reserve, inset paddings, and section label were re-based to the new 12px inline padding so nothing misaligns. Rows with content taller than 36 (none today) would grow.
- Why: design-lead — DropdownMenu / ActionMenu / Popover should read as one dropdown-menu surface with one item rhythm; names + function stay distinct (this primitive keeps menu/checkbox/radio/shortcut/submenu semantics). Verified in catalog: surface 12/4/5%/panel, item 8-12 pad · r8 · 10 gap · 14 label.
- Blast radius: this is the shared `@klyp/ui` primitive, so all its consumers (asset-editor, MediaCardActions, DevStatePreview, prompt-input, asset-compose) inherit the more comfortable menu rhythm + 20px icons — intended systematization, flagged for review.

## 2026-06-25 09:49 — visible menu indicators (bulk → outline)

- What: the checkbox-item check and the submenu chevron were null bulk glyphs (`CheckBulk` / `ChevronRightBulk` are deprecated no-ops) so they never painted; swapped to Iconsax outline — `TickOutline` for the checkbox tick, `ChevronDownOutline` rotated -90° (`__sub-chevron`) for the submenu affordance (›). The radio dot is unchanged (painted via box-shadow, `CircleBulk` left in place). Added `Variants` (checkbox tick + radio dot) and `Submenu` (chevron) stories so the indicators are documented + visible in the catalog.
- Why: the indicators were invisible — checked checkbox items and submenu rows gave no visual signal; first step of the menu-unification pass (one DropdownMenu look across the DS).
