import './FeatureGrid.scss'
import type { ReactNode } from 'react'

export type FeatureGridItem = {
  icon: ReactNode
  title: string
  description: ReactNode
}

export type FeatureGridProps = {
  eyebrow?: string
  title: string
  description: ReactNode
  headingId?: string
  items: FeatureGridItem[]
}

export function FeatureGrid({ eyebrow, title, description, headingId, items }: FeatureGridProps) {
  return (
    <section className="dl-feature-grid" aria-labelledby={headingId}>
      <header className="dl-feature-grid__header">
        {eyebrow != null && <span>{eyebrow}</span>}
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
      </header>
      <ul className="dl-feature-grid__list">
        {items.map(({ icon, title: itemTitle, description: itemDescription }) => (
          <li key={itemTitle}>
            <span className="dl-feature-grid__icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{itemTitle}</h3>
            <p>{itemDescription}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
