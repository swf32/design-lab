import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { AmountInput } from './AmountInput'

const meta = {
  component: AmountInput,
  title: 'Brand / Molecules / AmountInput',
  tags: ['autodocs'],
} satisfies Meta<typeof AmountInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [v, setV] = useState<number | undefined>(undefined)
    return <AmountInput id="amt-default" value={v} onValueChange={setV} ticker="USDT" />
  },
}

export const WithMax: Story = {
  render: () => {
    const [v, setV] = useState<number | undefined>(undefined)
    return (
      <AmountInput
        id="amt-max"
        value={v}
        onValueChange={setV}
        ticker="USDT"
        max={1247.5}
        onMax={() => setV(1247.5)}
      />
    )
  },
}

export const WithTicker: Story = {
  render: () => {
    const [v, setV] = useState<number | undefined>(500)
    return <AmountInput id="amt-ticker" value={v} onValueChange={setV} ticker="USDC" />
  },
}

export const WithHelper: Story = {
  args: {
    id: 'amt-h',
    value: undefined,
    onValueChange: () => {},
    ticker: 'USDT',
    helper: 'Minimum 10 USDT',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 560 }}>
      <AmountInput
        id="amt-s0"
        value={1247.5}
        onValueChange={() => {}}
        size="hero-xl"
        ticker="USDT"
      />
      <AmountInput
        id="amt-s1"
        value={1247.5}
        onValueChange={() => {}}
        size="hero-lg"
        ticker="USDT"
      />
      <AmountInput
        id="amt-s2"
        value={1247.5}
        onValueChange={() => {}}
        size="hero-md"
        ticker="USDT"
      />
      <AmountInput
        id="amt-s3"
        value={1247.5}
        onValueChange={() => {}}
        size="hero-sm"
        ticker="USDT"
      />
    </div>
  ),
}

export const Invalid: Story = {
  args: {
    id: 'amt-bad',
    value: 5,
    onValueChange: () => {},
    ticker: 'USDT',
    invalid: true,
    helper: 'Minimum 10 USDT',
    errorMessage: 'Minimum is 10 USDT',
  },
}

export const Disabled: Story = {
  args: {
    id: 'amt-d',
    value: 1247.5,
    onValueChange: () => {},
    ticker: 'USDT',
    disabled: true,
  },
}

export const LengthBuckets: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 560 }}>
      <AmountInput
        id="amt-lb1"
        value={5}
        onValueChange={() => {}}
        ticker="USDT"
        helper="short bucket — ≤ 7 chars"
      />
      <AmountInput
        id="amt-lb2"
        value={12345.67}
        onValueChange={() => {}}
        ticker="USDT"
        helper="medium bucket — 8–11 chars"
      />
      <AmountInput
        id="amt-lb3"
        value={9876543210.99}
        onValueChange={() => {}}
        ticker="USDT"
        helper="long bucket — ≥ 12 chars"
      />
    </div>
  ),
}
