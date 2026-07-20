# Tooltip — changelog

## 2026-06-26 09:13 — playground-controls

- What: added meta args + argTypes (defaultOpen/isOpen booleans, delay/closeDelay range); trigger+content children supplied as default ReactNode args, defaultOpen:true so it renders open in the static catalog (compound component).
- Why: playground-controls convention (.claude/rules/components.md).

## 2026-06-25 11:53 — padding rebalance + softer radius

- What: padding set to `--space-8` vertical / `--space-12` horizontal (was uneven 6/12, briefly 8/8) and radius bumped from `--radius-sm` (6) to `--r-chip` (10).
- Why: the design lead — the old 6/12 split read lopsided and pure 8/8 felt tight on the sides; 8/12 gives a touch more side breathing room. Chip radius makes it a crisp rounded chip.

## 2026-06-15 14:49 — WCAG tone contrast fix + reduced-motion + icon slot (audit)

- What: recoloured the four status tones (danger / warning / success / info). They previously set the saturated `--color-status-*` token (`-900`, a fg/icon colour) as the body background with `--color-fg-primary` (white@90%) text — failing WCAG AA text contrast at ~1.9–2.3:1. They now use the paired `--color-badge-<hue>-{bg,fg}` tokens (the same brand-aware, contrast-verified recipe `Badge[variant="subtle"]` uses), so the tinted fill + saturated same-hue text passes in both klyp-dark and unreals-light. Added a `prefers-reduced-motion` gate (instant show/hide). Added an optional caller-provided `icon` slot so a tone is signalled by more than colour alone (WCAG 1.4.1). Removed the dead `data-no-arrow` attribute (no SCSS consumed it).
- Why: senior DS audit — the only P0 in the four-component batch was Tooltip's status tones failing text contrast; the tinted-pair recipe fixes the a11y issue AND unifies every status surface on one token contract. `isDisabled` already works (inherited from `RACTooltipTriggerProps`), so no change was needed there.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: `Tooltip.scss` — for each tone (`[data-tone='danger'|'warning'|
  'success'|'info']`) added `border-color: transparent` on the body and
  `stroke: transparent` on `.klyp-Tooltip__arrow-stroke`. The default tone,
  geometry, props and public API are untouched.
- Why: the body border and arrow stroke stayed `--color-border-subtle`
  (5% white) on all tones — against a saturated background (danger/warning/
  success/info) the pale-white frame looked inconsistent and disappeared. Now
  the fill edge defines the shape cleanly, without a "ghost" frame (item 2.2).

## 2026-05-23 22:32 — tighter radius (10px → 6px)

- What: `border-radius` on `.klyp-Tooltip` body changed from
  `--radius-md` (10px) to `--radius-sm` (6px). Pill variant
  (`[data-shape='pill']`) still uses `--radius-full`.
- Why: 10px reads too soft for tooltip-sized surfaces — watermelon /
  Radix tooltips use 6px (Tailwind `rounded-md` = 0.375rem) and the
  visual proportion looks better against compact arrow + 12px text.
  `styles.md` explicitly allows `--radius-sm` as a primitive exception
  for small indicators.

## 2026-05-23 22:14 — restore 5% border + ≥2px trigger clearance

- What: body border returns at `--color-border-subtle` (5% white).
  Arrow svg is now two shapes — `<polygon>` for fill + `<polyline>`
  tracing only the left+right slanted sides (skipping the top edge)
  so the body border doesn't seam over the arrow tip. Default
  `sideOffset` raised from 4 → 8: arrow tip extends ~5px beyond the
  body, so 8px gap leaves ~3px clearance between tip and trigger.
- Why: the design lead wanted a soft 5% outline back AND a small gap so the
  tooltip never visually touches the element it labels.

## 2026-05-23 22:05 — remove body border + arrow stroke (seam fix)

- What: drop the 1px `--color-border-default` stroke on `.klyp-Tooltip`
  body and the matching `stroke` on the arrow svg. Tone variants also
  lose their border (each tone now uses fill-only on body + arrow).
  Elevation comes from `--shadow-soft` alone.
- Why: with a 1px body border, the arrow (a separate node positioned
  outside the body) cannot perfectly cover the body's stroked edge —
  a visible line shows above the triangle. Watermelon / Radix solve
  this the same way: no body border, solid fill arrow. Reported by
  the design lead with screenshot.

## 2026-05-23 21:54 — variant ramp (tone / shape / arrow / maxWidth)

- What: `TooltipContent` gains four optional props — `tone`
  (`default` | `danger` | `warning` | `success` | `info`),
  `shape` (`default` | `pill`), `arrow` (boolean, default `true`),
  `maxWidth` (px override, default 280). SCSS adds the corresponding
  `[data-tone='*']` and `[data-shape='pill']` selectors using DTCG
  status tokens. Stories rewritten — 10 demos cover every
  watermelon.sh Tooltip 1-10 pattern (default, no-arrow, pill, with
  badge, with avatar, info card, danger warning, tip, four sides,
  tones grid).
- Why: bring our single canonical RAC Tooltip up to the variant
  surface area of competitor showcases (watermelon.sh) without
  spawning per-variant components — one primitive, many compositions
  via tokens + content. Also lets `CopyButton` and `IconActionButton`
  drop their direct `react-aria-components` Tooltip imports and route
  through the brand-styled wrapper (previously they rendered
  unstyled RAC tooltips).
