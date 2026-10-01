import { useId, type ReactNode } from 'react'
import './SettingsPanel.scss'

export type SettingsPanelProps = {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode
  prominent?: boolean
  className?: string
}

export function SettingsPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  prominent = false,
  className,
}: SettingsPanelProps) {
  const titleId = useId()
  const Heading = prominent ? 'h2' : 'h3'
  return (
    <section
      className={['dl-settings-panel', prominent && 'dl-settings-panel--prominent', className]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={titleId}
    >
      <header className="dl-settings-panel__header">
        <div>
          <span className="dl-settings-panel__eyebrow">{eyebrow}</span>
          <Heading className="dl-settings-panel__title" id={titleId}>
            {title}
          </Heading>
          {description && <p className="dl-settings-panel__description">{description}</p>}
        </div>
        {action && <div className="dl-settings-panel__action">{action}</div>}
      </header>
      {children && <div className="dl-settings-panel__content">{children}</div>}
    </section>
  )
}
