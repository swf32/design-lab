import type { Meta, StoryObj } from '../__shared/stories-types'
import { IconLink } from './IconLink'

const meta = {
  component: IconLink,
  title: 'Brand / Icons / IconLink',
  tags: ['autodocs'],
} satisfies Meta<typeof IconLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <IconLink />,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
      <IconLink size="sm" />
      <IconLink size="md" />
      <IconLink size="lg" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
      <span style={{ color: 'var(--color-fg-default)' }}>
        <IconLink size="md" />
      </span>
      <span style={{ color: 'var(--color-fg-muted)' }}>
        <IconLink size="md" />
      </span>
      <span style={{ color: 'var(--color-accent)' }}>
        <IconLink size="md" />
      </span>
    </div>
  ),
}
