import './Auth.page.scss'
import { useState } from 'react'
import { Button, Input } from '@design-lab/system/components'
import type { PageRenderContext } from '@design-lab/system/pages'

export function renderPage({ values, onAction }: PageRenderContext) {
  const formError = Boolean(values.formError)
  const [email, setEmail] = useState('')
  return (
    <main className="dl-page-auth">
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
        <h1>Sign in</h1>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
          errorMessage={formError ? 'Check your email and password and try again.' : undefined}
        />
        <Input label="Password" type="password" fullWidth />
        <Button type="submit" variant="primary" fullWidth>
          Sign in
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={() => onAction({ id: 'back' })}>
          Back to Home
        </Button>
      </form>
    </main>
  )
}
