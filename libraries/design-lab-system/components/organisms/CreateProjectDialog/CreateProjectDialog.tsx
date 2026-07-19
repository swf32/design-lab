import { useState, type FormEvent } from 'react'
import { Button } from '../../atoms/Button/Button'
import { useDesignLabI18n } from '../../../i18n'

type CreateProjectDialogProps = {
  open: boolean
  busy: boolean
  error: string | null
  canClose: boolean
  onClose: () => void
  onCreate: (input: { name: string }) => Promise<void>
}

export function CreateProjectDialog({ open, busy, error, canClose, onClose, onCreate }: CreateProjectDialogProps) {
  const {t}=useDesignLabI18n()
  const [name, setName] = useState('')

  if (!open) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onCreate({ name })
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="create-project-dialog" role="dialog" aria-modal="true" aria-labelledby="create-project-title">
        <header>
          <div>
            <span className="dialog-kicker">{t('project.new')}</span>
            <h2 id="create-project-title">{t('project.createTitle')}</h2>
          </div>
          {canClose && <button type="button" className="dialog-close" onClick={onClose} aria-label={t('action.close')}>×</button>}
        </header>
        <p className="dialog-description">{t('project.description')}</p>
        <form onSubmit={submit}>
          <label>
            <span>{t('project.name')}</span>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={t('project.placeholder')} minLength={2} maxLength={80} required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <footer>
            {canClose && <Button type="button" variant="secondary" onClick={onClose}>{t('action.cancel')}</Button>}
            <Button type="submit" variant="primary" disabled={busy || name.trim().length < 2}>{busy ? t('action.creating') : t('action.create')}</Button>
          </footer>
        </form>
      </section>
    </div>
  )
}
