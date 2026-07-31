import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { StarIcon } from '@design-lab/system/icons'
import { Button } from '../../../atoms/actions/Button/Button'
import { EmptyState } from './EmptyState'

export function renderStoryExample(example: StoryExample) {
  const actionable = Boolean((example.props as { actionable?: boolean } | undefined)?.actionable)
  return createElement(EmptyState, {
    icon: createElement(StarIcon, { size: 22 }),
    title: actionable ? 'Create your first project' : 'No results',
    description: actionable
      ? 'Connect an existing design system or start clean.'
      : 'Try another search or choose a different folder.',
    action: actionable ? <Button variant="primary">Create</Button> : undefined,
  })
}

export const stories = [
  {
    id: 'empty-state-purpose',
    kind: 'state',
    name: 'Informational and actionable',
    examples: [
      { label: 'Informational', props: { actionable: false } },
      { label: 'Actionable', props: { actionable: true } },
    ],
  },
]
