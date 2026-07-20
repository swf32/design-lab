# SolidButton — changelog

## 2026-06-29 04:23 — fill-prop-slot-width-truncate

- What: Added a `fill` prop (emits `data-fill`) for slot-based full-width buttons: SCSS `&[data-fill]` sets width:100%, min-width:0, flex-shrink:1 and centers the label, and `__content` now truncates (min-width:0, overflow:hidden, text-overflow:ellipsis, white-space:nowrap).
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-18 12:58 — full size range (xs/sm/md/lg/xl)

- What: added `data-size='xs'` (24px) + `data-size='xl'` (56px) to complete the xs/sm/md/lg/xl ladder; `lg` font base→`--type-buttons-lg` (16px, reads right at the new lg=48). Default stays md (now 40 via the rescaled `control.size`). Sizes story shows all five.
- Why: DS-wide button size scale extended — see `@klyp/tokens` CHANGELOG 2026-06-18.

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: `data-size='md'` height 36px → 40px. sm (32) / lg (44) and the `@media (any-pointer: coarse)` touch override unchanged.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). SolidButton md (the Unreals render of MeshButton md) tracks the same baseline.

## 2026-05-26 14:51 — remove-shadow

- What: removed `box-shadow` from base state (inset top highlight + accent-tinted micro shadow) and from `[data-pressed]` state (inset highlight only).
- Why: aligns visual output with file's stated contract ("NO shadow, NO inset glow") — header comment said flat solid fill but base styles still rendered a soft elevation.
