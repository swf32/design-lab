import type { Meta, StoryObj } from '../__shared/stories-types'
import { Spinner } from './Spinner'

const meta = {
  title: 'UI / Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: { size: 'md', 'aria-label': 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    'aria-label': { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
}

// Spinner has no own colour — it paints with `currentColor`, so it inherits
// whatever foreground its context sets (primary text, a muted slot, an accent
// CTA). One source of truth, zero colour props.
export const Color: Story = {
  name: 'Color (inherits currentColor)',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <span style={{ display: 'inline-flex', color: 'var(--color-fg-primary)' }}>
        <Spinner size="lg" />
      </span>
      <span style={{ display: 'inline-flex', color: 'var(--color-fg-muted)' }}>
        <Spinner size="lg" />
      </span>
      <span style={{ display: 'inline-flex', color: 'var(--color-fg-accent)' }}>
        <Spinner size="lg" />
      </span>
    </div>
  ),
}
