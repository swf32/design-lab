import './SectionHeader.scss'

import type { ComponentProps, ReactNode } from 'react'

// =====================================================================
// SectionHeader — Klyp brand molecule
// =====================================================================
//
// Eyebrow + title + (optional) description on the left, actions on the right.
// Used as the canonical section/page header (paired with PageHeader for
// breadcrumb-led pages).

export type SectionHeaderProps = ComponentProps<'header'> & {
  /** Tiny eyebrow label above the title (e.g. "Episode 02"). */
  eyebrow?: ReactNode
  /** Main heading. */
  title: ReactNode
  /** Subhead / supporting copy. */
  description?: ReactNode
  /** Slot for actions (buttons, menus) on the right. */
  actions?: ReactNode
  /** Render the title as h1/h2/h3. Default h2. */
  level?: 1 | 2 | 3
  align?: 'start' | 'center'
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  level = 2,
  align = 'start',
  className,
  ...props
}: SectionHeaderProps) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3'
  const composedClassName =
    typeof className === 'string' && className.length > 0
      ? `klyp-SectionHeader ${className}`
      : 'klyp-SectionHeader'

  return (
    <header
      data-slot="section-header"
      data-align={align}
      data-level={level}
      className={composedClassName}
      {...props}
    >
      <div className="klyp-SectionHeader__body">
        {eyebrow && <span className="klyp-SectionHeader__eyebrow">{eyebrow}</span>}
        <Heading className="klyp-SectionHeader__heading">{title}</Heading>
        {description && <p className="klyp-SectionHeader__description">{description}</p>}
      </div>
      {actions && <div className="klyp-SectionHeader__actions">{actions}</div>}
    </header>
  )
}
