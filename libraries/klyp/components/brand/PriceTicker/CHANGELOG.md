# PriceTicker — changelog

## 2026-06-05 14:50 — stories + catalog registration, promoted to stable

- What: added `PriceTicker.stories.tsx` (4 CSF3 stories — Default,
  WithStrike, interactive BillingFlip, interactive SliderStops) +
  `PriceTicker.stories.scss` (production-28px story frame), and registered
  the component in the catalog (`components-registry.ts`, slug
  `price-ticker`, `status: 'stable'`, tier `brand-atom`). One source fix:
  `&__previous` (strike chip) `font-weight: var(--fw-regular)` → `--fw-body`
  (`--fw-regular` is not a real token, so the chip silently inherited the
  live price's heading weight instead of rendering regular).
- Why: the component was shipped + consumed by `PricingTierCard` but had no
  stories and no registry entry, so it (a) had no `/components/price-ticker`
  page and (b) was silently dropped from PricingTierCard's "Components used"
  list (the catalog import-scanner detected the relative import but found no
  matching registry entry). Registering it surfaces the link automatically
  and brings it up to the per-component standard (≥3 stories). Val 2026-06-05.

## 2026-05-26 19:41 — strike chip fixed at 14px

- What: `&__previous` (struck-through pre-discount price) switched
  from `font-size: 1em` (inherited 28px from `PricingTierCard.__price`)
  to `font-size: var(--font-size-14)`. Live price untouched.
- Why: design lead 2026-05-26 — «в unreals /pricing цена со скидкой …
  сделай её во всех карточках размером шрифта 14». Strike now reads
  as a secondary chip beside the live price across every tier card.

## 2026-05-22 15:40 — wired into PricingTierCard, blur+Y crossfade

- What: Component fully rewritten for the new role — replaces
  `PricingTierCard`'s home-grown `heldStrike` / `onTransitionEnd` /
  `displayBundle` machinery (≈50 LOC of useState+useEffect+useRef).
  Motion v12 owns all timing. Strike chip enters/exits via
  `<AnimatePresence>`; root `layout` animates row width when strike
  enters/exits. Live price keyed on `value` — old exits 140ms ease-in
  (`opacity → 0`, `y → -4px`, `blur(0 → 2px)`), new enters 220ms Klyp
  signature easing in the reverse direction. Asymmetric per Emil
  Kowalski: exit faster than enter — the eye latches onto what
  *arrives*. Width stability via `visibility:hidden` sizer span in flow
  + position-absolute live span; no tabular-nums jitter when digit count
  changes ($169 ↔ $152.10). Reduced-motion: pure opacity fade 120ms,
  zero transform / zero blur.
- Why: design lead 2026-05-22 — «сейчас короче нужно сделать чтобы скрытие
  раскрытие и смена цифр плавнее происходила… либо слот машина цифры,
  но чтобы это все оптимизировано было и не лагало». Three-agent
  research (motion docs + code review + Emil-style proposal) converged
  on blur-crossfade over slot-machine: slot-machine "animates a lie"
  between $169 and $152.10 (no intermediate values exist); crossfade
  is honest. NumberFlow library rejected (~7 kB extra dep, motion/react
  already in stack).
- Removed `aria-live="polite"` from the live price span — the
  page-level `__billingAnnouncer` in `pricing-page.tsx` is the single
  SR voice per toggle flip (otherwise a 4-card grid produced 5
  announces per click).

## 2026-05-22 — slot-machine removed (initial drift)

- What: Earlier per-digit roll (slot-machine column with per-position
  `<motion.span>` and `translateY` driven by digit value) was removed
  in favour of single opacity crossfade.
- Why: the design lead «лагает … хуево сделал».
