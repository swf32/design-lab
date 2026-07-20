import './BulkActionsBar.scss'

import { CloseCircleOutline } from '@klyp/icons/outline'
import type { ReactNode, Ref } from 'react'

/**
 * `<BulkActionsBar>` — floating bottom-centered action bar that surfaces
 * when ≥ 1 items are selected. Magnific pattern: dismissable via `X` on
 * the left, "N items selected" label next to it, then a flex row of
 * caller-provided action buttons.
 *
 * Caller owns the actions — pass `<ToolButton>` / `<Button>` children in
 * the order you want. Common combinations are Download / Upscale /
 * Create video / Favorite / Move / Delete.
 *
 * Positioning: by default `position: fixed; bottom: var(--space-24);
 * left: 50%; transform: translateX(-50%);` — appears inside the viewport
 * regardless of scroll container. Pass `inline` to opt-out and let the
 * parent position the bar with its own layout.
 */

export type BulkActionsBarProps = {
  /** Number of selected items — shown next to the close button. */
  count: number
  /** Callback wired to the X button on the left. */
  onClear: () => void
  /** Action buttons. Render as `<Button>` / `<ToolButton>` from `@klyp/brand`. */
  children: ReactNode
  /** Override the label format. Default: `${count} item${count===1?'':'s'} selected`. */
  label?: string
  /** Position inline (relative) instead of fixed-bottom-centered. */
  inline?: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function BulkActionsBar({
  count,
  onClear,
  children,
  label,
  inline,
  className,
  ref,
}: BulkActionsBarProps) {
  const resolvedLabel = label ?? `${count} item${count === 1 ? '' : 's'} selected`
  const rootClass =
    typeof className === 'string' ? `klyp-BulkActionsBar ${className}` : 'klyp-BulkActionsBar'

  return (
    <div
      ref={ref}
      className={rootClass}
      role="toolbar"
      aria-label="Bulk selection actions"
      data-inline={inline || undefined}
    >
      <button
        type="button"
        className="klyp-BulkActionsBar__clear"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <CloseCircleOutline width={18} height={18} />
      </button>
      <span className="klyp-BulkActionsBar__label" aria-live="polite">
        {resolvedLabel}
      </span>
      <div className="klyp-BulkActionsBar__actions">{children}</div>
    </div>
  )
}
