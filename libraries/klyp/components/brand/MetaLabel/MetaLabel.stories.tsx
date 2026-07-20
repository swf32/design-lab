import type { Meta, StoryObj } from '../__shared/stories-types'
import { MetaLabel } from './MetaLabel'

const meta = {
  title: 'Brand / Atoms / MetaLabel',
  component: MetaLabel,
  tags: ['autodocs'],
  args: { children: 'Episode 02' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm'] },
    tone: { control: 'select', options: ['subtle', 'muted', 'accent'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MetaLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <MetaLabel tone="subtle">Subtle</MetaLabel>
      <MetaLabel tone="muted">Muted</MetaLabel>
      <MetaLabel tone="accent">Accent</MetaLabel>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <MetaLabel size="xs">Extra small</MetaLabel>
      <MetaLabel size="sm">Small</MetaLabel>
    </div>
  ),
}
