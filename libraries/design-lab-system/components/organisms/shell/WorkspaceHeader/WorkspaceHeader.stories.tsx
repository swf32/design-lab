import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Button } from '../../../atoms/actions/Button/Button'
import { WorkspaceHeader } from './WorkspaceHeader'

export function renderStoryExample(example: StoryExample) {
  return createElement(WorkspaceHeader, {
    productName: 'Design Lab',
    sectionName: String(example.props.sectionName ?? 'Components'),
    navigation: example.props.navigation
      ? createElement(Button, { variant: 'ghost', children: 'Browse' })
      : undefined,
    actions: createElement(Button, { variant: 'ghost', children: 'Copy link' }),
  })
}

export const stories = [
  {
    id: 'workspace-identity',
    kind: 'context',
    name: 'Workspace identity and utilities',
    examples: [
      { label: 'Desktop', props: { sectionName: 'Components' } },
      { label: 'Navigation entry', props: { sectionName: 'Assets', navigation: true } },
    ],
  },
]
