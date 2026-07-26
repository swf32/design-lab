import './Dialog.scss'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseIcon } from '../../../../assets/icons/CloseIcon'
import { useDesignLabI18n } from '../../../../i18n'
import { IconButton } from '../../../atoms/actions/IconButton/IconButton'

export type DialogSize = 'small' | 'medium' | 'large'

export type DialogProps = {
  open: boolean
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: DialogSize
  dismissible?: boolean
  onClose: () => void
  className?: string
}

export function Dialog({
  open,
  title,
  eyebrow,
  description,
  children,
  footer,
  size = 'medium',
  dismissible = true,
  onClose,
  className = '',
}: DialogProps) {
  const { t } = useDesignLabI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = `dl-dialog-title-${useId().replace(/:/g, '')}`
  const descriptionId = description ? `${titleId}-description` : undefined

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!open) {
      if (dialog.open) dialog.close()
      return
    }

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!dialog.open) dialog.showModal()
    const focusFrame = window.requestAnimationFrame(() => {
      const preferred = dialog.querySelector<HTMLElement>('[autofocus]')
      const fallback = dialog.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      ;(preferred ?? fallback)?.focus()
    })

    return () => {
      window.cancelAnimationFrame(focusFrame)
      if (dialog.open) dialog.close()
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`dl-dialog dl-dialog--${size}${className ? ` ${className}` : ''}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      <section className="dl-dialog__surface">
        <header className="dl-dialog__header">
          <div className="dl-dialog__heading">
            {eyebrow != null && <span className="dl-dialog__eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          {dismissible && (
            <IconButton
              type="button"
              className="dl-dialog__close"
              aria-label={t('action.close')}
              title={t('action.close')}
              onClick={onClose}
            >
              <CloseIcon size={14} />
            </IconButton>
          )}
        </header>
        {description != null && (
          <p id={descriptionId} className="dl-dialog__description">
            {description}
          </p>
        )}
        {children != null && <div className="dl-dialog__body">{children}</div>}
        {footer != null && <footer className="dl-dialog__footer">{footer}</footer>}
      </section>
    </dialog>
  )
}
