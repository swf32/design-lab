import { createElement, useState } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CanvasBackgroundControl, type CanvasMode } from './CanvasBackgroundControl'

function CanvasBackgroundControlFixture({
  mode: initialMode,
  color: initialColor,
}: {
  mode: CanvasMode
  color: string
}) {
  const [mode, setMode] = useState(initialMode)
  const [color, setColor] = useState(initialColor)

  return createElement(CanvasBackgroundControl, {
    mode,
    color,
    onModeChange: setMode,
    onColorChange: setColor,
  })
}

export function renderStoryExample(example: StoryExample) {
  return createElement(CanvasBackgroundControlFixture, {
    mode: String(example.props.mode ?? 'dark-grid') as CanvasMode,
    color: String(example.props.color ?? '#264653'),
  })
}

export const stories = [
  {
    id: 'modes',
    kind: 'behavior',
    name: 'Compact mode disclosure',
    description:
      'Only the selected background is visible at rest; hover or keyboard focus reveals every mode.',
    interactive: true,
    examples: [
      { label: 'Dark grid', props: { mode: 'dark-grid' } },
      { label: 'Light grid', props: { mode: 'light-grid' } },
      { label: 'Solid', props: { mode: 'solid', color: '#264653' } },
    ],
  },
  {
    id: 'picker',
    kind: 'behavior',
    name: 'Solid color picker',
    description: 'Choose saturation, brightness, hue, a preset, or a valid six-digit HEX value.',
    interactive: true,
    examples: [{ label: 'Open', props: { mode: 'solid' } }],
  },
]
