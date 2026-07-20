import './NodeBottomBar.stories.scss'

import { Badge } from '@klyp/ui'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { NodeBottomBar } from './NodeBottomBar'

// Storybook playground for the canvas-node bottom toolbar molecule.
// Demonstrates the four slot positions (stepper / chips / settings / action),
// the "minimal action only" degenerate case (no settings or chips), and the
// adaptive behaviour across 280 / 360 / 480px canvas-node widths.

const meta = {
  title: 'Brand / Molecules / NodeBottomBar',
  component: NodeBottomBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NodeBottomBar>

export default meta
type Story = StoryObj<typeof meta>

// Inline mini-stepper for the story — node code typically writes this
// inline (no shared atom yet, see decision in NodeBottomBar.tsx comment).
function MockStepper({ count = 1 }: { count?: number }) {
  return (
    <div className="klyp-NodeBottomBar-storyStepper">
      <button type="button" className="klyp-NodeBottomBar-storyStepper__btn" aria-label="decrement">
        −
      </button>
      <span className="klyp-NodeBottomBar-storyStepper__val">x{count}</span>
      <button type="button" className="klyp-NodeBottomBar-storyStepper__btn" aria-label="increment">
        +
      </button>
    </div>
  )
}

// Mock action button — a gold-filled icon-button stand-in for the real
// `▶` run button each node mounts in its actionSlot.
function MockRunButton() {
  return (
    <button type="button" aria-label="Run generation" className="klyp-NodeBottomBar-storyRun">
      ▶
    </button>
  )
}

function MockSettingsButton() {
  return (
    <button type="button" aria-label="Settings" className="klyp-NodeBottomBar-storyIcon">
      ⚙
    </button>
  )
}

export const Default: Story = {
  args: {
    stepperSlot: <MockStepper count={1} />,
    chipsSlot: (
      <>
        <Badge size="sm" intent="gray" variant="subtle">
          Auto
        </Badge>
        <Badge size="sm" intent="gray" variant="subtle">
          1:1
        </Badge>
      </>
    ),
    settingsSlot: <MockSettingsButton />,
    actionSlot: <MockRunButton />,
  },
}

export const WithoutStepper: Story = {
  args: {
    chipsSlot: (
      <>
        <Badge size="sm" intent="gray" variant="subtle">
          Seedance 2.0
        </Badge>
        <Badge size="sm" intent="gray" variant="subtle">
          720p
        </Badge>
      </>
    ),
    settingsSlot: <MockSettingsButton />,
    actionSlot: <MockRunButton />,
  },
}

export const MinimalActionOnly: Story = {
  args: {
    actionSlot: <MockRunButton />,
  },
}

export const Adaptive: Story = {
  render: (args) => (
    <div className="klyp-NodeBottomBar-storyAdaptive">
      {[280, 360, 480].map((w) => (
        <div key={w} style={{ width: `${w}px` }}>
          <div className="klyp-NodeBottomBar-storyAdaptive__label">{w}px</div>
          <div className="klyp-NodeBottomBar-storyAdaptive__frame">
            <NodeBottomBar {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
  args: {
    stepperSlot: <MockStepper count={1} />,
    chipsSlot: (
      <>
        <Badge size="sm" intent="gray" variant="subtle">
          Auto
        </Badge>
        <Badge size="sm" intent="gray" variant="subtle">
          1:1
        </Badge>
      </>
    ),
    settingsSlot: <MockSettingsButton />,
    actionSlot: <MockRunButton />,
  },
}
