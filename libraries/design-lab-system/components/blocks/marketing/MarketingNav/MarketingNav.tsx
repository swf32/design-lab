import './MarketingNav.scss'
import type { ReactNode } from 'react'
import { StarIcon } from '@design-lab/system/icons'

export type MarketingNavProps = {
  ariaLabel?: string
  brandTitle?: string
  brandMeta?: string
  brandHref?: string
  actions?: ReactNode
}

export function MarketingNav({
  ariaLabel = 'Marketing',
  brandTitle = 'Design Lab',
  brandMeta = 'Filesystem-first product design',
  brandHref = '#',
  actions,
}: MarketingNavProps) {
  return (
    <nav className="dl-marketing-nav" aria-label={ariaLabel}>
      <a className="dl-marketing-nav__brand" href={brandHref}>
        <StarIcon aria-hidden="true" />
        {brandTitle}
      </a>
      <span className="dl-marketing-nav__meta">{brandMeta}</span>
      <div className="dl-marketing-nav__actions">{actions}</div>
    </nav>
  )
}
