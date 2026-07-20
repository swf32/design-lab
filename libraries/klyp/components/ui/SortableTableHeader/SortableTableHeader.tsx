import './SortableTableHeader.scss'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

// SortableTableHeader — generic sortable column header primitive.
// Lifted from `apps/web/src/features/referrals/activity-ledger.tsx`
// (SortHeader + SortIndicator, 2026-05-17) so every data-table can share
// the same dual-triangle indicator + RAC-style focus / hover states.

export type SortDirection = 'asc' | 'desc' | 'none'

export interface SortableTableHeaderProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Controlled sort state. `'none'` = sortable but inactive (both arrows
   * muted). `'asc'` highlights the up arrow, `'desc'` highlights the down.
   */
  direction?: SortDirection
  /** Text-align of the header. `'end'` flips flex direction so the label
   *  + indicator hug the cell's trailing edge — pair with a trailing
   *  numeric / date column. `'center'` centers the label + indicator
   *  cluster — pair with a centered status / icon column. */
  align?: 'start' | 'end' | 'center'
  /**
   * Adaptive hide priority. Surfaces as `data-priority` on the button so
   * the host table's container queries can hide low-priority columns on
   * narrow viewports (3 = hide first).
   */
  priority?: 1 | 2 | 3
  children: ReactNode
}

/**
 * Sortable column header rendered as a `<button>` element.
 *
 * **Accessibility**: this component does NOT write `aria-sort` itself — the
 * button element carries no role that supports it. The CONSUMER must write
 * `aria-sort={…}` on the wrapping `<th>` (the cell with the sortable role);
 * the button only drives the visual indicator via `data-direction`.
 *
 * Always render this inside a `<th aria-sort={…}>` — see the `InTable` story
 * (and `DataTable`, which wires this correctly) for the canonical pattern.
 */
export function SortableTableHeader({
  direction = 'none',
  align = 'start',
  priority,
  children,
  className,
  onClick,
  ...rest
}: SortableTableHeaderProps) {
  // aria-sort is set on the wrapping <th>, not on the button (the button
  // doesn't carry a role that supports aria-sort). data-direction drives
  // the visual indicator.
  const merged =
    typeof className === 'string'
      ? `klyp-SortableTableHeader ${className}`
      : 'klyp-SortableTableHeader'

  return (
    <button
      type="button"
      {...rest}
      className={merged}
      data-direction={direction}
      data-align={align}
      data-priority={priority}
      onClick={onClick}
    >
      <span className="klyp-SortableTableHeader__label">{children}</span>
      <SortIndicator direction={direction} />
    </button>
  )
}

export interface SortIndicatorProps {
  direction: SortDirection
}

/**
 * Dual-triangle indicator. Both arrows always render so "this column is
 * sortable" is always visible — active direction goes to full opacity,
 * inactive stays muted. No rotation. Same pattern as shadcn / Linear /
 * GitHub data tables.
 *
 * Standalone export — useful for custom header layouts that want the
 * indicator without the button wrapper.
 */
export function SortIndicator({ direction }: SortIndicatorProps) {
  return (
    <span
      className="klyp-SortableTableHeader__indicator"
      aria-hidden="true"
      data-direction={direction}
    >
      <svg
        width="8"
        height="13"
        viewBox="0 0 8 13"
        fill="none"
        focusable="false"
        role="presentation"
      >
        <title>Sort direction indicator</title>
        {/* Fill-only triangles — no stroke. Corner rounding is baked into
            the path geometry (rounded apexes), so the arrows stay crisp at
            any size without a same-coloured stroke hack. The two are pulled
            to the viewBox edges (top y≈0.65..4.5, bottom y≈8.5..12.35) so
            the gap between their bases reads as two distinct arrows. */}
        <g clipPath="url(#klyp-sortIndicatorClip)">
          <path
            d="M3.62469 0.654364C3.82732 0.448545 4.17268 0.448545 4.37531 0.654364L7.36213 3.68823C7.66643 3.99732 7.43403 4.5 6.98682 4.5H1.01318C0.565974 4.5 0.333567 3.99732 0.637867 3.68823L3.62469 0.654364Z"
            fill="currentColor"
            className="klyp-SortableTableHeader__indicatorUp"
          />
          <path
            d="M4.37531 12.3456C4.17268 12.5515 3.82732 12.5515 3.62469 12.3456L0.637867 9.31177C0.333567 9.00268 0.565974 8.5 1.01318 8.5H6.98682C7.43403 8.5 7.66643 9.00268 7.36213 9.31177L4.37531 12.3456Z"
            fill="currentColor"
            className="klyp-SortableTableHeader__indicatorDown"
          />
        </g>
        <defs>
          <clipPath id="klyp-sortIndicatorClip">
            <rect width="8" height="13" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </span>
  )
}

export default SortableTableHeader
