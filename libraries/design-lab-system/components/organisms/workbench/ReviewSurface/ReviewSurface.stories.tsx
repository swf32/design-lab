import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ReviewSurface } from './ReviewSurface'

export function renderStoryExample(example: StoryExample) {
  const kind = example.props.kind === 'wireframe' ? 'wireframe' : 'page'
  return createElement(
    ReviewSurface,
    { kind, style: { height: 260 } },
    createElement(
      'section',
      { className: `${kind}-view__stage ${kind}-view__stage--screen` },
      createElement('div', { className: `${kind}-view__screen` }, example.label),
    ),
  )
}

export const stories = [
  {
    id: 'review-kind',
    kind: 'variant',
    name: 'Review routes',
    examples: [
      { label: 'Page review', props: { kind: 'page' } },
      { label: 'Wireframe review', props: { kind: 'wireframe' } },
    ],
  },
]
