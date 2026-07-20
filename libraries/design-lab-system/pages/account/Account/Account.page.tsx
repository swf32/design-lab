import './Account.page.scss'
import { Button, Chip } from '@design-lab/system/components'
import type { PageRenderContext } from '@design-lab/system/pages'

export function renderPage({ values, onAction }: PageRenderContext) {
  const subscriptionActive = Boolean(values.subscriptionActive)
  return (
    <main className="dl-page-account">
      <header className="dl-page-account__header">
        <h1>Account</h1>
        <Button variant="ghost" onClick={() => onAction({ id: 'log-out' })}>
          Log out
        </Button>
      </header>
      <section className="dl-page-account__card">
        <div>
          <strong>Subscription</strong>
          <Chip color={subscriptionActive ? 'success' : 'warning'} variant="soft">
            {subscriptionActive ? 'Active' : 'Inactive'}
          </Chip>
        </div>
        {subscriptionActive && (
          <Button variant="secondary" onClick={() => onAction({ id: 'manage-subscription' })}>
            Cancel subscription
          </Button>
        )}
      </section>
    </main>
  )
}
