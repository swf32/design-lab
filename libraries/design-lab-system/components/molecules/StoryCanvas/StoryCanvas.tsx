import type { ReactNode } from 'react'

type StoryCanvasProps = {
  title: string
  description?: string
  children: ReactNode
  meta?: ReactNode
}

export function StoryCanvas({ title, description, children, meta }: StoryCanvasProps) {
  return (
    <article className="dl-story-canvas">
      <header className="dl-story-canvas__header">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {meta && <code>{meta}</code>}
      </header>
      <div className="dl-story-canvas__stage">{children}</div>
    </article>
  )
}
