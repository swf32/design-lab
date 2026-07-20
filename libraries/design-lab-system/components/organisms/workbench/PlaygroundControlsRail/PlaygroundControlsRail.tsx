import './PlaygroundControlsRail.scss'
import type { HTMLAttributes, ReactNode } from 'react'

export type PlaygroundControlsRailProps = HTMLAttributes<HTMLElement> & {
  label?: string
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function PlaygroundControlsRail({
  label = 'Playground settings',
  header,
  children,
  footer,
  className = '',
  ...props
}: PlaygroundControlsRailProps) {
  return (
    <aside
      {...props}
      className={`dl-playground-controls-rail${className ? ` ${className}` : ''}`}
      aria-label={label}
    >
      <header className="dl-playground-controls-rail__header">{header}</header>
      <div className="dl-playground-controls-rail__body">{children}</div>
      {footer && <footer className="dl-playground-controls-rail__footer">{footer}</footer>}
    </aside>
  )
}
