import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import {
  CardsViewIcon,
  DarkThemeIcon,
  LightThemeIcon,
  ListViewIcon,
} from '../../../../assets/icons'
import {
  TabSwitcher,
  type TabSwitcherOption,
  type TabSwitcherSize,
  type TabSwitcherVariant,
} from './TabSwitcher'

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const values = Array.isArray(props.options)
    ? props.options.map(String)
    : ['tokens', 'palette', 'fonts']
  const content = String(props.content ?? 'text')
  const options: TabSwitcherOption<string>[] =
    content === 'theme-icons'
      ? [
          {
            value: 'light',
            icon: createElement(LightThemeIcon, { size: 16 }),
            accessibleLabel: 'Light theme',
          },
          {
            value: 'dark',
            icon: createElement(DarkThemeIcon, { size: 16 }),
            accessibleLabel: 'Dark theme',
          },
        ]
      : content === 'view-icons'
        ? [
            {
              value: 'cards',
              icon: createElement(CardsViewIcon, { size: 16 }),
              accessibleLabel: 'Cards view',
            },
            {
              value: 'list',
              icon: createElement(ListViewIcon, { size: 16 }),
              accessibleLabel: 'List view',
            },
          ]
        : content === 'icon-text'
          ? [
              {
                value: 'cards',
                icon: createElement(CardsViewIcon, { size: 16 }),
                label: 'Cards',
              },
              {
                value: 'list',
                icon: createElement(ListViewIcon, { size: 16 }),
                label: 'List',
              },
            ]
          : values.map((option) => ({
              value: option,
              label: option[0]?.toUpperCase() + option.slice(1),
              disabled: option === props.disabled,
            }))
  const value = String(props.value ?? options[0]?.value)
  return createElement(TabSwitcher, {
    options,
    value,
    onChange: () => undefined,
    ariaLabel: example.label,
    variant: String(props.variant ?? 'segmented') as TabSwitcherVariant,
    size: String(props.size ?? 'medium') as TabSwitcherSize,
    iconSize: Number(props.iconSize ?? 14),
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
        props: { variant: 'toggle', content: 'theme-icons', value: 'light' },
      },
    ],
  },
  {
    id: 'option-content',
    kind: 'variant',
    name: 'Option content',
    examples: [
      { label: 'Text', props: { variant: 'segmented' } },
      { label: 'Icon and text', props: { variant: 'segmented', content: 'icon-text' } },
      { label: 'Icon only', props: { variant: 'segmented', content: 'view-icons' } },
    ],
  },
  {
    id: 'sizes',
    kind: 'variant',
    name: 'Sizes by visual variant',
    examples: [
      { label: 'Segmented small', props: { variant: 'segmented', size: 'small' } },
      { label: 'Segmented medium', props: { variant: 'segmented', size: 'medium' } },
      {
        label: 'Toggle small',
        props: { variant: 'toggle', size: 'small', content: 'theme-icons' },
      },
      {
        label: 'Toggle medium',
        props: { variant: 'toggle', size: 'medium', content: 'theme-icons' },
      },
    ],
  },
  {
    id: 'touch-density',
    kind: 'context',
    name: 'Phone touch density',
    description:
      'At phone widths, both visual variants keep their compact appearance while each option expands to a minimum 44px touch target.',
    examples: [
      {
        label: 'Theme toggle',
        props: { variant: 'toggle', size: 'small', content: 'theme-icons' },
      },
      {
        label: 'View selector',
        props: { variant: 'segmented', size: 'small', content: 'view-icons' },
      },
    ],
  },
  {
    id: 'icon-size',
    kind: 'variant',
    name: 'Icon scale',
    examples: [
      {
        label: 'Compact 12px',
        props: { variant: 'segmented', content: 'icon-text', iconSize: 12 },
      },
      {
        label: 'Regular 16px',
        props: { variant: 'segmented', content: 'icon-text', iconSize: 16 },
      },
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
