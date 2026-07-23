import './MarketingStory.scss'
import type { ReactNode } from 'react'

export type MarketingStoryProps = {
  eyebrow?: string
  title: string
  description: ReactNode
  media: ReactNode
  actions?: ReactNode
  headingId?: string
}

export function MarketingStory({
  eyebrow,
  title,
  description,
  media,
  actions,
  headingId,
}: MarketingStoryProps) {
  return (
    <section className="dl-marketing-story" aria-labelledby={headingId}>
      <figure className="dl-marketing-story__media">{media}</figure>
      <div className="dl-marketing-story__copy">
        {eyebrow != null && <span>{eyebrow}</span>}
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
        {actions}
      </div>
    </section>
  )
}
