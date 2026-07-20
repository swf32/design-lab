# BulkActionsBar — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: In `BulkActionsBar.scss` added a solid `background: var(--color-bg-surface);` fallback line immediately before the `color-mix(in srgb, …)` background on `.klyp-BulkActionsBar` (item 4.2).
- Why: on old Safari (15) without `color-mix` support the bar rendered with no background and became invisible; the solid fallback is overridden by `color-mix` on modern browsers and gives a non-transparent surface elsewhere. A progressive enhancement that does not change geometry or the public API.
