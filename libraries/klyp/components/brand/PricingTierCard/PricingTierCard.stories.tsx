import type { Meta, StoryObj } from '../__shared/stories-types'
import { MeshButton } from '../MeshButton'
import { TierGlyph } from '../TierGlyph'
import {
  PricingTierCard,
  type PricingTierCardProps,
  type PricingTierModel,
} from './PricingTierCard'
import './PricingTierCard.stories.scss'

// =====================================================================
// Catalog story rendering note
// =====================================================================
//
// The `/components/<slug>` catalog renders stories via
// `createElement(meta.component, args)` (see `StoryCard.tsx:62`) — it
// does NOT apply meta-level `decorators`. Each story therefore wraps
// the card in a `render: ...` function with the `.klyp-PricingTierCard-story__frame`
// fixed-width class (360px, defined in `PricingTierCard.stories.scss`)
// so the preview matches the production grid column width on `/pricing`
// instead of stretching to the full stage width.

function renderTierCard(args: PricingTierCardProps) {
  return (
    <div className="klyp-PricingTierCard-story__frame">
      <PricingTierCard {...args} />
    </div>
  )
}

// =====================================================================
// Canonical model lineup (internal pricing reference → "Models Price List")
// =====================================================================
//
// Mirrors `PRICING_TIER_MODELS` in `apps/web/src/lib/pricing-tiers.ts`.
// Inlined locally because `@klyp/brand` cannot import from
// `apps/web/src/lib` (tier rule: brand layer is upstream of feature
// layer). When the canonical list shifts, update this constant alongside.

const CANONICAL_MODELS: readonly PricingTierModel[] = [
  {
    name: 'Claude Opus 4.7',
    tooltip: 'Anthropic premium reasoning model — used for script, scene logic, agent loops.',
  },
  {
    name: 'GPT-5.4',
    tooltip: 'OpenAI flagship text model — used for marketing copy, chat, structured outputs.',
  },
  {
    name: 'Gemini 3.5',
    tooltip: 'Google image + multimodal model — used for stills, references, image editing.',
  },
  {
    name: 'Seedance 2.0',
    tooltip: 'ByteDance text-to-video — used for short clips, motion, scene generation.',
  },
  {
    name: 'Kling 3.0',
    tooltip: 'Kuaishou text-to-video — used for stylised clips, cinematic motion.',
  },
]

// =====================================================================
// Canonical "Creator" baseline — used as `meta.args`
// =====================================================================
//
// Mirrors the `creator` entry in `apps/web/src/lib/pricing-tiers.ts` so
// the catalog preview matches the production `/pricing` Creator card
// 1:1 (price, allowance, features w/ emphasis, models, tooltip copy).

const meta = {
  component: PricingTierCard,
  title: 'Brand / Molecules / PricingTierCard',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Single pricing tier card used in the `/pricing` route 4-card grid. Four independent axes — `id` (analytics tag), `tone` (silver/purple/gold/blue palette, defaults from id), `mesh` (animated/static/off perpetual goo-mesh), `billingPeriod` (monthly/annual). `recommended` auto-renders a flat light-gold "Popular" `<Badge intent="gold" variant="subtle">`. CTA is slot-injected — on the live `/pricing` grid EVERY tier passes a `<MeshButton tone={...} size="lg">` with a leading `<TierGlyph>` glyph; the tone matches the card palette (silver→`neutral`, purple, gold, blue). The card never imports MeshButton/TierGlyph itself — they arrive through the `cta` slot. Optional `slider` (discrete token-allowance stops), `allowanceExamples` (Higgsfield-style "what this buys you" lines), and `models` (per-tier model lineup with info tooltips) round out the molecule.',
      },
    },
  },
  args: {
    id: 'creator',
    name: 'Creator',
    pitch: 'For solo creators who ship reels and shorts weekly.',
    price: '$26.10',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $34.80/yr vs monthly',
    billingPeriod: 'annual',
    allowance: { amount: '1,200', unit: 'tokens / month' },
    allowanceExamples: ['≈ 150 Gemini 3.5 images', '≈ 6 Seedance 2.0 videos'],
    featuresHead: 'What you will get / Per month',
    features: [
      { label: 'Access to all models & tools' },
      { label: '≈ 150 Gemini 3.5 images', emphasis: true },
      { label: '≈ 6 Seedance 2.0 videos', emphasis: true },
      {
        label: 'Up to ∞ text generations',
        tooltip:
          'Fair use — Claude / GPT chat is unmetered for normal usage. Abusive automated traffic may be rate-limited.',
      },
    ],
    models: CANONICAL_MODELS,
    recommended: false,
    // CTA labels across every story mirror the canonical `tier.ctaLabel`
    // values in `apps/web/src/lib/pricing-tiers.ts` (TIER_COPY.*.ctaLabel) so
    // the catalog preview reads 1:1 with the live `/pricing` grid:
    //   starter → "Get started", creator → "Become a creator",
    //   creatorPlus → "Build your serial", studio → "Run a studio".
    cta: (
      <MeshButton tone="purple" size="lg">
        <TierGlyph tier="creator" />
        Become a creator
      </MeshButton>
    ),
  },
} satisfies Meta<typeof PricingTierCard>

