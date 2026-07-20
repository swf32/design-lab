import type { Meta, StoryObj } from '../__shared/stories-types'
import { StatusDot } from './StatusDot'

const meta = {
  component: StatusDot,
  title: 'Brand / Atoms / StatusDot',
  tags: ['autodocs'],
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { tone: 'success', 'aria-label': 'Online' },
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusDot tone="neutral" aria-label="Neutral" />
      <StatusDot tone="success" aria-label="Success" />
      <StatusDot tone="warning" aria-label="Warning" />
      <StatusDot tone="danger" aria-label="Danger" />
      <StatusDot tone="info" aria-label="Info" />
      <StatusDot tone="accent" aria-label="Accent" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusDot tone="success" size="xs" aria-label="Extra small" />
      <StatusDot tone="success" size="sm" aria-label="Small" />
      <StatusDot tone="success" size="md" aria-label="Medium" />
    </div>
  ),
}

export const Pulse: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusDot tone="info" pulse aria-label="In progress" />
      <StatusDot tone="success" pulse size="md" aria-label="Live" />
      <StatusDot tone="danger" pulse aria-label="Alert" />
    </div>
  ),
}
