import type { Meta, StoryObj } from '../__shared/stories-types'
import type { PricingTierId } from '../PricingTierCard'
import { ProviderIcon } from '../ProviderIcon'
import {
  type CompareCategory,
  PricingCompareMatrix,
  type PricingCompareMatrixTier,
} from './PricingCompareMatrix'

const meta = {
  component: PricingCompareMatrix,
  title: 'Brand / Molecules / PricingCompareMatrix',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '4-tier feature comparison table for the `/pricing` route. Real `<table>` markup with `position: sticky` `<thead>` docked at `top: var(--matrix-sticky-top, 0)` (the consumer opts into a header offset when a header overlaps its scroll port). Recommended column gets a `--color-overlay-gold-10` wash. Below 880px the table scrolls horizontally (sticky breaks at narrow widths — accepted trade-off, mobile users read category-by-category).',
      },
    },
  },
} satisfies Meta<typeof PricingCompareMatrix>

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// Fixtures — mirror the live klypapp.com/pricing compare table (2026-06-09).
// Tiers + per-model rows come from the app's `pricing-tiers.ts`
// (`PRICING_TIERS` + `COMPARE_CATEGORIES` / `makeModelRow`); the per-tier
// "N videos / images / runs" counts are the annual figures
// `floor(tokensMonthly × 12 / model.cost)`. Prices shown are the annual
// (billed-yearly) per-month price, matching the page's default toggle state.
// =============================================================================

const TIERS: readonly PricingCompareMatrixTier[] = [
  {
    id: 'starter' satisfies PricingTierId,
    name: 'Starter',
    price: '$9',
    priceUnit: '/month',
    creditsPerYear: '3,600 tokens / year',
  },
  {
    id: 'creator' satisfies PricingTierId,
    name: 'Creator',
    price: '$26',
    priceUnit: '/month',
    creditsPerYear: '14,400 tokens / year',
  },
  {
    id: 'creatorPlus' satisfies PricingTierId,
    name: 'Creator +',
    price: '$89',
    priceUnit: '/month',
    creditsPerYear: '54,000 tokens / year',
    recommended: true,
  },
  {
    id: 'studio' satisfies PricingTierId,
    name: 'Studio',
    price: '$152',
    priceUnit: '/month',
    creditsPerYear: '96,000 tokens / year',
  },
]

