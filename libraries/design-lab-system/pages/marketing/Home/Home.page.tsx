import './Home.page.scss'
import {
  Button,
  Chip,
  FeatureGrid,
  MarketingHero,
  MarketingNav,
  MarketingStory,
} from '@design-lab/system/components'
import {
  ComponentsIcon,
  PagesIcon,
  StarIcon,
  TokensIcon,
  WireframesIcon,
} from '@design-lab/system/icons'
import type { PageRenderContext } from '@design-lab/system/pages'
import heroImage from '@design-lab/system/assets/images/stock/modern-workspace.jpg'
import teamImage from '@design-lab/system/assets/images/stock/creative-team.jpg'

const features = [
  {
    icon: ComponentsIcon,
    title: 'Components',
    description:
      'Reusable UI primitives with manifests, previews, and a verified public contract agents can trust.',
  },
  {
    icon: WireframesIcon,
    title: 'Wireframes',
    description:
      'Compare layout directions, states, and user flows before committing to a production screen.',
  },
  {
    icon: PagesIcon,
    title: 'Pages',
    description:
      'Graduate the winning direction into a hand-off-ready screen composed only from real library code.',
  },
  {
    icon: TokensIcon,
    title: 'Tokens',
    description:
      'One semantic layer for color, spacing, type, and radius — shared across every surface in the workspace.',
  },
]

export function renderPage({ values, onAction }: PageRenderContext) {
  const authenticated = Boolean(values.authenticated)

  return (
    <main className="dl-page-home">
      <MarketingNav
        brandTitle="Design Lab"
        brandMeta="Filesystem-first product design"
        actions={
          authenticated ? (
            <>
              <Chip color="success" variant="soft" size="small">
                Signed in
              </Chip>
              <Button
                variant="primary"
                size="small"
                onClick={() => onAction({ id: 'open-profile' })}
              >
                Profile
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="small" onClick={() => onAction({ id: 'sign-in' })}>
                Sign in
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => onAction({ id: 'open-profile' })}
              >
                Profile
              </Button>
            </>
          )
        }
      />

      <MarketingHero
        chip={
          <Chip
            color="accent"
            variant="soft"
            size="small"
            startContent={<StarIcon aria-hidden="true" />}
          >
            Now in review
          </Chip>
        }
        title="Ship products, not decks"
        description={
          <>
            Design Lab keeps components, Wireframes, and Pages in one filesystem-first workspace.
            Agents search by intent, verify the contract, and reuse what already exists.
          </>
        }
        actions={
          <>
            <Button variant="primary" size="large" onClick={() => onAction({ id: 'open-profile' })}>
              {authenticated ? 'Open account' : 'Get started'}
            </Button>
            {!authenticated && (
              <Button variant="secondary" size="large" onClick={() => onAction({ id: 'sign-in' })}>
                Sign in (dev mode)
              </Button>
            )}
          </>
        }
        status={
          authenticated
            ? 'Signed in · Profile leads to Account.'
            : 'Not signed in · Profile leads to Auth.'
        }
        media={<img src={heroImage} alt="Modern organized workspace and desk" />}
      />

      <FeatureGrid
        eyebrow="Why teams choose Design Lab"
        title="One source of truth for every screen"
        headingId="home-features-heading"
        description={
          <>
            From atomic tokens to finished Pages, everything lives in canonical project and library
            directories — discoverable, reviewable, and ready for production hand-off.
          </>
        }
        items={features.map(({ icon: Icon, title, description }) => ({
          icon: <Icon aria-hidden="true" />,
          title,
          description,
        }))}
      />

      <MarketingStory
        eyebrow="Built for product teams"
        title="Design and engineering on the same page"
        headingId="home-story-heading"
        description={
          <>
            Wireframes explore directions; Pages commit to one. Components carry real props and
            states. MCP and CLI expose the same context gateway so agents never guess filenames.
          </>
        }
        actions={
          <Button variant="secondary" onClick={() => onAction({ id: 'open-profile' })}>
            Explore the workspace
          </Button>
        }
        media={<img src={teamImage} alt="Creative team collaborating together" />}
      />
    </main>
  )
}
