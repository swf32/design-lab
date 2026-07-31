import './EmptyState.scss'
import type { ComponentProps, ReactNode } from 'react'

export type EmptyStateProps = Omit<ComponentProps<'section'>, 'title'> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <section className={`dl-empty-state${className ? ` ${className}` : ''}`} {...props}>
      {icon && <div className="dl-empty-state__icon">{icon}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {action && <div className="dl-empty-state__action">{action}</div>}
    </section>
  )
}
