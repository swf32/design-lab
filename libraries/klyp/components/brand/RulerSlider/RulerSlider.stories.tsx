import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { RulerSlider } from './RulerSlider'

const meta = {
  component: RulerSlider,
  title: 'Brand / RulerSlider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal ruler slider (DEV-805 top-up variant). Same discrete-stop, value-as-INDEX contract as AllowanceSlider: gold-fill rail, knurled dial thumb, ruler marks that lift toward the thumb on a cosine falloff, and a value bubble above the thumb. Parent owns state.',
      },
    },
  },
} satisfies Meta<typeof RulerSlider>

export default meta
type Story = StoryObj<typeof meta>

function StatefulStory({
  stops,
  ariaLabel,
  initial = 0,
}: {
  stops: { tokens: number; label?: string }[]
  ariaLabel: string
  initial?: number
}) {
  const [value, setValue] = useState(initial)
  return (
    <div style={{ maxWidth: 420 }}>
      <RulerSlider stops={stops} value={value} onChange={setValue} ariaLabel={ariaLabel} />
    </div>
  )
}

const PRESET_STOPS = [
  { tokens: 2000, label: '2,000' },
  { tokens: 8000 },
  { tokens: 16000 },
  { tokens: 24000 },
  { tokens: 32000, label: '32,000' },
]

export const Default: Story = {
  args: { stops: PRESET_STOPS, value: 0, onChange: () => {}, ariaLabel: 'Top-up amount' },
  render: () => <StatefulStory stops={PRESET_STOPS} ariaLabel="Top-up amount" initial={2} />,
}

export const TwoStops: Story = {
  args: {
    stops: [
      { tokens: 8000, label: '8k' },
      { tokens: 50000, label: '50k' },
    ],
    value: 0,
    onChange: () => {},
    ariaLabel: 'Two-stop demo',
  },
  render: () => (
    <StatefulStory
      stops={[
        { tokens: 8000, label: '8k' },
        { tokens: 50000, label: '50k' },
      ]}
      ariaLabel="Two-stop demo"
    />
  ),
}

// Many stops — the dense ruler is where the proximity bulge reads best.
const LONG_LADDER = Array.from({ length: 22 }, (_, i) => ({ tokens: 8000 + i * 2000 }))

export const LongLadder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A 22-stop ladder. With a dense ruler the cosine-falloff bulge around the thumb is most visible — marks nearest the dial lift toward the track and fade out with distance.',
      },
    },
  },
  args: { stops: LONG_LADDER, value: 0, onChange: () => {}, ariaLabel: 'Long ladder demo' },
  render: () => <StatefulStory stops={LONG_LADDER} ariaLabel="Long ladder demo" initial={8} />,
}
