/**
 * `<BoardCard>` — Tier 4 brand molecule for the `/canvas` board-library
 * surface. One tile in a grid of the caller's canvas boards.
 *
 * **Visual contract**
 *
 *   - 16:10 thumbnail wrapper (matches xyflow viewport ratio)
 *   - `--r-card` (12px) outer radius
 *   - Caller controls the thumbnail content via the `thumbnail` slot.
 *     When omitted, a centered FrameOutline placeholder renders on a
 *     surface fill (boards without a snapshot yet).
 *   - Title 14/500 on `--color-fg-primary` (single line, ellipsis)
 *   - Meta 12/500 on `--color-fg-muted` (e.g. "3 days ago")
 *   - Hover: 1px neutral outline via `::after` pseudo (no Warm Gold,
 *     no scale, no translate — single-accent doctrine, the gold sits
 *     on the page CTA not on each card)
 *   - Focus-visible: 2px gold outline + offset (a11y signal)
 *
 * **Why a `<div role="button">` and not `<RACButton>`**
 *
 *   The `actions` slot renders inside the card; a 3-dot context-menu
 *   trigger is itself a `<button>`. `<button>` inside `<button>` is
 *   invalid HTML and breaks the inner click in some browsers. Same
 *   rationale `<AssetCard>` uses (see its source).
 */

import { FrameOutline } from '@klyp/icons'
import type { KeyboardEvent, ReactNode, Ref } from 'react'
import './BoardCard.scss'

export type BoardCardProps = {
  /** Board name — rendered as the card title. */
  name: string
  /** Subtitle — typically a relative time string like "3 days ago".
   *  Pre-formatted by the caller; BoardCard doesn't own time formatting. */
  meta?: string
  /** Custom thumbnail content (image, SVG mock, generated preview).
   *  When omitted, BoardCard renders a centered `FrameOutline`. */
  thumbnail?: ReactNode
  /** Imperative click — caller handles navigation. */
  onClick?: () => void
  /** Top-right slot inside the thumbnail — typically an `ActionMenuTrigger`
   *  with a 3-dot icon. Shown on hover / focus-within so the card stays
   *  visually quiet at rest. */
  actions?: ReactNode
  /** Visually marks the card as the user's "last opened" board.
   *  Reserved for post-MVP. */
  active?: boolean
  /** Override `aria-label` (defaults to the board `name`). */
  ariaLabel?: string
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function BoardCard({
  name,
  meta,
  thumbnail,
  onClick,
  actions,
  active,
  ariaLabel,
  className,
  ref,
}: BoardCardProps) {
  const composedClass = className ? `klyp-BoardCard ${className}` : 'klyp-BoardCard'

  const inner = (
    <>
      <div className="klyp-BoardCard__thumbnail">
        <div className="klyp-BoardCard__thumbnailInner" aria-hidden="true">
          {thumbnail ?? (
            <div className="klyp-BoardCard__placeholder">
              <FrameOutline width={28} height={28} />
            </div>
          )}
        </div>
        {actions ? <div className="klyp-BoardCard__actions">{actions}</div> : null}
      </div>
      <div className="klyp-BoardCard__body">
        <span className="klyp-BoardCard__title">{name}</span>
        {meta ? <span className="klyp-BoardCard__meta">{meta}</span> : null}
      </div>
    </>
  )

  // Split into two static-role JSX branches so the lint rule
  // `a11y/useValidAriaValues` doesn't trip on a dynamic `role={…}` ternary.
  if (onClick) {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    }
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={composedClass}
        data-active={active || undefined}
        data-interactive="true"
        aria-label={ariaLabel ?? name}
      >
        {inner}
      </div>
    )
  }

  return (
    <div ref={ref} className={composedClass} data-active={active || undefined}>
      {inner}
    </div>
  )
}

export default BoardCard
