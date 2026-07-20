import type { Meta, StoryObj } from '../__shared/stories-types'
import { HeroAmount } from './HeroAmount'

const meta = {
  component: HeroAmount,
  title: 'Brand / Atoms / HeroAmount',
  tags: ['autodocs'],
} satisfies Meta<typeof HeroAmount>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: 1247.5 },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <HeroAmount value={1247.5} size="hero-xl" />
      <HeroAmount value={1247.5} size="hero-lg" />
      <HeroAmount value={1247.5} size="hero-md" />
      <HeroAmount value={1247.5} size="hero-sm" />
    </div>
  ),
}

export const Currencies: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <HeroAmount value={1247.5} currency="$" />
      <HeroAmount value={1247.5} currency="€" />
      <HeroAmount value={1247.5} currency="₽" />
    </div>
  ),
}

export const WithTicker: Story = {
  args: {
    value: 1245.5,
    currency: '',
    trailingTicker: 'USDT',
    size: 'hero-xl',
  },
}

export const ZeroCents: Story = {
  args: { value: 1000, hideCentsWhenZero: true },
}

export const Aligned: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <HeroAmount value={1247.5} size="hero-lg" align="start" />
      <HeroAmount value={1247.5} size="hero-lg" align="center" />
      <HeroAmount value={1247.5} size="hero-lg" align="end" />
    </div>
  ),
}
