import { CheckOutline, CloseCircleOutline, InfoCircleOutline } from '@klyp/icons'
import { Badge, type BadgeIntent, type BadgeVariant } from '@klyp/ui/Badge'
import { Tooltip, TooltipContent } from '@klyp/ui/Tooltip'
import { motion, useReducedMotion } from 'motion/react'
import {
  type CSSProperties,
  memo,
  type ReactNode,
  type SVGProps,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react'
import { Button as RACButton } from 'react-aria-components'
import { useBrand } from '../_brand-context'

const CARD_COPY = {
  klyp: {
    appliedAria: 'Applied discounts breakdown',
    appliedTitle: 'Applied discounts',
    total: 'Total',
    popular: 'Popular',
    accessToModels: 'Access to Models',
    models: 'Models',
    moreInfo: (name: string) => `More info: ${name}`,
  },
  unreals: {
    appliedAria: 'Применённые скидки',
    appliedTitle: 'Применённые скидки',
    total: 'Итого',
    popular: 'Популярный',
    accessToModels: 'Доступные модели',
    models: 'Модели',
    moreInfo: (name: string) => `Подробнее: ${name}`,
  },
} as const

import { AllowancePanel } from '../AllowancePanel/AllowancePanel'
import { AllowanceSlider, type AllowanceSliderStop } from '../AllowanceSlider/AllowanceSlider'
import { PriceTicker } from '../PriceTicker/PriceTicker'
import './PricingTierCard.scss'

// =====================================================================
// CheckCircleBulk — Iconsax "tick-circle" Bulk variant inlined locally.
// =====================================================================
//
// Two-tone duo: a filled circle at 40% opacity (background ring) plus a
// solid checkmark at 100% opacity (foreground glyph). Both paths share a
// single `fill="currentColor"` so SCSS can tint the icon via the parent's
// `color` property — no per-path color override.
//
// Inlined per design lead 2026-05-21: «сделай в карточках вот эту чек иконку
// везде белую» — the design lead provided this exact SVG (Iconsax bulk variant).
// Not added to `@klyp/icons/bulk` because that file is deprecated as of
// 2026-05-14 (all bulk exports return `null` stubs until the file is
// retired). Once the icons package gets a non-deprecated bulk pipeline,
// this inline can promote to a canonical `<CheckCircleBulk>` export.
//
// Project rule `.claude/rules/frontend.md`: bulk icons require an
// explicit user ask — the design lead's provided SVG satisfies that gate.
//
// `feedback_icon_opacity_on_wrapper.md` (project memory) advises wrapper-
// level opacity over per-stroke alpha to avoid the stroke-overlap doubling
// artefact. Here both shapes are SOLID FILLS (not strokes), so per-path
// `opacity` is safe — no overlapping strokes to double.

function CheckCircleBulk(props: SVGProps<SVGSVGElement>) {
  return <CheckOutline aria-hidden width={16} height={16} {...props} />
}

// =====================================================================
// CloseCircleBulk — Iconsax "close-circle" Bulk variant, sibling of
// CheckCircleBulk above. Used for UNAVAILABLE feature rows (`available:
// false`) — a higher-tier feature shown greyed-out on a lower tier so
// all 4 cards keep the same row order. Same duo-tone construction: a
// filled ring at 40% opacity + a solid ✕ glyph, both `fill="currentColor"`
// so SCSS tints the whole icon via the row's muted `color`.
// =====================================================================

function CloseCircleBulk(props: SVGProps<SVGSVGElement>) {
  return <CloseCircleOutline aria-hidden width={16} height={16} {...props} />
}

// =====================================================================
// Perpetual goo-mesh — per-instance random seed so neighbouring cards in
// the 4-tier row don't animate in lockstep. Lifted from `MeshButton.tsx`
// and `pricing-mesh-tier-card.tsx` (which this component absorbed on
// 2026-05-20 when the mesh effect went universal across all tiers).
//
// Four LARGE blobs, lemon-sliced at card edges (per design feedback: a
// circle set into the square with only half of it visible inside —
// like a lemon slice).
// Each blob's centre sits ON the card edge; half-blob visible inside,
// half clipped by `__blobClip overflow:hidden`. Sizes 140-150cqi (≈
// 500-540px on 360w card, in the design lead's 400-800px range).
//
// Anchors + sizes + drift paths live in SCSS (`klyp-tiercard-drift-*`);
// the TSX seed only randomises the temporal phase (delay) + duration
// (mult) per blob per card so neighbouring cards stay out of lockstep.
//
//   • `__blob[data-blob='a']` — primary, BOTTOM-LEFT corner,  115cqi, 34s
//   • `__blob[data-blob='b']` — shadow,  BOTTOM 33%X,         130cqi, 38s
//   • `__blob[data-blob='c']` — LIGHT,   BOTTOM 67%X,         155cqi, 32s
//   • `__blob[data-blob='d']` — primary, BOTTOM-RIGHT corner, 140cqi, 36s
//
//   delay  ∈ [-30s, 0s]   — wider delay range since durations are long
//   mult   ∈ [0.90, 1.10] — tight jitter so all blobs stay in slow zone
// =====================================================================

type MeshSeed = {
  delays: [number, number, number, number]
  mults: [number, number, number, number]
}

function createMeshSeed(): MeshSeed {
  const r = Math.random
  return {
    delays: [-(r() * 30), -(r() * 30), -(r() * 30), -(r() * 30)],
    mults: [0.9 + r() * 0.2, 0.9 + r() * 0.2, 0.9 + r() * 0.2, 0.9 + r() * 0.2],
  }
}

/**
 * Local SVG goo filter — `stdDeviation=15` (vs MeshButton's 5) for card-
 * scale geometry. Filter id is `klyp-PricingTierCard-goo`; mounted once
 * per card instance — browsers resolve duplicate ids to the first match
 * in the DOM, which is fine for a stateless decorative filter.
 */
function PricingTierCardGooFilter() {
  return (
    // filter-defs-only SVG, 0×0, decorative — `aria-hidden` already excludes from a11y tree
    <svg className="klyp-PricingTierCard__svgFilter" aria-hidden focusable="false">
      <defs>
        {/* Filter region expanded to -20%/-20%/140%/140% (was 0/0/100%/100%).
            With lemon-sliced blobs anchored ON card edges, the previous
            tight region was hard-clipping the Gaussian falloff at the
            card border — visible razor edges before `__blobClip`'s
            border-radius could round them. The wider region preserves
            the blur falloff; `__blobClip overflow:hidden` does the
            final rounded clip. */}
        <filter id="klyp-PricingTierCard-goo" x="-20%" y="-20%" width="140%" height="140%">
          {/* Plain Gaussian blur — no metaball threshold. The earlier
           * `feColorMatrix values="… 16 -7"` matrix slammed near blobs
           * into a single blob (gooey merge). design lead 2026-05-23: that read
           * as «один гигантский блоб посередине» — wanted distinct
           * silhouettes per edge. Removed colormatrix; SCSS `__mesh`
           * still applies an additional CSS `blur(40px)` on top for
           * extra softness. */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
          <feBlend in="SourceGraphic" in2="blur" />
        </filter>
      </defs>
    </svg>
  )
}

// =====================================================================
// InfoTip — small "(i)" trigger with a Tooltip carrying read-only copy.
// =====================================================================
//
// Tooltip (was HoverPopover, retired 2026-06-24): the body is short
// non-interactive text — there is nothing to click or hover into, so the
// hover-into bridge HoverPopover existed for was unused here. Parent card
// keeps its hover lift while open via `onHintOpenChange` → Tooltip.onOpenChange.
function InfoTip({
  content,
  label,
  onHintOpenChange,
}: {
  content: string
  label: string
  onHintOpenChange?: (isOpen: boolean) => void
}) {
  return (
    <Tooltip
      // Near-instant open per design feedback (the prior delay felt too slow). 400ms
      // felt sluggish — at 80ms the tip pops on intentional hover but
      // ignores mouse pass-through.
      delay={80}
      closeDelay={150}
      onOpenChange={onHintOpenChange}
    >
      <RACButton className="klyp-PricingTierCard__infoTip" aria-label={label} type="button">
        <InfoCircleOutline width={14} height={14} aria-hidden />
      </RACButton>
      <TooltipContent side="top" sideOffset={6} className="klyp-PricingTierCard__infoPopover">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

// =====================================================================
// DiscountBreakdownTip — (i) popover next to the live price listing the
// applied discounts when an offer stack is active (design lead 2026-05-22 round 3).
// =====================================================================
//
// Same Tooltip primitive + visual treatment as the feature-level
// `InfoTip` above, but the body is a structured list (each line: label
// + N%) plus a "Total" sum at the bottom. The trigger sits flush next
// to the live price; hover/focus opens the tooltip with the breakdown.

function DiscountBreakdownTip({
  lines,
  onHintOpenChange,
}: {
  lines: ReadonlyArray<{ key: string; label: string; pct: number }>
  onHintOpenChange?: (isOpen: boolean) => void
}) {
  const { brandId } = useBrand()
  const cardCopy = CARD_COPY[brandId]
  const total = lines.reduce((sum, line) => sum + line.pct, 0)
  return (
    <Tooltip
      // Near-instant open per design feedback (the prior delay felt too slow). Was 300ms.
      delay={80}
      closeDelay={150}
      onOpenChange={onHintOpenChange}
    >
      {/* Reuse `__infoTip` chrome (NOT a bespoke `__discountTip` class): the
          standalone `__discountTip` trigger rule was deleted in SCSS on
          2026-05-23 (see PricingTierCard.scss comment) so the design lead's
          «возьми тултип как внизу» — both (i) triggers share one quiet,
          chrome-stripped glyph. Leaving `__discountTip` here fell back to RAC's
          native <button> UA box (the stray grey square). Body styles keep the
          `__discountTip*` names — only the trigger reuses `__infoTip`. */}
      <RACButton
        className="klyp-PricingTierCard__infoTip"
        aria-label={cardCopy.appliedAria}
        type="button"
      >
        <InfoCircleOutline width={14} height={14} aria-hidden />
      </RACButton>
      <TooltipContent side="top" sideOffset={6} className="klyp-PricingTierCard__infoPopover">
        <span className="klyp-PricingTierCard__discountTipBody">
          <span className="klyp-PricingTierCard__discountTipTitle">{cardCopy.appliedTitle}</span>
          <ul className="klyp-PricingTierCard__discountTipList">
            {lines.map((line) => (
              <li key={line.key} className="klyp-PricingTierCard__discountTipRow">
                <span>{line.label}</span>
                <span className="klyp-PricingTierCard__discountTipPct">−{line.pct}%</span>
              </li>
            ))}
          </ul>
          <span className="klyp-PricingTierCard__discountTipTotal">
            <span>{cardCopy.total}</span>
            <span className="klyp-PricingTierCard__discountTipPct">−{total}%</span>
          </span>
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

// =====================================================================
// PricingTierCard — Klyp brand molecule (Phase 2 — `/pricing` route, 2026-05-15)
// =====================================================================
//
// Single tier card used in the `/pricing` route's 4-card grid + as a
// standalone surface inside the marketing tier picker. Standalone — does
// NOT compose `@klyp/ui/Card` (per ARCHITECTURE §3.1: trying to layer the
// recommended bg/border swap + absolute `__badge` + features-list slot on
// top of `<Card>` would be 80% override / 20% Card — a contract leak).
//
// Visual contract (2026-05-20 hover stack — mirrors BalanceCard):
//   • Neutral (Starter / Creator) — `--color-bg-surface` bg, base 1px
//     ring `--color-border-default`. Hover layers a silver corner blob,
//     silver gradient hover-ring, `--fx-card-inset-glow-silver` bloom.
//   • Recommended (Creator Plus, `data-recommended="true"`) — same bg,
//     base 1px ring `--color-border-accent` (gold-300). Hover layers a
//     warm-gold corner blob with `plus-lighter` additive blend, gold
//     gradient hover-ring, `--fx-card-inset-glow-gold` bloom. Pairs with
//     the gold "Popular" badge (canonical `<Badge intent="featured">`).
//   • Studio (`data-tier="studio"`, no `recommended` flag) — same bg,
//     base 1px ring stays neutral (`--color-border-default`, same as
//     Starter / Creator). The Klyp blue identity surfaces ONLY on hover:
//     blue corner blob with `plus-lighter` blend, blue gradient hover-
//     ring, inline `color-mix` blue inset bloom. `--color-status-info`
//     = --blue-900 (#52a8ff). Studio gets the blue tint on hover without
//     the "Popular" badge — two independent signals.
//   • All ring layers across the three branches live at `inset: 0` with
//     `border-radius: inherit` via mask-composite, so the base ring and
//     the hover ring trace the card's outer corner pixel-perfectly — no
//     drift at the four corners.
//
// CTA is slot-injected (ARCHITECTURE §3.2):
//   • Recommended → `<MeshButton tone="gold" size="md">…</MeshButton>`
//   • Neutral     → caller passes a ghost / secondary control. The card
//     does not own button chrome.
//
// A11y (per react-aria semantics + Architect's spec):
//   • Root is `<article>` so each tier is a recognisable region for SR users
//     navigating with rotor.
//   • `aria-labelledby` points to a stable `useId()`-generated id on the
//     tier-name `<h3>` — SR users hear "Studio, article" entering the card.
//   • The injected CTA keeps its own a11y (RAC `<Button>` inside MeshButton
//     already provides keyboard / focus-visible / aria-disabled).
//   • The decorative divider is `aria-hidden` (visual only).
//   • The `CheckCircleBulk` icons in the features list are `aria-hidden` —
//     the adjacent label text is the SR announcement; the check is
//     redundant decoration for a sighted reader.

/**
 * 2026-05-20: Tier IDs updated to match canonical `internal pricing reference`
 * (см. `_handoff/PRICING-ROUTE-2026-05-15/CANONICAL-PRICING.md`):
 *   - `'free'` — default state without subscription (not a tier you choose)
 *   - `'starter'`, `'creator'`, `'creatorPlus'`, `'studio'` — 4 paid tiers
 *   - `'enterprise'` — kept for legacy mailto: CTA; not in canonical pricing
 *     (TODO design lead: confirm — drop or keep as 5th pseudo-tier?)
 */
export type PricingTierId = 'free' | 'starter' | 'creator' | 'creatorPlus' | 'studio' | 'enterprise'

/**
 * Visual palette identity — decoupled from `id`. Each tone maps to a set
 * of `--color-tier-mesh-*` semantic tokens (see `semantic.tokens.json`)
 * which drive the perpetual goo-mesh, the corner hover blob, the
 * `::after` hover ring, and the `--fx-card-inset-glow-*` bloom. Default
 * tone is derived from `id` via {@link DEFAULT_TIER_TONE}; callers can
 * override with the `tone` prop for embed / partner contexts.
 */
export type PricingTierTone = 'silver' | 'purple' | 'gold' | 'blue'

/**
 * Perpetual goo-mesh behaviour:
 *   • `'animated'` (default) — blobs drift via @keyframes.
 *   • `'static'` — blobs visible but `animation-play-state: paused`
 *     (auto-coerced from `'animated'` under `prefers-reduced-motion`).
 *   • `'off'` — `__mesh` hidden entirely; only the hover trio plays
 *     (BalanceCard-like quiet surface for embedded contexts).
 */
export type PricingTierMesh = 'animated' | 'static' | 'off'

/** Billing cadence — display hint, drives `data-billing` + conditional saveLine. */
export type PricingTierBillingPeriod = 'monthly' | 'annual'

/**
 * Optional pill rendered INSIDE the card frame at the top (above the tier
 * name). Independent from `recommended` (a card can be recommended without
 * a badge, or carry a badge without being the recommended tier). When the
 * `recommended` prop is true and no `badge` is passed, the card defaults
 * to `{ label: 'Popular', tone: 'gold' }`.
 *
 * Renders a canonical `<Badge>` from `@klyp/ui`. `tone` maps to the
 * Badge `intent` + `variant`:
 *   • `'gold'`    → `intent="gold"` + `variant="subtle"` (flat light gold) —
 *                   used for the auto-default "Popular" pill on recommended
 *                   tiers (Creator+). Replaced the metallic gold-gradient
 *                   `featured` look on 2026-05-20 per the design lead.
 *   • `'neutral'` → `intent="gray"` + `variant="subtle"` — used for
 *                   the gray "Current" pill on the user's currently-
 *                   active tier (Starter today, runtime per-user once
 *                   subscriptions land).
 *   • `'blue'`    → `intent="blue"` + `variant="subtle"` — reserved
 *                   for future use (e.g. "New" markers).
 *
 * See {@link TONE_TO_BADGE_PROPS} below for the resolved mapping.
 */
export interface PricingTierBadge {
  /** Visible label, e.g. `'Popular'` / `'New'` / `'Limited offer'`. */
  label: string
  /** Pill tone. Default: `'gold'` (the historical Most-Popular look). */
  tone?: 'gold' | 'neutral' | 'blue'
}

/**
 * `PricingTierBadge.tone` → Badge `intent` + `variant` mapping.
 * Centralised so JSX can render `<Badge {...TONE_TO_BADGE_PROPS[tone]}>`
 * without per-tone branching. Kept as a literal map (not a function) so
 * TypeScript can narrow exhaustively across the `tone` union.
 */
const TONE_TO_BADGE_PROPS: Record<
  NonNullable<PricingTierBadge['tone']>,
  { intent: BadgeIntent; variant?: BadgeVariant }
> = {
  gold: { intent: 'gold', variant: 'subtle' },
  neutral: { intent: 'gray', variant: 'subtle' },
  blue: { intent: 'blue', variant: 'subtle' },
}

/**
 * `id → tone` default map. Override per call via the `tone` prop on
 * `<PricingTierCard>` when the same `id` needs to wear a different
 * palette (e.g. Studio rendered in gold for a partner microsite).
 */
const DEFAULT_TIER_TONE: Record<PricingTierId, PricingTierTone> = {
  free: 'silver',
  starter: 'silver',
  creator: 'purple',
  creatorPlus: 'gold',
  studio: 'blue',
  enterprise: 'silver',
}

export interface PricingTierFeature {
  /** Single-line feature copy. Keep ≤60 chars to avoid wrap on the 4-col grid. */
  label: string
  /**
   * Optional secondary line rendered under `label` at smaller / muted
   * weight — for clarifiers like "Per month" or "fair use" that don't
   * fit on the main label without crowding.
   */
  note?: string
  /**
   * Optional tooltip copy. When present an info-circle "(i)" trigger is
   * rendered after the label; hover/focus reveals a RAC tooltip with the
   * string. Used for "fair-use" disclaimers and other context that doesn't
   * belong on the visible label.
   */
  tooltip?: string
  /**
   * When `true`, the feature renders with `data-emphasis="true"` — used for
   * "What you get" headline rows (videos / images / text runs) so they read
   * with stronger visual weight than the rest of the list (seats, support).
   */
  emphasis?: boolean
  /**
   * When `false`, the row renders as UNAVAILABLE on this tier — muted grey
   * text + a grey `CloseCircle` (✕) bullet instead of the `CheckCircle`
   * tick. Used to show higher-tier features greyed-out on lower tiers so
   * every card shares the same row order. Default (`undefined` / `true`) →
   * available, normal tick. SCSS hook: `[data-available='false']`.
   */
  available?: boolean
}

/**
 * Per-tier model entry rendered under the features list. Each model row is
 * a name + a small info-circle trigger that reveals a short description
 * tooltip on hover/focus. Models are typically the same across tiers —
 * differentiation lives in the token allowance + headline counts.
 */
export interface PricingTierModel {
  /** Display name — e.g. "Claude Opus 4.7", "Seedance 2.0". */
  name: string
  /** Tooltip copy shown on the info-circle trigger. */
  tooltip: string
}

export interface PricingTierCardProps {
  /** Tier identifier — used by parent for analytics + CTA routing. Drives
   *  the default `tone` via {@link DEFAULT_TIER_TONE} unless overridden. */
  id: PricingTierId
  /** Optional DOM `id` attribute for the root `<article>` — used as a
   *  scroll-anchor target (e.g. `tier-creatorPlus` for MarketingHeader's
   *  "Get started" CTA scroll-into-view). Separate from the tier
   *  identifier above. */
  htmlId?: string
  /** Visual palette override. Default: derived from `id`. */
  tone?: PricingTierTone
  /** Perpetual goo-mesh state. Default `'animated'`; auto-coerced to
   *  `'static'` under `prefers-reduced-motion` regardless of caller. */
  mesh?: PricingTierMesh
  /** Tier display name. e.g. `Creator`, `Studio`. */
  name: string
  /** One-sentence pitch under the name. Min-height locked for grid alignment. */
  pitch: string
  /**
   * Price shown big. Pass `'$0'`, `'$15'`, `'Custom'`, etc. as a string so the
   * component does not own currency formatting.
   */
  price: string
  /**
   * Optional pre-discount price string. When set, the card renders a small
   * struck-through line above `price` showing the un-discounted figure —
   * used when an auth-aware discount stack has reduced the headline price
   * (design lead 2026-05-22, DEV-187). When omitted, no strike line is rendered.
   */
  priceOriginal?: string
  /** Primary cadence line shown next to the price (e.g. `'/month'`). */
  priceUnit?: string
  /** Optional secondary cadence line stacked under `priceUnit` (e.g.
   *  `'billed annually'`). Two-line Magnific-style label so the cadence
   *  block visually matches the height of the big price digits. */
  priceUnitSecondary?: string
  /**
   * Optional savings copy under price. Auto-hidden when
   * `billingPeriod === 'monthly'` (annual-only savings shouldn't render
   * on a monthly view even if the caller passes the string).
   */
  saveLine?: string
  /**
   * Optional renew sub-line displayed UNDER `saveLine` when a one-shot
   * offer (FP / EB / Referral) has reduced the live price. Example:
   * `'Renews at $169 next month'` (monthly) / `'Renews at $169/mo
   * after year 1'` (annual). When omitted, no extra row renders.
   * Computed by `resolveTierPrice` per design lead 2026-05-22 round 3.
   */
  renewLine?: string
  /**
   * Optional CTA state — derived from (activeSubscription, this tier)
   * in the page consumer. When `'current'`, the card's `__ctaSlot` paints
   * a disabled visual (lower opacity, no hover-wake). Caller still owns
   * the actual button content (passed via `cta`); the state attribute
   * here is for CSS targeting only.
   */
  ctaState?: 'default' | 'current' | 'upgrade' | 'downgrade'
  /**
   * Optional list of currently-applied discounts shown inside an
   * (i) popover next to the live price. Empty / undefined → no (i)
   * trigger. Each entry is one line in the popover. Caller (the
   * pricing page) generates this via `getDiscountBreakdown(active)`.
   */
  discountBreakdown?: ReadonlyArray<{ key: string; label: string; pct: number }>
  /** Billing cadence — drives `data-billing` attr + conditional saveLine
   *  render. Display-hint only; does NOT format `price` (parent owns that).
   *  Default: `'annual'` (matches the page-level toggle default). */
  billingPeriod?: PricingTierBillingPeriod
  /** Token-allowance row. e.g. `{ amount: '25,000', unit: 'units / month' }`. */
  allowance: { amount: string; unit: string }
  /**
   * Optional concrete examples shown inside the allowance panel below the
   * headline — Higgsfield-style "what does this number buy you" hint. Each
   * string is a single line, no icon, muted color. Typical content:
   * `'≈ 240 Nano Banana Pro images'`, `'≈ 12 Seedance 2.0 videos'`. Used
   * by the page consumer to anchor abstract token counts to recognisable
   * model outputs. When the card also has a `slider`, examples and slider
   * stack inside the panel — the slider goes below the examples. */
  allowanceExamples?: readonly string[]
  /** Heading above the features list. e.g. `Includes`, `Everything in Free, plus`. */
  featuresHead: string
  /** Bulleted features list. Cap suggested to 4 items per card. */
  features: readonly PricingTierFeature[]
  /**
   * Optional "Models" section rendered below the features list. Heading
   * "Models" + a vertical list of model names; each row carries an
   * info-circle (i) trigger that reveals a short description tooltip.
   * Same list across tiers — Klyp's pitch is "every model, every tier".
   */
  models?: readonly PricingTierModel[]
  /**
   * Render the recommended treatment — gold tone + default "Popular"
   * badge. Independent of `badge` (a card can be recommended without
   * setting a badge prop; we default the badge in that case).
   */
  recommended?: boolean
  /**
   * Optional pill rendered inside the card at the top of the content flow.
   * When omitted and `recommended` is true, defaults to
   * `{ label: 'Popular', tone: 'gold' }`. Pass `null` to suppress the
   * default badge even when `recommended` is true.
   */
  badge?: PricingTierBadge | null
  /**
   * **CTA slot.** Caller injects the action element — for the recommended
   * tier this is typically `<MeshButton tone="gold" size="md">…</MeshButton>`;
   * for neutral tiers an `<a>` / RAC `<Button>` with the caller's preferred
   * variant. The slot is intentionally open — never bake a hardcoded button
   * inside this component.
   */
  cta: ReactNode
  /**
   * Optional discrete-stop slider. When provided, the card renders
   * `<AllowanceSlider>` between the CTA slot and the tokens row. The parent
   * still owns the active stop index; `price` / `allowance` reflect the
   * active stop's resolved values (see `resolveTierPrice` /
   * `resolveTierAllowance` helpers in `apps/web/src/lib/pricing-tiers.ts`).
   */
  slider?: {
    stops: readonly AllowanceSliderStop[]
    value: number
    onChange: (stopIndex: number) => void
  }
  /**
   * Optional static allowance read-out shown when this tier has NO `slider`
   * — a filled track + label (e.g. "Fixed · 1,200 tokens/mo") that rhymes
   * with the slider tier so all cards keep equal height. `fillPercent`
   * defaults to 100 (full/fixed); a logged-in usage view can later pass a
   * remaining % + "N left" label. Ignored when `slider` is set.
   */
  allowanceReadout?: { fillPercent?: number; label: string }
  /**
   * Optional "manage" node injected into the allowance panel's foot slot,
   * REPLACING the slider (and the static readout). Used for an active Studio
   * subscription where the card swaps its buy-slider for top-up actions
   * (e.g. two buttons → upgrade / one-time pack). Takes precedence over
   * `slider` and `allowanceReadout`. The card stays generic — the consumer
   * owns the node's content and behaviour.
   */
  manageSlot?: ReactNode
  /** Optional className appended to the root `<article>`. */
  className?: string
}

/**
 * `<PricingTierCard>` — single tier card with neutral / recommended states.
 *
 * Layout (top → bottom):
 *   1. `__head` — flex column:
 *        a. `__nameRow` — `<h3>` tier name (flex-grow, LEFT) + optional
 *           `<Badge intent="featured">` ("Popular", content-sized, RIGHT).
 *           Single adaptive row (design lead 2026-05-21).
 *        b. `__pitch` — paragraph, min-height locked for grid alignment.
 *   2. `__priceBlock` — big price + cadence + optional save-line reserve.
 *   3. `__ctaSlot` — caller-injected CTA.
 *   4. `<AllowancePanel>` — amount + unit + optional examples + optional slider.
 *   5. `__divider` — 1px hairline below the locked `__upper` block.
 *   6. `__featuresHead` + `__features` list with `CheckCircleBulk`
 *      bullets — Iconsax duo-tone tick-circle, uniform white across
 *      all tiers (design lead 2026-05-21: ranked check colour out of the tier-
 *      identity stack; mesh + hover trio + badge carry that signal).
 *
 * Hover: card translates `-2px` Y over `--duration-normal` (`--easing-standard`).
 * Disabled inside `@media (prefers-reduced-motion: reduce)` — see SCSS.
 */
export function PricingTierCard({
  id,
  htmlId,
  tone,
  mesh = 'animated',
  name,
  pitch,
  price,
  priceOriginal,
  priceUnit,
  priceUnitSecondary,
  saveLine: _saveLine,
  renewLine,
  ctaState = 'default',
  discountBreakdown,
  billingPeriod = 'annual',
  allowance,
  allowanceExamples,
  featuresHead,
  features,
  models,
  recommended = false,
  badge,
  cta,
  slider,
  allowanceReadout,
  manageSlot,
  className,
}: PricingTierCardProps) {
  const { brandId } = useBrand()
  const cardCopy = CARD_COPY[brandId]
  // `useId()` survives SSR / hydration mismatches — the same article-label
  // pairing is generated on server + client. A raw `${id}-title` would also
  // work but breaks if the same tier is rendered twice on a page (e.g.
  // story grid demos). useId() guarantees uniqueness.
  const titleId = useId()

  // Per-instance random seed for the perpetual goo-mesh — 4 blobs (a..d),
  // each with its own `delay` (-30s..0s = phase shift) and `mult`
  // (0.90..1.10 = ±10% duration jitter). Different seed per card so
  // neighbouring tiers in the 4-card row don't drift in lockstep.
  // Trajectory shape lives in SCSS keyframes — the seed is purely temporal.
  const seed = useMemo(createMeshSeed, [])
  // `meshVars` MUST be memoised — otherwise a fresh object literal on every
  // render busts the `style` prop diff on the article and forces a DOM
  // attribute write per render across all 4 cards on every toggle flip.
  const meshVars = useMemo<CSSProperties>(
    () =>
      ({
        '--blob-a-delay': `${seed.delays[0]}s`,
        '--blob-b-delay': `${seed.delays[1]}s`,
        '--blob-c-delay': `${seed.delays[2]}s`,
        '--blob-d-delay': `${seed.delays[3]}s`,
        '--blob-a-mult': seed.mults[0],
        '--blob-b-mult': seed.mults[1],
        '--blob-c-mult': seed.mults[2],
        '--blob-d-mult': seed.mults[3],
      }) as CSSProperties,
    [seed],
  )

  // Resolve the effective visual state at the article level:
  //   • tone        — explicit prop wins, otherwise mapped from id.
  //   • effectiveMesh — coerce caller's `'animated'` to `'static'` under
  //                     `prefers-reduced-motion` (a11y floor — never
  //                     animates against the user's OS setting).
  //   • resolvedBadge — explicit prop wins; recommended defaults to gold
  //                     "Popular"; `badge: null` suppresses the
  //                     default even when recommended.
  const resolvedTone: PricingTierTone = tone ?? DEFAULT_TIER_TONE[id]
  const prefersReducedMotion = useReducedMotion()
  const effectiveMesh: PricingTierMesh =
    prefersReducedMotion && mesh === 'animated' ? 'static' : mesh
  // `priceOriginal` is set by `resolveTierPrice` only when the live price
  // differs from the monthly base (i.e. on annual OR when an offer stack
  // discounted the price). PriceTicker owns the strike show/hide animation.
  const strikeValue = priceOriginal && priceOriginal !== price ? priceOriginal : undefined

  const resolvedBadge: PricingTierBadge | null =
    badge === null
      ? null
      : (badge ?? (recommended ? { label: cardCopy.popular, tone: 'gold' } : null))

  const composed = ['klyp-PricingTierCard', className].filter(Boolean).join(' ')

  const [hintOpenCount, setHintOpenCount] = useState(0)
  const handleHintOpenChange = useCallback((isOpen: boolean) => {
    setHintOpenCount((count) => Math.max(0, count + (isOpen ? 1 : -1)))
  }, [])

  return (
    <article
      className={composed}
      id={htmlId}
      data-hint-open={hintOpenCount > 0 ? 'true' : undefined}
      // `data-tier` stays for analytics hooks / e2e selectors / future
      // marketing tagging. `data-tone` drives the visual palette in SCSS
      // (decoupled from id so the same Studio card can render in gold
      // for a partner microsite, etc.). `data-mesh` and `data-billing`
      // drive the perpetual mesh state branches + saveLine visibility.
      data-tier={id}
      data-tone={resolvedTone}
      data-mesh={effectiveMesh}
      data-billing={billingPeriod}
      data-recommended={recommended ? 'true' : undefined}
      data-brand={brandId}
      aria-labelledby={titleId}
      // Inline style is per-instance CSS variable seed (random delays /
      // mults for the 4 mesh blobs a..d). Values are randomised at mount
      // via `createMeshSeed()` — can't live in static SCSS. Same pattern
      // as MeshButton.tsx + the original pricing-mesh-tier-card.tsx that
      // this canonical card absorbed on 2026-05-20.
      style={meshVars}
    >
      <PricingTierCardGooFilter />
      {/* `__blobClip` (absolute, overflow:hidden, inherits radius) clips
       * BOTH the perpetual goo-mesh AND the corner hover blob to the card's
       * rounded rect. Since 2026-05-21 the badge moved INSIDE the card (was
       * absolute at top:-10px outside the frame); overflow:hidden on the
       * article would still clip the hover ring + blob if applied there, so
       * we keep the clipping confined to this wrapper. The two `::before` /
       * `::after` rings use mask-composite (self-clipping), so they don't
       * need this wrapper. Pattern absorbed from `pricing-mesh-tier-card`
       * (universal across tiers as of 2026-05-20). */}
      <span className="klyp-PricingTierCard__blobClip" aria-hidden>
        {/* Perpetual goo-mesh — 4 LARGE absolutely-positioned `__blob`
         * elements inside `__mesh` (which holds the goo filter + post-
         * blur + `container-type: size` for `cqi` / `cqb` units). Each
         * blob is 140-150cqi (≈500-540px on 360w card) with its CENTRE
         * anchored ON a card edge → half-blob visible inside the card,
         * half clipped by `__blobClip overflow:hidden` (the lemon-slice
         * effect per design lead 2026-05-23 «как долька лимона»). Palette per
         * `[data-tone]` (silver / purple / gold / blue); one blob (c)
         * is the LIGHT tone the design lead explicitly named. Drift ±15cqi/cqb,
         * durations 50-56s. */}
        <span className="klyp-PricingTierCard__mesh">
          <span className="klyp-PricingTierCard__blob" data-blob="a" />
          <span className="klyp-PricingTierCard__blob" data-blob="b" />
          <span className="klyp-PricingTierCard__blob" data-blob="c" />
          <span className="klyp-PricingTierCard__blob" data-blob="d" />
        </span>
        {/* Corner hover blob — fades in on hover, sibling of `__mesh` so it
         * stays outside the goo filter (which would otherwise warp its
         * shape). Same `__blobClip` overflow:hidden clips it to the card. */}
        <span className="klyp-PricingTierCard__hoverBlob" />
      </span>

      {/* Badge is meaningful UX info ("Popular" → Creator Plus) — NOT
       *  decorative. No aria-hidden so SR users hear the badge label as they
       *  enter the card. (Was incorrectly aria-hidden in an earlier revision
       *  — caught by web-design-guidelines review 2026-05-20.)
       *
       *  Refactored 2026-05-21: now uses the canonical `<Badge intent="featured">`
       *  from `@klyp/ui` (gold gradient pill) instead of a bespoke `__badge`
       *  span. Sits INSIDE the card frame on the SAME ROW as the tier name —
       *  name on the left (flex-grow), badge on the right (content-sized),
       *  one adaptive row (design lead 2026-05-21: «бадж и заголовок в одну секцию
       *  с адаптивной шириной — бадж справа, название слева»). Previous
       *  revision had badge as a standalone slot above `__head`; the current
       *  in-row placement reads cleaner and frees a row of vertical space.
       *
       *  `resolvedBadge.tone` is intentionally ignored here — the only tier
       *  that surfaces a badge today is Creator Plus (`recommended`), and the
       *  featured intent's gold gradient is the canonical Most-Popular look.
       *  If/when other tiers ship custom-toned badges, map `tone` → Badge
       *  `intent` (gold → featured, blue → blue, neutral → inverted). */}
      <div className="klyp-PricingTierCard__upper">
        <header className="klyp-PricingTierCard__head">
          <div className="klyp-PricingTierCard__nameRow">
            <h3 id={titleId} className="klyp-PricingTierCard__name">
              {name}
            </h3>
            {resolvedBadge && (
              <Badge {...TONE_TO_BADGE_PROPS[resolvedBadge.tone ?? 'gold']}>
                {resolvedBadge.label}
              </Badge>
            )}
          </div>
          <p className="klyp-PricingTierCard__pitch">{pitch}</p>
        </header>

        <div className="klyp-PricingTierCard__priceBlock">
          {/* Price row — PriceTicker owns the strike chip + live-price
           *  crossfade (Motion v12). aria-live is intentionally NOT on the
           *  price span — the page-level __billingAnnouncer in
           *  pricing-page.tsx is the single SR voice per toggle flip. */}
          <div className="klyp-PricingTierCard__priceBundle">
            <PriceTicker
              className="klyp-PricingTierCard__price"
              value={price}
              previousValue={strikeValue}
            />
            {priceUnit && (
              // `layout="position"` — when the PriceTicker grows (strike
              // chip enters) or shrinks (strike chip exits), the unit
              // column's flex position shifts horizontally. Motion FLIP
              // animates the shift at the same 220ms cadence as
              // PriceTicker's internal layout so the whole row glides as
              // one piece instead of priceUnit teleporting after the chip
              // settles.
              <motion.div
                layout="position"
                transition={{ layout: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
                className="klyp-PricingTierCard__priceUnit"
              >
                <span className="klyp-PricingTierCard__priceUnitLine">{priceUnit}</span>
                {priceUnitSecondary ? (
                  <span className="klyp-PricingTierCard__priceUnitLine">{priceUnitSecondary}</span>
                ) : null}
              </motion.div>
            )}
          </div>
          {renewLine && (
            // Single info row beneath the price — always shows the
            // renew copy ("Renews at $X next month" / "Renews at $X/mo
            // after year 1") regardless of billing period or offer
            // state. design lead 2026-05-23: «"Includes 8,000 tokens / month"
            // и "Save $12/yr vs monthly" везде заменить на ту [Renews]».
            // (i) popover with the discount breakdown sits in the same
            // row when an offer stack is active.
            <div
              className="klyp-PricingTierCard__saveRow"
              data-variant="renew"
              data-has-offers={
                discountBreakdown && discountBreakdown.length > 0 ? 'true' : undefined
              }
            >
              <span className="klyp-PricingTierCard__saveRowText">{renewLine}</span>
              {discountBreakdown && discountBreakdown.length > 0 && (
                <DiscountBreakdownTip
                  lines={discountBreakdown}
                  // Use the shared clamped `handleHintOpenChange` (NOT an inline
                  // unclamped closure): both feature/model InfoTips and this
                  // discount tip write the SAME `hintOpenCount` cell, so the
                  // increment/decrement must be identical + `Math.max(0,…)`-
                  // clamped, else an unbalanced open/close could drive the count
                  // negative (hover-lift drops mid-popover) or leak +1 (card
                  // stuck lifted).
                  onHintOpenChange={handleHintOpenChange}
                />
              )}
            </div>
          )}
        </div>

        <div className="klyp-PricingTierCard__ctaSlot" data-cta-state={ctaState}>
          {cta}
        </div>

        {/* Allowance panel — extracted to `<AllowancePanel>` brand molecule
         *  (2026-05-23). Slider injected via slot so this card doesn't own
         *  AllowanceSlider chrome internally; tickDisplay heuristic
         *  (endpoints-only when stops > 10) stays here because it's a
         *  pricing-card concern, not a panel concern. */}
        <AllowancePanel
          amount={allowance.amount}
          unit={allowance.unit}
          examples={allowanceExamples}
          readout={manageSlot ? undefined : allowanceReadout}
          slider={
            manageSlot ??
            (slider && (
              <AllowanceSlider
                stops={slider.stops}
                value={slider.value}
                onChange={slider.onChange}
                ariaLabel={`${name} token allowance`}
                tickDisplay={slider.stops.length > 10 ? 'endpoints' : 'all'}
              />
            ))
          }
        />
      </div>

      <div className="klyp-PricingTierCard__divider" aria-hidden />

      <span className="klyp-PricingTierCard__featuresHead">{featuresHead}</span>
      <ul className="klyp-PricingTierCard__features">
        {features.map((f, i) => (
          <li
            // Index suffix guards against duplicate labels in future
            // authoring. Static data, so index is stable for this list.
            key={`${f.label}-${i}`}
            className="klyp-PricingTierCard__feature"
            data-emphasis={f.emphasis ? 'true' : undefined}
            data-available={f.available === false ? 'false' : undefined}
          >
            {f.available === false ? (
              <CloseCircleBulk aria-hidden width={16} height={16} />
            ) : (
              <CheckCircleBulk aria-hidden width={16} height={16} />
            )}
            {f.note || f.tooltip ? (
              <span className="klyp-PricingTierCard__featureBody">
                <span className="klyp-PricingTierCard__featureLabelLine">
                  <span>{f.label}</span>
                  {f.tooltip && (
                    <InfoTip
                      content={f.tooltip}
                      // Brand-aware label (was hardcoded English `More info: …`) —
                      // matches the models-list InfoTip below; on Unreals this
                      // announces «Подробнее: …» to screen readers, not English.
                      label={cardCopy.moreInfo(f.label)}
                      onHintOpenChange={handleHintOpenChange}
                    />
                  )}
                </span>
                {f.note && <span className="klyp-PricingTierCard__featureNote">{f.note}</span>}
              </span>
            ) : (
              <span>{f.label}</span>
            )}
          </li>
        ))}
      </ul>

      {models && models.length > 0 && (
        <>
          {/* Models section head — mirrors `__featuresHead` typographically
           *  (per design feedback: a "what you will get"-style heading
           *  above the models list). Copy hardcoded — same string
           *  across all tiers since Klyp's pitch is "every model, every
           *  tier"; bumping a prop would be over-engineering for a one-
           *  line constant. */}
          <span className="klyp-PricingTierCard__modelsHead">{cardCopy.accessToModels}</span>
          <ul className="klyp-PricingTierCard__modelsList" aria-label={cardCopy.models}>
            {models.map((m, i) => (
              <li key={`${m.name}-${i}`} className="klyp-PricingTierCard__model">
                <CheckCircleBulk aria-hidden width={16} height={16} />
                <span>{m.name}</span>
                <InfoTip
                  content={m.tooltip}
                  label={cardCopy.moreInfo(m.name)}
                  onHintOpenChange={handleHintOpenChange}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}

// `memo()` — without this, all 4 tier cards re-render on every toggle flip
// even when their own props are unchanged (e.g. flipping billingPeriod only
// changes Studio's price, but Starter / Creator / Creator + re-rendered too).
// Plain shallow comparison is correct here — every prop is a primitive or a
// stable reference (parent uses `useMemo` to stabilise `slider.onChange` +
// `cta` etc., see pricing-page.tsx).
export default memo(PricingTierCard)
