import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Button } from '../../../atoms/actions/Button/Button'
import teamImage from '@design-lab/system/assets/images/stock/creative-team.jpg'
import { MarketingStory } from './MarketingStory'

export function renderStoryExample(_example: StoryExample) {
  return createElement(MarketingStory, {
    eyebrow: 'Built for product teams',
    title: 'Design and engineering on the same page',
    headingId: 'marketing-story-example-heading',
    description:
      'Wireframes explore directions; Pages commit to one. Components carry real props and states.',
    actions: <Button variant="secondary">Explore the workspace</Button>,
    media: <img src={teamImage} alt="Creative team collaborating together" />,
  })
}

export const stories = [
  {
    id: 'default-story',
    kind: 'context',
    name: 'Default story',
    description: 'Media panel on the left with eyebrow, headline, copy, and one action.',
    examples: [{ label: 'Image and copy', props: {} }],
  },
]
