# PricingCompareMatrix — changelog

## 2026-06-29 07:33 — recommended tier name → gold (was iris)

- Files: `PricingCompareMatrix.scss`
- What: `th[data-recommended='true'] .__tierName` color `var(--color-fg-accent)` → `var(--color-badge-gold-fg)`.
- Why: Val — `--color-fg-accent` went iris (#755DED) on the 2026-06-29 brand-accent swap, so the "Creator +" column header in Compare Plans rendered purple while the rest of the Creator Plus tier stayed gold. `--color-badge-gold-fg` is the brand-aware gold accent (gold.700 klyp / blue.500 unreals) — the same token as the "Popular" badge text, so the header now matches the tier. No token rebuild (existing token).

## 2026-06-09 17:53 — fix: fill container width (was blank in flex/centred parents)

- What: add `width: 100%` to the `.klyp-PricingCompareMatrix` root.
- Why: the root was an auto-width block — fine inside a block parent (the
  `/pricing` `<main>`), but inside a flex parent that centres its children (the
  catalog StoryCard stage) it shrank to the `__scrollWrap`'s 0 min-content width
  and rendered blank. Filling the container fixes the catalog Preview with zero
  change on `/pricing` (the block parent already gave it full width).

## 2026-06-01 — fix: sticky tier row no longer hard-pins to `--header-h` (configurable offset)

- What: `&__tierRow { top: var(--header-h) }` → `top: var(--matrix-sticky-top, 0)`.
  The sticky offset is now an opt-in consumer variable, defaulting to 0 (dock
  to the top of the scroll port). Header doc, the `.tsx` composition comment,
  and the stories description updated to match.
- Why: the component reached into `--header-h` — an `apps/web` layout variable
  the DS package has no business knowing about (leaky abstraction). On the
  prototype's scroll-port `/pricing` layout the global header sits OUTSIDE the
  scroll port, so the port already starts below the header; `top: var(--header-h)`
  then added the header height a SECOND time, leaving a ~56px gap between the
  page header and the docked tier row. Default 0 fixes that layout; a page
  whose header OVERLAPS its scroll port now opts in via
  `--matrix-sticky-top: <header-height>` instead of relying on a baked-in
  global. `z-index: 10` and the glass chrome are unchanged.

## 2026-05-20 23:23 — fix: BillingToggle now actually vertically centered in `__rowHeadCol`

- What: Added nested override `&__tierRow &__rowHeadCol { vertical-align: middle; }`
  and removed the duplicate `vertical-align: middle` from the flat
  `&__rowHeadCol` block. Comment expanded with the specificity story so
  the next reader doesn't unfold the same trap.
- Why: design lead 2026-05-21: «можно его по центру вертикально расположить».
  Root cause was a specificity miss: `&__tierRow th` (0,1,1) sets
  `vertical-align: top` for the tier-card cells, which legitimately
  need top alignment. But that selector also matches `__rowHeadCol`
  (it IS a `th` inside `__tierRow`), and `&__rowHeadCol` on its own
  (0,1,0) wasn't strong enough to override it. The toggle was pinned
  to the top of the ~300px-tall sticky row instead of the middle.
  Nesting under `__tierRow` bumps specificity to (0,2,0) and wins.

## 2026-05-21 — Magnific-style rewrite (Phase 2)

- What: Complete component rewrite to match magnific.com/pricing pattern.
  Sticky 2-row thead: row 1 = Monthly/Annual radio-group toggle pill +
  "Save N% with annual" hint (stuck `top: 0`); row 2 = corner-spacer +
  tier cards (name + price + credits/year + Get-plan CTA, stuck
  `top: var(--space-48)` under the toggle row). Tbody renders per-model
  rows with optional `subline` (e.g. "100 credits / 10s · 720p clip")
  and optional `badge` pill (NEW / LOWER PRICE) next to the row label.
  Tier-card name flips to `--color-fg-accent` for recommended, plus the
  full column wash (`--color-overlay-gold-10` on every body cell) is
  preserved from the previous version.
- API changes:
  - `PricingCompareMatrixTier` now optionally carries `price`,
    `priceUnit`, `creditsPerYear`, `cta` (ReactNode).
  - New props on the component: `billingPeriod`, `onBillingPeriodChange`
    (controlled toggle), `annualDiscountPct` (defaults to 10).
  - `CompareRow` gained optional `subline` + `badge` (`'new' |
    'lower-price'`) — additive, existing rows unchanged.
  - New exported type `PricingCompareBillingPeriod`.
- A11y: toggle is `role="radiogroup"` + per-button `role="radio"` with
  `aria-checked` + roving tabIndex + arrow-key handler (Left/Up =
  Monthly, Right/Down = Annual). Mirrors the canonical ARIA APG pattern.
- SCSS: replaced sticky pill row with the new 2-row sticky structure.
  Added `__toggle*`, `__tierRow`, `__tierCard*`, `__tierCell`, `__pill`,
  `__rowSubline`, `__rowLabelMain` BEM elements. Pill tones via
  `data-tone='new' | 'lower-price'` with `color-mix(...status-info /
  warning, transparent)` bg / fg.
- Why: design lead 2026-05-20 — «compare plans block переделать наш под такой
  формат… хедер побольше чем наш, sticky». Reference reviewed across 3
  parallel senior agents (FE scrape + UX visual analysis + current
  matrix audit). Confirmed Magnific structure — sticky tier-card header
  with per-model derived count rows.
- Archive: pre-rewrite snapshot at
  `_archive/2026-05-20-pre-magnific-port/` via `pnpm catalog:archive`.

## 2026-05-20 11:08 — canonical 4-tier sync

- What: Component itself unchanged (data-driven); consumer (`pricing-tiers.ts`)
  now feeds 4 tiers [Starter, Creator, Creator Plus, Studio] instead of
  [Free, Creator, Studio, Enterprise]. Category set rebuilt: Allowance /
  Models / Library & projects / Collaboration / Support & priority. New
  rows reflect xlsx-confirmed shape — all models on all tiers (gating
  removed), GPT-5.4 + Gemini per-tier monthly run limits added explicitly,
  brand kits now Creator-Plus-and-above only.
- Why: Sync from canonical `internal pricing reference` (см.
  `_handoff/PRICING-ROUTE-2026-05-15/CANONICAL-PRICING.md`). Free → default
  state, Enterprise → not in canonical pricing (TODO the design lead confirm).

## 2026-05-15 — Initial — compare matrix with sticky tier-pill row + mobile horizontal scroll

- What: Ports `.klyp-pricing-Compare` from
  `.research/2026-05-14-pricing-page/variant-a-classic.html` into a typed
  React component. Real `<table>` markup. Sticky `<thead>` pinned under
  `var(--header-h)`. Recommended column wash via `data-recommended` on
  both `<th>` and every `<td>`. Mobile (`@container (max-width: 880px)`)
  flips the wrapper to `overflow-x: auto` with `min-width: 720px` on the
  table.
- Why: Phase 1 deliverable from Engineer B against
  `_handoff/PRICING-ROUTE-2026-05-15/ARCHITECTURE.md` §4. Side-by-side
  feature comparison is the load-bearing content of `/pricing`.
## 2026-05-20 — pre-magnific-port

- Archive: `./_archive/2026-05-20-pre-magnific-port/`
- Tokens source: `tokens@4002e0ae`

