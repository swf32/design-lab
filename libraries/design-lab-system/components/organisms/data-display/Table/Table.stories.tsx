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

export function renderStoryExample(example: StoryExample) {
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
]
