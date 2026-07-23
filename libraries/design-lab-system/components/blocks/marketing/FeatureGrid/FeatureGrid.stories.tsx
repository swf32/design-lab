import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { ComponentsIcon, PagesIcon, TokensIcon, WireframesIcon } from '@design-lab/system/icons'
import { FeatureGrid } from './FeatureGrid'

const defaultItems = [
  {
    icon: <ComponentsIcon aria-hidden="true" />,
    title: 'Components',
    description: 'Reusable UI primitives with manifests, previews, and a verified public contract.',
  },
  {
    icon: <WireframesIcon aria-hidden="true" />,
    title: 'Wireframes',
    description: 'Compare layout directions, states, and user flows before committing.',
  },
  {
    icon: <PagesIcon aria-hidden="true" />,
    title: 'Pages',
    description: 'Graduate the winning direction into a hand-off-ready production screen.',
  },
  {
    icon: <TokensIcon aria-hidden="true" />,
    title: 'Tokens',
    description: 'One semantic layer for color, spacing, type, and radius across every surface.',
  },
]

export function renderStoryExample(_example: StoryExample) {
  return createElement(FeatureGrid, {
    eyebrow: 'Why teams choose Design Lab',
    title: 'One source of truth for every screen',
    headingId: 'feature-grid-story-heading',
    description:
      'From atomic tokens to finished Pages, everything lives in canonical project and library directories.',
    items: defaultItems,
  })
}

export const stories = [
  {
    id: 'default-grid',
    kind: 'context',
    name: 'Default grid',
    description: 'Centered section header with four icon feature cards.',
    examples: [{ label: 'Four features', props: {} }],
  },
]
