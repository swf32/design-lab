# Skeleton — changelog

## 2026-06-29 04:23 — animation-none-prop

- What: Added an `animation` prop ('wave' | 'none') with an exported SkeletonAnimation type; data-animation='none' renders a static placeholder (no motion, --opacity-70) so a single instance can opt out without relying on OS prefers-reduced-motion, and the reduced-motion opacity was tokenized.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-15 14:49 — animation opt-out (audit)

- What: added optional `animation` prop (`'wave'` default | `'none'`) → `[data-animation='none']` renders a static placeholder (same resting look as reduced-motion) without needing an OS setting.
- Why: senior DS audit / library parity (MUI, Mantine, Chakra all expose an animation toggle) — lets a caller opt one instance out of motion inside an already-animated context. Default behaviour unchanged.

## 2026-05-18 18:30 — pulse-wave-cascade

- What: Replaced generic opacity pulse with **Pulse Wave** — same 1.6s opacity breath, plus per-instance phase offset via `--klyp-stagger-i` (×120ms). Adjacent placeholders with sequential indices cascade visibly as one continuous wave.
- What: Added `radius` prop with 6 semantic aliases (`sm` / `chip` / `card` / `section` / `panel` / `full`) mapped to the locked radius ramp from `.claude/rules/styles.md`.
- What: Base fill lifted from `--color-bg-surface` to `--alpha-white-10` so the placeholder reads visibly brighter than its host card on dark mode (previous fill matched the host and vanished into it).
- What: Promoted to Stable in the components catalog; sidebar Featured.
- Why: The legacy fill was invisible against `Card` hosts on dark mode; the cascade behaviour is needed for multi-block loading layouts like `/referrals` activity ledger.
- How: All animation goes through `opacity` only — composite-only, GPU friendly, respects `prefers-reduced-motion` (no motion, fill stays at 0.7 opacity).

## 2026-06-26 09:12 — playground-controls

- What: completed meta args + argTypes (added animation inline-radio + args defaults; className/style non-editable) for the catalog ComponentPlayground.
- Why: playground-controls convention (.claude/rules/components.md).
