import './ModalToolbar.scss'

import type { ReactNode } from 'react'

// =====================================================================
// ModalToolbar — brand molecule. A modal / sheet toolbar band: a filter-
// control cluster paired with a search field.
//
//   - Desktop (container ≥ 640px): controls fill the LEFT, the search is
//     pinned RIGHT at a fixed width (400px, overridable via the
//     `--modal-toolbar-search-w` custom property).
//   - Mobile (narrow container): controls on TOP (one wrapping row), the
//     search edge-to-edge BELOW.
//
// Layout-only + slot-based — the consumer owns the control + search nodes.
// The modal's footer band (selection summary + primary action) is owned by
// each consumer directly (e.g. LibraryPicker's `__footer`).
// Responsive via a CONTAINER query, so it adapts to its own width (a full
// desktop modal vs a narrow mobile sheet) rather than the viewport.
// =====================================================================

export interface ModalToolbarProps {
  /** Filter / control cluster — fills the left on desktop, a wrapping row on top on mobile. */
  controls: ReactNode
  /** Search field — pinned right (fixed width) on desktop, full-width below on mobile. */
  search: ReactNode
  className?: string
}

export function ModalToolbar({ controls, search, className }: ModalToolbarProps) {
  const cls = ['klyp-ModalToolbar', className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      {/* Inner row carries the flex layout — the root is the query container, and
          a container can't style itself, so the responsive flip lives here. */}
      <div className="klyp-ModalToolbar__row">
        <div className="klyp-ModalToolbar__controls">{controls}</div>
        <div className="klyp-ModalToolbar__search">{search}</div>
      </div>
    </div>
  )
}

export default ModalToolbar
