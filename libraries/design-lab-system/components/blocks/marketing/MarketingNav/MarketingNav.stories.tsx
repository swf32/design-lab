import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Button } from '../../../atoms/actions/Button/Button'
import { Chip } from '../../../atoms/data-display/Chip/Chip'
import { MarketingNav, type MarketingNavProps } from './MarketingNav'

export function renderStoryExample(example: StoryExample) {
  const props = example.props as { authenticated?: boolean } | undefined
  const authenticated = Boolean(props?.authenticated)

  const actions: MarketingNavProps['actions'] = authenticated ? (
    <Chip color="success" variant="soft" size="small">
      Signed in
    </Chip>
  ) : (
    <Button variant="ghost" size="small">
      Sign in
    </Button>
  )

  return createElement(MarketingNav, {
    actions: (
      <>
        {actions}
        <Button variant="primary" size="small">
          Profile
        </Button>
      </>
    ),
  })
}

export const stories = [
  {
    id: 'auth-actions',
    kind: 'context',
    name: 'Authentication actions',
    description: 'Signed-in shows status chip; guests show a sign-in button.',
    examples: [
      { label: 'Guest', props: { authenticated: false } },
      { label: 'Signed in', props: { authenticated: true } },
    ],
  },
]
