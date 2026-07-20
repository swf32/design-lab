# RulerSlider — changelog

## 2026-06-25 06:07 — initial

- What: New horizontal ruler slider — gold-fill rail, knurled dial thumb,
  ruler marks that lift toward the thumb (cosine falloff, linear fallback) and
  fade with distance, plus a value bubble above the thumb. Built on RAC Slider
  with the same discrete-stop / value-as-INDEX contract as AllowanceSlider and
  MeshSlider. Wired as the `ruler` `sliderVariant` in TopUpDialog and the
  `/topup-paywall` playground "Slider style" control.
- Why: Third top-up slider variant for the DEV-805 comparison — adapted from a
  vertical CSS-only ruler slider, re-oriented horizontal and re-skinned onto
  Klyp DTCG tokens.
