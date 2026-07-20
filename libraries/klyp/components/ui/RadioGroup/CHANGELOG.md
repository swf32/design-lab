# RadioGroup — changelog

## 2026-06-29 04:23 — hover-bg-uses-elevated-token

- What: Changed the radio hover background in RadioGroup.scss from --color-bg-surface-hover to --color-bg-surface-elevated for the [data-hovered]:not([data-disabled]):not([data-selected]) state.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-26 15:19 — menu-row variant

- What: added `data-variant="menu-row"` — a compact DropdownMenu-style row (radio molecule + 14/medium label, 36px min-height, 8/12 padding, concentric `--r-inner-section`, surface-solid hover-fill, no card border). Mirrors the CheckboxGroup `menu-row` variant; the indicator is the radio `::before` circle with the inset-ring centre dot on select.
- Why: single-select filter menus (the mobile LibraryPicker Type/Source sections) need flat radio rows under section headings — no nested dropdowns.

## 2026-06-26 10:57 — card-stories-to-one-composition

- What: dropped the two raw-children card stories (`GridLayout`, `RowsLayout`); added one `Composition — card` story — vertical-stack body (title over description, left-aligned) with a top-right radio indicator, labelled as composition (not RadioGroup API).
- Why: old card stories showed no selection indicator and read as the component's own prop; in prod the card body is `SelectableCard` (@klyp/brand, tier above) — can't import into a ui story, so the indicator is inlined here to show the shape honestly.

## 2026-06-26 10:49 — bigger-selected-dot

- What: selected `default`-variant radio dot grew from 4px → 8px (inset ring `--space-6` → `--space-4` on the 16px circle, now 50% fill).
- Why: the old dot read as cramped/undersized; 50% is the standard radio proportion.
