import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { SemanticTreeItem, type SemanticTreeNode } from './SemanticTreeItem'

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const kind = String(props.kind ?? 'component') as SemanticTreeNode['kind']
  const node: SemanticTreeNode = {
    name: kind === 'folder' ? 'Inputs' : kind === 'component' ? 'Button' : 'color.accent',
    path: kind === 'folder' ? 'atoms/inputs' : `atoms/inputs/${kind}`,
    kind,
    level: Number(props.level ?? 0),
  }

  return createElement(
    'div',
    { role: 'tree', style: { width: 280 } },
    createElement(SemanticTreeItem, {
      node,
      active: Boolean(props.active),
      expanded: kind === 'folder',
      color: typeof props.color === 'string' ? props.color : null,
      coloringEnabled: Boolean(props.coloringEnabled),
      actionsEnabled: Boolean(props.actionsEnabled),
      onSelect: () => undefined,
      onExpandedChange: () => undefined,
    }),
  )
}

export const stories = [
  {
    id: 'entity-kinds',
    kind: 'variant',
    name: 'Entity kinds',
    examples: [
      { label: 'Folder', props: { kind: 'folder' } },
      { label: 'Component', props: { kind: 'component' } },
      { label: 'Token', props: { kind: 'token' } },
      { label: 'File', props: { kind: 'file' } },
    ],
  },
  {
    id: 'tree-context',
    kind: 'context',
    name: 'Inside semantic tree',
    description:
      'Verify stronger indentation, disclosure, selection, and sibling alignment inside a tree.',
    interactive: true,
    examples: [{ label: 'Nested selection', props: { active: true, level: 2 } }],
  },
  {
    id: 'folder-actions',
    kind: 'behavior',
    name: 'Disclosure and selection',
    description:
      'The disclosure button expands a folder without selecting it; the adjacent label remains an independent navigation target.',
    interactive: true,
    examples: [{ label: 'Expanded folder', props: { kind: 'folder' } }],
  },
  {
    id: 'optional-affordances',
    kind: 'behavior',
    name: 'Optional color and actions',
    description:
      'Color editing and future actions remain separately configurable secondary affordances.',
    interactive: true,
    examples: [
      {
        label: 'Both enabled',
        props: { coloringEnabled: true, actionsEnabled: true, color: '#8b5cf6' },
      },
      { label: 'Quiet row', props: { coloringEnabled: false, actionsEnabled: false } },
    ],
  },
]
