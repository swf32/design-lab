import { createElement } from 'react'
import type { StoryExample } from '../../../storyContract'
import { Table, type TableColumn } from './Table'

type ExampleRow = { id: string; name: string; status: string; count: number }
const rows: ExampleRow[] = [
  { id: 'button', name: 'Button', status: 'Ready', count: 4 },
  { id: 'dialog', name: 'Create Project Dialog', status: 'Review', count: 2 },
  { id: 'input', name: 'Input', status: 'Ready', count: 3 },
]
const columns: TableColumn<ExampleRow>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row) => row.name,
    sortValue: (row) => row.name,
    width: '46%',
    minWidth: 140,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => row.status,
    sortValue: (row) => row.status,
    width: '30%',
    minWidth: 100,
  },
  {
    id: 'count',
    header: 'Variants',
    cell: (row) => row.count,
    sortValue: (row) => row.count,
    align: 'end',
    width: '24%',
    minWidth: 90,
  },
]

type TokenRow = { id: string; path: string; value: string; file: string }
const tokenRows: TokenRow[] = [
  { id: 'accent', path: 'color.accent.primary', value: '#7755dc', file: 'color.tokens.json' },
  { id: 'surface', path: 'color.surface.primary', value: '#24252a', file: 'color.tokens.json' },
]
const tokenColumns: TableColumn<TokenRow>[] = [
  {
    id: 'path',
    header: 'Token',
    cell: (row) =>
      createElement(
        'span',
        { className: 'dl-table__identity' },
        createElement('strong', null, row.path),
        createElement('code', null, row.file),
      ),
    sortValue: (row) => row.path,
    width: '55%',
  },
  {
    id: 'value',
    header: 'Value',
    cell: (row) =>
      createElement(
        'span',
        { className: 'dl-table__value' },
        createElement('i', {
          className: 'dl-table__swatch',
          style: { background: row.value },
          'aria-hidden': true,
        }),
        createElement('strong', null, row.value),
      ),
    sortValue: (row) => row.value,
    width: '45%',
  },
]

export function renderStoryExample(example: StoryExample) {
  if (example.props.registry)
    return createElement(Table<TokenRow>, {
      rows: tokenRows,
      columns: tokenColumns,
      getRowId: (row) => row.id,
      ariaLabel: 'Token registry cell content',
      density: 'compact',
      resizableColumns: false,
    })
  return createElement(Table<ExampleRow>, {
    rows: example.props.empty ? [] : rows,
    columns,
    getRowId: (row) => row.id,
    ariaLabel: 'Component inventory',
    density: example.props.compact ? 'compact' : 'comfortable',
    defaultSort: { columnId: 'name', direction: 'ascending' },
    resizableColumns: true,
    striped: Boolean(example.props.striped),
    selectedRowId: example.props.selected ? 'dialog' : null,
    onRowSelect: () => undefined,
  })
}

export const stories = [
  {
    id: 'density',
    kind: 'variant',
    name: 'Row density',
    examples: [
      { label: 'Comfortable', props: {} },
      { label: 'Compact', props: { compact: true } },
    ],
  },
  {
    id: 'row-banding',
    kind: 'variant',
    name: 'Row banding',
    examples: [{ label: 'Striped', props: { striped: true } }],
  },
  {
    id: 'column-resizing',
    kind: 'behavior',
    name: 'Column resizing',
    examples: [{ label: 'Drag a divider or focus it and use arrow keys', props: {} }],
  },
  {
    id: 'data-states',
    kind: 'state',
    name: 'Data states',
    examples: [
      { label: 'Selected row', props: { selected: true } },
      { label: 'Empty', props: { empty: true } },
    ],
  },
  {
    id: 'cell-content',
    kind: 'context',
    name: 'Registry cell content',
    examples: [{ label: 'Identity, path, swatch, and value', props: { registry: true } }],
  },
]
