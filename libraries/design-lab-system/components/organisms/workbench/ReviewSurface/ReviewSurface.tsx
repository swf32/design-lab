import type { ComponentProps } from 'react'
import './ReviewSurface.scss'

export type ReviewSurfaceProps = ComponentProps<'main'> & {
  kind: 'page' | 'wireframe'
}

export function ReviewSurface({ kind, className, ...props }: ReviewSurfaceProps) {
  return <main className={[`${kind}-view`, className].filter(Boolean).join(' ')} {...props} />
}
