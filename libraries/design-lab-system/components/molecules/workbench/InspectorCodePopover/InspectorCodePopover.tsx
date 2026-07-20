import './InspectorCodePopover.scss'
import type { CSSProperties } from 'react'
import { CodeBlock } from '../../data-display/CodeBlock/CodeBlock'

export type InspectorKind = 'component' | 'slot' | 'element'

export type InspectorCodePopoverProps = {
  kind: InspectorKind
  name: string
  code: string
  language: 'tsx' | 'html' | 'scss'
  style?: CSSProperties
  className?: string
}

export function InspectorCodePopover({
  kind,
  name,
  code,
  language,
  style,
  className = '',
}: InspectorCodePopoverProps) {
  return (
    <section
      className={`dl-inspector-code-popover dl-inspector-code-popover--${kind}${className ? ` ${className}` : ''}`}
      style={style}
      aria-live="polite"
      aria-label={`${kind} inspection`}
    >
      <header className="dl-inspector-code-popover__identity">
        <span>{kind}</span>
        <strong>{name}</strong>
      </header>
      <CodeBlock code={code} language={language} showCopy={false} copyOnClick />
    </section>
  )
}
