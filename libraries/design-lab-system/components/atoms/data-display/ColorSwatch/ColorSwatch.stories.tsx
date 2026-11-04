import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ColorSwatch } from './ColorSwatch'

export function renderStoryExample(example: StoryExample) {
  return createElement(ColorSwatch, {
    value: String(example.props?.value ?? '#26d9c7'),
    size: example.props?.size === 'large' ? 'large' : 'small',
  })
}

export const stories = [
  {
    id: 'size',
    kind: 'variant',
    name: 'Catalog sizes',
    description: 'The same token-driven swatch in token and palette tables.',
    examples: [
      { label: 'Token', props: { value: '#26d9c7', size: 'small' } },
      { label: 'Palette', props: { value: '#26d9c7', size: 'large' } },
    ],
  },
]
