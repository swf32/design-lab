import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { FontCatalog } from './FontCatalog'

export function renderStoryExample(example: StoryExample) {
  return createElement(FontCatalog, {
    families: [
      {
        id: 'interface',
        name: 'Interface Sans',
        cssFamily: 'sans-serif',
        source: 'Local font',
        styles: [
          { weight: 400, style: 'normal' },
          { weight: 600, style: 'normal' },
        ],
      },
    ],
    typography: [
      { id: 'family', path: 'typography.interface.family', value: 'sans-serif' },
      { id: 'weight', path: 'typography.heading.weight', value: 600 },
      { id: 'size', path: 'typography.body.size', value: '42px' },
      { id: 'line-height', path: 'typography.body.line-height', value: 1.5 },
    ],
    mode: String(example.props?.mode ?? 'dark'),
  })
}

export const stories = [
  {
    id: 'mode',
    kind: 'variant',
    name: 'Resolved font mode',
    description: 'A font family and its resolved typography tokens in the selected mode.',
    examples: [{ label: 'Dark', props: { mode: 'dark' } }],
  },
]