export default meta
type Story = StoryObj<typeof meta>

// ===========================================================================
// 1. Default — Creator tier (purple tone, no slider, secondary CTA)
// ===========================================================================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The neutral baseline — Creator tier, purple tone (resolved from `id="creator"` via `DEFAULT_TIER_TONE`). Perpetual purple goo-mesh, neutral rest-state ring, hover surfaces the purple identity (corner blob + ring + inset glow). CTA is a `<MeshButton tone="purple" size="lg">` with a leading `<TierGlyph tier="creator">` (same component the live `/pricing` Creator card renders); no slider, fixed 1,200 token allowance.',
      },
    },
  },
  render: renderTierCard,
}

// ===========================================================================
// 2. Recommended — Creator + tier (gold tone, slider, MeshButton, badge)
// ===========================================================================

export const Recommended: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The recommended treatment — `recommended={true}` auto-renders a flat light-gold "Popular" `<Badge intent="gold" variant="subtle">` next to the tier name. Tone resolves to `gold` (via `id="creatorPlus"` default), so the perpetual mesh, hover blob, hover ring, and inset glow all paint warm gold. CTA is `<MeshButton tone="gold" size="lg">` with a leading `<TierGlyph tier="creatorPlus">` — moment-of-truth click target carries the premium goo-mesh. Fixed 4,500-token allowance (no slider on Creator + per 2026-05-21 sync).',
      },
    },
  },
  args: {
    id: 'creatorPlus',
    name: 'Creator +',
    pitch: 'When weekly drops turn into a steady weekly serial.',
    price: '$89.10',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $118.80/yr vs monthly',
    allowance: { amount: '4,500', unit: 'tokens / month' },
    allowanceExamples: undefined,
    features: [
      { label: 'Access to all models & tools' },
      { label: '≈ 560 Gemini 3.5 images', emphasis: true },
      { label: '≈ 22 Seedance 2.0 videos', emphasis: true },
      {
        label: 'Up to ∞ text generations',
        tooltip:
          'Fair use — Claude / GPT chat is unmetered for normal usage. Abusive automated traffic may be rate-limited.',
      },
    ],
    recommended: true,
    cta: (
      <MeshButton tone="gold" size="lg">
        <TierGlyph tier="creatorPlus" />
        Build your serial
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 3. Starter — silver tone, "Current" gray badge, no slider
// ===========================================================================

export const Starter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The entry tier — silver tone (resolved from `id="starter"`). Carries a gray "Current" `<Badge intent="gray" variant="subtle">` (mock — once auth lands, this becomes runtime-resolved per user). Smallest token allowance (300/mo) so allowance examples are small whole numbers — anchors the abstract count to recognisable model outputs.',
      },
    },
  },
  args: {
    id: 'starter',
    name: 'Starter',
    pitch: 'Dip your toe in — small monthly bundle, every model unlocked.',
    price: '$8.99',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $12/yr vs monthly',
    allowance: { amount: '300', unit: 'tokens / month' },
    allowanceExamples: ['≈ 35 Gemini 3.5 images', '≈ 2 Seedance 2.0 videos'],
    features: [
      { label: 'Access to all models & tools' },
      { label: '≈ 35 Gemini 3.5 images', emphasis: true },
      { label: '≈ 2 Seedance 2.0 videos', emphasis: true },
      {
        label: 'Up to ∞ text generations',
        tooltip:
          'Fair use — Claude / GPT chat is unmetered for normal usage. Abusive automated traffic may be rate-limited.',
      },
    ],
    badge: { label: 'Current', tone: 'neutral' },
    cta: (
      <MeshButton tone="neutral" size="lg">
        <TierGlyph tier="starter" />
        Get started
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 4. Studio — blue tone, 4-stop slider, large allowance
// ===========================================================================
//
// Mirror of production Studio configuration (design lead 2026-05-22 PM, screenshot
// data): 4 stops from 8,000 → 14,000 tokens at 2,000-token increments with
// non-linear per-step pricing ($30/$40/$30). PricingTierCard renders each
// stop as a labelled tick (`tickDisplay='all'` — `stops.length <= 10`).

const STUDIO_STORY_STOPS = [
  {
    tokens: 8000,
    priceMonthly: { price: '$169', priceUnit: '/ month' },
    priceAnnual: {
      price: '$152.10',
      priceUnit: '/ mo · annual',
      saveLine: 'Save $202.80/yr vs monthly',
    },
  },
  {
    tokens: 10000,
    priceMonthly: { price: '$199', priceUnit: '/ month' },
    priceAnnual: {
      price: '$179.10',
      priceUnit: '/ mo · annual',
      saveLine: 'Save $238.80/yr vs monthly',
    },
  },
  {
    tokens: 12000,
    priceMonthly: { price: '$239', priceUnit: '/ month' },
    priceAnnual: {
      price: '$215.10',
      priceUnit: '/ mo · annual',
      saveLine: 'Save $286.80/yr vs monthly',
    },
  },
  {
    tokens: 14000,
    priceMonthly: { price: '$269', priceUnit: '/ month' },
    priceAnnual: {
      price: '$242.10',
      priceUnit: '/ mo · annual',
      saveLine: 'Save $322.80/yr vs monthly',
    },
  },
]

export const Studio: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The team tier — blue tone (resolved from `id="studio"`). 4-stop slider (8,000 → 14,000 tokens, $169/$199/$239/$269 per stop). All stops render labelled ticks because `stops.length <= 10`. Tone-identity surfaces only on hover (blue corner blob + ring + inset glow); rest-state ring is neutral.',
      },
    },
  },
  args: {
    id: 'studio',
    name: 'Studio',
    pitch: 'For small teams producing serial content with frequent iterations.',
    price: '$152.10',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $202.80/yr vs monthly',
    allowance: { amount: '8,000', unit: 'tokens / month' },
    allowanceExamples: undefined,
    features: [
      { label: 'Access to all models & tools' },
      { label: '≈ 1,000 Gemini 3.5 images', emphasis: true },
      { label: '≈ 40 Seedance 2.0 videos', emphasis: true },
      { label: 'Publish to Streaming App' },
      { label: '3 collaborator seats included' },
    ],
    slider: {
      stops: STUDIO_STORY_STOPS,
      value: 0,
      onChange: () => {},
    },
    cta: (
      <MeshButton tone="blue" size="lg">
        <TierGlyph tier="studio" />
        Run a studio
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 5. MeshStatic — perpetual blobs frozen (no @keyframes drift)
// ===========================================================================

export const MeshStatic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`mesh="static"` — the per-tone goo-mesh palette stays visible but `animation-play-state: paused`. Per-instance random `delay` still applies, so a frozen composition differs between cards in a row instead of being identical lockstep. This is the automatic fallback under `prefers-reduced-motion: reduce` (card coerces `animated` → `static` regardless of caller).',
      },
    },
  },
  args: {
    mesh: 'static',
  },
  render: renderTierCard,
}

