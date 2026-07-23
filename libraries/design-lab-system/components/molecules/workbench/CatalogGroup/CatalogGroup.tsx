import './CatalogGroup.scss'
import type { ComponentProps, ReactNode } from 'react'

export type CatalogGroupProps = ComponentProps<'section'> & {
  title?: string
  count?: number
  children: ReactNode
}

export function CatalogGroup({ title, count, children, className, ...props }: CatalogGroupProps) {
  const hasHeader = title !== undefined
  return (
    <section
      className={`dl-catalog-group${hasHeader ? ' dl-catalog-group--with-header' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {hasHeader && (
        <header className="dl-catalog-group__header">
          <h2>{title}</h2>
          {count !== undefined && <span>{count}</span>}
        </header>
      )}
      {children}
    </section>
  )
}
