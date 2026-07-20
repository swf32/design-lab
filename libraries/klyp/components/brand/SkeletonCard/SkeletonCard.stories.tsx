import type { Meta, StoryObj } from '../__shared/stories-types'
import { SkeletonCard } from './SkeletonCard'

const meta = {
  title: 'Brand / Molecules / SkeletonCard',
  component: SkeletonCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SkeletonCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <SkeletonCard />
    </div>
  ),
}

export const Ratios: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 720 }}>
      <SkeletonCard ratio="16:9" />
      <SkeletonCard ratio="1:1" />
      <SkeletonCard ratio="9:16" />
    </div>
  ),
}
