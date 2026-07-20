import type { Meta, StoryObj } from '../__shared/stories-types'
import { IconEmail } from './IconEmail'

const meta = {
  title: 'Brand / Icons / IconEmail',
  component: IconEmail,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof IconEmail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: {} }

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <IconEmail size="sm" />
      <IconEmail size="md" />
      <IconEmail size="lg" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <span style={{ color: 'var(--color-fg-default)' }}>
        <IconEmail />
      </span>
      <span style={{ color: 'var(--color-accent)' }}>
        <IconEmail />
      </span>
      <span style={{ color: 'var(--color-status-danger)' }}>
        <IconEmail />
      </span>
    </div>
  ),
}
