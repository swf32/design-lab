import './MarketingHero.scss'
import type { ReactNode } from 'react'

export type MarketingHeroProps = {
  title: string
  description: ReactNode
  media: ReactNode
  chip?: ReactNode
  actions?: ReactNode
  status?: ReactNode
}

export function MarketingHero({
  chip,
  title,
  description,
  actions,
  status,
  media,
}: MarketingHeroProps) {
  return (
    <section className="dl-marketing-hero">
      <div className="dl-marketing-hero__copy">
        {chip}
        <h1>{title}</h1>
        <p className="dl-marketing-hero__description">{description}</p>
        <div className="dl-marketing-hero__actions">{actions}</div>
        {status != null && <p className="dl-marketing-hero__status">{status}</p>}
      </div>
      <figure className="dl-marketing-hero__media">{media}</figure>
    </section>
  )
}
