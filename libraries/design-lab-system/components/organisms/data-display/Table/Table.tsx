import './Table.scss'
import { useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowDownIcon } from '../../../../assets/icons'

export type TableSortDirection = 'ascending' | 'descending'
export type TableSort = { columnId: string; direction: TableSortDirection }
export type TableDensity = 'comfortable' | 'compact'

export type TableColumn<Row> = {
  id: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  sortValue?: (row: Row) => string | number | null | undefined
  sortable?: boolean
  width?: string
  align?: 'start' | 'center' | 'end'
}

export type TableProps<Row> = {
  rows: readonly Row[]
  columns: readonly TableColumn<Row>[]
  getRowId: (row: Row) => string
  ariaLabel: string
  density?: TableDensity
  selectedRowId?: string | null
  onRowSelect?: (row: Row) => void
  defaultSort?: TableSort | null
  sort?: TableSort | null
  onSortChange?: (sort: TableSort | null) => void
  emptyMessage?: ReactNode
  className?: string
}

function compareValues(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
) {
  if (left == null && right == null) return 0
  if (left == null) return 1
  if (right == null) return -1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export function Table<Row>({
  rows,
  columns,
  getRowId,
  ariaLabel,
  density = 'comfortable',
  selectedRowId,
  onRowSelect,
  defaultSort = null,
  sort,
  onSortChange,
  emptyMessage = 'No rows to display.',
  className,
}: TableProps<Row>) {
  const [internalSort, setInternalSort] = useState<TableSort | null>(defaultSort)
  const activeSort = sort === undefined ? internalSort : sort
  const sortedRows = useMemo(() => {
    if (!activeSort) return [...rows]
    const column = columns.find((candidate) => candidate.id === activeSort.columnId)
    if (!column?.sortValue) return [...rows]
    const direction = activeSort.direction === 'ascending' ? 1 : -1
    return rows
      .map((row, index) => ({ row, index }))
      .sort(
        (left, right) =>
          compareValues(column.sortValue?.(left.row), column.sortValue?.(right.row)) * direction ||
          left.index - right.index,
      )
      .map(({ row }) => row)
  }, [activeSort, columns, rows])

  const changeSort = (column: TableColumn<Row>) => {
    if (!(column.sortable ?? Boolean(column.sortValue))) return
    const next: TableSort =
      activeSort?.columnId === column.id
        ? {
            columnId: column.id,
            direction: activeSort.direction === 'ascending' ? 'descending' : 'ascending',
          }
        : { columnId: column.id, direction: 'ascending' }
    if (sort === undefined) setInternalSort(next)
    onSortChange?.(next)
  }

  const activateRow = (row: Row, event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onRowSelect?.(row)
  }

  return (
    <div className={`dl-table-shell${className ? ` ${className}` : ''}`}>
      <table
        className={`dl-table dl-table--${density}`}
        aria-label={ariaLabel}
        role={onRowSelect ? 'grid' : undefined}
      >
        <thead>
          <tr>
            {columns.map((column) => {
              const sortable = column.sortable ?? Boolean(column.sortValue)
              const selected = activeSort?.columnId === column.id
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={`dl-table__cell--${column.align ?? 'start'}`}
                  aria-sort={selected ? activeSort.direction : undefined}
                  style={{ width: column.width } as CSSProperties}
                >
                  {sortable ? (
                    <button type="button" onClick={() => changeSort(column)}>
                      <span>{column.header}</span>
                      <ArrowDownIcon
                        className={`dl-table__sort-icon${selected ? ' is-selected' : ''}${selected && activeSort.direction === 'ascending' ? ' is-ascending' : ''}`}
                        size={12}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length ? (
            sortedRows.map((row) => {
              const rowId = getRowId(row)
              const selected = rowId === selectedRowId
              return (
                <tr
                  key={rowId}
                  className={selected ? 'dl-table__row--selected' : undefined}
                  aria-selected={onRowSelect ? selected : undefined}
                  tabIndex={onRowSelect ? 0 : undefined}
                  onClick={
                    onRowSelect
                      ? (event) => {
                          const target = event.target as HTMLElement
                          if (target.closest('a, button, input, select, textarea, [role="button"]'))
                            return
                          onRowSelect(row)
                        }
                      : undefined
                  }
                  onKeyDown={onRowSelect ? (event) => activateRow(row, event) : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.id} className={`dl-table__cell--${column.align ?? 'start'}`}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })
          ) : (
            <tr className="dl-table__empty">
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
