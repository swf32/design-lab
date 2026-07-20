import './Home.page.scss'
import { Button } from '@design-lab/system/components'
import type { PageRenderContext } from '@design-lab/system/pages'

export function renderPage({ values, onAction }: PageRenderContext) {
  const authenticated = Boolean(values.authenticated)
  return (
    <main className="dl-page-home">
      <section className="dl-page-home__hero">
        <h1>Ship products, not decks</h1>
        <p>Design Lab keeps components, Wireframes, and Pages in one filesystem-first workspace.</p>
        <div className="dl-page-home__actions">
          <Button variant="primary" size="large" onClick={() => onAction({ id: 'open-profile' })}>
            Profile
          </Button>
          {!authenticated && (
            <Button variant="ghost" size="large" onClick={() => onAction({ id: 'sign-in' })}>
              Sign in (dev mode)
            </Button>
          )}
        </div>
      </section>
      <p className="dl-page-home__status">
        {authenticated ? 'Signed in' : 'Not signed in'} · Profile leads to{' '}
        {authenticated ? 'Account' : 'Auth'}.
      </p>
    </main>
  )
}