// ===========================================================================
// 6. MeshOff — no perpetual mesh, only hover trio
// ===========================================================================

export const MeshOff: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`mesh="off"` — hides the perpetual `__mesh` layer entirely; only the hover trio (corner blob + colored `::after` ring + inset glow) plays on `:hover`. Use this for embedded contexts (in-app upgrade prompts, profile menu) where the animated mesh would compete with surrounding UI.',
      },
    },
  },
  args: {
    mesh: 'off',
  },
  render: renderTierCard,
}

// ===========================================================================
// 7. Monthly billing — saveLine auto-hidden, fallback "Includes N tokens"
// ===========================================================================

export const Monthly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`billingPeriod="monthly"` — even though `saveLine` is provided, the card replaces it with an `Includes {amount} {unit}` line (annual-only savings shouldn\'t advertise on a monthly view). The slot still renders (no `visibility: hidden` placeholder) so toggling between billing periods does not jump the layout — Motion swaps the text in place.',
      },
    },
  },
  args: {
    billingPeriod: 'monthly',
    price: '$29',
    priceUnit: '/ month',
  },
  render: renderTierCard,
}

// ===========================================================================
// 8. CustomBadge — independent of `recommended`
// ===========================================================================

export const CustomBadge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`badge` is independent from `recommended`. Pass `{ label, tone }` to surface any pill next to the tier name — e.g. a "New" badge in blue to flag a fresh launch without claiming "Popular". Pass `badge={null}` to suppress the default badge even when `recommended` is true.',
      },
    },
  },
  args: {
    id: 'studio',
    name: 'Studio',
    pitch: 'For small teams producing serial content with frequent iterations.',
    price: '$152.10',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $202.80/yr vs monthly',
    allowance: { amount: '8,000', unit: 'tokens / month' },
    allowanceExamples: undefined,
    badge: { label: 'New', tone: 'blue' },
    cta: (
      <MeshButton tone="blue" size="lg">
        <TierGlyph tier="studio" />
        Run a studio
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 9. Grid — all 4 canonical tiers side-by-side (Starter / Creator / Creator + / Studio)
// ===========================================================================

export const Grid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All 4 canonical tiers from `PRICING_TIERS` rendered side-by-side at the production grid width. Each tier carries its own tone (silver / purple / gold / blue) via `DEFAULT_TIER_TONE` mapping; only Creator + is `recommended` (the others surface their tone identity exclusively on hover). Only Studio exposes a `slider` (4 stops, 8k → 14k tokens, all ticks labelled); Starter / Creator / Creator + are fixed-allowance with `allowanceExamples` below the token headline.',
      },
    },
  },
  render: () => (
    <div className="klyp-PricingTierCard-story__grid">
      <PricingTierCard
        id="starter"
        name="Starter"
        pitch="Dip your toe in — small monthly bundle, every model unlocked."
        price="$8.99"
        priceUnit="/ mo · annual"
        saveLine="Save $12/yr vs monthly"
        billingPeriod="annual"
        allowance={{ amount: '300', unit: 'tokens / month' }}
        allowanceExamples={['≈ 35 Gemini 3.5 images', '≈ 2 Seedance 2.0 videos']}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 35 Gemini 3.5 images', emphasis: true },
          { label: '≈ 2 Seedance 2.0 videos', emphasis: true },
          {
            label: 'Up to ∞ text generations',
            tooltip:
              'Fair use — Claude / GPT chat is unmetered for normal usage. Abusive automated traffic may be rate-limited.',
          },
        ]}
        models={CANONICAL_MODELS}
        badge={{ label: 'Current', tone: 'neutral' }}
        cta={
          <MeshButton tone="neutral" size="lg">
            <TierGlyph tier="starter" />
            Get started
          </MeshButton>
        }
      />
      <PricingTierCard
        id="creator"
        name="Creator"
        pitch="For solo creators who ship reels and shorts weekly."
        price="$26.10"
        priceUnit="/ mo · annual"
        saveLine="Save $34.80/yr vs monthly"
        billingPeriod="annual"
        allowance={{ amount: '1,200', unit: 'tokens / month' }}
        allowanceExamples={['≈ 150 Gemini 3.5 images', '≈ 6 Seedance 2.0 videos']}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 150 Gemini 3.5 images', emphasis: true },
          { label: '≈ 6 Seedance 2.0 videos', emphasis: true },
          {
            label: 'Up to ∞ text generations',
            tooltip:
              'Fair use — Claude / GPT chat is unmetered for normal usage. Abusive automated traffic may be rate-limited.',
          },
        ]}
        models={CANONICAL_MODELS}
        cta={
          <MeshButton tone="purple" size="lg">
            <TierGlyph tier="creator" />
            Become a creator
          </MeshButton>
        }
      />
      <PricingTierCard
        id="creatorPlus"
        name="Creator +"
        pitch="When weekly drops turn into a steady weekly serial."
        price="$89.10"
        priceUnit="/ mo · annual"
        saveLine="Save $118.80/yr vs monthly"
        billingPeriod="annual"
        allowance={{ amount: '4,500', unit: 'tokens / month' }}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 560 Gemini 3.5 images', emphasis: true },
          { label: '≈ 22 Seedance 2.0 videos', emphasis: true },
          {
            label: 'Up to ∞ text generations',
            tooltip:
              'Fair use — Claude / GPT chat is unmetered for normal usage. Abusive automated traffic may be rate-limited.',
          },
        ]}
        models={CANONICAL_MODELS}
        recommended
        cta={
          <MeshButton tone="gold" size="lg">
            <TierGlyph tier="creatorPlus" />
            Build your serial
          </MeshButton>
        }
      />
      <PricingTierCard
        id="studio"
        name="Studio"
        pitch="For small teams producing serial content with frequent iterations."
        price="$152.10"
        priceUnit="/ mo · annual"
        saveLine="Save $202.80/yr vs monthly"
        billingPeriod="annual"
        allowance={{ amount: '8,000', unit: 'tokens / month' }}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 1,000 Gemini 3.5 images', emphasis: true },
          { label: '≈ 40 Seedance 2.0 videos', emphasis: true },
          { label: 'Publish to Streaming App' },
          { label: '3 collaborator seats included' },
        ]}
        models={CANONICAL_MODELS}
        slider={{
          stops: STUDIO_STORY_STOPS,
          value: 0,
          onChange: () => {},
        }}
        cta={
          <MeshButton tone="blue" size="lg">
            <TierGlyph tier="studio" />
            Run a studio
          </MeshButton>
        }
      />
    </div>
  ),
}

