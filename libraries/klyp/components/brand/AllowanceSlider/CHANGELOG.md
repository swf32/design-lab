# AllowanceSlider — changelog

## 2026-06-19 01:38 — drop spring overshoot (no more bounce)

- What: `__fill` and `__thumb` transitions reverted from `--easing-spring` back to `--easing-standard` (duration unchanged at `--duration-base`/220ms). The `:has([data-dragging])` 1:1-chase guard in base Slider.scss is untouched, so this only affects tick-click + drag-release easing.
- Why: the `--easing-spring` back-out (~12% overshoot, added 2026-05-25 to read as "weight") read as an unwanted BOUNCE — the thumb/fill crossed the target stop and sprang back. `--easing-standard` (monotonic ease-out) glides to the stop and settles cleanly (Val 2026-06-19).

## 2026-05-27 21:03 — brand-aware slider tokens (unreals light theme)

- What: Replaced all hard-coded `--alpha-white-*` / `--color-fg-primary`
  / `--neutral-0` / `--color-bg-canvas` colour references inside the
  slider chrome (rail, fill, thumb bg, thumb inset border, thumb chevron
  icon, drag halo, inactive tick label) with new brand-aware semantic
  tokens `--color-slider-{rail,fill,thumb-bg,thumb-border,thumb-icon,thumb-halo-drag,tick-inactive}`.
  Klyp default values are identical to the prior hard-coded ones (white
  pill on dark rail, dark chevron, white-30 rail / white-90 fill / white-30
  inactive tick); Unreals overrides flip to black-15 rail + accent-blue
  fill + accent-blue pill + inverse-white chevron + black-40 inactive
  tick. Added `LightPanelContext` story that renders the slider inside a
  white panel mock so the contract can be eyeballed under either build.
- Why: Under `VITE_BRAND=unreals` (light theme on `unreals.ai`) the entire
  slider was rendering near-invisible — rail (white-30) and fill (white-90
  resolving to black-90 via fg.primary) collapsed against the white tier
  card, the thumb (`neutral-0`) was a white pill on a white panel held up
  only by a 12% black inset border, and the chevron icon (`--color-bg-canvas`
  → resolves to `neutral-0` on unreals) was pure white on a white pill, so
  the glyph was literally invisible. Ticks at white-30 were also gone.
  Tokenising the palette keeps klyp pixel-identical while giving unreals
  its own readable, on-brand chrome via one override file edit.

## 2026-05-24 19:55 — spring easing on tick-click + drag-release

- What: Position transitions on `__thumb` (`left/top/margin-left`) and
  `__fill` (`left/width`) swapped from `--duration-fast`/`--easing-standard`
  (140ms monotonic ease-out) to `--duration-base`/`--easing-spring`
  (220ms `cubic-bezier(0.34, 1.56, 0.64, 1)` — back-out with ~12%
  overshoot). Transform/shadow/color transitions on `__thumbInner` and
  tick color stay on duration-fast/standard (micro-interactions stay
  snappy). `:has([data-dragging])` rule in base Slider.scss still kills
  transition during pointer drag → drag remains 1:1 with the pointer.
  Spring only fires on tick-click + drag-release.
- Why: the design lead asked for Motion-style spring feel after seeing an
  AdaptiveSlider reference using `spring(stiffness=300, damping=30)`.
  Path A (cheapest CSS-only approximation): swap to the existing
  `--easing-spring` token + bump duration so the back-out has visible
  room to settle. If overshoot reads too bouncy, fallback is
  `--easing-emphasis` (Apple HIG snap, no overshoot) at same 220ms.

## 2026-05-22 14:05 — pricing matrix locked to NEW (Studio 4-stop, no Creator+ slider)

- What: Slider config in production now reflects the design lead's 2026-05-22 PM
  pricing decision — Creator Plus dropped the slider entirely (fixed
  4,500 tokens / $99), Studio simplified to 4 hardcoded stops
  (8,000 / 10,000 / 12,000 / 14,000 tokens → $169 / $199 / $239 / $269).
  Per-step price is non-linear ($30 / $40 / $30 deltas) — hardcoded
  lookup in `STUDIO_SLIDER_STOPS` (pricing-tiers.ts), no formula. The
  earlier "Creator Plus 4500/7500" + "Studio 10000/13000/16000/19000"
  shape mentioned in the 2026-05-20 12:30 entry below is OBSOLETE;
  kept in changelog as historical record only.
