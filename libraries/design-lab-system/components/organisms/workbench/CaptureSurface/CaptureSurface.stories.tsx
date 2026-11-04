import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CaptureSurface } from './CaptureSurface'

export function renderStoryExample(example: StoryExample) {
  const kind =
    example.props.kind === 'preview' || example.props.kind === 'story'
      ? example.props.kind
      : 'state'
  return createElement(CaptureSurface, { kind, style: { minHeight: 160 } }, example.label)
}

export const stories = [
  {
    id: 'capture-kinds',
    kind: 'variant',
    name: 'Capture surfaces',
    examples: [
      { label: 'Loading capture', props: { kind: 'state' } },
      { label: 'Preview capture', props: { kind: 'preview' } },
      { label: 'Story capture', props: { kind: 'story' } },
    ],
  },
]
