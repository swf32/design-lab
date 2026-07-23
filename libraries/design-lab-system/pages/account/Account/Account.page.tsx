import './Account.page.scss'
import { Button, Chip } from '@design-lab/system/components'
import { StarIcon } from '@design-lab/system/icons'
import type { PageRenderContext } from '@design-lab/system/pages'
import avatarImage from '@design-lab/system/assets/images/stock/lavender-fabric.png'

export function renderPage({ values, onAction }: PageRenderContext) {
  const subscriptionActive = Boolean(values.subscriptionActive)

  return (
    <main className="dl-page-account">
      <header className="dl-page-account__header">
        <div className="dl-page-account__identity">
          <figure className="dl-page-account__avatar">
            <img src={avatarImage} alt="" />
          </figure>
          <div>
            <span className="dl-page-account__eyebrow">
              <StarIcon aria-hidden="true" />
              Member account
            </span>
            <h1>Alex Morgan</h1>
            <p>alex.morgan@designlab.dev</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => onAction({ id: 'log-out' })}>
          Log out
        </Button>
      </header>

      <div className="dl-page-account__grid">
        <section className="dl-page-account__card dl-page-account__card--subscription">
          <header>
            <div>
              <span>Subscription</span>
              <h2>Pro workspace</h2>
            </div>
            <Chip color={subscriptionActive ? 'success' : 'warning'} variant="soft">
              {subscriptionActive ? 'Active' : 'Inactive'}
            </Chip>
          </header>
          <p>
            {subscriptionActive
              ? 'Your plan renews on the 1st of each month. Manage billing or cancel anytime.'
              : 'Your subscription has ended. Reactivate to restore shared libraries and team seats.'}
          </p>
          <div className="dl-page-account__plan-meta">
            <div>
              <strong>{subscriptionActive ? '$42' : '$0'}</strong>
              <span>/ month</span>
            </div>
            <ul>
              <li>Unlimited projects</li>
              <li>Shared libraries</li>
              <li>Priority support</li>
            </ul>
          </div>
          {subscriptionActive ? (
            <Button variant="secondary" onClick={() => onAction({ id: 'manage-subscription' })}>
              Cancel subscription
            </Button>
          ) : (
            <Button variant="primary">Reactivate plan</Button>
          )}
        </section>

        <section className="dl-page-account__card">
          <header>
            <span>Workspace</span>
            <h2>Northstar Travel</h2>
          </header>
          <dl className="dl-page-account__details">
            <div>
              <dt>Role</dt>
              <dd>Owner</dd>
            </div>
            <div>
              <dt>Projects</dt>
              <dd>3 active</dd>
            </div>
            <div>
              <dt>Libraries</dt>
              <dd>2 linked</dd>
            </div>
          </dl>
        </section>

        <section className="dl-page-account__card">
          <header>
            <span>Security</span>
            <h2>Session & access</h2>
          </header>
          <dl className="dl-page-account__details">
            <div>
              <dt>Last sign-in</dt>
              <dd>Today, 09:14</dd>
            </div>
            <div>
              <dt>Two-factor</dt>
              <dd>
                <Chip color="warning" variant="soft" size="small">
                  Not enabled
                </Chip>
              </dd>
            </div>
            <div>
              <dt>API tokens</dt>
              <dd>1 active</dd>
            </div>
          </dl>
          <Button variant="ghost" size="small">
            Manage security
          </Button>
        </section>
      </div>
    </main>
  )
}
