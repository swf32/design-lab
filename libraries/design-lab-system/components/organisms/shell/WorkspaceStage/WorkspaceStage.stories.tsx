import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { WorkspaceStage } from './WorkspaceStage'

export function renderStoryExample(_example: StoryExample) {
  return createElement(
    WorkspaceStage,
    { style: { minHeight: 260 } },
    createElement('span', null, 'Module content'),
  )
}

export const stories = [
  {
    id: 'bounded-stage',
    kind: 'context',
    name: 'Bounded module stage',
    examples: [{ label: 'Module content', props: {} }],
  },
]
