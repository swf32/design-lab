# MediaFrame — changelog

## 2026-06-30 10:55 — initial

- What: new `@klyp/brand` molecule — one fixed-size frame for the whole generation lifecycle. Generating (no `src`): SnakeBorder bold running ring (NO halo — a single glow only, the breathing surface) around a colored surface with label + ETA. On `src` arrival the media mounts behind the overlay and the overlay reveals it — media de-blurs (24px→0) while the colored surface fades (100%→0) over ~1.2s; the frame never swaps/remounts. Covers all 9 gen aspects; reduced-motion → instant reveal + no breathing.
- Why: replaces the chat-local GeneratingFrame + swap approach with a single catalogued component that owns the generating state AND the in-place blur-reveal into the final image/video (design direction).
