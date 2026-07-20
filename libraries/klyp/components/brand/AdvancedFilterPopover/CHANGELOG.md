# AdvancedFilterPopover — changelog

## 2026-06-29 04:23 — migrate-rows-to-dropdown-pill

- What: Migrated the filter rows off BrandSelect onto the unified Dropdown pill — rowSlot now stretches `.klyp-Dropdown-pill` to full width (instead of the old .klyp-BrandSelect/__trigger) and the dialog dropped its redundant --space-4 padding since the wrapping .klyp-Popover already supplies the 4px gutter; JSDoc examples updated.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-27 18:20 — drop doubled dialog padding

- Files: `AdvancedFilterPopover.scss`
- What: removed the `--space-4` padding from `__dialog`. The wrapping
  `.klyp-Popover` already supplies a 4px edge gutter, so the two stacked into
  an 8px inset — now a single 4px.
- Why: design lead — the inner section had its own 4px on top of the popover's
  4px (doubled padding around the filter lists).

## 2026-06-25 08:14 — indicator prop: count | dot

- Files: `AdvancedFilterPopover.tsx`, `AdvancedFilterPopover.scss`
- What: new prop `indicator?: 'count' | 'dot'` (default `'count'`). In `'dot'`
  mode an active filter state is shown as a decorative `<StatusDot tone="accent"
  size="sm">` at the trigger's top-right corner (no number) instead of the
  numeric `<Badge>`; `'count'` is unchanged. New `__indicator` positioning class.
- Why: LibraryPicker collapses its two filter axes into one popover button and
  wants a "has active filters" dot, not an axis count.

## 2026-06-24 14:57 — active-count badge → DS Badge

- Files: `AdvancedFilterPopover.tsx`, `AdvancedFilterPopover.scss`
- What: the bespoke `__badge` count pill is replaced by the shared DS
  `<Badge intent="gray" variant="subtle" size="sm">` (number only, no icon). The
  `__badge` class now only positions it at the corner; chrome comes from klyp-Badge.
- Why: design-lead — use the DS badge everywhere.
- Verified live (`/components/advanced-filter-popover`): klyp-Badge gray/subtle/sm "2".

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: square ghost icon-button trigger 36×36 → 40×40.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). This component hardcoded the old 36px lg control height; bumped to 40px so it matches sibling controls.

## 2026-06-05 — badge digit optical centering

- What: Added `padding-bottom: 1px` to `&__badge` in `AdvancedFilterPopover.scss`.
- Why: The active-count digit read slightly low inside the 16px badge — more space above than below. Cause: digits have no descender, so the font's ~2px descent slack sits empty below the baseline and the flex-centred glyph lands ~1px low. The 1px bottom pad shifts the centred glyph up by half that, balancing the gaps. Measured glyph-ink gaps went from 4.56 (top) / 3.5 (bottom) to 4.06 / 4.0. Stays 16px tall (border-box). SCSS-only; marked `magic-ok` as a sub-token glyph-metric correction.

## 2026-05-30 01:03 — fixed-width trigger (no shrink under expanding search)

- What: the trigger is now `flex: 0 0 auto` so it never shrinks when a sibling
  grows in the same flex toolbar — the Library expanding-search was squishing
  it below its 36px square. (Scope note: the active-count `aria-label`
  enhancement was already in a prior committed change, not this entry.)
- Why: owner 2026-05-30 — opening the search narrowed the filter button.

## 2026-05-26 15:05 — popover-hugs-content-fix

- What: (a) bumped specificity of `__popover` override to compound `&.klyp-Popover` (2 classes) — previous single-class override was beaten by Popover.scss source order at equal specificity, so the 256px floor never actually lifted; (b) stretched `__rowSlot > .klyp-BrandSelect` and its trigger to `width: 100%` so each chip fills the row instead of sitting content-sized with empty slack on the right.
- Why: первый фикс не дал визуального эффекта — the design lead проверил и попап всё ещё 256px + триггеры не заполняли ряд; теперь popover хагает контент и все BrandSelect-чипы выравниваются по правой кромке.

## 2026-05-26 14:57 — popover-hugs-content

- What: popover overrides Popover's `min-width: var(--menu-min-width)` (256px) with `min-width: 0`, paired with existing `width: max-content` — now hugs the widest row instead of holding a 256px baseline.
- Why: the design lead flagged лишнее пустое место справа от контролов в filter popover; share/action menus still need the 256px floor, only this surface opts out.

## 2026-06-25 10:24 — popover reads as a menu surface

- What: the dialog now uses a small `--space-4` pad zone + gap (was `--space-12`), `__rowLabel` matches the DropdownMenu `__label` (12/medium/`--color-fg-muted` with the menu inline padding, was 13/medium/`--color-fg-primary`), and `menu-row` CheckboxGroup lists stretch full-width and sit flush (`gap: 0`) so each row's own padding + hover-fill provides the menu rhythm.
- Why: menu-unification — the Type/Source filter popover should look like a DropdownMenu, not a boxed form panel.

## 2026-06-25 13:37 — dot-only active state + unified-menu content

- What: removed the numeric count badge (and the `indicator` prop + the `Badge` dependency) — the trigger now shows a single accent dot when any filter is active, and nothing at all when none. Rewrote the catalog story so the popover content is ONE menu (Type / Source section labels over `menu-row` checkbox options) instead of two nested BrandSelects.
- Why: design lead — the exact count is noise on the trigger (a "has filters" cue is enough), and the popover should read as one DS menu rather than stacked selects.

## 2026-06-26 09:50 — labelled select-pill trigger (triggerLabel)

- What: added an optional `triggerLabel` prop — when set, the trigger renders as a select-style pill (static label text + a chevron that rotates on open) instead of the icon-only filter button; the active dot still shows when `activeCount > 0`. Because the label is static the pill width never jumps.
- Why: the LibraryPicker desktop layout needs two labelled multiselect dropdowns (Type / Source); the icon button stays for the mobile collapsed filter.

## 2026-06-26 15:19 — RadioGroup menu-row slot support

- What: `__rowSlot` now stretches + flushes (`gap: 0`) single-select `RadioGroup` menu-row lists too (alongside CheckboxGroup), so a Row can hold a flat radio menu, not just a nested control.
- Why: the mobile LibraryPicker filter renders Type/Source as flat radio menus inside the popover rows.
