import './ModuleHeader.scss'
import type { ReactNode } from 'react'
import { ArrowLeftIcon } from '../../../../assets/icons'
import { Button } from '../../../atoms/actions/Button/Button'

export function ModuleHeader({
  eyebrow,
  title,
  count,
  backLabel,
  onBack,
  meta,
  actions,
}: {
  eyebrow: string
  title: string
  count?: number
  backLabel?: string
  onBack?: () => void
  meta?: string
  actions?: ReactNode
}) {
  const hasUtilities = meta !== undefined || count !== undefined || actions !== undefined

  return (
    <header className={`dl-module-header${onBack ? ' dl-module-header--with-back' : ''}`}>
      {onBack && (
        <nav className="dl-module-header__navigation" aria-label={backLabel ?? 'Back'}>
          <Button
            type="button"
            className="dl-module-header__back"
            variant="secondary"
            leading={<ArrowLeftIcon size={16} aria-hidden="true" focusable="false" />}
            onClick={onBack}
          >
            {backLabel ?? 'Back'}
          </Button>
        </nav>
      )}
      <div className="dl-module-header__identity">
        <span className="dl-module-header__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {hasUtilities && (
        <div className="dl-module-header__utilities">
          {meta && (
            <code className="dl-module-header__meta" title={meta}>
              {meta}
            </code>
          )}
          {count !== undefined && <strong className="dl-module-header__count">{count}</strong>}
          {actions && <div className="dl-module-header__actions">{actions}</div>}
        </div>
      )}
    </header>
  )
}
