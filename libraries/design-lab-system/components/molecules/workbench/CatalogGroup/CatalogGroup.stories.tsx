import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { CatalogGroup } from './CatalogGroup'

export function renderStoryExample(example: StoryExample) {
  return createElement(CatalogGroup, {
    title: example.props.headerless ? undefined : String(example.props.title ?? 'workbench'),
    count: example.props.headerless ? undefined : 3,
    children: createElement('div', null, 'Catalog cards'),
  })
}

export const stories = [
  {
    id: 'category-identity',
    kind: 'variant',
    name: 'Category identity',
    examples: [
      { label: 'Named category', props: { title: 'molecules / workbench' } },
      { label: 'Current folder', props: { headerless: true } },
    ],
  },
]
