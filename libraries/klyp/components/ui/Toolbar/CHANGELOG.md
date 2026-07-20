# Toolbar — changelog

## 2026-06-30 07:17 — stories: token-driven layout helper

- What: `Toolbar.stories.tsx` — replaced the inline-style literal scaffolding (the
  `cap` const, raw `gap`/`width`/`border` literals, the dashed adaptive frame) with
  the new `__shared/story-layout` helpers (StoryRow/Cell/Stack/Frame). No component
  or behaviour change.
- Why: kill inline-style literals in showcases (styles.md token rule) as part of the
  catalog-hygiene pass.

## 2026-06-30 06:09 — promote beta → stable

- What: `status` flipped `beta` → `stable` in `components-registry.ts`. As a
  layout/roving-focus container the primitive has no intrinsic visual states
  (hover/pressed/disabled live on the child `ToolButton`); the applicable axes —
  orientation (h/v), grouping, roving-focus, adaptive — are all covered in
  stories, and the 3-agent audit came back all-pass.
- Why: Val sign-off ("в стейбл их давай").

## 2026-06-30 05:48 — stories-playground + vertical-orientation

- Files: `Toolbar.stories.tsx`, `Toolbar.scss`.
- What: (1) Added `meta.args` + `meta.argTypes` (aria-label text, orientation
  inline-radio) so the catalog ComponentPlayground now renders (was empty).
  (2) Stories expanded to Default / Grouped / Orientation / RovingFocus /
  Adaptive — documenting the primitive's identity (a keyboard roving-focus
  container, distinct from the brand MessageActions molecule). (3) Made
  `orientation="vertical"` real: `&[aria-orientation='vertical']` stacks the row
  (roving focus already follows orientation). Replaced the hardcoded `#888`
  story border with `var(--color-border-subtle)`.
- Why: Val — Toolbar's catalog page had no playground and didn't show its
  roving-focus reason-to-exist; the "is this a dupe of MessageActions?" question
  needed the primitive's distinct identity made obvious.

## 2026-06-29 04:23 — baseline

- What: Baseline — tracked from repo init; only incidental repo-wide sweeps (IconButton→ToolButton rename, surface-elevated token swap) touched it; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

