# MetaLabel — changelog

## 2026-06-29 04:23 — accent-tone-uses-purple-token

- What: Switched the [data-tone='accent'] color in MetaLabel.scss from the gold --color-fg-accent to the brand-aware --color-fg-accent-purple (klyp purple.900 on dark, unreals purple.400 on light).
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 — accent tone: purple, not gold

- What: `tone='accent'` now uses the new brand-aware `--color-fg-accent-purple` (klyp purple.900 #e0c6ff on dark; unreals purple.400 #7442a1 on light) instead of the gold `--color-fg-accent`.
- Why: the design lead wants MetaLabel's accent purple, not gold. Both theme values pass WCAG (light lavender on dark; 5.94:1 dark purple on light).
