# MediaGrid — changelog

## 2026-07-02 22:30 — videoPlayback pass-through

- What: new optional `videoPlayback?: 'hover' | 'auto'` prop (default
  `'hover'`), forwarded to every `<MediaCard>` — `'auto'` makes video tiles
  loop while near the viewport instead of playing on hover only.
- Why: the chat Template Gallery grid runs always-playing preview clips (Val
  2026-07-03); additive, /library and LibraryPicker callers unchanged.

## 2026-06-30 06:01 — windowed-opt-out + catalog-preview-fix

- What: Added a `windowed` prop (default `true`) to opt out of masonry DOM virtualization; rewrote the stories around a responsive `Frame` that fills the stage width (`width:100%` + `box-sizing:border-box`, no horizontal overflow) with `windowed={false}` (dropped `minHeight:100vh`). Roster: Default / GridMode / Selection / Narrow / Dense / Empty / SingleCard + `args`/`argTypes` for the catalog playground.
- Why: On `/components/media-grid` 5 of 6 previews rendered as empty boxes (absolute-positioned masonry tiles give the grid zero intrinsic width; scroll-windowing also blanked every grid below the fold on the long stacked catalog page), and the two fixed-wide previews (1400/1000px) overflowed the ~900px story frame with a horizontal scrollbar.

## 2026-06-29 04:23 — baseline-tracked-from-init

- What: Baseline — tracked from repo init; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

