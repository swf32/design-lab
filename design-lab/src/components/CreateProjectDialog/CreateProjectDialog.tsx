import './CreateProjectDialog.scss'
import { useId, useState, type FormEvent } from 'react'
import { Button, Dialog, Input } from '@design-lab/system/components'
import { useDesignLabI18n } from '@design-lab/system/i18n'

type CreateProjectDialogProps = {
  open: boolean
  busy: boolean
  error: string | null
  canClose: boolean
  onClose: () => void
  onCreate: (input: { name: string }) => Promise<void>
}

export function CreateProjectDialog({
  open,
  busy,
  error,
  canClose,
  onClose,
  onCreate,
}: CreateProjectDialogProps) {
  const { t } = useDesignLabI18n()
  const [name, setName] = useState('')
  const formId = `create-project-form-${useId().replace(/:/g, '')}`

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onCreate({ name })
  }

  return (
    <Dialog
      open={open}
      dismissible={canClose}
      eyebrow={t('project.new')}
      title={t('project.createTitle')}
      description={t('project.description')}
      onClose={onClose}
      footer={
        <>
          {canClose && (
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('action.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={busy || name.trim().length < 2}
          >
            {busy ? t('action.creating') : t('action.create')}
          </Button>
        </>
      }
    >
      <form id={formId} className="create-project-form" onSubmit={submit}>
        <Input
          label={t('project.name')}
          autoFocus
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder={t('project.placeholder')}
          minLength={2}
          maxLength={80}
          required
          fullWidth
          errorMessage={error}
        />
      </form>
    </Dialog>
  )
}
