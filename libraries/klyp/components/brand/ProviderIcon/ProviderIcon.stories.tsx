import type { Meta, StoryObj } from '../__shared/stories-types'
import { PROVIDER_LABELS, PROVIDER_ORDER, ProviderIcon } from './ProviderIcon'

const meta = {
  component: ProviderIcon,
  title: 'Brand / ProviderIcon',
  tags: ['autodocs'],
} satisfies Meta<typeof ProviderIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { provider: 'anthropic' },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {PROVIDER_ORDER.map((p) => (
        <div
          key={p}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            minWidth: 64,
          }}
        >
          <ProviderIcon provider={p} size="lg" />
          <span style={{ fontSize: 12, color: 'var(--color-fg-muted)' }}>{PROVIDER_LABELS[p]}</span>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ProviderIcon provider="google" size="sm" />
        <span style={{ fontSize: 12 }}>sm — 16×16</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ProviderIcon provider="google" size="lg" />
        <span style={{ fontSize: 12 }}>lg — 20×20</span>
      </div>
    </div>
  ),
}
