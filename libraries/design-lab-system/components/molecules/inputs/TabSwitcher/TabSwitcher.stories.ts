import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { TabSwitcher, type TabSwitcherSize, type TabSwitcherVariant } from './TabSwitcher'

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const values = Array.isArray(props.options)
    ? props.options.map(String)
    : ['tokens', 'palette', 'fonts']
  const value = String(props.value ?? values[0])
  return createElement(TabSwitcher, {
    options: values.map((option) => ({
      value: option,
      label: option[0]?.toUpperCase() + option.slice(1),
      disabled: option === props.disabled,
    })),
    value,
    onChange: () => undefined,
    ariaLabel: example.label,
    variant: String(props.variant ?? 'segmented') as TabSwitcherVariant,
    size: String(props.size ?? 'medium') as TabSwitcherSize,
  })
}

export const stories = [
  {
    id: 'variants',
    kind: 'variant',
    name: 'Visual variants',
    examples: [
      {
        label: 'Segmented text',
        props: { variant: 'segmented', options: ['tokens', 'palette', 'fonts'], value: 'tokens' },
      },
      {
        label: 'Compact toggle',
        props: { variant: 'toggle', options: ['light', 'dark'], value: 'light' },
      },
    ],
  },
  {
    id: 'sizes',
    kind: 'variant',
    name: 'Sizes by visual variant',
    examples: [
      { label: 'Segmented small', props: { variant: 'segmented', size: 'small' } },
      { label: 'Segmented medium', props: { variant: 'segmented', size: 'medium' } },
      { label: 'Toggle small', props: { variant: 'toggle', size: 'small' } },
      { label: 'Toggle medium', props: { variant: 'toggle', size: 'medium' } },
    ],
  },
  {
    id: 'states',
    kind: 'state',
    name: 'Selection and disabled state',
    examples: [
      { label: 'Selected', props: { value: 'tokens' } },
      { label: 'Disabled option', props: { disabled: 'fonts' } },
    ],
  },
]
