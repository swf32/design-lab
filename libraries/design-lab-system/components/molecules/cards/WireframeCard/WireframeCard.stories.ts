import { createElement } from 'react'
import type { StoryDefinition, StoryExample } from '../../../storyContract'
import { WireframeCard } from './WireframeCard'

export const stories: StoryDefinition[] = [
  {
    id: 'lifecycle',
    kind: 'state',
    name: 'Review lifecycle',
    examples: [
      { label: 'Draft', props: { status: 'draft' } },
      { label: 'Review', props: { status: 'review' } },
      { label: 'Approved', props: { status: 'approved' } },
    ],
  },
  {
    id: 'representative-content',
    kind: 'context',
    name: 'Representative Wireframe',
    description: 'Verifies realistic description and graph counts at catalog width.',
    examples: [{ label: 'Pricing', props: { status: 'review' } }],
  },
]

export function renderStoryExample(example: StoryExample) {
  return createElement(WireframeCard, {
    name: 'Pricing',
    description:
      'Compares plan selection and token-entitlement layouts across saved customer states.',
    status: (example.props.status ?? 'review') as 'draft' | 'review' | 'approved',
    layoutCount: 3,
    stateCount: 6,
    transitionCount: 7,
    preview: createElement('div', {
      style: {
        width: '100%',
        minHeight: '100%',
        background:
          'linear-gradient(145deg, var(--color-surface-secondary), var(--color-surface-primary))',
      },
    }),
    onClick: () => undefined,
  })
}
