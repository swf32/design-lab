# SortableTableHeader — changelog

## 2026-06-26 09:13 — playground-controls

- What: added meta args + argTypes (direction/align/priority inline-radio, children text); bare header renders standalone, no structural wrapper needed.
- Why: playground-controls convention (.claude/rules/components.md).

## 2026-06-25 12:41 — cross-ds audit follow-ups

- What: (1) JSDoc rewritten — it falsely claimed the component writes `aria-sort` on the button; clarified the consumer must set `aria-sort` on the wrapping `<th>` (button only drives `data-direction`). (2) SCSS comment fixed `0.35` → `0.5` to match the actual inactive-arrow opacity (drifted since the 2026-06-03 contrast bump). (3) `Priority` story rebuilt as a slider-driven resizable container (same pattern as DataTable's `AdaptivePriority`) that actually hides columns at the real breakpoints (priority=3 < 600px, priority=2 < 480px); headers ordered 3/1/2 so the drop reads as priority-based, not just the trailing column vanishing. (4) Added `Adaptive` story — slider 280→1200 (matches Input's `Adaptive`), confirms the header stays readable across widths.
- Why: cross-DS audit found code-vs-doc contradictions (aria-sort, opacity comment) and that the marquee `priority` feature had no story proving it works; brings the component to the adaptive-first story bar.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: SortableTableHeader.scss — (1.2) `&__indicator` color changed from hard-coded `--color-fg-subtle` to `inherit`, so the arrows brighten in sync with the text on hover/focus; (1.2) base opacity of inactive arrows raised 0.35 → 0.5 for contrast on the dark theme; (2.1) `text-align: left` → `start` (base) and `text-align: right` → `end` (`[data-align='end']`) for correct RTL layout.
- Why: the indicator arrows did not react to hover and were nearly invisible on the dark theme; physical left/right broke alignment in RTL.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/ui`.
- Why: Generic sortable `<th>` button with asc/desc/none indicator + aria-sort + adaptive priority. Lifted from /referrals activity-ledger inline SortHeader as part of the catalog promotion wave 2026-05-17.
