import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ModuleHeader } from '../../../molecules/workbench/ModuleHeader/ModuleHeader'
import { ModulePage } from './ModulePage'

export function renderStoryExample(example: StoryExample) {
  const content = example.props.empty
    ? createElement(
        'div',
        { className: 'dl-module-page__empty' },
        createElement('strong', null, 'No items in this group'),
        createElement('span', null, 'Choose another group or add a source file.'),
      )
    : example.props.catalog
      ? createElement(
          'div',
          { className: 'dl-module-page__groups' },
          createElement(
            'div',
            { className: 'dl-module-page__grid dl-module-page__grid--components' },
            ...['Button', 'Input', 'Select'].map((label) =>
              createElement('span', { key: label }, label),
            ),
          ),
        )
      : createElement('div', null, 'Module content')
  return createElement(
    ModulePage,
    {
      variant: example.props.variant === 'canvas' ? 'canvas' : 'scroll',
      style: { minHeight: 260 },
    },
    createElement(ModuleHeader, { eyebrow: 'Live inventory', title: example.label, count: 24 }),
    content,
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
  {
    id: 'catalog-content',
    kind: 'context',
    name: 'Catalog content',
    examples: [
      { label: 'Responsive component grid', props: { catalog: true } },
      { label: 'Empty group', props: { empty: true } },
    ],
  },
]
