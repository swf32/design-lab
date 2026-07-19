import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { RadioButton, type RadioButtonProps } from './RadioButton'

export function renderStoryExample(example: StoryExample) {
  return createElement(RadioButton, {
    name: `story-${example.label}`,
    ...(example.props as RadioButtonProps),
    label: String(example.props.label ?? example.label),
  })
}

export const stories = [
  {
    id: 'selection-states',
    kind: 'state',
    name: 'Selection states',
    description: 'Compare unchecked, checked, disabled, and invalid native radio semantics.',
    examples: [
      { label: 'Unchecked', props: { label: 'Draft' } },
      { label: 'Checked', props: { label: 'Published', defaultChecked: true } },
      { label: 'Disabled', props: { label: 'Archived', disabled: true } },
      { label: 'Invalid', props: { label: 'Unavailable', 'aria-invalid': true } },
    ],
  },
  {
    id: 'color-and-size-matrix',
    kind: 'variant',
    name: 'Color and size matrix',
    description: 'Every semantic color is verified at every supported control size.',
    examples: ['default', 'accent', 'success', 'warning', 'danger'].flatMap((color) =>
      ['small', 'medium', 'large'].map((size) => ({
        label: `${color} · ${size}`,
        props: { label: color, color, size, defaultChecked: true },
      })),
    ),
  },
  {
    id: 'label-composition',
    kind: 'accessibility',
    name: 'Label composition',
    description:
      'The full label and optional description remain inside the native activation area.',
    examples: [
      { label: 'Label', props: { label: 'Use system preference' } },
      {
        label: 'Description',
        props: {
          label: 'Always use dark mode',
          description: 'Overrides the operating system preference.',
        },
      },
    ],
  },
]
