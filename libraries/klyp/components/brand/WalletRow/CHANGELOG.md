# WalletRow — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: WalletRow.tsx — added `aria-label` on the `<button role="radio">`, composed from props as `${name}, ${ticker} ${network}, address ending ${addressTail}`.
- Why: Screen readers were reading the truncated address tail (e.g. `TXyZ…k9Lm`) character by character; the aggregated label gives AT a readable, human-friendly announcement. Pure a11y attribute — no markup, prop, or logic changes.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Card-style radio row for crypto wallet selection. Lifted from withdraw drawer as part of the /referrals catalog promotion wave 2026-05-17.
