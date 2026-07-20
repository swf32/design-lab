# NetworkChip — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: NetworkChip.tsx — added an aggregating `aria-label={`${ticker} on ${network} network`}` on the root `<span class="klyp-NetworkChip">`. The inner segments (ticker/sep/network) are overridden by this label on the root. Markup, props, and the public API were not changed.
- Why: without an aggregating label, the screen reader read the ticker and the network as two unrelated words; now it is announced as a coherent string "USDT on Tron network".

## 2026-05-17 02:08 — selected-neutral-symmetric-padding-smaller-logo

- What: Selected state now uses neutral `--alpha-white-50` ring (was gold). Padding symmetric both axes (md=`--space-6`, sm=`--space-4`). Logo slot clamped to 14×14 (md) / 12×12 (sm) regardless of node passed. JSDoc + stories meta describe purpose and consumers.
- Why: the design lead feedback on `/components/network-chip` — gold ring violates single-accent rule for an N-selectable chip; asymmetric padding looked optically off-balance; caller-passed logo was too dominant relative to chip text; catalog reader had no signal what the chip is for.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Compact ticker · network identity chip. Lifted from withdraw drawer as part of the /referrals catalog promotion wave 2026-05-17.
