# CodeBlock — changelog

## 2026-06-30 06:09 — fix-container-type-collapse

- File: `CodeBlock.scss` (+ `CodeBlock.stories.tsx`).
- What: Added `width: 100%` to `.klyp-CodeBlock`. `container-type: inline-size`
  zeroes the figure's max-content size, so as a shrink-to-fit item (flex/grid/
  inline-block, e.g. the centered catalog stage) it collapsed to the 1px border
  — every story rendered as a thin vertical line with the code clipped by
  `overflow: hidden`. Filling the container restores a definite inline-size.
  Also dropped the now-unneeded `maxWidth` wrapper on the `Overflow` story.
- Why: Catalog stories showed empty/collapsed blocks (DOM-verified: figureW=2px,
  bodyScrollW=232–1273px clipped to clientW=32px). No-op in prod chat (block in
  normal flow already fills); container queries unaffected. Verified in-browser.

## 2026-06-30 05:48 — drop-dead-toolbar-gap-hack

- File: `CodeBlock.scss`.
- What: Removed the `&__actions.klyp-Toolbar { gap: var(--space-4) }` self-chain
  — it guarded against a phantom `@klyp/brand/Toolbar` (gap --space-16) that
  never existed; the `@klyp/ui` Toolbar already gaps at --space-4, so the rule
  was a no-op. No visual change.
- Why: code hygiene during the MessageActions/Toolbar rework — the same dead
  hack had been copied here.

## 2026-06-30 05:43 — drop-floating-bar-and-rework-stories

- What: Removed the orphan `FloatingCodeBar` sub-component (`.tsx`, the
  `&__floatingBar` SCSS block, and the `@klyp/brand` + local barrel exports) —
  it was never rendered anywhere and its `position: sticky` was trapped by the
  `figure`'s `overflow: hidden`. Reworked the stories: real Shiki highlighting
  (matches prod `message-text`), added `args` + `argTypes` so the catalog
  playground renders, added a `Plain` (no-language text fence) story, and fixed
  the overflow story to use a wide single-line sample so the wrap toggle
  actually appears (the old 60-line sample only overflowed vertically).
- Why: Catalog stories showed dull unhighlighted `<code>` and an invisible wrap
  toggle, misrepresenting the component; the dead sub-component and missing
  playground controls violated the catalog rules. Aligned the demo with the
  real component states (referenced against Vercel AI Elements `CodeBlock`).

## 2026-06-29 04:23 — baseline-from-init

- What: Baseline — tracked from repo init; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

