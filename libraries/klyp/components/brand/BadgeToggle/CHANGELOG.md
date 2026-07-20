# BadgeToggle — changelog

## 2026-06-29 07:30 — gold selected bg → --color-badge-gold-bg (was iris)

- Files: `BadgeToggle.scss`
- What: `&__item[data-selected][data-intent='gold']` bg `var(--color-overlay-gold-15)` → `var(--color-badge-gold-bg)`.
- Why: same as Badge — `overlay.gold-15` went iris on the 2026-06-29 brand-accent swap; the gold-intent selected toggle now reads the dedicated gold token so it stays gold.

## 2026-05-28 01:45 — ghost-style idle, dot always intent-colored

- What: Idle items lost their visible border (now `border-color: transparent`)
  and lost their per-intent text colour — label sits at `--color-fg-muted` on
  idle so it reads as a "quiet pill". The leading dot is now driven by a
  per-item `--intent-dot` custom property and ALWAYS renders in its intent
  colour, regardless of selected state. Selected items keep the subtle
  intent wash + brighter label.
- Why: First pass made idle items look filled (border + dot tied to label
  color), which read as "lots of equally-weighted chrome" in a narrow rail.
  Ghost-style idle + always-coloured dot keeps the category signal but lets
  the selected pill stand out as the single active state.

## 2026-05-28 00:55 — initial

- What: New brand atom — toggleable filter row with per-item intent colour.
  Visual borrowed from `<Badge>` (subtle bg + token-driven fg per intent +
  Geist sizing), behaviour layer is RAC `ToggleButtonGroup` (single-select,
  roving tabindex, arrow-key nav). Each item carries a leading colored dot.
- Why: Studio right-rail Library kind filter (Char / Loc / Out / Vibe / Scr)
  needed a toggle that respects per-kind semantic colour. `<ChipToggle>`
  paints a single gold gradient on selected — wrong for this surface.
  `<Badge>` alone is static (no onClick). New atom unifies both: Badge
  styling + RAC selection semantics.
- Driven by: Option 04 of the 2026-05-27 4-agent design review of the
  editor right rail. Replaces the bespoke `FilterChipRow` self-rolled
  buttons inside `LibraryCardGrid`.