- Why: the design lead pricing screenshot (Old → New) — intermediate "Creator Plus 1"
  $148/7,500 tier removed, Studio rebased from $199-base / 19k-top to
  $169-base / 14k-top. Per-token rate descends $0.033 (Starter) → $0.024
  (Creator) → $0.022 (Creator+) → $0.0211 (Studio base) → $0.0192
  (Studio top); annual still 10% off monthly per stop, save lines
  scale 1:1 with monthly base.

## 2026-05-20 15:10 — chevron thumb + motion polish (3-agent review)

- What: Thumb redesigned to 20px white knob with inline `⟨⟩`
  chevron-left-right SVG injected via the new `thumbContent` slot on the
  UI Slider primitive — visual "drag me" cue mirroring the Higgsfield
  reference. Drag UX hardened: `transition-duration: 0ms` during
  `[data-dragging]` so the thumb chases the pointer 1:1 with no lag;
  hover scale 1.08 ("I see you"), drag scale 1.12 + bigger halo via
  `box-shadow` (no spring, no overshoot — slider is a commit-control, not
  a toy). Hover only gates `@media (hover: hover) and (pointer: fine)`
  so touch's :hover false-positive after tap doesn't stick. Tick active
  state moved to a soft `--alpha-white-10` glass pill + inset top
  hairline + color shift — NO bold (design lead styles.md rule "bold only on
  price + name"). Reduced-motion gate added for thumb scale + transitions;
  color/bg state changes stay.
- Why: Senior-frontend + ui-ux + emil-design-eng review converged on the
  same diagnosis — current thumb read as a "stray dot", needed a glyph
  for affordance + motion that respects pointer-as-state-source.

## 2026-05-20 14:25 — review fixes: tokens, perf, a11y

- What: Thumb size literal `18px` → `var(--space-18)` (styles.md). Tick
  hit-area expanded via `::before` pseudo (transparent overlay,
  -12px/-8px inset) so pointer footprint clears WCAG 2.5.5 44×44 without
  growing visible chrome. `formatTokens(stop.tokens)` computed once per
  tick (was twice — visible label + aria-label). Inline `onChange={(v) =>
  ...}` lifted into `useCallback` with `[onChange]` dep so the underlying
  RAC Slider sees stable identity across renders. `aria-pressed` switched
  from `'true'|'false'` ternary to boolean — biome jsx-a11y accepts the
  React boolean→string conversion. Tick group `aria-label` em-dash dropped
  (SR reads punctuation).
- Why: Aggregate of 4 reviews (web-design-guidelines, ui-ux-pro-max,
  frontend-design, vercel-react-best-practices) flagged these as P0/P1.

## 2026-05-20 13:42 — visual polish: neutral fill, bigger thumb, tighter padding

- What: Track fill switched from `--color-accent` (warm gold) to
  `--color-fg-primary` (neutral white) — the tier card's own ring +
  Most-popular badge carry the gold accent; the slider track shouting
  gold was visual noise. Rail switched to `--alpha-white-10` (subtler
  than `--color-bg-surface-solid` inherited from UI primitive). Thumb
  redrawn: 18px solid white, drop shadow + 1px inner ring, scale-up on
  hover (1.08) and drag (1.12). Slider's outer vertical padding
  tightened so it nests cleanly inside `PricingTierCard.__allowancePanel`.
- Why: design lead 2026-05-20 — «визуально пофикси драглайн этот, сейчас это
  параша» + Higgsfield reference uses neutral white track, never gold.

## 2026-05-20 12:30 — initial

- What: New brand molecule that wraps `@klyp/ui/Slider` (React Aria) +
  adds a `<button>`-per-stop tick row underneath. Value contract is
  index-based (0..stops.length-1, step=1) so parent components can read
  `stops[currentIndex].tokens` deterministically. Each tick has
  `aria-pressed` + `aria-label` ("4,500 tokens") for SR consumption;
  visible label defaults to comma-grouped number with `tabular-nums` so
  digit widths stay stable during stop transitions. SCSS overrides the
  UI primitive's track height (2px) and thumb size (18px) to match the
  Higgsfield reference.
- Why: design lead 2026-05-20 — Jira UI-68 ask for ползунки на двух последних
  тарифах (Creator Plus 4500/7500, Studio 10000/13000/16000/19000).
  Krea / Higgsfield use the same UX pattern; we keep the underlying
  primitive accessible via RAC rather than copying their custom-div
  slider (no `role="slider"` / `aria-value*` in their HTML).
