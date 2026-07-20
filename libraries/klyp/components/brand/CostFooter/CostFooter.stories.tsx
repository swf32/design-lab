import type { Meta, StoryObj } from '../__shared/stories-types'
import { CostFooter } from './CostFooter'

const meta = {
  title: 'Brand / Atoms / CostFooter',
  component: CostFooter,
  tags: ['autodocs'],
  args: { durationSec: 40, cost: '$0.08' },
  argTypes: {
    align: { control: 'select', options: ['left', 'center', 'right'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CostFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Alignments: Story = {
  render: () => (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <CostFooter durationSec={40} cost="$0.08" align="left" />
      <CostFooter durationSec={40} cost="$0.08" align="center" />
      <CostFooter durationSec={40} cost="$0.08" align="right" />
    </div>
  ),
}

export const EstimatedVsExact: Story = {
  render: () => (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Default: leading "~" marks an estimate. */}
      <CostFooter durationSec={40} cost="$0.08" />
      {/* exact: no "~" — the value is final, not an estimate. */}
      <CostFooter durationSec={40} cost="$0.08" exact />
    </div>
  ),
}
