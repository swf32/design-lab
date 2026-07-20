# PricingTierCard — changelog

## 2026-06-29 07:23 — gold tone keeps gold hover (post brand-accent swap)

- Files: `PricingTierCard.scss`
- What: `[data-tone='gold']` hover blob + `::after` hover ring switched `var(--color-fg-accent)` → `var(--gold-700)` (4 color-mix stops).
- Why: Val — `--color-fg-accent` went iris (#755DED) in the 2026-06-29 brand-accent swap, so the Creator Plus card hovered IRIS while its perpetual mesh, TierGlyph crown, Popular badge and gold CTA all stayed gold — a clash. Pinning the hover glow to the gold primitive (the pre-swap value, #c0995d) keeps the whole Creator Plus tier coherently gold. Gold is referenced as `--gold-*` ("Gold" scale on /components/colors), no longer the brand accent. The other tier-gold surfaces were already on `--gold-*` / `--color-tier-mesh-*-gold` / hardcoded gold (TierGlyph #FDD59A→#98805C), so they needed no change.

## 2026-06-29 04:23 — outline-icons-and-tooltip-swap

- What: Replaced the inline bulk SVG `CheckCircleBulk`/`CloseCircleBulk` feature-row glyphs with `@klyp/icons` `CheckOutline`/`CloseCircleOutline` wrappers, and migrated both `InfoTip` and `DiscountBreakdownTip` from `HoverPopover` to the `Tooltip`/`TooltipContent` primitive (the body is non-interactive copy). `onHintOpenChange` now routes through `Tooltip.onOpenChange` to keep the card's hover lift.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-24 06:56 — info-tips moved from HoverPopover to Tooltip

- What: Both `(i)` hint triggers (`InfoTip` + `DiscountBreakdownTip`) now use the `@klyp/ui` `Tooltip` primitive instead of `HoverPopover`. Delays map 1:1 (`openDelay`/`closeDelay` → `delay`/`closeDelay`), `offset={6}` → `sideOffset={6}`, `onHintOpenChange` → `Tooltip.onOpenChange` (card keeps its hover lift). Dead `--klyp-popover-bg` override dropped from `__infoPopover` (Tooltip already defaults to `--color-bg-surface-solid`); `user-select`/`cursor: text` removed (a tooltip can't be hovered into).
- Why: Cross-DS audit decision (lead) — both call-sites carry read-only copy, so the hover-into bridge HoverPopover existed for was never exercised; `Tooltip` is the right primitive. `HoverPopover` was deleted from `@klyp/ui` and the catalog (its only consumer was here).

## 2026-06-19 01:38 — visible info-tip surface + saturated blue (Studio) tone

- What: (1) `__infoPopover` `--klyp-popover-bg` switched from `--color-bg-canvas` to `--color-bg-surface-solid` so the hover info-tip reads as a dark-but-visible tooltip. (2) Blue (Studio) tone re-saturated: blob palette `--blue-400/700/800/900` → `--blue-500/600/700/600`; the hover blob + `::after` ring switched from `--color-status-info` to `--blue-600`; the blue inset-glow box-shadow inlined off `--blue-600` instead of the `--fx-card-inset-glow-blue` token.
- Why: (1) the popover portals over the dark page (not the card), so the deep low-elevation `--color-bg-canvas` ≈ the page bg and the tip read as having no background. (2) the 2026-06-17 blue-scale rebuild pushed 700–900 pale (#5fa0ff/#80b4ff/#b4d3ff) and `--color-status-info` resolves to blue-900 (#b4d3ff) — so the Studio blobs, hover ring/blob and inset bloom all read as washed grey-blue; driving them off the vivid `--blue-500/600` core (#0267dd/#2883ff) restores a clearly-blue, saturated identity (Val 2026-06-19).
## 2026-06-18 14:44 — manageSlot prop for active-sub top-up face

- What: added optional `manageSlot?: ReactNode` — when set it replaces the allowance-panel slider (and static readout) with a caller-supplied node.
- Why: token top-up spec — an active Studio subscription swaps its buy-slider for two top-up buttons (upgrade / one-time); the card stays generic and the `/pricing` feature owns the node + behaviour.

## 2026-06-11 — iOS blob clip via self-mask on __blobClip (review batch)

- What: `__blobClip` gained `-webkit-mask`/`mask: linear-gradient(#000 0 0) padding-box` next to its existing `overflow: hidden` + inherited radius.
- Why: on iOS Safari the composited (filtered/blurred) hover blob ignores ancestor `overflow: hidden` clipping (WebKit composited-children leak) — the opaque self-mask forces WebKit to flatten the wrapper's subtree and honour the rounded clip. Mask sits on the wrapper, not the card root, so the card's drop shadow is unaffected. Cherry-picked from vyach32's design-review batch.

## 2026-06-05 21:42 — focus-within parity for the hover trio (a11y)

- What: Added `:focus-within` to every hover-state selector that
  previously fired only on `:is(:hover, [data-hint-open='true'])` — the
  card lift, the `__hoverBlob` opacity, the `::after` colored ring, all
  four per-tone inset-glow box-shadows (silver/purple/gold/blue), the
  unreals-brand uniform-blue box-shadow override, and the reduced-motion
  `transform: none` neutraliser. The CTA TierGlyph wake already carried
  `:focus-within` (07:54 entry below); the rest of the hover trio now
  matches it. Also corrected two stale doc-comments: the Studio header
  block claimed "No `--fx-card-inset-glow-blue` token yet" (it exists and
  is used at line ~538) and the unavailable-row block said the ✕ glyph is
  50% (it is 30%).
- Why: a keyboard user tabbing to the CTA (or an info-tip) inside the
  card saw only the TierGlyph wake to colour while the card itself stayed
  visually at rest — no lift, no ring, no blob, no glow. Pointer hover and
  keyboard focus now reveal the identical hover treatment. Caught by a
  multi-agent state review (Val 2026-06-05).

## 2026-06-05 21:25 — dead-rule cleanup + fake-token hygiene

- What: Removed dead SCSS that never matched the rendered DOM:
  `&__saveRow[data-variant='save'] &__saveRowText` (50% dim) and
  `&__renewRow` — the TSX only ever renders `data-variant="renew"` on
  `__saveRow` and no `__renewRow` element. Fixed four fake token
  references that silently fell through to inherited values:
  `--mesh-blur` → `--blur-32` (mesh filter), `--fw-regular` → `--fw-body`
  (`__priceUnit`), `--fw-medium` → `--fw-emphasis` (discount-tip Total),
  `var(--space-160, 180px)` → literal `180px` (popover min-width). Added
  `appearance: none` to `__infoTip` (kills the stray native UA box on the
  shared (i) trigger reused by DiscountBreakdownTip). Tokenised the
  per-tone hover inset-glow box-shadow — raw `32/-4/16/40/-16px` →
  `--space-*` via calc(), `rgba(0,0,0,0.04)` → `--alpha-black-05`.
- Why: token-rule hygiene — `--fw-regular` / `--fw-medium` / `--mesh-blur`
  / `--space-160` are not real tokens, so they resolved to whatever was
  inherited, drifting weight/blur off spec. The dead save/renew rules
  confused future edits. Landed alongside the AllowancePanel height work
  (commit 5ebbca8).

## 2026-06-05 19:35 — allowanceReadout prop + discount-tip trigger/clamp fixes

- What: New `allowanceReadout?: { fillPercent?: number; label: string }`
  prop, forwarded to `<AllowancePanel readout=…>` so fixed (no-slider)
  tiers render a read-out filling the same band height as slider tiers.
  Switched the `<DiscountBreakdownTip>` trigger className `__discountTip`
  → `__infoTip` (the standalone `__discountTip` trigger rule was deleted
  in SCSS on 2026-05-23, so it fell back to RAC's native `<button>` UA box —
  a stray grey square). Routed the discount tip's open/close through the
  shared clamped `handleHintOpenChange` instead of an inline unclamped
  closure.
- Why: fixed and adjustable tiers now keep equal height via a shared
  panel chassis; the (i) discount glyph reads as the same quiet,
  chrome-stripped trigger as the feature/model tips; the shared clamped
  handler prevents the hover-lift `hintOpenCount` from going negative or
  leaking +1 (card stuck lifted). Val 2026-06-05.

## 2026-06-05 07:54 — desaturate CTA TierGlyph at rest

- What: leading `<TierGlyph>` inside the `__ctaSlot` MeshButton now
  renders `grayscale(1)` at rest and wakes to full colour on card
  `:hover` / `[data-hint-open]` / `:focus-within` (360ms,
  `--duration-slow`). Scoped to the CTA slot only — the catalog
  `/components/icons` Colorful grid keeps the glyphs saturated.
- Why: the colored glyph (creator purple / creatorPlus gold / studio
  blue) was the only saturated element on an otherwise monochrome
  resting CTA, so it popped out of the "quiet at rest, colour on
  hover" card language. Val 2026-06-05.

## 2026-06-05 04:57 — hoverBlob → wide flat top-left oval (final)

- What: `__hoverBlob` reshaped over two passes from the original square
  corner footprint to a wide, flat horizontal oval in the top-left zone:
  `width: 197.44%`, `height: 47.25%`, `top: -12%`, `left: -31.5%`.
  top/left recomputed each pass so the gradient hot-spot (`22% 35%` of the
  blob) stays partially inside the card and doesn't vanish into the corner.
- Why: design lead 2026-06-04 — «горизонтально овальным» then «на 50%
  шире, по высоте на 50% меньше, выше на 25%». A wide flat wash across the
  card's top edge reads better than a tight corner ball. Iterated across
  commits b66bee3 → 9e498dc; this entry records the final geometry.

## 2026-06-05 04:57 — unavailable feature rows (available:false)

- What: New `available?: boolean` flag on `PricingTierFeature`. When
  `false`, the row renders a `CloseCircleBulk` (✕) bullet instead of the
  `CheckCircleBulk` tick and dims: label text at 30% opacity (SCSS
  `[data-available='false'] > span`); the ✕ icon carries its own ring at
  10% plus a ✕ glyph at 30% scaled ~1.35× (per-path in the TSX SVG). Added
  the `CloseCircleBulk` icon as a sibling of `CheckCircleBulk`.
- Why: design lead 2026-06-04 («сделай серым и крестик в других», «у текста
  30%, у крестиков 50%», «верни круг, 10%») — show a higher-tier feature
  greyed-out on lower tiers so all 4 cards keep identical row order.
  Iterated across 3 commits (233cd39 → b66bee3 → 9e498dc); this entry
  records the final state.

## 2026-05-23 22:32 — `__infoPopover` override slim (rely on Tooltip-style defaults)

- What: HoverPopover now ships Tooltip-style defaults (6px radius,
  5% border, surface-solid bg, 12px Geist, arrow). The override
  collapses to only what's pricing-specific: `max-width: 16rem`
  (tighter than the 280px default), `--klyp-popover-bg:
  --color-bg-canvas` (recolours body AND arrow fill in one CSS var),
  `line-height: normal` (the discount list needs more breathing
  room than `tight`), plus `user-select: text` + `cursor: text` for
  copy-paste behaviour.
- Why: redundant `padding` / `border-radius` / `font-size` rules
  removed — they duplicated the new HoverPopover defaults. Effect:
  pricing tooltips now carry the same 5% outline, animation, and
  pointer arrow as the rest of the system; only the slightly darker
  surface stays pricing-specific.

## 2026-05-22 21:33 — drop hover scale(1.01), fix text sub-pixel snap

- What: Removed `scale(1.01)` from the article hover transform — now
  `translateY(-2px)` only. Counter-scale on `__priceBlock`
  (`transform: scale(1/1.01)` on hover, plus its own `transition`
  and `transform-origin`) deleted as it was a workaround for the
  same scale. Reduced-motion `&__priceBlock { transition: none;
  transform: none; }` block also removed (no transform to neutralise).
- Why: `scale(1.01)` on the article was re-rasterizing glyph hinting
  for the features / models list text on the boundary `1.0 ↔ 1.01`,
  producing a visible sub-pixel snap when the transition returned to
  identity (design lead: «контент shift'ится на миллимикромолекулы»). Pure
  `translateY` moves the already-rasterized bitmap through the
  compositor — no glyph re-hint, no snap. Two independent research
  agents confirmed the root cause and converged on "drop scale";
  industry reference: Linear /pricing uses background+border-color
  only (no transform on card), Stripe /pricing uses translateY +
  shadow swap with scale reserved for icons / popovers, not tier
  cards. The 1% scale signal was already lost in the noise of
  translateY + ring + blob + inset bloom — no perceptual loss.

## 2026-05-22 21:09 — blob mesh repositioned and scaled up

- What: All four perpetual goo-mesh blobs (`a`/`b`/`c`/`d`) moved from `top: 112%` to `top: 108%` — centres shifted 4pp closer to the card bottom edge, making more gradient visible inside the card. Sizes increased ×1.5625 (two ×1.25 passes): a `95cqi` → `149cqi`, b `60cqi` → `94cqi`, c `75cqi` → `118cqi`, d `102cqi` → `160cqi`. Blob d (`aspect-ratio: 3/2`) grows proportionally with its `width`.
- Why: the design lead — blobs were barely visible inside the card; larger footprint and slightly raised anchor bring the colour wash further into the card interior.

## 2026-05-23 12:00 — extract allowance panel to its own brand molecule

- What: `__allowancePanel` + its `__allowanceHeader / __allowanceAmount /
  __allowanceUnit / __allowanceExamples / __allowanceExample` SCSS rules
  moved out to a new `<AllowancePanel>` molecule at
  `packages/brand/src/AllowancePanel/`. Card now imports `<AllowancePanel>`
  and injects the slider as a `ReactNode` slot. Public API of
  `<PricingTierCard>` unchanged (same `allowance / allowanceExamples /
  slider` props); the `tickDisplay` heuristic (endpoints-only when
  stops > 10) stays inside the card since it's a pricing-card concern,
  not a panel concern. No visual change.
- Why: Lift the surface out of the pricing card so other places
  (dashboards, embedded tier previews) can reuse the same chassis
  without pulling the full card.

## 2026-05-22 19:35 — models section gets a head + check bullets

- What: Restored a section head above the models list ("All Klyp
  models", hardcoded — same across tiers) styled identically to
  `__featuresHead`. Each `__model` row now carries the same
  `CheckCircleBulk` bullet as feature rows; row layout switched from
  `inline-flex / align-center / gap-4` to `flex / align-center /
  gap-8` to match `__feature`. Removed the obsolete `margin-top` on
  `__modelsList` (parent flex gap handles the spacing now). Cleaned
  up the older "no section heading — design lead 2026-05-21" comment that no
  longer reflects reality.
- Why: design lead 2026-05-22 — «в карточках тарифов где перечисляются
  нейросети поставить галочку как у пунктов выше; и надпись над
  моделями как what you will get». Models read as first-class
  inclusions now, parallel to the features list — same bullet, same
  typography, dedicated section anchor. Reverses the 2026-05-21
  «удалим кэп, сделай чуть поменьше» step-down treatment.

## 2026-05-22 19:25 — annual saveRowText dimmed to 50%

- What: `__saveRow[data-variant='save'] __saveRowText` gets
  `opacity: 0.5`. Annual save-line text now reads dimmer than the
  price headline; the adjacent (i) discount trigger keeps full
  opacity (scoped to the text span, not the row container).
- Why: design lead 2026-05-22 — «в annual режиме saveRowText все равно пусть
  будет 50% прозрачности». Earlier pass (2026-05-21) had switched the
  annual save-line from gold → primary white to read as one block
  with the price; full white turned out too loud — dimming via
  opacity quiets it while keeping it readable.

## 2026-05-22 19:20 — models list matches feature label weight

- What: `__model` font-size 12 → 13 and color `--color-fg-muted` →
  `--color-fg-primary`. Models list now reads at the same size + full
  white as the feature label lines above (`__featureLabelLine`
  inheriting from `__feature`).
- Why: design lead 2026-05-22 — «сделай белым цветом без прозрачности и
  размер текста такой же как у пунктов выше». Models had been
  intentionally smaller + muted as a "supporting detail" treatment
  (2026-05-21 round), reversed today to read as first-class with
  features.

## 2026-05-22 15:40 — price flip animation via PriceTicker

- What: Replaced the home-grown `heldStrike` / `isStrikeLaneOpen` /
  `displayBundle` / `onTransitionEnd` machinery (≈50 LOC of state
  hooks + useEffect orchestration) with a single `<PriceTicker>`
  consumer. Motion v12 now owns all timing: strike chip enter/exit +
  live-price blur-Y crossfade. Asymmetry bug fixed — live-price leads
  in both Monthly→Annual and Annual→Monthly directions (no more 220ms
  lag on Annual→Monthly while the old grid-template-columns lane
  closed). Wrapped `meshVars` in `useMemo([seed])` so the article's
  inline-style prop identity stays stable across renders. Wrapped the
  default export in `memo()` so siblings in the 4-card grid don't
  re-render when a single card's slider stop changes. Removed
  `aria-live="polite"` from the price span — the page-level
  `__billingAnnouncer` is the single SR voice per flip (was 5
  announces per toggle click on the 4-card grid).
- Why: design lead 2026-05-22 — «скрытие раскрытие и смена цифр плавнее…
  оптимизировано и не лагало». Three-agent review (research + code
  review + Emil-style design proposal) converged on blur+Y crossfade
  via Motion v12 over slot-machine (which "animates a lie" between
  $169 and $152.10) and over NumberFlow library (extra ~7 kB dep, no
  win vs already-in-stack motion/react).
- Removed dead SCSS: `&__priceOriginal`, `&__priceRow`,
  `&__priceStrikeLane`, `&__priceStrikeLaneInner`, `&__priceStrike`
  rules + the `&__priceStrike { transition: none }` reduced-motion
  override. PriceTicker owns this surface now.

## 2026-05-22 13:48 — token-update

- What: `--color-tier-mesh-shadow-gold` (`#e89846` → `#98805c`, alias of `--gold-500`, 1 usage in the Creator Plus tier mesh shadow blob).
- Why: desaturate brand gold mid/deep stops — `gold-400` and `gold-500` were too saturated/orange next to the new Geist neutrals, made the accent shout. New muted bronze sits calmer on dark surfaces and reads as deliberate brand, not warning-orange.
- Source: handoff `2026-05-22 13:48 — gold-desaturate`.

## 2026-05-20 23:10 — Popular badge: flat light gold, not gradient

- What: `TONE_TO_BADGE_PROPS.gold` (PricingTierCard.tsx, line 301)
  switched from `{ intent: 'featured' }` (warm-gold gradient with inset
  highlight) to `{ intent: 'gold', variant: 'subtle' }` (flat
  `gold-200` bg + `gold-800` fg, no gradient, no inset). Top-of-file
  comment block updated accordingly. The new `'gold'` intent landed in
  `@klyp/ui` Badge today (see Badge CHANGELOG 2026-05-20 23:05).
- Why: design lead 2026-05-20 23:08: «этот батш использую вот в этой карточке
  вместо текущего» — the metallic gradient pulled too much weight on
  the Creator Plus card and competed with the gold corner hover blob /
  inset bloom that already carry the tier's identity. The flat light
  gold reads as a calm "Popular" pill instead of a second focal point.
- Card-level chrome unchanged: `[data-tone='gold']` still drives the
  gold mesh, gold corner hover blob, gold ring on hover, and
  `--fx-card-inset-glow-gold` inset bloom — only the in-frame badge
  pill changed look.

## 2026-05-20 20:37 — badge moved inside frame, refactored to `<Badge intent="featured">`

- What: Replaced the bespoke absolute `__badge` pill (anchored at
  `top: -10px` OUTSIDE the card frame, gold-linear gradient, hand-
  rolled radius-full chrome) with the canonical
  `<Badge intent="featured">` from `@klyp/ui`, wrapped in a new
  positioning-only `__badgeSlot` div. Badge now sits INSIDE the card
  frame at the TOP of the content flow (first child, above `__head`).
  Default badge label changed from `'Most popular'` to `'Popular'`.
  Per-tone (`gold` / `blue` / `neutral`) backgrounds on the old
  `__badge` were removed — only Creator Plus surfaces a badge today
  and featured intent's gold gradient is the canonical look. The
  z-index ladder exclude rule for `__badge` was dropped (badge is now
  an ordinary content-layer child at z:1).
- Why: Single source of truth for the gold gradient pill (Badge owns
  its chrome via `@klyp/ui` — no more drift between PricingTierCard's
  bespoke `__badge` and the canonical `<Badge>`). In-frame placement
  reads as a content-layer label, matches Higgsfield's "Popular" tag,
  and frees the card's top edge for cleaner alignment with neighbouring
  tiers in the 4-card grid.

## 2026-05-20 15:11 — unified multi-tone, multi-state card (multi-agent rebuild)

- What: Comprehensive rebuild after a 3-agent audit (Senior FE +
  Senior Design + Teamlead) — formalised the card's prop / state /
  visual contract to cover ALL 4 tiers from one component.

  **New API surface** (additive, back-compat where possible):
  - `tone?: 'silver' | 'purple' | 'gold' | 'blue'` — explicit palette
    override. Defaults derived from `id` via `DEFAULT_TIER_TONE`
    (starter→silver, creator→purple, creatorPlus→gold, studio→blue,
    free+enterprise→silver). Drives a NEW `data-tone` attribute on
    the article root — visual palette is now decoupled from analytics
    id (the same Studio card can wear gold for a partner page).
  - `mesh?: 'animated' | 'static' | 'off'` — perpetual goo-mesh
    behaviour. Default `animated`; auto-coerced to `static` under
    `prefers-reduced-motion` regardless of caller (a11y floor).
    `off` hides `__mesh` entirely so only the hover trio plays
    (BalanceCard-like quiet surface for embeds).
  - `billingPeriod?: 'monthly' | 'annual'` — display hint. Drives
    `data-billing` attr + auto-hides `saveLine` on monthly (annual-
    only savings shouldn't render on a monthly view even if the
    parent passes the string). Does NOT format `price` — parent
    still owns currency math.
  - `badge?: PricingTierBadge | null` — replaces `badgeLabel?: string`.
    Object shape `{ label, tone? }`. Independent of `recommended`:
    a card can be recommended without a badge (pass `badge={null}`)
    or carry a custom badge without being recommended (`badge={{
    label: 'New', tone: 'blue' }}` on Studio). Defaults to
    `{ label: 'Most popular', tone: 'gold' }` when `recommended`
    is true and `badge` is omitted.

  **Hover trio matches BalanceCard 1:1** (per design feedback: match the
  BalanceCard component exactly):
  - `::before` base ring: padding 1px → **2px**, background
    `--color-border-default` → **`--color-border-subtle`**.
  - `::after` hover ring: padding 1px → **2px**.
  - Per-tone branches now via `[data-tone='X']` (was the
    `[data-recommended]` / `[data-tier='studio']` mix-and-match).
    Purple branch ADDED for Creator (was missing — Creator was
    inheriting the silver branch).
  - Inset hover glow per tone via new tokens
    `--fx-card-inset-glow-purple` + `--fx-card-inset-glow-blue`
    (alongside existing `-gold` / `-silver`). Studio's previous
    inline `color-mix` box-shadow now goes through the
    `--fx-card-inset-glow-blue` semantic token.

  **Mesh palette token migration**:
  - Dropped raw `rgba(R,G,B, alpha)` triples (the documented
    exception in `.claude/rules/styles.md`).
  - New semantic tokens in `semantic.tokens.json`:
    `--color-tier-mesh-{primary,shadow}-{silver,purple,gold,blue}`
    (8 total). Selectors switched from
    `[data-tier='creator'] { --mesh-c2: 142,78,198 }` to
    `[data-tone='purple'] { --mesh-primary: var(--color-tier-mesh-primary-purple); }`,
    with `color-mix(in oklch, var(--mesh-primary) 16%, transparent)`
    on the gradient stops. Palette now flows from the semantic
    token graph instead of hand-tuned RGB triples.

  **Top-half alignment** (design lead: «верхняя половина выровнена
  одинаково по левому верхнему углу»):
  - `__tiersGrid`: added `grid-auto-rows: 1fr` + `align-items: stretch`.
  - `.klyp-PricingTierCard` root: added `height: 100%`.
  - `__pitch` min-height bumped `--space-32` → `--space-40` (40px,
    fits the 2-line wrap of Studio's 14-word pitch).
  - `__divider` gained `margin-top: auto` — pushes divider +
    featuresHead + features to the bottom of the card so the top
    half (name / pitch / price / saveRow / CTA / allowance) sits
    at identical y-coordinates across the row regardless of pitch
    drift.

  **A11y polish**:
  - Page-level `__billingAnnouncer` `aria-live="polite"` region in
    `pricing-page.tsx` announces "Annual billing selected" /
    "Monthly billing selected" ONCE per toggle (replaces 4×
    per-card price-change spam that would happen with
    per-card live regions).
  - `useReducedMotion` hook (inlined local) listens to
    `prefers-reduced-motion: reduce` media query + coerces
    `mesh='animated'` → `'static'`. Existing SCSS reduced-motion
    rules (transform / opacity transitions disabled) remain.

  **Storybook coverage** — 4 new stories: `MeshStatic`, `MeshOff`,
  `Monthly`, `CustomBadge`. Existing `Default`, `Recommended`,
  `Free`, `Grid` retained.

  **Cleanup**:
  - Deleted `apps/web/src/features/pricing/pricing-mesh-tier-card.{tsx,scss}`
    (dormant since 2026-05-20 14:20 absorb; zero imports verified
    via grep before deletion).
  - Removed orphan `--blob-a-delay` / `--blob-a-mult` from
    `createMeshSeed()` (blob `a` was removed from DOM earlier but
    its seed slot was still wired into inline style).
  - `MeshSeed` type now `{ delays: [b, d], mults: [b, d] }` — 2
    slots instead of dead 3.

- Why: design lead 2026-05-20 — «делай компонент сложный карточка тарифа,
  чтобы все тарифы наши им были, у него будут отличаться цвета,
  состояния с блобами внутри плавающими и без, разные цвета,
  состояния контента внутри разного и начальный контент верхняя
  половина должен быть выравнен одинаково по левому верхнему краю
  карточки + состояние Most Popular + Annual и Monthly состояние +
  восстановить hover trio как у BalanceCard». Plan + 4 sign-offs +
  3 agent reports archived at
  `C:\Users\user\.claude\plans\lazy-scribbling-scott.md`.

## 2026-05-20 15:10 — allowance panel: glassy 30% pocket

- What: `__allowancePanel` bg switched from solid `--color-bg-canvas` to
  `--glass-222-30` (rgba(20,20,20,0.3) — same recipe used by floating
  panels in canvas / composer / sidebar). Added `backdrop-filter:
  blur(var(--blur-16))` so the per-tier mesh blobs underneath read as
  diffuse light rather than smear the headline. Border softened to
  `--color-border-subtle` (1px hairline at 30%-alpha bg), inset top
  highlight via `--alpha-white-06` (Figma DS standard anchor for top-
  light) gives the panel a thin "light from above" edge.
- Why: design lead 2026-05-20 — «30% прозрачности» on the allowance panel inside
  the tier card. Black-tinted glass (not white) creates a pocket inside
  the card — panel sinks rather than lifts, which is what reads as
  "container for slider", not a competing surface.

## 2026-05-20 14:20 — universal perpetual goo-mesh per tier tone

- What: Absorbed the goo-mesh pattern from `pricing-mesh-tier-card.tsx`
  into the canonical brand card. All 4 tiers now ship a perpetual
  background mesh (2 animated `__blob`s through a goo filter inside the
  existing `__blobClip`), recoloured per tier via `[data-tier]` palette
  blocks (`--mesh-c2` primary + `--mesh-c4` shadow as RGB triples). Renamed
  the existing corner hover-fade blob `__blob` → `__hoverBlob` so the
  mesh blobs can use the `__blob[data-blob='b'|'d']` namespace from the
  original mesh card. Added inline `style={meshVars}` carrying per-instance
  random `--blob-{b,d}-{delay,mult}` seed (animations don't sync across
  cards in the 4-tier row). Local SVG goo filter id is
  `klyp-PricingTierCard-goo`. `pricing-page.tsx` dropped its
  `tier.id === 'creator' ? <PricingMeshTierCard> : <PricingTierCard>`
  ternary — canonical card now renders every tier; the local
  `PricingMeshTierCard` import is dormant and the file can be deleted
  once the universal mesh stabilises.
- Per-tier palettes (RGB triples for the `rgba(...)` gradient stops):
  starter → `200,200,210` / `120,120,130` (light + muted silver);
  creator → `142,78,198` / `79,39,104` (purple-700 / purple-400);
  creatorPlus → `253,213,154` / `122,90,30` (warm gold / dark gold);
  studio → `82,168,255` / `13,56,104` (blue-900 / blue-400).
- Why: design lead 2026-05-20 — "блобы как в creator сделай во всех карточках но
  их цветов, т.е в стартер серебрянные в креатор плюс золотые в студио
  голубые". One card component for all tones avoids drift between
  canonical + mesh-card (allowance panel + slider migrations were
  diverging — see entries from earlier today).

## 2026-05-20 14:25 — a11y + token sweep

- What: `__badge` no longer `aria-hidden` ("Most popular" is meaningful UX
  info, not decoration). `top: -10px` literal swapped for
  `calc(var(--space-10) * -1)`. `__feature` line-height switched from
  `1.4em` to unitless `1.4` (styles.md exception list allows only `1em`).
  `__saveRow` empty-state no longer ships a literal space text node —
  conditional render with `aria-hidden` wrapper preserves layout height
  without polluting SR output. Feature `key` now `${label}-${i}` instead
  of just label, guarding against future duplicates.
- Why: Aggregate of 4 reviews (web-design-guidelines, ui-ux-pro-max,
  frontend-design, vercel-react-best-practices) flagged these as P0.

## 2026-05-20 13:42 — allowance panel (Higgsfield-style)

- What: Replaced the loose `__tokens` row + `__slider` slot with a single
  `__allowancePanel` nested card. Panel paints `--color-bg-canvas` bg,
  1px border, `--r-card` radius, padded — holds a header line
  (`MagicStarOutline` sparkle + amount + unit) and the optional
  `<AllowanceSlider>` beneath. `data-has-slider="true"` adds extra
  bottom padding so the slider focus ring breathes. Fixed-allowance
  tiers (Starter / Creator) get the same panel without a slider —
  visual consistency across all 4 cards.
- Why: design lead 2026-05-20 — «его в такую же плашку с кредитами засунул как
  на 2 скрине» (Higgsfield reference). Before: tokens line was a bare
  flex row hanging in the card; slider sat below it with no surface,
  felt disconnected. Now the credits headline + slider read as one
  self-contained group.

## 2026-05-20 13:17 — Studio: blue only on hover, neutral border at rest

- What: Dropped the `[data-tier='studio']::before { background: ... }`
  override. Studio now falls through to the neutral default base ring
  (`--color-border-default`) at rest — visually identical to Starter and
  Creator. The blue identity (`--color-status-info`) still surfaces on
  hover via the corner blob + `::after` gradient ring + inline blue inset
  bloom.
- Why: design lead 2026-05-20 — "убери его в дефолт стейте, 5% белый бордер как и
  у других карточек". Blue at rest was reading as a permanent "this is
  recommended" signal, competing with Creator Plus's gold badge. Hover-
  only blue keeps the tier visually quiet at rest, and the interaction
  reveals the accent.

## 2026-05-20 13:13 — Studio tier paints the hover stack Klyp blue

- What: Added a third hover-stack branch targeted by `[data-tier='studio']`.
  Base ring (`::before`), hover blob, hover ring (`::after`), and the
  hover `box-shadow` inset bloom all switch from the neutral silver path
  to `--color-status-info` (= --blue-900, #52a8ff). Specificity matches
  the neutral `:not([data-recommended='true'])` rules; source-order wins
  (studio rules declared after neutral). `[data-recommended='true']`
  (Creator Plus) stays gold — the two are mutually exclusive in the data,
  and the "Most popular" gold badge remains paired with recommended,
  independent of Studio's blue accent.
- Why: design lead 2026-05-20 — "в студии blue наш юзай для этого" (use our blue
  on Studio for the hover effect). Originally tagged the change on
  `[data-recommended='true']` by mistake — that flag lives on Creator Plus
  (the badge anchor), not Studio. Corrected to target `[data-tier]`.

## 2026-05-20 12:56 — hover stack: corner blob + base/hover rings + inset glow

- What: Replaced the cursor-following spotlight (`::before` + JS handlers)
  and the 2px inset border (`::after`) with the BalanceCard hover stack:
  (1) `__blobClip` > `__blob` real DOM child — corner-anchored radial
  blob that fades in on hover, clipped via overflow:hidden wrapper so
  the `__badge` at `top:-10px` stays visible; (2) `::before` always-on
  1px ring via mask-composite — `--color-border-default` on neutral,
  `--color-border-accent` (gold) on recommended; (3) `::after` colored
  hover ring with same mask-composite geometry — silver gradient on
  neutral, gold-with-plus-lighter on recommended; (4) hover box-shadow
  layers `--fx-card-inset-glow-{silver,gold}` under the lift shadow.
  Dropped `useCallback` + `MouseEvent` handlers + `--mouse-x/y` /
  `--spotlight-opacity` CSS vars and the native `border` on the article.
- Why: design lead 2026-05-20 — "посмотри на BalanceCard, при наведении блоб +
  градиентный бордер на углу + инлайн шадоу, я бы такое же сделал у
  карточки тарифа. + следи чтобы бордеры по закруглению и позиции
  совпадали с самой карточкой особенно на углах". Mask-composite rings
  at `inset: 0` + `border-radius: inherit` give pixel-perfect corner
  alignment between base ring and hover ring — what the old 1px native
  border + 1px inset `::after` pair couldn't guarantee at the radii.

## 2026-05-20 11:55 — typography reset: sentence case + bold only on price + name

- What: Stripped uppercase from `__name`, `__badge`, `__featuresHead` (was
  `text-transform: uppercase` + wide letter-spacing). Dropped fw-heading /
  fw-emphasis from every text element except `__name` and `__price`. Name
  now reads as sentence-case at font-size-18; pitch / save line / price
  unit / tokens / features / featuresHead all switched to regular weight.
  Estimate rows (`[data-emphasis="true"]`) keep their visual lift via size
  only (font-size-14 vs baseline 13) — no longer bold.
- Why: the design lead directive 2026-05-20 — "название тарифа капсом писать сделай
  нормально с заглавной", "везде в карточках удали капсом", "жирным
  шрифтом нигде не пиши кроме цены и названия тарифа".

## 2026-05-20 11:08 — canonical pricing sync + emphasized features

- What: `PricingTierId` extended with `'starter'` and `'creatorPlus'` (4 paid
  tiers now match canonical `internal pricing reference`). `PricingTierFeature`
  gained an optional `emphasis?: boolean` flag — rows flagged render at
  font-size-14 + heading weight + tabular-nums via new `&[data-emphasis='true']`
  SCSS branch. Used by the page for the "What you get" headline rows
  (videos / images / text runs) so estimates read first against secondary
  detail (seats / support).
- Why: design lead sync from Excel — Free тариф убран из публичной выдачи (default-
  стейт без подписки, не plan); Enterprise тоже убран из xlsx (TODO design lead).
  Estimates замена model-gating featurer-листов (все модели на всех тарифах).

## 2026-05-15 — initial

- What: Initial — pricing tier card with neutral / recommended states,
  slot-injected CTA. Renders as `<article aria-labelledby>` for SR
  navigation. Recommended state flips background to
  `--color-bg-surface-solid` and border to `--color-border-accent`,
  surfaces a "Most popular" badge anchored above the card frame.
- Why: First brand molecule for the public `/pricing` route (Phase 2,
  Engineer A). Composes standalone instead of layering on `@klyp/ui/Card`
  to keep the recommended-state contract local — per
  `_handoff/PRICING-ROUTE-2026-05-15/ARCHITECTURE.md` §3.1.
