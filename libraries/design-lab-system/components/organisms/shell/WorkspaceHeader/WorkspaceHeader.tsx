import './WorkspaceHeader.scss'
import type { ComponentProps, ReactNode } from 'react'

export type WorkspaceHeaderProps = ComponentProps<'header'> & {
  productName: string
  sectionName: string
  navigation?: ReactNode
  actions?: ReactNode
}

export function WorkspaceHeader({
  productName,
  sectionName,
  navigation,
  actions,
  className,
  ...props
}: WorkspaceHeaderProps) {
  return (
    <header className={`dl-workspace-header${className ? ` ${className}` : ''}`} {...props}>
      {navigation && <div className="dl-workspace-header__navigation">{navigation}</div>}
      <div className="dl-workspace-header__title">
        <span>{productName}</span>
        <b aria-hidden="true">/</b>
        <strong>{sectionName}</strong>
      </div>
      {actions && <div className="dl-workspace-header__actions">{actions}</div>}
    </header>
  )
}
