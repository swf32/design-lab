# Prose — changelog

## 2026-06-30 07:17 — fix reading-column collapse + repair stories

- What: (1) `Prose.scss` — added `inline-size: 100%` + `max-inline-size:
  var(--width-prose)` so the column owns a width source. A `container-type:
  inline-size` box derives its width from its containing block, not its content,
  so with no width source it collapsed to ~0 inside any non-stretched flex/grid
  parent (the catalog stage) → article wrapped one word per line. (2) `Prose.tsx`
  — moved the `render(content)` call into a `<ProseBody>` child rendered BELOW
  `<MarkdownBoundary>`, so a throwing engine is caught and falls back to raw text
  instead of throwing above the not-yet-mounted boundary and blanking the message.
  (3) `Prose.stories.tsx` — added `args`/`argTypes` (live `size` playground); fixed
  the `RawFallback` story (now shows the boundary's raw-text fallback, not a red
  crash card); added the `klyp-Prose__shiki` highlighted-code path to
  `RenderContract`; replaced all inline-style literals (incl. a hardcoded `#888`)
  with the new `__shared/story-layout` helpers.
- Why: `/components/prose` rendered the article as a 1-word-per-line column with a
  crashing fallback story — Val flagged it ("узкие уёбищные / не помещаются во фрейм").

## 2026-06-29 04:23 — baseline-tracked-from-repo-init

- What: Baseline — tracked from repo init; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

