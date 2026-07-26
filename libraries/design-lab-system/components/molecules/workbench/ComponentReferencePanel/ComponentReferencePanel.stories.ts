import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ComponentReferencePanel } from './ComponentReferencePanel'

const button = {
  id: 'button',
  name: 'Button',
  directory: 'atoms/actions/Button',
}

export function renderStoryExample(example: StoryExample) {
  const fixture = example.props.fixture
  return createElement(ComponentReferencePanel, {
    importStatement: "import { Button } from '@design-lab/design-lab-system/components'",
    usedBy: fixture === 'button' ? [{ ...button, id: 'dialog', name: 'Dialog' }] : [],
    usedInExamplesBy:
      fixture === 'button' ? [{ ...button, id: 'story-canvas', name: 'Story Canvas' }] : [],
    diagnostics:
      fixture === 'diagnostic'
        ? [
            {
              code: 'preview-imports-component',
              message: 'Button.preview.tsx imports production component Button.',
            },
          ]
        : [],
  })
}

export const stories = [
  {
    id: 'complete-reference',
    kind: 'context',
    name: 'Complete component reference',
    description: 'Import and collapsible direct relationship groups in one compact panel.',
    examples: [{ label: 'Button reference', props: { fixture: 'button' } }],
  },
  {
    id: 'empty-relations',
    kind: 'state',
    name: 'No direct relationships',
    description: 'Empty relation groups remain explicit without inventing dependencies.',
    examples: [{ label: 'Standalone component', props: { fixture: 'standalone' } }],
  },
  {
    id: 'diagnostic',
    kind: 'state',
    name: 'Preview contract diagnostic',
    description: 'A preview import violation stays visible next to the affected artifacts.',
    examples: [{ label: 'Preview violation', props: { fixture: 'diagnostic' } }],
  },
]