// ===========================================================================
// 10. WithDiscounts — offer stack active: strike price + (i) Applied discounts popover
// ===========================================================================
//
// Mirrors what `/pricing` renders when the user has one or more offer flags
// active (firstPurchase / earlyBird / referral) on top of annual billing.
// `resolveTierPrice` produces `priceOriginal` + `renewLine`, the page passes
// `getDiscountBreakdown(active)` into `discountBreakdown` → card renders the
// strike chip via `<PriceTicker>` and the (i) trigger via `<DiscountBreakdownTip>`.

export const WithDiscounts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Offer-stack-active state — Starter on annual billing with First Purchase (10%) layered on top of the annual discount (10%). `priceOriginal` triggers the struck-through `$10` chip next to the live `$9` price (PriceTicker handles the chip animation). `discountBreakdown` populates the (i) Applied discounts popover stacked on the renew-row. `renewLine` advertises the post-promo renewal price so the user knows the live price is one-shot. This is the same data shape the `/pricing` page passes when its DevStatePreview FAB toggles offer flags on.',
      },
    },
  },
  args: {
    id: 'starter',
    name: 'Starter',
    pitch: 'Dip your toe in — small monthly bundle, every model unlocked.',
    price: '$9',
    priceOriginal: '$10',
    priceUnit: '/ month',
    priceUnitSecondary: 'annually',
    renewLine: 'Renews at $10/mo after year 1',
    discountBreakdown: [
      { key: 'firstPurchase', label: 'First purchase', pct: 10 },
      { key: 'annual', label: 'Annual billing', pct: 10 },
    ],
    allowance: { amount: '300', unit: 'tokens / month' },
    allowanceExamples: ['≈ 35 Gemini 3.5 images', '≈ 2 Seedance 2.0 videos'],
    cta: (
      <MeshButton tone="neutral" size="lg">
        <TierGlyph tier="starter" />
        Get started
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 11. ActiveSubscription — Grid of 4 tiers in upgrade/current/downgrade states
// ===========================================================================
//
// Simulates the user holding an active Creator + subscription. `ctaState`
// drives both the CTA label (Downgrade / Your current plan / Upgrade) and
// the `__ctaSlot` disabled visual for the `current` card. This is what
// `/pricing` renders when DevStatePreview FAB pins "Active subscription =
// Creator +" — every other tier resolves its CTA state relative to that.

export const ActiveSubscription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Active-subscription state — user has Creator + today. `ctaState` flips every other tier\'s CTA label to its directional outcome ("Downgrade" for cheaper tiers, "Your current plan" for the active one, "Upgrade" for pricier tiers) and stamps `data-cta-state` on the slot so the current-plan button can paint a disabled visual without the caller having to know. Same MeshButton tone per tier as the default Grid — only the label and disabled state shift.',
      },
    },
  },
  render: () => (
    <div className="klyp-PricingTierCard-story__grid">
      <PricingTierCard
        id="starter"
        name="Starter"
        pitch="Dip your toe in — small monthly bundle, every model unlocked."
        price="$8.99"
        priceUnit="/ mo · annual"
        billingPeriod="annual"
        allowance={{ amount: '300', unit: 'tokens / month' }}
        allowanceExamples={['≈ 35 Gemini 3.5 images', '≈ 2 Seedance 2.0 videos']}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 35 Gemini 3.5 images', emphasis: true },
          { label: '≈ 2 Seedance 2.0 videos', emphasis: true },
        ]}
        models={CANONICAL_MODELS}
        ctaState="downgrade"
        cta={
          <MeshButton tone="neutral" size="lg">
            <TierGlyph tier="starter" />
            Downgrade
          </MeshButton>
        }
      />
      <PricingTierCard
        id="creator"
        name="Creator"
        pitch="For solo creators who ship reels and shorts weekly."
        price="$26.10"
        priceUnit="/ mo · annual"
        billingPeriod="annual"
        allowance={{ amount: '1,200', unit: 'tokens / month' }}
        allowanceExamples={['≈ 150 Gemini 3.5 images', '≈ 6 Seedance 2.0 videos']}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 150 Gemini 3.5 images', emphasis: true },
          { label: '≈ 6 Seedance 2.0 videos', emphasis: true },
        ]}
        models={CANONICAL_MODELS}
        ctaState="downgrade"
        cta={
          <MeshButton tone="purple" size="lg">
            <TierGlyph tier="creator" />
            Downgrade
          </MeshButton>
        }
      />
      <PricingTierCard
        id="creatorPlus"
        name="Creator +"
        pitch="When weekly drops turn into a steady weekly serial."
        price="$89.10"
        priceUnit="/ mo · annual"
        billingPeriod="annual"
        allowance={{ amount: '4,500', unit: 'tokens / month' }}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 560 Gemini 3.5 images', emphasis: true },
          { label: '≈ 22 Seedance 2.0 videos', emphasis: true },
        ]}
        models={CANONICAL_MODELS}
        recommended
        ctaState="current"
        cta={
          <MeshButton tone="gold" size="lg" isDisabled>
            <TierGlyph tier="creatorPlus" />
            Your current plan
          </MeshButton>
        }
      />
      <PricingTierCard
        id="studio"
        name="Studio"
        pitch="For small teams producing serial content with frequent iterations."
        price="$152.10"
        priceUnit="/ mo · annual"
        billingPeriod="annual"
        allowance={{ amount: '8,000', unit: 'tokens / month' }}
        featuresHead="What you will get / Per month"
        features={[
          { label: 'Access to all models & tools' },
          { label: '≈ 1,000 Gemini 3.5 images', emphasis: true },
          { label: '≈ 40 Seedance 2.0 videos', emphasis: true },
          { label: 'Publish to Streaming App' },
        ]}
        models={CANONICAL_MODELS}
        ctaState="upgrade"
        cta={
          <MeshButton tone="blue" size="lg">
            <TierGlyph tier="studio" />
            Upgrade
          </MeshButton>
        }
      />
    </div>
  ),
}

