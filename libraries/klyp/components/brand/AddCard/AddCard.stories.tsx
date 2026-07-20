import type { Meta, StoryObj } from '../__shared/stories-types'
import { AddCard } from './AddCard'

const meta = {
  title: 'Brand / Atoms / AddCard',
  component: AddCard,
  tags: ['autodocs'],
  args: { label: 'New episode' },
  argTypes: {
    aspect: { control: 'select', options: ['16/9', '4/3', '3/4', '1/1', 'auto'] },
    accent: { control: 'select', options: ['gold', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AddCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Accents: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: 480 }}>
      <AddCard label="New (neutral)" accent="neutral" />
      <AddCard label="New (gold)" accent="gold" />
    </div>
  ),
}

export const Aspects: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 600 }}>
      <AddCard label="16/9" aspect="16/9" />
      <AddCard label="1/1" aspect="1/1" />
      <AddCard label="3/4" aspect="3/4" />
    </div>
  ),
}
