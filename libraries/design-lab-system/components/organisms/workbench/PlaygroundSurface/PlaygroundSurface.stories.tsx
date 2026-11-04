import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { PlaygroundSurface } from './PlaygroundSurface'

export function renderStoryExample(example: StoryExample) {
  return createElement(
    PlaygroundSurface,
    { controlsOpen: Boolean(example.props.controlsOpen), style: { height: 260 } },
    createElement('aside', { className: 'component-playground-panel' }, 'Controls'),
    createElement(
      'section',
      { className: 'component-playground-page__canvas' },
      'Component Canvas',
    ),
  )
}

export const stories = [
  {
    id: 'controls-state',
    kind: 'state',
    name: 'Controls visibility',
    examples: [
      { label: 'Controls closed', props: { controlsOpen: false } },
      { label: 'Controls open', props: { controlsOpen: true } },
    ],
  },
]
