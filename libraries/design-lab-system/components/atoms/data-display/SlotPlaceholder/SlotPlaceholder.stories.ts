import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { SlotPlaceholder, type SlotPlaceholderProps } from './SlotPlaceholder'

export function renderStoryExample(example: StoryExample) {
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        width: 'min(240px, 24vw)',
        minWidth: '128px',
      },
    },
    createElement(SlotPlaceholder, example.props as SlotPlaceholderProps),
  )
}

export const stories = [
  {
    id: 'dimensions',
    kind: 'context',
    name: 'Dimensions',
    description:
      'The same slot marker can stay compact, use explicit dimensions, or fill the available width.',
    examples: [
      { label: 'Compact', props: { width: '24px', height: '24px' } },
      { label: 'Fixed region', props: { width: '120px', height: '48px' } },
      { label: 'Full width', props: { width: '100%', height: '48px' } },
    ],
  },
]
