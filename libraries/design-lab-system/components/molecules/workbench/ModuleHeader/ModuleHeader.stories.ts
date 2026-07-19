import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { TabSwitcher } from '../../inputs/TabSwitcher/TabSwitcher'
import { ModuleHeader } from './ModuleHeader'

export function renderStoryExample(example: StoryExample) {
  const props = example.props
  const actions = props.actions
    ? createElement(TabSwitcher, {
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        value: 'light',
        onChange: () => undefined,
        ariaLabel: 'Theme',
        size: 'small',
      })
    : undefined

  return createElement(ModuleHeader, {
    eyebrow: String(props.eyebrow ?? 'Live inventory'),
    title: String(props.title ?? example.label),
    count: typeof props.count === 'number' ? props.count : undefined,
    backLabel: typeof props.backLabel === 'string' ? props.backLabel : undefined,
    onBack: props.backLabel ? () => undefined : undefined,
    meta: typeof props.meta === 'string' ? props.meta : undefined,
    actions,
  })
}

export const stories = [
  {
    id: 'module-summary',
    kind: 'variant',
    name: 'Module summary',
    examples: [
      { label: 'Count', props: { eyebrow: 'Live inventory', title: 'Components', count: 18 } },
      { label: 'Actions', props: { eyebrow: 'Color tokens', title: 'Palette', actions: true } },
    ],
  },
  {
    id: 'workbench-navigation',
    kind: 'context',
    name: 'Workbench navigation',
    examples: [
      {
        label: 'Back and source metadata',
        props: {
          eyebrow: 'atoms / actions',
          title: 'Button',
          backLabel: 'Back',
          meta: 'Button.tsx',
        },
      },
    ],
  },
]
