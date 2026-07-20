import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { SegmentSlider, type SegmentSliderStop } from './SegmentSlider'

const meta = {
  component: SegmentSlider,
  title: 'Brand / SegmentSlider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Segmented (cell) slider — 40px pill split into one cell per stop. No smooth travel: drag and the white active cell jumps cell-to-cell. Min / max labels live in the first / last cell. Value is the INDEX into stops; parent owns state. Brand-aware via the shared --color-slider-* tokens.',
      },
    },
  },
} satisfies Meta<typeof SegmentSlider>

export default meta
type Story = StoryObj<typeof meta>

function StatefulStory({
  stops,
  ariaLabel,
  initial = 0,
}: {
  stops: SegmentSliderStop[]
  ariaLabel: string
  initial?: number
}) {
  const [value, setValue] = useState(initial)
  return (
    <div style={{ display: 'grid', gap: 'var(--space-12)', maxWidth: '32rem' }}>
      <SegmentSlider stops={stops} value={value} onChange={setValue} ariaLabel={ariaLabel} />
      <p style={{ color: 'var(--color-fg-muted)', fontSize: 'var(--font-size-12)' }}>
        Selected: {stops[value]?.label ?? stops[value]?.tokens}
      </p>
    </div>
  )
}

const STOPS: SegmentSliderStop[] = [
  { tokens: 2000, label: '2k' },
  { tokens: 8000 },
  { tokens: 14000 },
  { tokens: 20000 },
  { tokens: 26000 },
  { tokens: 32000 },
  { tokens: 40000, label: '40k' },
]

export const Default: Story = {
  render: () => <StatefulStory stops={STOPS} ariaLabel="Top-up amount" initial={3} />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
      <StatefulStory stops={STOPS} ariaLabel="Min selected" initial={0} />
      <StatefulStory stops={STOPS} ariaLabel="Mid selected" initial={3} />
      <StatefulStory stops={STOPS} ariaLabel="Max selected" initial={STOPS.length - 1} />
    </div>
  ),
}

export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
      {[280, 600, 1200].map((w) => (
        <div key={w} style={{ width: w, maxWidth: '100%' }}>
          <StatefulStory stops={STOPS} ariaLabel={`Width ${w}`} initial={3} />
        </div>
      ))}
    </div>
  ),
}
