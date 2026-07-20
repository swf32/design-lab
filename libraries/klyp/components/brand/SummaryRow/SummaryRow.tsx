import type { ReactNode } from 'react'

import './SummaryRow.scss'

export interface SummaryRowProps {
  /** Left-side label (string or React node). */
  label: ReactNode
  /** Right-side value. Numbers render in tabular-nums automatically. */
  value: ReactNode
  /** Hierarchy hint — `bold` rows (e.g. "Total", "You'll receive") use heavier weight. */
  emphasis?: 'default' | 'bold'
  /** Optional muted parenthetical or note shown next to the label (e.g. "(TRC20)"). */
  hint?: ReactNode
  /** Optional value tint for success / danger states. */
  tone?: 'default' | 'success' | 'danger'
}

/**
 * Key:value row used in Review / Confirm summary cards. Renders the value
 * with `tabular-nums` so figures line up across stacked rows. Optional
 * `hint` shows a muted parenthetical next to the label; `tone` tints the
 * value; `emphasis="bold"` raises the value weight to medium.
 */
export function SummaryRow({
  label,
  value,
  emphasis = 'default',
  hint,
  tone = 'default',
}: SummaryRowProps) {
  return (
    <div className="klyp-SummaryRow" data-emphasis={emphasis} data-tone={tone}>
      <span className="klyp-SummaryRow__label">
        {label}
        {hint != null && hint !== false && <span className="klyp-SummaryRow__hint">{hint}</span>}
      </span>
      <span className="klyp-SummaryRow__value">{value}</span>
    </div>
  )
}

export default SummaryRow
