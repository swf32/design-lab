# MediaCard — changelog

## 2026-07-02 22:30 — videoPlayback prop (hover | auto)

- What: new optional `videoPlayback` prop — `'hover'` (default, unchanged
  /library behaviour) or `'auto'`: the clip attaches its src and loops while
  the tile is near the viewport (`useInViewport`, 200px look-ahead) and
  pauses off-screen.
- Why: the chat Template Gallery needs always-playing preview clips (Val
  2026-07-03); additive API, zero change for existing callers.

## 2026-06-30 06:01 — focus-ring + playground args

- What: `:focus-visible` now paints a distinct 2px accent ring (previously identical to the 1px hover ring); added `args`/`argTypes` + a sized playground wrapper to the stories.
- Why: Keyboard focus was visually indistinguishable from hover (weak WCAG 2.4.7 indicator), and MediaCard had no live catalog playground.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What:
  - MediaCard.tsx + MediaCard.scss: added `data-selection-active={selectionActive || undefined}` on the root div and a `.klyp-MediaCard[data-selection-active] &` selector for the checkbox so standalone cards in selection mode keep the checkbox visible at rest without a parent MediaGrid (item 2.2).
- Why: the `selectionActive` prop only gated JSX rendering while the checkbox opacity depended on an ancestor `[data-selection-active]` that standalone cards never had.