const CATEGORIES: readonly CompareCategory[] = [
  {
    title: 'Allowance',
    rows: [
      {
        label: 'Tokens / month',
        cells: [
          { kind: 'num', value: '300' },
          { kind: 'num', value: '1,200' },
          { kind: 'num', value: '4,500' },
          { kind: 'text', value: '8,000–14,000' },
        ],
      },
      {
        label: 'Roll-over of unused tokens',
        cells: [
          { kind: 'minus' },
          { kind: 'text', value: '7 days' },
          { kind: 'text', value: '14 days' },
          { kind: 'text', value: '30 days' },
        ],
      },
    ],
  },
  {
    title: 'AI video',
    rows: [
      {
        label: 'Seedance 2.0',
        icon: <ProviderIcon provider="seedance" size="sm" />,
        subline: '100 credits / 10s · 720p clip',
        badge: 'new',
        cells: [
          { kind: 'num', value: '36', sub: 'videos' },
          { kind: 'num', value: '144', sub: 'videos' },
          { kind: 'num', value: '540', sub: 'videos' },
          { kind: 'num', value: '960', sub: 'videos' },
        ],
      },
      {
        label: 'Kling 2.6',
        icon: <ProviderIcon provider="kling" size="sm" />,
        subline: '200 credits / 10s · with audio',
        badge: 'lower-price',
        cells: [
          { kind: 'num', value: '18', sub: 'videos' },
          { kind: 'num', value: '72', sub: 'videos' },
          { kind: 'num', value: '270', sub: 'videos' },
          { kind: 'num', value: '480', sub: 'videos' },
        ],
      },
      {
        label: 'Google Veo 3.1',
        icon: <ProviderIcon provider="google" size="sm" />,
        subline: '120 credits / 10s · 1080p · with audio',
        badge: 'new',
        cells: [
          { kind: 'num', value: '30', sub: 'videos' },
          { kind: 'num', value: '120', sub: 'videos' },
          { kind: 'num', value: '450', sub: 'videos' },
          { kind: 'num', value: '800', sub: 'videos' },
        ],
      },
    ],
  },
  {
    title: 'AI image',
    rows: [
      {
        label: 'GPT Image 2',
        icon: <ProviderIcon provider="openai" size="sm" />,
        subline: '15 credits / 2K · high quality',
        cells: [
          { kind: 'num', value: '240', sub: 'images' },
          { kind: 'num', value: '960', sub: 'images' },
          { kind: 'num', value: '3,600', sub: 'images' },
          { kind: 'num', value: '6,400', sub: 'images' },
        ],
      },
      {
        label: 'Nano Banana Pro',
        icon: <ProviderIcon provider="google" size="sm" />,
        subline: '5 credits / 2K · 1 image',
        badge: 'lower-price',
        cells: [
          { kind: 'num', value: '720', sub: 'images' },
          { kind: 'num', value: '2,880', sub: 'images' },
          { kind: 'num', value: '10,800', sub: 'images' },
          { kind: 'num', value: '19,200', sub: 'images' },
        ],
      },
    ],
  },
  {
    title: 'Text generation',
    rows: [
      {
        label: 'Claude Sonnet 4.6',
        icon: <ProviderIcon provider="anthropic" size="sm" />,
        subline: '1 credit / per run',
        cells: [
          { kind: 'num', value: '3,600', sub: 'runs' },
          { kind: 'num', value: '14,400', sub: 'runs' },
          { kind: 'num', value: '54,000', sub: 'runs' },
          { kind: 'num', value: '96,000', sub: 'runs' },
        ],
      },
      {
        label: 'Gemini 3.1 Pro',
        icon: <ProviderIcon provider="google" size="sm" />,
        subline: '1 credit / per run',
        cells: [
          { kind: 'num', value: '3,600', sub: 'runs' },
          { kind: 'num', value: '14,400', sub: 'runs' },
          { kind: 'num', value: '54,000', sub: 'runs' },
          { kind: 'num', value: '96,000', sub: 'runs' },
        ],
      },
      {
        label: 'Gemini Flash 2.5',
        icon: <ProviderIcon provider="google" size="sm" />,
        subline: '1 credit / per run',
        cells: [
          { kind: 'num', value: '3,600', sub: 'runs' },
          { kind: 'num', value: '14,400', sub: 'runs' },
          { kind: 'num', value: '54,000', sub: 'runs' },
          { kind: 'num', value: '96,000', sub: 'runs' },
        ],
      },
      {
        label: 'GPT-5 Mini',
        icon: <ProviderIcon provider="openai" size="sm" />,
        subline: '1 credit / per run',
        cells: [
          { kind: 'num', value: '3,600', sub: 'runs' },
          { kind: 'num', value: '14,400', sub: 'runs' },
          { kind: 'num', value: '54,000', sub: 'runs' },
          { kind: 'num', value: '96,000', sub: 'runs' },
        ],
      },
      {
        label: 'GPT-5.4',
        icon: <ProviderIcon provider="openai" size="sm" />,
        subline: '1 credit / per run',
        cells: [
          { kind: 'num', value: '3,600', sub: 'runs' },
          { kind: 'num', value: '14,400', sub: 'runs' },
          { kind: 'num', value: '54,000', sub: 'runs' },
          { kind: 'num', value: '96,000', sub: 'runs' },
        ],
      },
    ],
  },
  {
    title: 'Team & support',
    rows: [
      {
        label: 'Editor seats',
        cells: [
          { kind: 'num', value: '1' },
          { kind: 'num', value: '1' },
          { kind: 'num', value: '2' },
          { kind: 'num', value: '3' },
        ],
      },
      {
        label: 'Viewer seats',
        cells: [
          { kind: 'num', value: '—' },
          { kind: 'num', value: '2' },
          { kind: 'num', value: '5' },
          { kind: 'num', value: '15' },
        ],
      },
      {
        label: 'Brand kits',
        cells: [{ kind: 'minus' }, { kind: 'minus' }, { kind: 'check' }, { kind: 'check' }],
      },
      {
        label: 'Generation priority',
        cells: [
          { kind: 'text', value: 'Standard' },
          { kind: 'text', value: 'Standard' },
          { kind: 'text', value: 'Standard' },
          { kind: 'text', value: 'Priority' },
        ],
      },
      {
        label: 'Support',
        cells: [
          { kind: 'text', value: 'Community' },
          { kind: 'text', value: 'Email · 48h' },
          { kind: 'text', value: 'Email · 24h' },
          { kind: 'text', value: 'Email · 12h' },
        ],
      },
      {
        label: 'Publish to Streaming App',
        cells: [{ kind: 'minus' }, { kind: 'minus' }, { kind: 'check' }, { kind: 'check' }],
      },
    ],
  },
]

