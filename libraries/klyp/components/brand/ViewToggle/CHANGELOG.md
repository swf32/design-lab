# ViewToggle — changelog

## 2026-06-29 04:23 — stories-variants-tabswitcher-doc

- What: Stories-only: added a `Variants` story showing the two view modes (value="grid" / value="line") and relabeled `States` to selection + disabled; updated the component doc string from "Wraps `<ChipToggle>`" to "Wraps `<TabSwitcher>`".
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 23:45 — add-variants-story

- What: added a dedicated `Variants` story showing the grid/line view-mode axis, splitting the variant cases out from the existing `States` story (which keeps the disabled state).
- Why: stable-readiness review — strengthen story coverage to the Default + Variants + States + Adaptive menu without touching the component's visual identity.

## 2026-06-17 23:08 — md-outer-36-to-40 (inherited via TabSwitcher)

- What: no ViewToggle code change — its size="md" outer pill is now 40px because TabSwitcher's md option-h went 30->34 (control-height baseline 36->40).
- Why: DS-wide control-height baseline bump 36->40 (control.size.lg); the Grid/Line toggle stays in lockstep with section-header controls.
