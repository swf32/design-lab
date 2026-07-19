import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Button, type ButtonProps } from './Button'

export function renderStoryExample(example: StoryExample) {
  const props = example.props as unknown as Omit<ButtonProps, 'children'>
  return createElement(Button, {
    ...props,
    children: example.label,
  })
}

export const stories = [
  {
    id: 'variants',
    kind: 'variant',
    name: 'Variants',
    description: 'Compare semantic emphasis at one size.',
    examples: [
      { label: 'Primary', props: { variant: 'primary' } },
      { label: 'Secondary', props: { variant: 'secondary' } },
      { label: 'Ghost', props: { variant: 'ghost' } },
      { label: 'Danger', props: { variant: 'danger' } },
    ],
  },
  {
    id: 'sizes',
    kind: 'variant',
    name: 'Sizes',
    description: 'Compare density without changing semantic emphasis.',
    examples: [
      { label: 'Small', props: { size: 'small' } },
      { label: 'Medium', props: { size: 'medium' } },
      { label: 'Large', props: { size: 'large' } },
    ],
  },
  {
    id: 'full-width',
    kind: 'context',
    name: 'Full width',
    description: 'Compare intrinsic and container-filling layout.',
    examples: [
      { label: 'Intrinsic', props: {} },
      { label: 'Full width', props: { fullWidth: true } },
    ],
  },
  {
    id: 'loading',
    kind: 'behavior',
    name: 'Loading',
    description: 'Trigger a two-second async transition.',
    interactive: true,
    examples: [
      { label: 'Ready', props: {} },
      { label: 'Loading', props: { loading: true } },
    ],
  },
  {
    id: 'states',
    kind: 'state',
    name: 'States and composition',
    description: 'Review disabled behavior and optional slots.',
    examples: [
      { label: 'Disabled', props: { disabled: true } },
      { label: 'Leading', props: { leading: '←' } },
      { label: 'Trailing', props: { trailing: '→' } },
    ],
  },
]
