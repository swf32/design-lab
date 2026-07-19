import './PlaygroundControlsRail.scss'
import type { HTMLAttributes, ReactNode } from 'react'
import { inspectionAttributes, slotAttributes } from '@design-lab/system/inspection'

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
      {...inspectionAttributes('PlaygroundControlsRail', {
        label,
        hasFooter: Boolean(footer),
      })}
      {...props}
      className={`dl-playground-controls-rail${className ? ` ${className}` : ''}`}
      aria-label={label}
    >
      <header className="dl-playground-controls-rail__header" {...slotAttributes('header')}>
        {header}
      </header>
      <div className="dl-playground-controls-rail__body" {...slotAttributes('content')}>
        {children}
      </div>
      {footer && (
        <footer className="dl-playground-controls-rail__footer" {...slotAttributes('footer')}>
          {footer}
        </footer>
      )}
    </aside>
  )
}
