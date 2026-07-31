import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { WorkspaceSurface } from './WorkspaceSurface'

export function renderStoryExample(_example: StoryExample) {
  return createElement(WorkspaceSurface, {
    style: { minHeight: 280 },
    headerProps: {
      productName: 'Design Lab',
      sectionName: 'Components',
    },
    children: createElement('span', null, 'Active module'),
  })
}

export const stories = [
  {
    id: 'header-and-stage',
    kind: 'integration',
    name: 'Header and bounded stage',
    examples: [{ label: 'Active workspace', props: {} }],
  },
]