// ===========================================================================
// 12. UnavailableRows — higher-tier features greyed-out (available: false)
// ===========================================================================
//
// Exercises the `available?: boolean` flag (design lead 2026-06-04). A lower
// tier shows higher-tier-only features greyed-out so all 4 cards keep the
// same row order. Each `available: false` row swaps the CheckCircleBulk tick
// for a faint-ring CloseCircleBulk (✕) bullet and dims its label to 30%.

export const UnavailableRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `available: false` treatment — a Starter card listing higher-tier features (collaborator seats, streaming publish) greyed-out so every card in the grid shares the same row order. Each unavailable row renders a `CloseCircleBulk` (✕) bullet — ring at 10%, ✕ glyph at 30% — instead of the white check, and dims its label text to 30% opacity. Available rows above keep the normal white `CheckCircleBulk` tick.',
      },
    },
  },
  args: {
    id: 'starter',
    name: 'Starter',
    pitch: 'Dip your toe in — small monthly bundle, every model unlocked.',
    price: '$8.99',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $12/yr vs monthly',
    allowance: { amount: '300', unit: 'tokens / month' },
    allowanceExamples: ['≈ 35 Gemini 3.5 images', '≈ 2 Seedance 2.0 videos'],
    features: [
      { label: 'Access to all models & tools' },
      { label: '≈ 35 Gemini 3.5 images', emphasis: true },
      { label: '≈ 2 Seedance 2.0 videos', emphasis: true },
      { label: 'Publish to Streaming App', available: false },
      { label: '3 collaborator seats included', available: false },
    ],
    cta: (
      <MeshButton tone="neutral" size="lg">
        <TierGlyph tier="starter" />
        Get started
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 13. FixedReadout — no-slider tier with allowanceReadout band
// ===========================================================================
//
// Exercises the `allowanceReadout` prop (2026-06-05). A fixed (no-slider)
// tier passes `allowanceReadout={{ label }}` so its AllowancePanel renders a
// "Fixed amount" control band at the SAME height as a slider tier's track —
// keeping all 4 cards level in the grid whether the tier is adjustable or
// fixed.

export const FixedReadout: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `allowanceReadout` band — a Creator card with no slider passes `allowanceReadout={{ label: "Fixed amount" }}`, so the AllowancePanel reserves the same control-band height a slider tier uses for its track. This is the chassis that keeps fixed and adjustable tiers the same height across the 4-card grid (Val 2026-06-05). `fillPercent` is accepted but label-only today — no fill track is rendered yet.',
      },
    },
  },
  args: {
    id: 'creator',
    name: 'Creator',
    pitch: 'For solo creators who ship reels and shorts weekly.',
    price: '$26.10',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $34.80/yr vs monthly',
    allowance: { amount: '1,200', unit: 'tokens / month' },
    allowanceExamples: ['≈ 150 Gemini 3.5 images', '≈ 6 Seedance 2.0 videos'],
    allowanceReadout: { label: 'Fixed amount' },
    cta: (
      <MeshButton tone="purple" size="lg">
        <TierGlyph tier="creator" />
        Become a creator
      </MeshButton>
    ),
  },
  render: renderTierCard,
}

