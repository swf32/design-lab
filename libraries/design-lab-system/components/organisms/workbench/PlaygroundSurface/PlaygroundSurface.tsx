import type { ComponentProps } from 'react'
import './PlaygroundSurface.scss'

export type PlaygroundSurfaceProps = ComponentProps<'main'> & {
  controlsOpen?: boolean
}

export function PlaygroundSurface({
  controlsOpen = false,
  className,
  ...props
}: PlaygroundSurfaceProps) {
  return (
    <main
      className={['component-playground-page', controlsOpen && 'is-controls-open', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
