import { createElement } from 'react'
import { StarIcon } from '../../../../assets/icons/StarIcon'
import type { StoryExample } from '../../../storyContract'
import { IconButton } from './IconButton'

export function renderStoryExample(example: StoryExample) {
  return createElement(IconButton, {
    ...example.props,
    'aria-label': String(example.props['aria-label'] ?? example.label),
    children: createElement(StarIcon, { size: 16 }),
  })
}

export const stories = [
  {
    id: 'states',
    kind: 'state',
    name: 'Interaction states',
    examples: [
      { label: 'Default', props: { 'aria-label': 'Add' } },
      { label: 'Disabled', props: { 'aria-label': 'Add', disabled: true } },
    ],
  },
  {
    id: 'toolbar',
    kind: 'context',
    name: 'Toolbar context',
    description: 'Review compact icon actions inside a real workbench toolbar.',
    examples: [{ label: 'Source actions', props: { fixture: 'toolbar' } }],
  },
]
