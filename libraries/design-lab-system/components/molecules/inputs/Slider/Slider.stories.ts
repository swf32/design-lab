import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Slider, type SliderProps } from './Slider'

export function renderStoryExample(example: StoryExample) {
  return createElement(Slider, {
    label: String(example.props.label ?? example.label),
    ...(example.props as SliderProps),
  })
}

export const stories = [
  {
    id: 'semantic-colors',
    kind: 'variant',
    name: 'Semantic colors',
    description: 'The same value and anatomy across neutral, accent, and status roles.',
    examples: ['default', 'accent', 'success', 'warning', 'danger'].map((color) => ({
      label: color,
      props: { label: color, color, defaultValue: 52 },
    })),
  },
  {
    id: 'color-and-size-matrix',
    kind: 'variant',
    name: 'Color and size matrix',
    description: 'Every semantic color is verified at every supported track and thumb size.',
    examples: ['default', 'accent', 'success', 'warning', 'danger'].flatMap((color) =>
      ['small', 'medium', 'large'].map((size) => ({
        label: `${color} · ${size}`,
        props: { label: color, color, size, defaultValue: 64 },
      })),
    ),
  },
  {
    id: 'value-formatting',
    kind: 'behavior',
    name: 'Value formatting',
    description: 'The visible output may format the same native numeric value for its domain.',
    examples: [
      { label: 'Number', props: { label: 'Volume', defaultValue: 52 } },
      { label: 'Percent', props: { label: 'Opacity', defaultValue: 72 } },
      {
        label: 'Bounded scale',
        props: { label: 'Columns', minValue: 1, maxValue: 12, defaultValue: 4 },
      },
    ],
  },
  {
    id: 'availability',
    kind: 'state',
    name: 'Availability',
    description: 'Interactive and disabled sliders preserve the same measurable geometry.',
    examples: [
      { label: 'Interactive', props: { label: 'Volume', defaultValue: 52 } },
      { label: 'Disabled', props: { label: 'Volume', defaultValue: 52, disabled: true } },
    ],
  },
]
