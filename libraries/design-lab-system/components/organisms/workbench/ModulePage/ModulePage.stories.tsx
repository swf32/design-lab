import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ModuleHeader } from '../../../molecules/workbench/ModuleHeader/ModuleHeader'
import { ModulePage } from './ModulePage'

export function renderStoryExample(example: StoryExample) {
  return createElement(
    ModulePage,
    {
      variant: example.props.variant === 'canvas' ? 'canvas' : 'scroll',
      style: { minHeight: 260 },
    },
    createElement(ModuleHeader, { eyebrow: 'Live inventory', title: example.label, count: 24 }),
    createElement('div', null, 'Module content'),
  )
}

export const stories = [
  {
    id: 'module-layout',
    kind: 'variant',
    name: 'Module layout',
    examples: [
      { label: 'Scrolling catalog', props: { variant: 'scroll' } },
      { label: 'Bounded canvas', props: { variant: 'canvas' } },
    ],
  },
]
