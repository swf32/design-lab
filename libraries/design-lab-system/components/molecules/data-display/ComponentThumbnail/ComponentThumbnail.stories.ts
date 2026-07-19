import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ComponentThumbnail } from './ComponentThumbnail'

export function renderStoryExample(example: StoryExample) {
  return createElement(ComponentThumbnail, {
    kind: String(example.props?.kind ?? 'custom-widget'),
  })
}

export const stories = [
  {
    id: 'known-kinds',
    kind: 'variant',
    name: 'Known silhouettes',
    examples: [
      { label: 'Button', props: { kind: 'button' } },
      { label: 'Sidebar tab', props: { kind: 'sidebar-tab' } },
      { label: 'Component card', props: { kind: 'component-card' } },
    ],
  },
  {
    id: 'fallback',
    kind: 'state',
    name: 'Generic fallback',
    examples: [{ label: 'Unknown component', props: { kind: 'custom-widget' } }],
  },
]
