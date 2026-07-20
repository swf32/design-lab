import type { Meta, StoryObj } from '../__shared/stories-types'
import { IconCopy } from './IconCopy'

const meta = {
  component: IconCopy,
  title: 'Brand / Icons / IconCopy',
  tags: ['autodocs'],
} satisfies Meta<typeof IconCopy>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <IconCopy />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
      <IconCopy size="sm" />
      <IconCopy size="md" />
      <IconCopy size="lg" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
      <span style={{ color: 'var(--color-fg-default)' }}>
        <IconCopy size="md" />
      </span>
      <span style={{ color: 'var(--color-fg-muted)' }}>
        <IconCopy size="md" />
      </span>
      <span style={{ color: 'var(--color-accent)' }}>
        <IconCopy size="md" />
      </span>
    </div>
  ),
}
