import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { RuntimeFrameSurface } from './RuntimeFrameSurface'

export function renderStoryExample(example: StoryExample) {
  const state = ((example.props as { state?: 'loading' | 'error' } | undefined)?.state ??
    'loading') as 'loading' | 'error'
  return createElement(RuntimeFrameSurface, {
    state,
    heading: state === 'error' ? 'Preview unavailable' : undefined,
    message:
      state === 'error' ? 'The source runtime could not render this view.' : 'Preparing preview…',
    title: 'Runtime state',
  })
}

export const stories = [
  {
    id: 'runtime-status',
    kind: 'state',
    name: 'Loading and error presentation',
    examples: [
      { label: 'Loading', props: { state: 'loading' } },
      { label: 'Error', props: { state: 'error' } },
    ],
  },
]
