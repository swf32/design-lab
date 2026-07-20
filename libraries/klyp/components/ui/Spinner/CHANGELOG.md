# Spinner — changelog

## 2026-06-30 04:24 — promote-to-stable

- What: Tokenised the spin + reduced-motion durations (`calc(var(--duration-slow) * 2.2)` ≈ 0.8s / `* 11` ≈ 4s, was hardcoded `0.8s` / `4s`); added a `Color (currentColor)` story and `meta.args` + `argTypes` so the catalog playground renders; promoted `beta → stable` in the catalog registry.
- Why: Stable gate — every applicable axis (sm/md/lg size, currentColor, animated + reduced-motion) is now covered in SCSS and stories. As a non-interactive status SVG (`pointer-events: none`, `role="status"`) it has no hover/pressed/focus/disabled/selected states to add, so the SCSS was already complete; the work was tokens + story/playground coverage + sign-off flip (Val).

## 2026-06-29 04:23 — baseline

- What: Baseline — tracked from repo init; no standalone component changes logged yet.
- Why: Establishing the per-artifact CHANGELOG baseline so every shipped DS artifact tracks changes from here on (history to date is repo init + incidental DS-wide sweeps only).

