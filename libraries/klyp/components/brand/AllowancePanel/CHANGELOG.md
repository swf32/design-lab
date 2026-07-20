# AllowancePanel — changelog

## 2026-06-05 21:25 — control band + fixed-tier readout, equal-height alignment

- What: Restructured into a fixed-height layout so all 4 pricing-tier
  panels align. New `readout?: { fillPercent?: number; label: string }`
  prop — fixed (no-slider) tiers now render a "Fixed amount" label inside
  a `__control` band, and the `__examples` list moved BELOW that band (was
  directly under the amount). `__control` uses `flex: 1` to eat vertical
  slack; `__examples` gets `margin-top: auto` so the last example line
  shares a baseline across cards. `__header` gained `margin-bottom:
  --space-8`. Panel `min-height` pinned to the tallest (Studio: slider +
  ticks + 2 examples) variant — `calc(--space-128 + --space-16)`.
  `__fixedLabel` reads white (`--color-fg-primary`).
- Why: Val 2026-06-05 (Krea/Higgsfield pattern) — slider and fixed tiers
  were different heights and the examples floated. A fixed-height control
  band with examples pinned to the panel foot keeps the 4-card row level
  whether the tier is adjustable or fixed. Landed across 8 commits the
  same day (d097e3e → 5ebbca8); this records the net final state.
- Note: `readout.fillPercent` is accepted by the type + JSDoc but not yet
  rendered (no fill track) — the readout is label-only today. Track is a
  follow-up if a logged-in "N tokens left" usage view needs it.

## 2026-05-27 21:03 — brand-aware glass tokens (unreals light theme)

- What: Replaced `--alpha-white-03` hard-codes on `background` + `border`
  with new brand-aware `--color-panel-glass-bg` / `--color-panel-glass-border`
  semantic tokens. Klyp default keeps white-3% bg + white-3% border
  (pixel-identical to prior). Unreals override flips to black-5% bg +
  black-10% border so the panel chassis stays legible against the white
  parent tier card. Doc comment in `AllowancePanel.tsx` updated to match.
- Why: On unreals (light theme on `unreals.ai`) white-3% over a white tier
  card surface = visually invisible — the panel had no readable bg or
  border, only its inner padding implied a container at all. Inverting
  to a low-alpha black tint preserves the design lead's "lighter glass / animated
  bg reads through" intent while making the chassis visible.

## 2026-05-23 12:00 — extracted-from-pricing-tier-card

- What: New `<AllowancePanel>` brand molecule extracted from
  `PricingTierCard.__allowancePanel`. Same Higgsfield-style nested card —
  headline (amount + unit) + optional examples list + optional slider slot.
- Why: Lift the surface out of `PricingTierCard` so dashboards / embedded
  tier previews can reuse it without pulling the full pricing card. Slider
  is now a `ReactNode` slot — panel does not own slider chrome.
