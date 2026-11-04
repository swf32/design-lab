import type { ComponentProps } from 'react'
import './CaptureSurface.scss'

export type CaptureSurfaceProps = ComponentProps<'main'> & {
  kind: 'state' | 'preview' | 'story'
}

export function CaptureSurface({ kind, className, ...props }: CaptureSurfaceProps) {
  const baseClass =
    kind === 'state' ? 'component-capture-state' : `component-capture component-capture--${kind}`
  return <main className={[baseClass, className].filter(Boolean).join(' ')} {...props} />
}
