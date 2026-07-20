import './DataTable.scss'

import { DirectboxOutline } from '@klyp/icons'
import { motion, type Transition, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { Skeleton } from '../Skeleton'
import { SortableTableHeader, type SortDirection } from '../SortableTableHeader'

// =====================================================================
// DataTable — generic sortable data table primitive
// =====================================================================
//
// Composes SortableTableHeader for column headers, adds:
//   - `useSortedRows` cycle (asc → desc → none) — also exported standalone
//   - motion.tr `layout="position"` row reorder (auto-disabled on
//     prefers-reduced-motion)
//   - adaptive column hiding via container query on the table's own
//     inline-size: priority=3 hides < 600px, priority=2 hides < 480px
//   - generic `<T>` rows + `ColumnDef<T, K>` configuration
//
// Lifted from `apps/web/src/features/referrals/activity-ledger.tsx` so
// every data-table in the app (referrals, assets, library, earnings…)
// shares the same chrome and interaction model.

// === Public API types ===============================================

export type DataTableSortDir = 'asc' | 'desc'
export type DataTableSortState<K extends string> = { key: K; dir: DataTableSortDir } | null
export type DataTableAlign = 'start' | 'end' | 'center'

export interface ColumnDef<T, K extends string> {
  /** Stable column id. Used for sort state + as React key on `<th>` / `<td>`. */
  key: K
  /** Header label. */
  label: ReactNode
  /**
   * Adaptive hide priority. `1` = always visible (default), `2` hides
   * under 480px, `3` hides under 600px. Container is the table itself —
   * column-hiding reacts to the table's allotted width, not the page.
   */
  priority?: 1 | 2 | 3
  /** Text-align of header + body cell. Defaults to `'start'`. */
  align?: DataTableAlign
  /** Optional explicit `<col>` width (e.g. `'16%'`, `'120px'`). */
  width?: string
  /**
   * When provided, this column becomes sortable — the function maps each
   * row to a comparable value. Omit to make the column non-sortable.
   */
  sort?: (row: T) => string | number
  /** Cell content renderer. */
  render: (row: T) => ReactNode
}

export interface DataTableProps<T, K extends string> {
  columns: readonly ColumnDef<T, K>[]
  rows: readonly T[]
  /** Stable row key — used as React key on each `<tr>`. */
  rowKey: (row: T) => string
  /** Initial sort. Pass `null` for no default sort. Defaults to `null`. */
  defaultSort?: DataTableSortState<K>
  /**
   * Shown in the table body when `rows` is empty — the header row stays
   * visible (HeroUI-style "No results" pattern), the caller's node renders
   * inside a cell spanning all columns. Omit to get the default glyph +
   * "No results found".
   */
  empty?: ReactNode
  /**
   * Loading flag. While `true` the header stays and the body shows
   * skeleton rows (one Skeleton bar per cell, preserving the column grid)
   * instead of data. `aria-busy` is set on the table.
   */
  loading?: boolean
  /** How many skeleton rows to render while `loading`. Defaults to `5`. */
  loadingRows?: number
  /**
   * Zebra striping — tints every even body row a whisper-quiet step
   * (`--alpha-white-02`, below the header tint and the hover step so it
   * never reads as a header band or eats the hover feedback). Off by
   * default.
   */
  striped?: boolean
  /**
   * Sticky header — pins `thead` to the top while the body scrolls.
   * Only meaningful when the table lives inside a vertical scroll
   * container. Off by default.
   */
  stickyHeader?: boolean
  /** Accessible label for the `<table>`. */
  ariaLabel?: string
  /**
   * Formats the visually-hidden screen-reader announcement emitted when
   * the sort changes. Defaults to English ("Sorted by Name, ascending").
   * Packages ship EN-only strings — localized builds pass their own
   * formatter from the app layer.
   */
  formatSortAnnouncement?: (label: string, dir: DataTableSortDir) => string
  className?: string
}

// === useSortedRows hook =============================================
// Exported for consumers that need to render a non-table layout (e.g. a
// card grid) but want the same sort cycle. The DataTable component uses
// this internally — pass a `ColumnDef` array and it derives the value
// accessor for you.

function compareValues(a: string | number, b: string | number): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function useSortedRows<T, K extends string>(
  rows: readonly T[],
  getValue: (row: T, key: K) => string | number,
  initial: DataTableSortState<K> = null,
) {
  const [sort, setSort] = useState<DataTableSortState<K>>(initial)

  const sorted = useMemo(() => {
    if (!sort) return rows
    // .sort mutates — copy so React's reconciler doesn't see the input
    // array reordered between commits (would defeat row keys).
    const copy = rows.slice()
    copy.sort((a, b) => {
      const cmp = compareValues(getValue(a, sort.key), getValue(b, sort.key))
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sort, getValue])

  const toggle = useCallback((key: K) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }, [])

  return { sorted, sort, toggle, setSort }
}

// === Component ======================================================

// Row-reorder spring — tuned for 8–12 rows: ~280ms travel, no overshoot,
// fast enough to feel snappy when you spam-toggle. `mass: 0.6` keeps it
// from over-damping into linear-feel territory.
const ROW_LAYOUT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.6,
}

function directionFor<K extends string>(sort: DataTableSortState<K>, key: K): SortDirection {
  if (!sort || sort.key !== key) return 'none'
  return sort.dir
}

function defaultSortAnnouncement(label: string, dir: DataTableSortDir): string {
  return `Sorted by ${label}, ${dir === 'asc' ? 'ascending' : 'descending'}`
}

export function DataTable<T, K extends string>({
  columns,
  rows,
  rowKey,
  defaultSort = null,
  empty,
  loading = false,
  loadingRows = 5,
  striped = false,
  stickyHeader = false,
  ariaLabel,
  formatSortAnnouncement = defaultSortAnnouncement,
  className,
}: DataTableProps<T, K>) {
  // Build the value accessor from the columns table so consumers don't
  // have to wire it twice (once in `render`, once for sort).
  const getValue = useCallback(
    (row: T, key: K): string | number => {
      const col = columns.find((c) => c.key === key)
      // A sort toggle can only fire for columns with `sort` set — non-
      // sortable headers don't render a button. So `col.sort` is present
      // whenever this runs. Guard anyway to satisfy TS.
      return col?.sort ? col.sort(row) : ''
    },
    [columns],
  )

  const { sorted, sort, toggle } = useSortedRows<T, K>(rows, getValue, defaultSort)
  const reducedMotion = useReducedMotion()

  // Visually-hidden announcement of the current sort. Screen readers
  // pick this up via the aria-live region; otherwise a sort toggle is
  // silent. Uses the column label only when it's a plain string,
  // falling back to the column key for ReactNode labels.
  const sortAnnouncement = useMemo(() => {
    if (!sort) return ''
    const col = columns.find((c) => c.key === sort.key)
    const label = typeof col?.label === 'string' ? col.label : sort.key
    return formatSortAnnouncement(label, sort.dir)
  }, [sort, columns, formatSortAnnouncement])

  const rootClass = typeof className === 'string' ? `klyp-DataTable ${className}` : 'klyp-DataTable'

  const isEmpty = !loading && sorted.length === 0

  return (
    <div
      className={rootClass}
      data-striped={striped ? '' : undefined}
      data-sticky={stickyHeader ? '' : undefined}
    >
      <div className="klyp-DataTable__srStatus" role="status" aria-live="polite">
        {sortAnnouncement}
      </div>
      <div className="klyp-DataTable__wrap">
        <table
          className="klyp-DataTable__table"
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
        >
          <colgroup>
            {columns.map((c) => (
              <col
                key={c.key}
                data-col={c.key}
                data-priority={c.priority ?? 1}
                style={c.width ? { width: c.width } : undefined}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((c) => {
                const priority = c.priority ?? 1
                const align = c.align ?? 'start'
                const dir = directionFor(sort, c.key)
                const ariaSort =
                  dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'

                if (c.sort) {
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      data-priority={priority}
                      data-align={align}
                      aria-sort={ariaSort}
                    >
                      <SortableTableHeader
                        direction={dir}
                        align={align}
                        onClick={() => toggle(c.key)}
                      >
                        {c.label}
                      </SortableTableHeader>
                    </th>
                  )
                }
                return (
                  <th key={c.key} scope="col" data-priority={priority} data-align={align}>
                    {c.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.max(1, loadingRows) }, (_, i) => (
                <tr key={`skeleton-${i}`} className="klyp-DataTable__skeletonRow">
                  {columns.map((c) => {
                    const priority = c.priority ?? 1
                    const align = c.align ?? 'start'
                    return (
                      <td key={c.key} data-priority={priority} data-align={align}>
                        <Skeleton
                          className="klyp-DataTable__skeletonBar"
                          radius="chip"
                          style={{ '--klyp-stagger-i': i } as CSSProperties}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : isEmpty ? (
              <tr className="klyp-DataTable__stateRow">
                <td colSpan={columns.length}>
                  <div className="klyp-DataTable__state" data-kind="empty">
                    {empty ?? (
                      <>
                        <span className="klyp-DataTable__emptyIcon" aria-hidden>
                          <DirectboxOutline />
                        </span>
                        <span className="klyp-DataTable__emptyText">No results found</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <motion.tr
                  key={rowKey(row)}
                  layout={reducedMotion ? false : 'position'}
                  transition={ROW_LAYOUT_TRANSITION}
                >
                  {columns.map((c) => {
                    const priority = c.priority ?? 1
                    const align = c.align ?? 'start'
                    return (
                      <td key={c.key} data-priority={priority} data-align={align}>
                        {c.render(row)}
                      </td>
                    )
                  })}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