// ===========================================================================
// 14. ManageFace — active-Studio top-up face via manageSlot
// ===========================================================================
//
// Exercises the `manageSlot` prop (2026-06-18). When a Studio subscription is
// active, the `/pricing` feature swaps the buy-slider for a caller-supplied
// node — here an "Upgrade plan" (recurring) + "Buy tokens" (one-time pack)
// pair. The card stays generic; the feature owns the node + behaviour.

export const ManageFace: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `manageSlot` prop (2026-06-18) — for an active Studio subscription the `/pricing` feature replaces the allowance-panel slider with a caller-supplied node (here an "Upgrade plan" + "Buy tokens" pair). The card never owns the buttons or their behaviour; it just hosts the slot.',
      },
    },
  },
  args: {
    id: 'studio',
    name: 'Studio',
    pitch: 'For teams and studios shipping at volume.',
    price: '$99',
    priceUnit: '/ mo · annual',
    saveLine: 'Save $120/yr vs monthly',
    allowance: { amount: '8,000', unit: 'tokens / month' },
    allowanceExamples: ['≈ 1,000 Gemini 3.5 images', '≈ 40 Seedance 2.0 videos'],
    manageSlot: (
      <>
        <MeshButton tone="gold" size="md">
          Upgrade plan
        </MeshButton>
        <MeshButton tone="neutral" size="md">
          Buy tokens
        </MeshButton>
      </>
    ),
    cta: (
      <MeshButton tone="blue" size="lg">
        <TierGlyph tier="studio" />
        Run a studio
      </MeshButton>
    ),
  },
  render: renderTierCard,
}
