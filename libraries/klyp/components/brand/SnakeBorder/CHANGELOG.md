# SnakeBorder — changelog

## 2026-06-30 16:30 — opt-in `intensity="bold"` generating head (scoped, no regression)

- What: added an `intensity?: 'default' | 'bold'` prop. `'default'` (the default) keeps the legacy thin ~50deg generating spike at `/2.5` speed with glow honoured only on `submit` — every existing consumer (canvas nodes, ambient cards) is byte-for-byte unchanged. `'bold'` opts into a wide ~180deg cone with a white-hot core, `glow` honoured on `generating`, raw `duration` (default 3.6s) driving rotation, and a reduced-motion gate. The reduced-motion gate + glow-on-generating + cone are all scoped to `data-intensity='bold'`.
- Why: the chat GeneratingFrame needs a confident glowing generating ring, but baking that into the base `generating` state changed every other consumer's speed/head/halo. Gating it behind `intensity="bold"` gives GeneratingFrame the look it needs while leaving the shared default untouched.

## 2026-05-22 13:48 — token-update

- What: `--gold-400` (`#f4b86c` → `#caaa7b`, 3 usages — default snake color anchor + drop-shadow halo). JSDoc on the `color` prop simplified to drop the inlined hex literal.
- Why: desaturate brand gold mid/deep stops — `gold-400` and `gold-500` were too saturated/orange next to the new Geist neutrals, made the accent shout. New muted bronze sits calmer on dark surfaces and reads as deliberate brand, not warning-orange.
- Source: handoff `2026-05-22 13:48 — gold-desaturate`.
