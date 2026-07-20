# MarkdownBoundary — changelog

## 2026-06-29 04:23 — stories-only-lint-and-anchor-fixes

- What: Stories-only change: `MarkdownBoundary.stories.tsx` was reworked to satisfy Biome lint (valid anchor `href`, label/control suppression); no change to the component `.tsx` or `.scss` source.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-25 12:03 — onError-prop + lifelike-stories

- What: added optional `onError?: (error, info) => void` prop (fires alongside the built-in `console.warn` so consumers can log to analytics/Sentry); rewrote stories to show real usage — `RealMessage`, `BrokenStreamFallback` (real mid-stream parse crash, not an abstract `Boom`), kept `VarsResolution`; demo text sized to match chat (body 14px, heading 16px medium); fixed the catalog registry summary which wrongly described this as a typography wrapper (that's `Prose`).
- Why: cross-DS audit — catalog stories were abstract and the registry blurb was plain wrong, so it was unclear what the component does; production markdown crashes were only visible in the browser console.
