import type { Meta, StoryObj } from '../__shared/stories-types'
import { Kbd } from './Kbd'

const meta = {
  title: 'Brand / Atoms / Kbd',
  component: Kbd,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { combo: 'cmd+k' } }

export const Combos: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Kbd combo="cmd+k" />
      <Kbd combo="shift+enter" />
      <Kbd combo="ctrl+s" />
      <Kbd combo="esc" />
      <Kbd combo="alt+up" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Kbd size="sm" combo="cmd+k" />
      <Kbd size="md" combo="cmd+k" />
    </div>
  ),
}
