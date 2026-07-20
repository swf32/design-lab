# MeshSlider — changelog

## 2026-06-29 04:23 — add-meshslider-component

- What: Added the MeshSlider brand component as a new file set (MeshSlider.tsx + MeshSlider.scss + index.ts, 250 insertions) landed in the unified-Dropdown checkpoint commit.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-25 06:10 — plain-white-thumb

- What: Thumb is now plain white (`--color-fg-primary`) with a black arrow (`--color-fg-inverse`), no mesh; thumb height bumped to 40px to match the track.
- Why: Val wants the thumb to read as a clean white control, not a mesh chip.

## 2026-06-25 06:03 — track-height-40

- What: Track height bumped from 32px to 40px; thumb size unchanged (32×32).
- Why: Val wants a chunkier rail while keeping the same thumb footprint.
