# DevStatePreview — changelog

## 2026-06-28 — translucent glass panel background

- What: Panel background is now a ~30% translucent surface
  (`color-mix(... var(--color-bg-elevated) 30%, transparent)`) with a
  `--fx-glass-blur-md` backdrop blur, so the page reads through it while the
  controls stay legible.
- Why: Val wanted the panel to sit over content less heavily ("фон 30%").

## 2026-06-27 18:23 — compact, fit-on-screen, no-scroll panel

- What: Tightened the panel so a long option list fits one screen without
  scrolling — smaller type (label 12 / desc 11), regular weight, tight rows
  (no 36px min-height) and gaps, narrower width (~224px), and near-full
  viewport height (`100dvh − margins`). Option descriptions now render on a
  single ellipsised line with the full text on hover (`title`).
- Why: On `/billing` the ~17-item list (tiers + billing lifecycle) scrolled
  and felt bulky; multi-line descriptions made each row tall. Val wanted it
  to fit one screen and be switchable without scrolling.

## 2026-06-27 18:14 — dropdown-menu → stay-open floating panel

- What: Replaced the `DropdownMenu` internals with a controlled, non-modal
  floating panel built from real form controls (`RadioGroup` / `Radio`
  `menu-row` + `Checkbox`). Picking an option no longer closes it — it
  closes only via the Dev button, the ✕, or Escape. Width is capped (~256px)
  with wrapping descriptions instead of stretching to the longest label. The
  page underneath stays interactive and re-renders live while it's open.
  Public props API unchanged.
- Why: A RAC menu closed on every selection, so switching a tier dismissed
  the menu and you couldn't see the page react or flip states in a row; the
  long billing-lifecycle descriptions also forced a giant single-line width.