// =============================================================================
// 1. Default — full 4-tier matrix, 5 categories, Studio recommended
// =============================================================================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Full matrix exactly as it ships on klypapp.com/pricing. Four tiers (Starter / Creator / Creator + / Studio) with sticky price headers, five categories (Allowance / AI video / AI image / Text generation / Team & support). Model rows carry a `<ProviderIcon>`, a NEW / LOWER PRICE badge, a per-unit credit subline, and the derived annual count per tier (`floor(tokensMonthly × 12 / cost)`). Creator + carries `recommended: true` so the column gets a gold-10 wash and the header flips to fg-accent.',
      },
    },
  },
  args: {
    tiers: TIERS,
    categories: CATEGORIES,
  },
}

// =============================================================================
// 2. RecommendedColumn — isolated demo of column highlight
// =============================================================================

export const RecommendedColumn: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Minimal 3-tier shape with the middle column flagged `recommended`. Use this to verify the column wash + the header `::after` "Recommended" sub-line ship without leaking onto neighbouring columns.',
      },
    },
  },
  args: {
    tiers: [
      { id: 'starter', name: 'Starter' },
      { id: 'creatorPlus', name: 'Creator +', recommended: true },
      { id: 'studio', name: 'Studio' },
    ],
    categories: [
      {
        title: 'Allowance',
        rows: [
          {
            label: 'Tokens / month',
            cells: [
              { kind: 'num', value: '300' },
              { kind: 'num', value: '4,500' },
              { kind: 'text', value: '8,000–14,000' },
            ],
          },
        ],
      },
      {
        title: 'AI video',
        rows: [
          {
            label: 'Seedance 2.0',
            icon: <ProviderIcon provider="seedance" size="sm" />,
            subline: '100 credits / 10s · 720p clip',
            badge: 'new',
            cells: [
              { kind: 'num', value: '36', sub: 'videos' },
              { kind: 'num', value: '540', sub: 'videos' },
              { kind: 'num', value: '960', sub: 'videos' },
            ],
          },
        ],
      },
    ],
  },
}

// =============================================================================
// 3. MobileScroll — 360px viewport demo (horizontal scroll)
// =============================================================================

export const MobileScroll: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Wraps the full matrix in a 360px-wide container to demonstrate the `@container (max-width: 880px)` horizontal-scroll behaviour. The table holds at `min-width: 720px` and the wrapper scrolls horizontally. Sticky on `<thead>` breaks inside the horizontal-scroll context — this is the accepted Phase 1 trade-off; mobile users read category-by-category.',
      },
    },
  },
  render: () => (
    <div
      style={{
        width: 360,
        maxWidth: '100%',
        border: '1px dashed var(--color-border-subtle)',
        padding: 8,
        borderRadius: 8,
      }}
    >
      <PricingCompareMatrix tiers={TIERS} categories={CATEGORIES} />
    </div>
  ),
}
