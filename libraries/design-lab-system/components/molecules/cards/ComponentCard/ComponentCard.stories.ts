import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ComponentThumbnail } from '../../data-display/ComponentThumbnail/ComponentThumbnail'
import { ComponentCard } from './ComponentCard'

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const name = String(props.name ?? 'Button')
  return createElement(ComponentCard, {
    name,
    entry: String(props.entry ?? `${name}.tsx`),
    meta: String(props.meta ?? '4 variants'),
    preview: createElement(ComponentThumbnail, {
      kind: name.toLowerCase().replace(/\s+/g, '-'),
    }),
    previewAnimated: Boolean(props.previewAnimated),
    selected: Boolean(props.selected),
  })
}

export const stories = [
  {
    id: 'selection',
    kind: 'state',
    name: 'Selection',
    interactive: true,
    examples: [
      { label: 'Default', props: { name: 'Button', entry: 'Button.tsx', meta: '4 variants' } },
      {
        label: 'Selected',
        props: { name: 'Button', entry: 'Button.tsx', meta: '4 variants', selected: true },
      },
    ],
  },
  {
    id: 'animated-preview',
    kind: 'behavior',
    name: 'Animated preview trigger',
    description: 'Hover or focus a card whose manifest opts into preview motion.',
    interactive: true,
    examples: [{ label: 'Opted in', props: { previewAnimated: true } }],
  },
  {
    id: 'catalog-row',
    kind: 'context',
    name: 'Catalog row',
    description:
      'Review borderless overlay-title cards at catalog density with different preview silhouettes and title lengths.',
    examples: [{ label: 'Mixed entries', props: {} }],
  },
]
