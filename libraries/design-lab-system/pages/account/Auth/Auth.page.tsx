import './Auth.page.scss'
import { useState } from 'react'
import { Button, Checkbox, Input } from '@design-lab/system/components'
import { StarIcon } from '@design-lab/system/icons'
import type { PageAction, PageRenderContext } from '@design-lab/system/pages'
import sideImage from '@design-lab/system/assets/images/stock/geometric-architecture.webp'

function AuthForm({
  formError,
  onAction,
}: {
  formError: boolean
  onAction: (action: PageAction) => void
}) {
  const [email, setEmail] = useState('')

  return (
    <form
      className="dl-page-auth__card"
      onSubmit={(event) => {
        event.preventDefault()
        onAction(
          email.includes('@')
            ? { id: 'submit-valid' }
            : { id: 'submit', values: { formError: true } },
        )
      }}
    >
      <header className="dl-page-auth__card-header">
        <span className="dl-page-auth__brand" aria-hidden="true">
          <StarIcon />
        </span>
        <div>
          <h1>Sign in</h1>
          <p>Welcome back. Enter your credentials to continue to your workspace.</p>
        </div>
      </header>

      <div className="dl-page-auth__fields">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          fullWidth
          errorMessage={formError ? 'Check your email and password and try again.' : undefined}
        />
        <Input label="Password" type="password" placeholder="••••••••" fullWidth />
      </div>

      <div className="dl-page-auth__options">
        <Checkbox label="Remember me" defaultChecked />
        <button type="button" className="dl-page-auth__link">
          Forgot password?
        </button>
      </div>

      <div className="dl-page-auth__actions">
        <Button type="submit" variant="primary" fullWidth size="large">
          Sign in
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={() => onAction({ id: 'back' })}>
          Back to Home
        </Button>
      </div>
    </form>
  )
}

export function renderPage({ values, onAction }: PageRenderContext) {
  return (
    <main className="dl-page-auth">
      <section className="dl-page-auth__panel">
        <AuthForm formError={Boolean(values.formError)} onAction={onAction} />
      </section>
      <aside className="dl-page-auth__visual" aria-hidden="true">
        <img src={sideImage} alt="" />
        <div className="dl-page-auth__visual-copy">
          <span>Design Lab</span>
          <p>Filesystem-backed context for agents and product teams.</p>
        </div>
      </aside>
    </main>
  )
}
