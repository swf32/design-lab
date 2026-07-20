import { Button } from '@klyp/ui'
import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { TierGlyph } from '../TierGlyph/TierGlyph'
import { TopUpDialog } from './TopUpDialog'

const meta = {
  title: 'Brand / Molecules / TopUpDialog',
  component: TopUpDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TopUpDialog>

export default meta
type Story = StoryObj<typeof meta>

const fmtUsd = (v: number): string => `$${v.toLocaleString('en-US')}`

const LABELS = {
  title: 'Buy one-time tokens',
  description: (d: number) =>
    `A one-off token pack on top of your subscription. Valid for ${d} days.`,
  amountAriaLabel: 'Buy one-time tokens',
  payLabel: 'You pay',
  note: (d: number) => `One-time tokens expire ${d} days after purchase.`,
  nowLabel: 'One-time now',
  totalLabel: 'New one-time total',
  capMessage: 'One-time token limit reached',
  confirmLabel: 'Continue to payment',
  cancelLabel: 'Cancel',
}

// Trigger-driven so the catalog preview shows a button (not a permanently
// open overlay). Mirrors StatusDialog.stories — `open` is real state.

// Fresh wallet — no held tokens, so no summary rows (just amount → pay).
export const Default: Story = {
  name: 'Buy — fresh wallet',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Buy tokens</Button>
        <TopUpDialog
          open={open}
          onOpenChange={setOpen}
          ticker="tokens"
          headroom={50_000}
          pricePerStep={30}
          presets={[2_000, 4_000, 6_000, 8_000]}
          formatPrice={fmtUsd}
          labels={LABELS}
        />
      </>
    )
  },
}

// Mid-usage — already holds one-time tokens, so the now → new-total summary shows.
export const MidUsage: Story = {
  name: 'Buy — mid-usage (summary shown)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Buy tokens</Button>
        <TopUpDialog
          open={open}
          onOpenChange={setOpen}
          ticker="tokens"
          currentTokens={6_000}
          headroom={44_000}
          pricePerStep={30}
          presets={[2_000, 4_000, 6_000, 8_000]}
          formatPrice={fmtUsd}
          labels={LABELS}
        />
      </>
    )
  },
}

// Upgrade stopper — not eligible for top-up; sells the next plan up with the
// tier glyph + benefit bullets + a single CTA (no amount picker).
export const Upgrade: Story = {
  name: 'Upgrade — next-plan stopper',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Show upgrade</Button>
        <TopUpDialog
          open={open}
          onOpenChange={setOpen}
          state="upgrade"
          icon={<TierGlyph tier="creator" size={80} />}
          ticker="tokens"
          headroom={0}
          pricePerStep={30}
          formatPrice={fmtUsd}
          bullets={['≈ 300 images or 12 videos / mo', 'Every model unlocked', 'Priority queue']}
          labels={{
            ...LABELS,
            title: 'Outgrowing Starter?',
            description: "You're out of tokens. Creator is 4× the allowance.",
            confirmLabel: 'Upgrade to Creator',
          }}
        />
      </>
    )
  },
}

// Cap reached — one-time pool maxed; body is a danger notice, confirm disabled.
export const CapReached: Story = {
  name: 'Cap reached (50k)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Show cap state
        </Button>
        <TopUpDialog
          open={open}
          onOpenChange={setOpen}
          state="cap"
          ticker="tokens"
          headroom={0}
          pricePerStep={30}
          formatPrice={fmtUsd}
          labels={LABELS}
        />
      </>
    )
  },
}
