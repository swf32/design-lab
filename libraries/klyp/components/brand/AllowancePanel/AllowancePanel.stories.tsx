import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { AllowanceSlider } from '../AllowanceSlider/AllowanceSlider'
import { AllowancePanel } from './AllowancePanel'

const meta = {
  component: AllowancePanel,
  title: 'Brand / AllowancePanel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Higgsfield-style nested card for token-allowance display. Headline (amount + unit) on top, optional concrete usage examples below, optional slider slot at the foot. Extracted from `<PricingTierCard>` 2026-05-23 — same chassis, now reusable.',
      },
    },
  },
} satisfies Meta<typeof AllowancePanel>

export default meta
type Story = StoryObj<typeof meta>

/** Bare headline — Starter tier (fixed allowance, no examples, no slider). */
export const Default: Story = {
  args: {
    amount: '300',
    unit: 'tokens / month',
  },
}

/** Creator tier — headline with concrete usage examples below. */
export const WithExamples: Story = {
  args: {
    amount: '1,200',
    unit: 'tokens / month',
    examples: ['≈ 300 Nano Banana 2 images', '≈ 12 Seedance 2.0 videos'],
  },
}

/** Studio tier — headline + slider slot. Stateful wrapper owns the stop index. */
export const WithSlider: Story = {
  render: function StudioStory() {
    const stops = [
      { tokens: 8000, label: '8,000' },
      { tokens: 10000, label: '10,000' },
      { tokens: 12000, label: '12,000' },
      { tokens: 14000, label: '14,000' },
    ]
    const [value, setValue] = useState(0)
    const amountByStop = ['8,000', '10,000', '12,000', '14,000'] as const
    return (
      <AllowancePanel
        amount={amountByStop[value] ?? '8,000'}
        unit="tokens / month"
        slider={
          <AllowanceSlider
            stops={stops}
            value={value}
            onChange={setValue}
            ariaLabel="Studio token allowance"
            tickDisplay="all"
          />
        }
      />
    )
  },
}
