import './Table.scss'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { ArrowDownIcon } from '../../../../assets/icons'
import { useDesignLabI18n } from '../../../../i18n'

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
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
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
  resizableColumns?: boolean
  defaultColumnWidths?: Readonly<Record<string, number>>
  onColumnWidthsChange?: (widths: Readonly<Record<string, number>>) => void
  striped?: boolean
  emptyMessage?: ReactNode
  className?: string
}

type ColumnResizeSession = {
  columnId: string
  nextColumnId: string
  startX: number
  startWidth: number
  nextStartWidth: number
  minWidth: number
  maxWidth: number
  nextMinWidth: number
  nextMaxWidth: number
  measuredWidths: Record<string, number>
}

const DEFAULT_MIN_COLUMN_WIDTH = 72
const DEFAULT_TABLE_MIN_WIDTH = 560
const KEYBOARD_RESIZE_STEP = 12
const EMPTY_COLUMN_WIDTHS: Readonly<Record<string, number>> = {}

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
  resizableColumns = true,
  defaultColumnWidths = EMPTY_COLUMN_WIDTHS,
  onColumnWidthsChange,
  striped = false,
  emptyMessage = 'No rows to display.',
  className,
}: TableProps<Row>) {
  const { t } = useDesignLabI18n()
  const [internalSort, setInternalSort] = useState<TableSort | null>(defaultSort)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => ({
    ...defaultColumnWidths,
  }))
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const resizeSession = useRef<ColumnResizeSession | null>(null)
  const activeSort = sort === undefined ? internalSort : sort
  const columnSignature = columns.map((column) => column.id).join('|')
  const defaultColumnWidthsSignature = Object.entries(defaultColumnWidths)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, width]) => `${id}:${width}`)
    .join('|')
  const minimumTableWidth = resizableColumns
    ? Math.max(
        DEFAULT_TABLE_MIN_WIDTH,
        columns.reduce((total, column) => total + (column.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH), 0),
        ...columns.map((column) => {
          const percentage = column.width?.match(/^([\d.]+)%$/)?.[1]
          return percentage
            ? ((column.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH) * 100) / Number(percentage)
            : 0
        }),
      )
    : undefined

  useEffect(() => {
    resizeSession.current = null
    setResizingColumnId(null)
    setColumnWidths({ ...defaultColumnWidths })
  }, [columnSignature, defaultColumnWidthsSignature])

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

  const measureColumnWidths = () =>
    Object.fromEntries(
      [...(tableRef.current?.querySelectorAll<HTMLElement>('th[data-column-id]') ?? [])].map(
        (header) => [header.dataset.columnId ?? '', header.getBoundingClientRect().width],
      ),
    )

  const commitColumnWidths = (next: Record<string, number>) => {
    setColumnWidths(next)
    onColumnWidthsChange?.(next)
  }

  const resizePair = (session: ColumnResizeSession, requestedDelta: number) => {
    const minimumDelta = Math.max(
      session.minWidth - session.startWidth,
      session.nextStartWidth - session.nextMaxWidth,
    )
    const maximumDelta = Math.min(
      session.maxWidth - session.startWidth,
      session.nextStartWidth - session.nextMinWidth,
    )
    if (minimumDelta > maximumDelta) return
    const delta = Math.min(Math.max(requestedDelta, minimumDelta), maximumDelta)
    commitColumnWidths({
      ...session.measuredWidths,
      [session.columnId]: Math.round(session.startWidth + delta),
      [session.nextColumnId]: Math.round(session.nextStartWidth - delta),
    })
  }

  const createResizeSession = (columnIndex: number, startX: number) => {
    const column = columns[columnIndex]
    const nextColumn = columns[columnIndex + 1]
    if (!column || !nextColumn) return null
    const measuredWidths = measureColumnWidths()
    const startWidth = measuredWidths[column.id]
    const nextStartWidth = measuredWidths[nextColumn.id]
    if (!startWidth || !nextStartWidth) return null
    return {
      columnId: column.id,
      nextColumnId: nextColumn.id,
      startX,
      startWidth,
      nextStartWidth,
      minWidth: column.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH,
      maxWidth: column.maxWidth ?? Number.POSITIVE_INFINITY,
      nextMinWidth: nextColumn.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH,
      nextMaxWidth: nextColumn.maxWidth ?? Number.POSITIVE_INFINITY,
      measuredWidths,
    }
  }

  const startColumnResize = (columnIndex: number, event: PointerEvent<HTMLButtonElement>) => {
    const session = createResizeSession(columnIndex, event.clientX)
    if (!session) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeSession.current = session
    setResizingColumnId(session.columnId)
    commitColumnWidths(session.measuredWidths)
  }

  const moveColumnResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (!resizeSession.current) return
    resizePair(resizeSession.current, event.clientX - resizeSession.current.startX)
  }

  const stopColumnResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (!resizeSession.current) return
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    resizeSession.current = null
    setResizingColumnId(null)
  }

  const resizeColumnWithKeyboard = (
    columnIndex: number,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Home') {
      event.preventDefault()
      commitColumnWidths({ ...defaultColumnWidths })
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const session = createResizeSession(columnIndex, 0)
    if (!session) return
    resizePair(session, event.key === 'ArrowLeft' ? -KEYBOARD_RESIZE_STEP : KEYBOARD_RESIZE_STEP)
  }

  return (
    <div
      className={`dl-table-shell${resizingColumnId ? ' dl-table-shell--resizing' : ''}${className ? ` ${className}` : ''}`}
    >
      <table
        ref={tableRef}
        className={`dl-table dl-table--${density}${resizableColumns ? ' dl-table--resizable' : ''}${striped ? ' dl-table--striped' : ''}`}
        aria-label={ariaLabel}
        role={onRowSelect ? 'grid' : undefined}
        style={{ minWidth: minimumTableWidth } as CSSProperties}
      >
        <colgroup>
          {columns.map((column) => (
            <col
              key={column.id}
              style={
                {
                  width: columnWidths[column.id] ? `${columnWidths[column.id]}px` : column.width,
                } as CSSProperties
              }
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column, columnIndex) => {
              const sortable = column.sortable ?? Boolean(column.sortValue)
              const selected = activeSort?.columnId === column.id
              const nextColumn = columns[columnIndex + 1]
              const canResize =
                resizableColumns &&
                Boolean(nextColumn) &&
                (column.resizable ?? true) &&
                (nextColumn?.resizable ?? true)
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={`dl-table__cell--${column.align ?? 'start'}`}
                  data-column-id={column.id}
                  aria-sort={selected ? activeSort.direction : undefined}
                >
                  {sortable ? (
                    <button
                      className="dl-table__sort-button"
                      type="button"
                      onClick={() => changeSort(column)}
                    >
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
                  {canResize && (
                    <button
                      className={`dl-table__resize-handle${resizingColumnId === column.id ? ' is-resizing' : ''}`}
                      type="button"
                      aria-label={`${t('table.resizeColumn')}: ${typeof column.header === 'string' ? column.header : column.id}`}
                      title={t('table.resizeInstructions')}
                      onPointerDown={(event) => startColumnResize(columnIndex, event)}
                      onPointerMove={moveColumnResize}
                      onPointerUp={stopColumnResize}
                      onPointerCancel={stopColumnResize}
                      onDoubleClick={() => commitColumnWidths({ ...defaultColumnWidths })}
                      onKeyDown={(event) => resizeColumnWithKeyboard(columnIndex, event)}
                    />
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
