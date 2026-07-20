import type { Meta, StoryObj } from '../__shared/stories-types'
import { TierGlyph } from './TierGlyph'

const meta = {
  component: TierGlyph,
  title: 'Brand / Icons / TierGlyph',
  tags: ['autodocs'],
} satisfies Meta<typeof TierGlyph>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <TierGlyph tier="creatorPlus" />,
}

export const Tiers: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
      <TierGlyph tier="starter" />
      <TierGlyph tier="creator" />
      <TierGlyph tier="creatorPlus" />
      <TierGlyph tier="studio" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
      <TierGlyph tier="creatorPlus" size={16} />
      <TierGlyph tier="creatorPlus" size={20} />
      <TierGlyph tier="creatorPlus" size={24} />
      <TierGlyph tier="creatorPlus" size={32} />
      <TierGlyph tier="creatorPlus" size={48} />
    </div>
  ),
}
