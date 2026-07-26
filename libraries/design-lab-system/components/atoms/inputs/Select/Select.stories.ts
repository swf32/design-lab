import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Select, type SelectSize } from './Select'

const options = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium', label: 'Premium economy' },
  { value: 'business', label: 'Business' },
]

export function renderStoryExample(example: StoryExample) {
  return createElement(Select, {
    label: String(example.props.label ?? 'Cabin class'),
    options,
    size: String(example.props.size ?? 'medium') as SelectSize,
    defaultValue: 'premium',
    disabled: Boolean(example.props.disabled),
    errorMessage: example.props.error ? 'Choose an available cabin.' : undefined,
  })
}

export const stories = [
  {
    id: 'sizes',
    kind: 'variant',
    name: 'Control sizes',
    examples: [
      { label: 'Small', props: { size: 'small' } },
      { label: 'Medium', props: { size: 'medium' } },
      { label: 'Large', props: { size: 'large' } },
    ],
  },
  {
    id: 'states',
    kind: 'state',
    name: 'Validation and availability',
    examples: [
      { label: 'Default', props: {} },
      { label: 'Invalid', props: { error: true } },
      { label: 'Disabled', props: { disabled: true } },
    ],
  },
  {
    id: 'viewport-invariant-selection',
    kind: 'context',
    name: 'Viewport-invariant selection',
    description:
      'The selected size keeps identical field and type geometry at every viewport width.',
    examples: [{ label: 'Travel filter', props: { size: 'small' } }],
  },
]
