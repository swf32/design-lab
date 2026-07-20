import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Avatar, AvatarFallback } from '../Avatar'
import { Badge } from '../Badge'
import { type ColumnDef, DataTable } from './DataTable'

// === Shared sample data =============================================

type Status = 'available' | 'pending' | 'on-hold'
type Earning = {
  id: string
  amount: number
  user: { name: string; sub: string; initials: string }
  level: 'Direct' | 'Subreferral'
  status: Status
  date: string
}

const ROWS: Earning[] = [
  {
    id: 'r1',
    amount: 12.6,
    user: { name: 'kira.lin', sub: 'Creator', initials: 'KL' },
    level: 'Direct',
    status: 'pending',
    date: '2026-05-16',
  },
  {
    id: 'r2',
    amount: 24.0,
    user: { name: 'Maya Chen', sub: 'Creator', initials: 'MC' },
    level: 'Direct',
    status: 'available',
    date: '2026-05-14',
  },
  {
    id: 'r3',
    amount: 18.5,
    user: { name: 'alex.ridley', sub: 'Creator Plus', initials: 'AR' },
    level: 'Direct',
    status: 'available',
    date: '2026-05-12',
  },
  {
    id: 'r4',
    amount: 3.2,
    user: { name: 'dani.k', sub: 'via alex.ridley', initials: 'DK' },
    level: 'Subreferral',
    status: 'on-hold',
    date: '2026-05-11',
  },
  {
    id: 'r5',
    amount: 42.1,
    user: { name: 'soviet_hogwarts', sub: 'Studio', initials: 'SH' },
    level: 'Direct',
    status: 'on-hold',
    date: '2026-05-09',
  },
]

const STATUS_INTENT = {
  available: 'green',
  pending: 'amber',
  'on-hold': 'gray',
} as const

const STATUS_LABEL: Record<Status, string> = {
  available: 'Available',
  pending: 'Pending',
  'on-hold': 'On Hold',
}

type Key = 'amount' | 'user' | 'level' | 'status' | 'date'

function columns(): ColumnDef<Earning, Key>[] {
  return [
    {
      key: 'amount',
      label: 'Amount',
      width: '16%',
      sort: (r) => r.amount,
      render: (r) => <strong>${r.amount.toFixed(2)}</strong>,
    },
    {
      key: 'user',
      label: 'User',
      width: '30%',
      sort: (r) => r.user.name.toLowerCase(),
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <Avatar size="sm">
            <AvatarFallback>{r.user.initials}</AvatarFallback>
          </Avatar>
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span>{r.user.name}</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>{r.user.sub}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      priority: 2,
      width: '18%',
      sort: (r) => r.level,
      render: (r) => r.level,
    },
    {
      key: 'status',
      label: 'Status',
      width: '18%',
      sort: (r) => r.status,
      render: (r) => (
        <Badge intent={STATUS_INTENT[r.status]} variant="subtle" size="md">
          {STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      priority: 3,
      align: 'end',
      width: '18%',
      sort: (r) => r.date,
      render: (r) => <span>{r.date}</span>,
    },
  ]
}

// Playground controls (FE-team convention) — the catalog ComponentPlayground
// drives the bare component from `args`/`argTypes` over REAL props only.
// DataTable is data-driven, so the structural props (`columns` / `rows` /
// `rowKey` / `defaultSort`) are supplied as DEFAULT args, NOT controls — a bare
// `<DataTable {...args}/>` needs real data to render. The genuinely-scalar
// props are the live controls: `striped` / `stickyHeader` / `loading` →
// boolean; `loadingRows` → range; `ariaLabel` → text. Skipped:
// `formatSortAnnouncement` (function), `empty` (ReactNode), `className`
// (control:false). There is NO `size`/`density` prop on DataTableProps — not
// invented. Composition variants live in the showcase stories below.
const meta = {
  component: DataTable,
  title: 'UI / DataTable',
  tags: ['autodocs'],
  args: {
    columns: columns(),
    rows: ROWS,
    rowKey: (r: Earning) => r.id,
    defaultSort: { key: 'date', dir: 'desc' },
    ariaLabel: 'Earnings',
    striped: false,
    stickyHeader: false,
    loading: false,
    loadingRows: 5,
  },
  argTypes: {
    striped: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingRows: { control: { type: 'range', min: 1, max: 12, step: 1 } },
    ariaLabel: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 920 }}>
      <DataTable
        ariaLabel="Earnings"
        columns={columns()}
        rows={ROWS}
        rowKey={(r) => r.id}
        defaultSort={{ key: 'date', dir: 'desc' }}
      />
    </div>
  ),
}

// Click headers to cycle asc → desc → none and watch rows animate into
// position. The transition spring is tuned for 8–12 rows; reduced-motion
// users get an instant re-order.
export const SortInteraction: Story = {
  render: () => (
    <div style={{ width: 920 }}>
      <DataTable
        ariaLabel="Earnings — interactive sort"
        columns={columns()}
        rows={ROWS}
        rowKey={(r) => r.id}
      />
    </div>
  ),
}

