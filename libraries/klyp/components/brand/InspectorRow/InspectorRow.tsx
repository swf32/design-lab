import './InspectorRow.scss'

import type { ComponentProps, ReactNode } from 'react'

/**
 * Label↔value pair for inspector / settings panels.
 * Used in the right-side Generate panel (Model / Duration / Aspect / Style preset)
 * and in any future Inspector tab.
 *
 * Pass a string `value` for plain text, or use `children` for a richer node
 * (e.g. a `<Button variant="ghost">Kling 2.6 ▾</Button>` dropdown trigger).
 *
 * Adaptive: stacks at narrow parents (≤220px container) — label above value.
 */
type InspectorRowProps = ComponentProps<'div'> & {
  label: ReactNode
  /** Plain-text value. Mutually exclusive with `children`. */
  value?: ReactNode
  /** Optional leading icon, rendered before the label. */
  icon?: ReactNode
}

export function InspectorRow({
  label,
  value,
  icon,
  className,
  children,
  ...props
}: InspectorRowProps) {
  const composedClassName =
    typeof className === 'string' && className.length > 0
      ? `klyp-InspectorRow ${className}`
      : 'klyp-InspectorRow'

  return (
    <div data-slot="inspector-row" className={composedClassName} {...props}>
      <span className="klyp-InspectorRow__label">
        {icon}
        <span className="klyp-InspectorRow__labelText">{label}</span>
      </span>
      <span className="klyp-InspectorRow__value">{children ?? value}</span>
    </div>
  )
}
