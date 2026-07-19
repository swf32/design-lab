import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Chip, type ChipProps } from './Chip'

export function renderStoryExample(example: StoryExample) {
  const props = example.props as ChipProps | undefined
  return createElement(Chip, {
    ...props,
    children: props?.children ?? example.label,
  })
}

export const stories = [
  {
    id: 'semantic-colors',
    kind: 'variant',
    name: 'Semantic colors',
    description: 'Five color roles at one quiet soft treatment.',
    examples: ['default', 'accent', 'success', 'warning', 'danger'].map((color) => ({
      label: color,
      props: { children: color, color, variant: 'soft' },
    })),
  },
  {
    id: 'visual-variants',
    kind: 'variant',
    name: 'Visual variants',
    description: 'Filled, outlined, text-only, and tinted treatments at one semantic color.',
    examples: ['primary', 'secondary', 'tertiary', 'soft'].map((variant) => ({
      label: variant,
      props: { children: variant, color: 'accent', variant },
    })),
  },
  {
    id: 'variant-and-size-matrix',
    kind: 'variant',
    name: 'Variant and size matrix',
    description: 'Every visual variant is verified at every supported size.',
    examples: ['primary', 'secondary', 'tertiary', 'soft'].flatMap((variant) =>
      ['small', 'medium', 'large'].map((size) => ({
        label: `${variant} · ${size}`,
        props: { children: 'Label', color: 'accent', variant, size },
      })),
    ),
  },
  {
    id: 'content-and-availability',
    kind: 'state',
    name: 'Content and availability',
    description: 'Short, long, slotted, and unavailable content preserve stable chip geometry.',
    examples: [
      { label: 'Short', props: { children: 'Beta' } },
      { label: 'Long', props: { children: 'Requires review' } },
      { label: 'Slotted', props: { children: '3 updates', startContent: '3' } },
      { label: 'Disabled', props: { children: 'Archived', disabled: true } },
    ],
  },
]
