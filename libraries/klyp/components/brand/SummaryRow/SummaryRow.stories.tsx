import type { Meta, StoryObj } from '../__shared/stories-types'
import { SummaryRow } from './SummaryRow'

const meta = {
  component: SummaryRow,
  title: 'Brand / Atoms / SummaryRow',
  tags: ['autodocs'],
} satisfies Meta<typeof SummaryRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Sending', value: '1,246.50 USDT' },
}

export const Bold: Story = {
  args: { label: 'Total', value: '1,245.50 USDT', emphasis: 'bold' },
}

export const WithHint: Story = {
  args: { label: 'Network fee', hint: '(TRC20)', value: '1.00 USDT' },
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 4, width: 320 }}>
      <SummaryRow label="Refunded" value="+0.50 USDT" tone="success" />
      <SummaryRow label="Penalty" value="−2.00 USDT" tone="danger" />
    </div>
  ),
}

export const Stack: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 4, width: 320 }}>
      <SummaryRow label="Sending" value="1,246.50 USDT" />
      <SummaryRow label="Network fee" hint="(TRC20)" value="1.00 USDT" />
      <SummaryRow label="Arrives in" value="Usually under 5 minutes" />
    </div>
  ),
}
