import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { BalanceCard, BalanceTriad } from './BalanceCard'

const meta = {
  component: BalanceCard,
  title: 'Brand / Molecules / BalanceCard',
  tags: ['autodocs'],
} satisfies Meta<typeof BalanceCard>

export default meta
type Story = StoryObj<typeof meta>

// Constrain the demo width so the card doesn't span the full preview
// pane in the catalog. Real layouts use `<BalanceTriad>` which sizes
// each cell via `auto-fit minmax(...)` — see the `Triad` story below.
const SINGLE_WIDTH = { maxWidth: 360 }

export const Default: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard label="Available to Withdraw" dotTone="success" amount={1247.5} />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <BalanceTriad>
      <BalanceCard
        label="Available to Withdraw"
        dotTone="success"
        amount={1247.5}
        sub="Ready to cash out"
      />
      <BalanceCard
        label="To Be Accrued"
        dotTone="warning"
        amount={328.9}
        sub="11 entries unlock from May 21"
      />
      <BalanceCard
        label="Total Earned"
        dotTone="info"
        amount={4892}
        sub="Since you joined · 42 invites"
      />
    </BalanceTriad>
  ),
}

export const Primary: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard
        primary
        label="Available to Withdraw"
        dotTone="success"
        amount={1247.5}
        sub="Ready to cash out"
      />
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard
        primary
        label="Available to Withdraw"
        dotTone="success"
        amount={1247.5}
        sub="Ready to cash out"
        action={<Button>Withdraw</Button>}
      />
    </div>
  ),
}

export const Triad: Story = {
  render: () => (
    <BalanceTriad>
      <BalanceCard
        primary
        label="Available to Withdraw"
        dotTone="success"
        amount={1247.5}
        action={<Button>Withdraw</Button>}
      />
      <BalanceCard
        label="To Be Accrued"
        dotTone="warning"
        amount={328.9}
        sub="11 entries unlock from May 21"
      />
      <BalanceCard
        label="Total Earned"
        dotTone="info"
        amount={4892}
        sub="Since you joined · 42 invites"
      />
    </BalanceTriad>
  ),
}

// `amount={42}` exercises the integer-only path: splitAmount returns
// `cents="00"` so the cents slot still renders for stable digit width.
export const IntegerOnly: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard label="Total Earned" dotTone="info" amount={42} />
    </div>
  ),
}

/**
 * Empty-balance state — a freshly-joined creator with no referrals yet,
 * or a wallet that's been fully withdrawn. `dotTone="neutral"` so the
 * card reads "no money, no urgency" rather than success/warning.
 */
export const Zero: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard
        label="Available to Withdraw"
        dotTone="neutral"
        amount={0}
        sub="No earnings yet — invite a creator to start"
      />
    </div>
  ),
}

/**
 * Skeleton state while the balance fetches from Convex. Common pre-CTA
 * state on `/referrals` first paint — the card stays in layout but
 * amount/sub are dimmed and a shimmer plays over the amount slot.
 */
export const Loading: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard
        loading
        label="Available to Withdraw"
        dotTone="success"
        amount={1247.5}
        sub="Ready to cash out"
      />
    </div>
  ),
}

/**
 * Tests `hero-lg` typography overflow with a 7-figure amount. Verifies
 * the cents slot stays baseline-aligned with the integer and the
 * currency glyph doesn't wrap to a second line on a 360px card.
 */
export const LargeAmount: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard
        label="Lifetime Earnings"
        dotTone="info"
        amount={1234567.89}
        sub="All-time creator payouts"
      />
    </div>
  ),
}

/**
 * Stresses label wrapping inside a 280px container (the narrowest cell
 * width the `<BalanceTriad>` grid produces before collapsing to a single
 * column). Confirms the dot stays line-1 aligned when the label wraps.
 */
export const LongLabel: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <BalanceCard
        label="Available to Withdraw After Network Fees"
        dotTone="success"
        amount={1247.5}
      />
    </div>
  ),
}

/**
 * Bare-minimum config: just `label` + `amount`. No status dot, no sub,
 * no action. Confirms the card still reads clean as a standalone tile
 * — useful in compact dashboard headers or widget previews.
 */
export const MinimalNoSub: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard label="Balance" amount={1247.5} />
    </div>
  ),
}

/**
 * Fetch-failed fallback. Re-uses the `danger` dot tone + a coloured sub
 * line to surface the retry hint without introducing new props. Amount
 * is forced to 0 so the visual reads "unknown / unavailable".
 */
export const ErrorState: Story = {
  render: () => (
    <div style={SINGLE_WIDTH}>
      <BalanceCard
        label="Available to Withdraw"
        dotTone="danger"
        amount={0}
        sub={<span style={{ color: 'var(--color-status-danger)' }}>Unable to load — retry</span>}
      />
    </div>
  ),
}

/**
 * Side-by-side preview of the hover-blob radial glow on `primary` (gold,
 * plus-lighter blend) vs default (silver, no blend). Hover either card
 * in the catalog Preview to trigger the animation — both rings + blobs
 * fade in together via `--duration-normal`.
 */
export const HoverGlow: Story = {
  render: function Render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <p
          style={{
            margin: 0,
            color: 'var(--color-fg-muted)',
            fontSize: 'var(--font-size-12)',
          }}
        >
          Hover the cards to see the blob glow animation.
        </p>
        <BalanceTriad>
          <BalanceCard
            primary
            label="Available to Withdraw"
            dotTone="success"
            amount={1247.5}
            sub="Gold glow on hover"
          />
          <BalanceCard
            label="Total Earned"
            dotTone="info"
            amount={4892}
            sub="Silver glow on hover"
          />
        </BalanceTriad>
      </div>
    )
  },
}
