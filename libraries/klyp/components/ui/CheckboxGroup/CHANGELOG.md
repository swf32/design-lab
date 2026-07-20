# CheckboxGroup — changelog

## 2026-06-29 04:23 — menu-row-hover-glyph-radius

- What: Menu-row variant tweaks: card hover background moved from `--color-bg-surface-hover` to `--color-bg-surface-elevated`; the checkbox box now uses a tighter 4px corner (`--radius-4`); and on row hover the leading glyph brightens from muted to `--color-fg-primary`.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-27 20:02 — menu-row: box 4px corners + glyph hover-brighten

- Files: `CheckboxGroup.scss`
- What: (1) the checkbox BOX inside a menu-row gets 4px corners (`--radius-4`);
  the ROW keeps the 8px `--r-inner-section`. (2) Leading glyph brightens muted →
  `--color-fg-primary` on row hover (was a static `--color-fg-muted`).
- Why: design lead — tighter 4px corners on the box itself; the row radius
  stays 8px. The glyph needed a hover cue (rest = muted, hover = full white).

## 2026-06-25 10:24 — menu-row variant (DropdownMenu item recipe)

- What: added `data-variant="menu-row"` for Checkbox group children — a compact 36px row matching the DropdownMenu `__item` recipe (checkbox molecule on the left · 20px leading glyph · 14/medium label · `--space-8`/`--space-12` padding · concentric `--r-inner-section` radius · `--color-bg-surface-solid` hover-fill · no card border). The leading glyph + label arrive as children. Added a `MenuRow` story.
- Why: menu-unification pass — multi-select filter lists (AdvancedFilterPopover / LibraryPicker) should read as one DropdownMenu-style menu surface instead of the boxed `card` look.
