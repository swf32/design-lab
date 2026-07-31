import './CreateProjectDialog.scss'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Button } from '../../../atoms/actions/Button/Button'
import { Input } from '../../../atoms/inputs/Input/Input'
import { RadioButton } from '../../../atoms/inputs/RadioButton/RadioButton'
import { useDesignLabI18n, type MessageKey } from '../../../../i18n'
import { Dialog } from '../Dialog/Dialog'

export type ProjectSetupMode = 'attach' | 'managed'

export type ProjectSetupSummary = {
  name: string
  scan: {
    frameworks: string[]
    found: Record<string, { files: number } | undefined>
  }
  changes: {
    createFiles: string[]
    updateFiles: string[]
  }
}

export type CreateProjectDialogProps = {
  open: boolean
  busy: boolean
  error: string | null
  canClose: boolean
  onClose: () => void
  onScan: (input: { name: string; mode: ProjectSetupMode }) => Promise<ProjectSetupSummary>
  onCreate: (input: { name: string; mode: ProjectSetupMode }) => Promise<void>
}

const summaryKinds: Array<{ kind: string; message: MessageKey }> = [
  { kind: 'components', message: 'project.found.components' },
  { kind: 'tokens', message: 'project.found.tokens' },
  { kind: 'assets', message: 'project.found.assets' },
  { kind: 'fonts', message: 'project.found.fonts' },
  { kind: 'pages', message: 'project.found.pages' },
  { kind: 'wireframes', message: 'project.found.wireframes' },
]

export function CreateProjectDialog({
  open,
  busy,
  error,
  canClose,
  onClose,
  onScan,
  onCreate,
}: CreateProjectDialogProps) {
  const { t } = useDesignLabI18n()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<ProjectSetupMode>('attach')
  const [plan, setPlan] = useState<ProjectSetupSummary | null>(null)
  const formId = `create-project-form-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (!open) return
    setName('')
    setMode('attach')
    setPlan(null)
  }, [open])

  const selectMode = (nextMode: ProjectSetupMode) => {
    setMode(nextMode)
    setPlan(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'attach' && !plan) {
      const result = await onScan({ name, mode })
      setPlan(result)
      if (!name.trim()) setName(result.name)
      return
    }
    await onCreate({ name, mode })
  }

  const reviewingExistingProject = mode === 'attach' && plan !== null
  const title = reviewingExistingProject ? t('project.reviewTitle') : t('project.createTitle')
  const description = reviewingExistingProject
    ? t('project.reviewDescription')
    : t('project.description')

  return (
    <Dialog
      open={open}
      dismissible={canClose && !busy}
      size="large"
      eyebrow={t('project.new')}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          {reviewingExistingProject && (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setPlan(null)}>
              {t('action.back')}
            </Button>
          )}
          {canClose && (
            <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
              {t('action.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            form={formId}
            variant="primary"
            loading={busy}
            disabled={name.trim().length < 2}
          >
            {reviewingExistingProject
              ? t('action.connectProject')
              : mode === 'attach'
                ? t('action.reviewSetup')
                : t('action.create')}
          </Button>
        </>
      }
    >
      <form id={formId} className="dl-create-project-form" onSubmit={submit}>
        {!reviewingExistingProject && (
          <fieldset className="dl-create-project-form__choices">
            <legend>{t('project.startQuestion')}</legend>
            <RadioButton
              name="project-setup-mode"
              value="attach"
              checked={mode === 'attach'}
              onChange={() => selectMode('attach')}
              label={t('project.attachTitle')}
              description={t('project.attachDescription')}
            />
            <RadioButton
              name="project-setup-mode"
              value="managed"
              checked={mode === 'managed'}
              onChange={() => selectMode('managed')}
              label={t('project.managedTitle')}
              description={t('project.managedDescription')}
            />
          </fieldset>
        )}

        <Input
          label={t('project.name')}
          autoFocus={!reviewingExistingProject}
          value={name}
          onChange={(event) => {
            setName(event.currentTarget.value)
            if (plan) setPlan(null)
          }}
          placeholder={t('project.placeholder')}
          minLength={2}
          maxLength={80}
          required
          fullWidth
          errorMessage={error}
        />

        {reviewingExistingProject && plan && (
          <section className="dl-setup-review" aria-live="polite">
            <header className="dl-setup-review__header">
              <strong>{t('project.foundTitle')}</strong>
              <span>
                {plan.scan.frameworks.length
                  ? plan.scan.frameworks.join(', ')
                  : t('project.frameworkUnknown')}
              </span>
            </header>
            <div className="dl-setup-review__summary">
              {summaryKinds.map(({ kind, message }) => (
                <div className="dl-setup-review__item" key={kind}>
                  <strong>{plan.scan.found[kind]?.files ?? 0}</strong>
                  <span>{t(message)}</span>
                </div>
              ))}
            </div>
            <p className="dl-setup-review__promise">{t('project.noMovePromise')}</p>
            <details className="dl-setup-review__details">
              <summary>{t('project.showDetails')}</summary>
              <ul>
                {plan.changes.createFiles.map((file) => (
                  <li key={file}>{file}</li>
                ))}
                {plan.changes.updateFiles.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </details>
          </section>
        )}
      </form>
    </Dialog>
  )
}
