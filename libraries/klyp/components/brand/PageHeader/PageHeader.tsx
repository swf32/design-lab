import './PageHeader.scss'

import { AppTopbar, type Crumb, type LinkComponent } from '@klyp/brand/AppTopbar'
import { SectionHeader } from '@klyp/brand/SectionHeader'
import type { ComponentProps, ReactNode } from 'react'

type PageHeaderProps = ComponentProps<'div'> & {
  /** Breadcrumb trail. Last item becomes the current page. */
  crumbs?: Crumb[]
  /** Override the current page label (default: last crumb). */
  current?: string
  /** Tiny eyebrow above the title. */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Right-side primary actions (CTA buttons, menus). */
  actions?: ReactNode
  /** Heading level. Default 1 (page title). */
  level?: 1 | 2
  /**
   * Forwarded to `<AppTopbar>` — caller injects the app's router `<Link>`
   * (e.g. TanStack `<Link>`) for client-side breadcrumb navigation.
   */
  linkComponent?: LinkComponent
}

/**
 * Composite page header used by every drill-down route. Combines breadcrumbs,
 * eyebrow + title + description, and an actions row in one block.
 *
 * Most routes start with this exact pattern — owning it here keeps spacing,
 * typography, and breadcrumb separator behavior consistent.
 */
export function PageHeader({
  crumbs,
  current,
  eyebrow,
  title,
  description,
  actions,
  level = 1,
  linkComponent,
  className,
  ...props
}: PageHeaderProps) {
  // B5: <header> → <div>. AppTopbar and SectionHeader each render their
  // own <header> — outer wrapper as <header> creates triple-nested
  // landmarks (a11y noise). The inner SectionHeader keeps the semantic
  // <header> for this section.
  return (
    <div
      data-slot="page-header"
      className={typeof className === 'string' ? `klyp-PageHeader ${className}` : 'klyp-PageHeader'}
      {...props}
    >
      {crumbs && crumbs.length > 0 && (
        <AppTopbar crumbs={crumbs} current={current} linkComponent={linkComponent} />
      )}
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
        level={level}
      />
    </div>
  )
}
