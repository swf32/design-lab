import { createElement } from 'react'
import type { StoryExample, StoryDefinition } from '../../../storyContract'
import { SemanticTreeItem } from '../../../atoms/navigation/SemanticTreeItem/SemanticTreeItem'
import { ColorPicker } from './ColorPicker'

export function renderStoryExample(example: StoryExample, story: StoryDefinition) {
  const value = typeof example.props.value === 'string' ? example.props.value : null
  if (story.id === 'tree-icon')
    return createElement(
      'div',
      { role: 'tree', style: { width: 280 } },
      createElement(SemanticTreeItem, {
        node: {
          name: 'Button',
          path: 'atoms/actions/Button',
          kind: 'component',
          level: 1,
        },
        color: value,
        coloringEnabled: true,
        onSelect: () => undefined,
      }),
    )

  return createElement(ColorPicker, {
    label: example.label,
    defaultValue: value ?? '#3b82f6',
  })
}

export const stories = [
  {
    id: 'selection',
    kind: 'behavior',
    name: 'Color selection',
    interactive: true,
    examples: [
      { label: 'Preset and custom color', props: { value: '#3b82f6' } },
      { label: 'No override', props: { value: null } },
    ],
  },
  {
    id: 'tree-icon',
    kind: 'integration',
    name: 'Semantic tree icon color',
    description:
      'The picker is triggered from a semantic entity icon and returns a nullable color override.',
    interactive: true,
    subject: 'ColorPicker',
    related: ['SemanticTreeItem'],
    examples: [{ label: 'Component icon', props: { value: '#8b5cf6' } }],
  },
]
