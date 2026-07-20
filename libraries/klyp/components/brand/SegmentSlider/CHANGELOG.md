# SegmentSlider — changelog

## 2026-06-25 06:33 — edge labels centred inside end cells

- What: Min / max endpoint labels are now centred over the first / last cell
  (same cell-centre math as the active value) instead of pinned to the track
  edge at a fixed 12px inset.
- Why: With many stops the end cells are narrow, so the edge labels floated
  across several segments ("on top of" them) instead of sitting inside their
  own segment.

## 2026-06-25 07:00 — wire into V2/V3 + formatValue

- What: Added optional `formatValue` prop (defaults to compact) so the active
  cell can label non-token stop values. Wired `sliderVariant="segments"` into
  `TopUpDialogV2` ($-first — passes `formatValue={formatPrice}` so the thumb
  reads "$50") and `TopUpDialogV3` (token-count — default compact). Now all
  three playground dialog variants render the segmented slider.
- Why: Design lead 2026-06-25 — wants the segmented slider visible across the
  other two modal variants in `/topup-paywall`, respecting each one's value
  logic (dollars vs tokens).

## 2026-06-25 06:30 — fit-and-tracking-fixes

- What: Removed the per-cell horizontal padding (with ~20 stops it was a fixed
  ~640px floor → row overflowed the container, which also made the RAC track
  wider than the visible area so the active cell outran the cursor). Padding now
  lives only on the label-bearing first/last cells. Endpoint labels are now
  compact ("2k" / "40k") and smaller (`--font-size-12`), with `overflow:hidden`
  so they clip instead of expand on tight widths.
- Why: Design lead 2026-06-25 — slider didn't fit width, white cell scrolled
  faster than the mouse, and "2,000" didn't fit. (Adaptive label colour on the
  active white cell was already handled via `--color-slider-thumb-icon`.)


## 2026-06-25 06:06 — new-component

- What: New `SegmentSlider` brand molecule — a segmented (cell) variant of the
  top-up slider. 40px-tall width-adaptive pill (radius `--r-card` = 12px) split
  into one cell per stop; no smooth travel, the white active cell jumps
  cell-to-cell. Empty cells dark grey, filled (left of active) lighter grey,
  active white. Min/max labels live inside the first/last cell. Built on RAC
  Slider (invisible thumb = drag/keyboard target, cells are the visual layer).
  Brand-aware via the shared `--color-slider-*` tokens. Wired into `TopUpDialog`
  as `sliderVariant="segments"` and exposed in the `/topup-paywall` playground.
- Why: Design lead 2026-06-25 — wants a discrete, segment-style slider for the
  top-up page + modals alongside the existing thin/mesh variants.
