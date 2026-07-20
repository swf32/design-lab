# Slider — changelog

## 2026-05-20 15:10 — thumbContent slot

- What: Added optional `thumbContent?: ReactNode | ((opts: { index }) =>
  ReactNode)` prop. When set, the value is forwarded as children inside
  every `RACSliderThumb` so consumers can render a glyph / icon /
  per-thumb label inside the knob without subclassing the primitive.
  Pure additive — existing consumers (only `AllowanceSlider` today) work
  unchanged when the prop is absent.
- Why: `AllowanceSlider` needs a chevron-left-right `⟨⟩` glyph in the
  thumb to cue "drag me" (Higgsfield reference). Forcing a render-prop
  in `RACSliderTrack` to inject thumb content would have leaked RAC's
  internal `state` API to consumers; a flat slot keeps the brand layer
  decoupled from RAC version churn.
