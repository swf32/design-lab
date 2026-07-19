import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CreateProjectDialog } from './CreateProjectDialog'

export function renderStoryExample(example: StoryExample) {
  return createElement(CreateProjectDialog, {
    open: true,
    busy: Boolean(example.props.busy),
    error: typeof example.props.error === 'string' ? example.props.error : null,
    canClose: example.props.canClose !== false,
    onClose: () => undefined,
    onCreate: async () => undefined,
  })
}

export const stories = [
  {
    id: 'states',
    kind: 'state',
    name: 'Submission states',
    examples: [
      { label: 'Default', props: { busy: false, error: null } },
      { label: 'Busy', props: { busy: true } },
      { label: 'Error', props: { error: 'A directory with this name already exists.' } },
    ],
  },
  {
    id: 'dismissal',
    kind: 'behavior',
    name: 'Dismissal policy',
    interactive: true,
    examples: [
      { label: 'Required creation', props: { canClose: false } },
      { label: 'Dismissible', props: { canClose: true } },
    ],
  },
]
