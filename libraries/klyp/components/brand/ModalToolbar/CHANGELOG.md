# ModalToolbar — changelog

## 2026-06-30 05:15 — promote-beta-to-stable

- What: Flipped catalog `status` beta → stable in `components-registry.ts` (slug `modal-toolbar`).
- Why: Val sign-off — after the preview-collapse fix it meets the bar: layout-only slot molecule (no variants/states to fill), used in production (LibraryPicker), token-only SCSS, 4 stories incl. Adaptive, browser-verified across container widths.

## 2026-06-30 05:01 — fix-catalog-preview-collapse

- What: Fixed the broken `/components/modal-toolbar` preview — the stories framed the toolbar with `max-width` (indefinite) instead of a definite `width`, so in the catalog's flex stage the `container-type: inline-size` root collapsed to ~0px and the query mis-fired into the stacked mobile layout (labels clipped to "Al/In/Fi"). Rewrote all stories to use fixed-`width` frames (AssetCard pattern), added an `Adaptive` story showing the 640px row⇄stack flip, and added defensive `inline-size: 100%` to the root so a drop-in can't collapse to zero.
- Why: Val — component looked broken/ugly in the catalog (still beta). The component itself was fine in production (LibraryPicker supplies a definite width); only its stories + a missing fill-default were wrong.

## 2026-06-29 04:23 — add-modaltoolbar-component

- What: Added the ModalToolbar brand molecule as a new file set (ModalToolbar.tsx + .scss + .stories.tsx + index.ts, 153 insertions): a slot-based controls+search toolbar band that flips layout via a container query (controls left / search pinned right on desktop, stacked full-width on mobile), landed in the modal-consistency pass.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-24 12:30 — new component

- Files: `ModalToolbar.tsx`, `ModalToolbar.scss`, `ModalToolbar.stories.tsx`, `index.ts` (+ brand barrel + catalog registry)
- What: new brand molecule — a modal / sheet toolbar band pairing a filter-control
  cluster with a search field. Desktop (container ≥ 640px): controls fill the
  left, search pinned right at 400px (`--modal-toolbar-search-w`, default
  `128·3 + 16`). Mobile (narrow container): controls on top (wrapping row), search
  edge-to-edge below. Layout-only + slot-based (`controls` + `search`); responsive
  via a CONTAINER query so it adapts to its own width (full modal vs mobile sheet).
- Why: design-lead — extract the Library toolbar row as a reusable piece, the
  toolbar counterpart to `SelectionFooter` (the modal footer band). Registered in
  the /components catalog (beta).
