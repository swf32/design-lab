import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import type { MarketingHeroProps } from './MarketingHero'
import { Button } from '../../../atoms/actions/Button/Button'
import { Chip } from '../../../atoms/data-display/Chip/Chip'
import { StarIcon } from '@design-lab/system/icons'
import heroImage from '@design-lab/system/assets/images/stock/modern-workspace.jpg'
import { MarketingHero } from './MarketingHero'

export function renderStoryExample(example: StoryExample) {
  const props = example.props as { authenticated?: boolean } | undefined
  const authenticated = Boolean(props?.authenticated)

  const actions: MarketingHeroProps['actions'] = (
    <>
      <Button variant="primary" size="large">
        {authenticated ? 'Open account' : 'Get started'}
      </Button>
      {!authenticated && (
        <Button variant="secondary" size="large">
          Sign in (dev mode)
        </Button>
      )}
    </>
  )

  const status: MarketingHeroProps['status'] = authenticated
    ? 'Signed in · Profile leads to Account.'
    : 'Not signed in · Profile leads to Auth.'

  return createElement(MarketingHero, {
    title: 'Ship products, not decks',
    chip: (
      <Chip
        color="accent"
        variant="soft"
        size="small"
        startContent={<StarIcon aria-hidden="true" />}
      >
        Now in review
      </Chip>
    ),
    description: (
      <>
        Design Lab keeps components, Wireframes, and Pages in one filesystem-first workspace. Agents
        search by intent, verify the contract, and reuse what already exists.
      </>
    ),
    actions,
    status,
    media: <img src={heroImage} alt="Modern organized workspace and desk" />,
  })
}

export const stories = [
  {
    id: 'auth-hero',
    kind: 'context',
    name: 'Signed in vs guest',
    description: 'Hero actions and status adapt to authentication.',
    examples: [
      { label: 'Guest', props: { authenticated: false } },
      { label: 'Signed in', props: { authenticated: true } },
    ],
  },
]