// Slide the slider to shrink the container width and watch columns
// drop out — priority=3 (Date) hides under 600px, priority=2 (Level)
// hides under 480px. Width queries reference the table's own container,
// not the page.
export const AdaptivePriority: Story = {
  render: function Render() {
    const [width, setWidth] = useState(920)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Container width: {width}px</span>
          <input
            type="range"
            min={320}
            max={920}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
        <div style={{ width, transition: 'width 80ms linear' }}>
          <DataTable
            ariaLabel="Earnings — adaptive"
            columns={columns()}
            rows={ROWS}
            rowKey={(r) => r.id}
            defaultSort={{ key: 'date', dir: 'desc' }}
          />
        </div>
      </div>
    )
  },
}

// Empty rows + a consumer-owned `empty` node. The header row now STAYS
// visible (HeroUI-style) and the custom node renders in a cell spanning
// all columns — the table chrome no longer disappears.
export const Empty: Story = {
  render: () => (
    <div style={{ width: 920 }}>
      <DataTable<Earning, Key>
        ariaLabel="Earnings"
        columns={columns()}
        rows={[]}
        rowKey={(r) => r.id}
        empty={
          <div style={{ textAlign: 'center', color: 'var(--color-fg-muted)' }}>
            <p>No data yet — pass your own EmptyState here.</p>
          </div>
        }
      />
    </div>
  ),
}

// Default empty-state: omit `empty` entirely and DataTable renders the
// Directbox glyph + "No results found" inside the table body, header
// intact. This is the new HeroUI-style default.
export const EmptyDefault: Story = {
  render: () => (
    <div style={{ width: 920 }}>
      <DataTable<Earning, Key>
        ariaLabel="Earnings — empty default"
        columns={columns()}
        rows={[]}
        rowKey={(r) => r.id}
      />
    </div>
  ),
}

// `loading` → header stays, the body shows skeleton rows (one Skeleton bar
// per cell, column grid preserved, pulse-wave staggered top-down), and
// `aria-busy` is set on the table. `loadingRows` controls the count.
export const Loading: Story = {
  render: () => (
    <div style={{ width: 920 }}>
      <DataTable
        ariaLabel="Earnings — loading"
        columns={columns()}
        rows={ROWS}
        rowKey={(r) => r.id}
        loading
        loadingRows={5}
      />
    </div>
  ),
}

// `striped` → even body rows get a whisper-quiet tint (--alpha-white-02),
// distinct from the header band and the hover step. Hover a striped row to
// confirm the hover feedback still reads one step darker on top.
export const Striped: Story = {
  render: () => (
    <div style={{ width: 920 }}>
      <DataTable
        ariaLabel="Earnings — striped"
        columns={columns()}
        rows={ROWS}
        rowKey={(r) => r.id}
        defaultSort={{ key: 'date', dir: 'desc' }}
        striped
      />
    </div>
  ),
}

// `stickyHeader` → the header pins to the top while the body scrolls. Needs
// a vertical scroll ancestor — here a fixed-height wrapper. Rows are
// repeated to overflow it.
export const StickyHeader: Story = {
  render: () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      ROWS.map((r) => ({ ...r, id: `${r.id}-${i}` })),
    ).flat()
    return (
      <div style={{ width: 920, height: 280, overflowY: 'auto' }}>
        <DataTable
          ariaLabel="Earnings — sticky header"
          columns={columns()}
          rows={many}
          rowKey={(r) => r.id}
          stickyHeader
        />
      </div>
    )
  },
}

// `align` — all three side by side so the difference is obvious at a glance:
// the same value left / center / right. The header label + sort indicator
// follow the alignment too.
type AlignRow = { id: string; v: string }
const ALIGN_ROWS: AlignRow[] = [
  { id: 'a1', v: 'Alpha' },
  { id: 'a2', v: 'Bravo' },
  { id: 'a3', v: 'Charlie' },
]

export const Alignment: Story = {
  render: () => {
    const alignCols: ColumnDef<AlignRow, 'start' | 'center' | 'end'>[] = [
      {
        key: 'start',
        label: 'Start (default)',
        align: 'start',
        sort: (r) => r.v,
        render: (r) => r.v,
      },
      { key: 'center', label: 'Center', align: 'center', sort: (r) => r.v, render: (r) => r.v },
      { key: 'end', label: 'End', align: 'end', sort: (r) => r.v, render: (r) => r.v },
    ]
    return (
      <div style={{ width: 560 }}>
        <DataTable
          ariaLabel="Column alignment — start / center / end"
          columns={alignCols}
          rows={ALIGN_ROWS}
          rowKey={(r) => r.id}
        />
      </div>
    )
  },
}
