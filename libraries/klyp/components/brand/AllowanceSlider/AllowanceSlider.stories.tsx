import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { AllowanceSlider } from './AllowanceSlider'
import './AllowanceSlider.stories.scss'

const meta = {
  component: AllowanceSlider,
  title: 'Brand / AllowanceSlider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Discrete-stop slider used in `/pricing` Studio tier card (2026-05-21: Creator Plus no longer has slider). Value is the INDEX into stops; parent owns state and resolves price from the active stop.',
      },
    },
  },
} satisfies Meta<typeof AllowanceSlider>

export default meta
type Story = StoryObj<typeof meta>

// Stateful wrapper component — each story owns its own state instance.
function StatefulStory({
  stops,
  ariaLabel,
  initial = 0,
  tickDisplay,
}: {
  stops: { tokens: number; label?: string }[]
  ariaLabel: string
  initial?: number
  tickDisplay?: 'all' | 'endpoints'
}) {
  const [value, setValue] = useState(initial)
  return (
    <div className="klyp-AllowanceSliderStory">
      <AllowanceSlider
        stops={stops}
        value={value}
        onChange={setValue}
        ariaLabel={ariaLabel}
        tickDisplay={tickDisplay}
      />
      <p className="klyp-AllowanceSliderStory__readout">
        Selected index: <b>{value}</b> → {stops[value]?.tokens.toLocaleString()} tokens
      </p>
    </div>
  )
}

// Short-ladder demo — 4 stops, default `tickDisplay='all'` (every stop
// gets a labelled tick). Demonstrates the slider's behaviour when stops
// are sparse enough that per-stop labels remain legible.
export const ShortLadder: Story = {
  args: {
    stops: [{ tokens: 8000 }, { tokens: 10000 }, { tokens: 12000 }, { tokens: 14000 }],
    value: 0,
    onChange: () => {},
    ariaLabel: 'Short ladder demo',
  },
  render: () => (
    <StatefulStory
      stops={[{ tokens: 8000 }, { tokens: 10000 }, { tokens: 12000 }, { tokens: 14000 }]}
      ariaLabel="Short ladder demo"
    />
  ),
}

export const TwoStops: Story = {
  args: {
    stops: [{ tokens: 8000 }, { tokens: 14000 }],
    value: 0,
    onChange: () => {},
    ariaLabel: 'Two-stop demo',
  },
  render: () => (
    <StatefulStory stops={[{ tokens: 8000 }, { tokens: 14000 }]} ariaLabel="Two-stop demo" />
  ),
}

// Long-ladder demo, endpoints-only tick row. Production Studio uses 4
// stops (see `Studio` short-ladder above), but the component supports
// many-stop ladders via `tickDisplay='endpoints'` — this story keeps
// that capability documented in case a future tier needs it.
const LONG_LADDER_STOPS = Array.from({ length: 22 }, (_, i) => ({
  tokens: 8000 + i * 2000,
}))

export const LongLadderEndpoints: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Many-stop ladder (22 stops, 2,000-token increments). `tickDisplay="endpoints"` collapses the tick row to the two extremes; the visible slider value (announced via `aria-valuetext` as "10,000 tokens") tells the user where they are. Use when a tier needs a long slider without the visual noise of 20+ tick labels.',
      },
    },
  },
  args: {
    stops: LONG_LADDER_STOPS,
    value: 0,
    onChange: () => {},
    ariaLabel: 'Long ladder demo',
    tickDisplay: 'endpoints',
  },
  render: () => (
    <StatefulStory stops={LONG_LADDER_STOPS} ariaLabel="Long ladder demo" tickDisplay="endpoints" />
  ),
}

export const WithShorthandLabels: Story = {
  args: {
    stops: [
      { tokens: 10000, label: '10k' },
      { tokens: 50000, label: '50k' },
    ],
    value: 0,
    onChange: () => {},
    ariaLabel: 'Custom labels',
  },
  render: () => (
    <StatefulStory
      stops={[
        { tokens: 10000, label: '10k' },
        { tokens: 50000, label: '50k' },
        { tokens: 100000, label: '100k' },
        { tokens: 500000, label: '500k' },
      ]}
      ariaLabel="Custom shorthand labels"
      initial={1}
    />
  ),
}

// Visual sanity-check for the Unreals (light-theme) brand. Stories
// run inside the active build's tokens (set by `VITE_BRAND`), so this
// just wraps the slider in a white panel to mimic the live pricing
// surface on `unreals.ai` — useful to eyeball whether rail / fill /
// thumb / chevron / ticks still read once the panel is white. The
// actual light palette only takes effect under `VITE_BRAND=unreals`.
export const LightPanelContext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the slider on a white panel to mirror the Unreals (light theme) tier-card surface. All slider colours come from `--color-slider-*` tokens — klyp default keeps the white-pill-on-dark look, Unreals overrides flip rail/fill/thumb/icon/ticks to readable values on white.',
      },
    },
  },
  args: {
    stops: [{ tokens: 8000 }, { tokens: 10000 }, { tokens: 12000 }, { tokens: 14000 }],
    value: 0,
    onChange: () => {},
    ariaLabel: 'Light panel context demo',
  },
  render: () => (
    <div className="klyp-AllowanceSlider-stories__lightPanel">
      <StatefulStory
        stops={[{ tokens: 8000 }, { tokens: 10000 }, { tokens: 12000 }, { tokens: 14000 }]}
        ariaLabel="Light panel context"
      />
    </div>
  ),
}
