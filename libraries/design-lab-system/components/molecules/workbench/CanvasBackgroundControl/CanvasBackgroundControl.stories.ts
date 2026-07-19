import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CanvasBackgroundControl, type CanvasMode } from './CanvasBackgroundControl'

export function renderStoryExample(example: StoryExample) {
  return createElement(CanvasBackgroundControl, {
    mode: String(example.props.mode ?? 'dark-grid') as CanvasMode,
    color: String(example.props.color ?? '#264653'),
    onModeChange: () => undefined,
    onColorChange: () => undefined,
  })
}

export const stories = [
  {
    id: 'modes',
    kind: 'state',
    name: 'Background modes',
    description: 'Switch between the two grid modes and a resolved solid color.',
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
    description: 'Choose a preset or enter a valid six-digit HEX value.',
    interactive: true,
    examples: [{ label: 'Open', props: { mode: 'solid' } }],
  },
]
