# CostFooter — changelog

## 2026-06-29 04:23 — stories-estimated-vs-exact

- What: Stories-only: added an `EstimatedVsExact` story contrasting the default estimate (leading "~") against the `exact` prop (final value, no "~").
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 23:45 — add-exact-story-stable-review

- What: Added an `EstimatedVsExact` story demonstrating the `exact` prop (estimated "~" vs final value), bringing the file to 3 CSF3 stories.
- Why: Stable-readiness review — the `exact` prop was undemonstrated and the file had fewer than 3 stories; this closes the coverage gap without changing the component's visual identity.
