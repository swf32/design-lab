# MentionPicker — changelog

## 2026-06-23 13:57 — row hover → solid surface (unify menu hovers)

- Files: `MentionPicker.scss`
- What: suggestion-row `&:hover` background `color-mix(… 60%, transparent)` →
  `--color-bg-surface-solid` (#222), matching the `[data-active]` row.
- Why: design-lead — one hover colour across all menu surfaces; MentionPicker
  was using a translucent color-mix instead of the solid surface step.

## 2026-06-23 12:05 — rows → shared menu-row recipe (dot/thumb kept)

- What: suggestion rows (`__item`) aligned to the shared menu-row recipe (ActionMenu / DropdownMenu / Select / Command / BrandSelect): `min-height: --space-36` (36px floor), 8/12 padding (was 4), 8px gap (was 6), radius `--radius-sm` (6) → `--r-inner-section` (8); `__name` `13px`/`--font-size-13` → `--font-size-14`; group header re-based to 12px inline. The leading color dot (6px) and the 36px thumbnail keep their own size — mention identity — so thumbnail rows grow taller than 36 (≈53px), like avatar/hint rows. Expected.
- Why: design-lead — a dropdown picker too; one row rhythm across all menu surfaces. Inter-row gap untouched. Group header: `--color-fg-subtle` → `--color-fg-muted` + `font: --type-label` to match the shared section-header. Surface: was glass (`color-mix(--color-bg-surface 92%, transparent)` + `backdrop-filter: blur(16px)`) → solid `--color-bg-surface` — the only glass menu; now all six menu surfaces share one opaque #141414 background.

## 2026-06-17 23:45 — fix-stories-add-item-focus-ring

- What: Rewrote the stories to use the real props (`query`/`onQueryChange`/`onPick`, was a non-existent `onSelect`) and expanded to 3 CSF3 stories (Default, Sides, States incl. empty + disabled browse-all), and added a `:focus-visible` ring to the list `__item` button.
- Why: Stories-readiness review — the single story rendered broken props and there were fewer than 3, and Tab-focusable rows had no visible focus indicator (a11y gap).
