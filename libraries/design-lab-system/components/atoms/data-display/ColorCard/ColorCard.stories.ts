import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ColorCard } from './ColorCard'

export function renderStoryExample(example: StoryExample) {
  return createElement(ColorCard, {
    name: String(example.props?.name ?? example.label),
    value: String(example.props?.value ?? '#26d9c7'),
  })
}

export const stories = [
  {
    id: 'semantic-roles',
    kind: 'context',
    name: 'Semantic roles',
    description: 'Compare resolved colors without turning token roles into component variants.',
    examples: [
      { label: 'Accent', props: { name: 'accent.primary', value: '#26d9c7' } },
      { label: 'Surface', props: { name: 'surface.raised', value: '#20201f' } },
    ],
  },
  {
    id: 'long-paths',
    kind: 'state',
    name: 'Long token paths',
    description: 'Verify truncation without changing grid geometry.',
    examples: [
      {
        label: 'Component token',
        props: { name: 'component.sidebar.active.border', value: '#ffffff66' },
      },
    ],
  },
]
