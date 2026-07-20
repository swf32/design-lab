import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { SortableTableHeader, type SortDirection } from './SortableTableHeader'

const meta = {
  component: SortableTableHeader,
  title: 'UI / SortableTableHeader',
  tags: ['autodocs'],
  // Playground controls (FE-team convention) — the catalog ComponentPlayground
  // drives the bare component from `args`/`argTypes` over REAL props only.
  // `direction`/`align`/`priority` → inline-radio (≤3 options each); `children`
  // is the header label, a plain string, so it's a `text` control. Skipped:
  // `onClick` (handler), `className` (control:false). The bare header renders
  // fine outside a table (no structural wrapper needed for the playground) —
  // the `InTable` showcase story below covers the real `<th aria-sort>` pattern.
  args: { children: 'Amount', direction: 'none', align: 'start', priority: 1 },
  argTypes: {
    direction: { control: 'inline-radio', options: ['none', 'asc', 'desc'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    priority: { control: 'inline-radio', options: [1, 2, 3] },
    children: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof SortableTableHeader>

export default meta
type Story = StoryObj<typeof meta>

// Cycle order matches the real consumer (activity-ledger.tsx):
// `none → asc → desc → none → asc → …`
function cycle(d: SortDirection): SortDirection {
  return d === 'none' ? 'asc' : d === 'asc' ? 'desc' : 'none'
}

export const Default: Story = {
  render: function Render() {
    const [dir, setDir] = useState<SortDirection>('none')
    return (
      <SortableTableHeader direction={dir} onClick={() => setDir(cycle(dir))}>
        Column
      </SortableTableHeader>
    )
  },
}

// Static snapshot showcase — the three direction states side-by-side so
// the visual difference is readable at a glance. Clicks intentionally do
// NOT cycle here; this story is a state-matrix demo, not an interactive
// playground (see `Default` / `InTable` for click behaviour).
export const Directions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <SortableTableHeader direction="none">None</SortableTableHeader>
      <SortableTableHeader direction="asc">Ascending</SortableTableHeader>
      <SortableTableHeader direction="desc">Descending</SortableTableHeader>
    </div>
  ),
}

export const Alignment: Story = {
  render: function Render() {
    const [startDir, setStartDir] = useState<SortDirection>('asc')
    const [endDir, setEndDir] = useState<SortDirection>('desc')
    return (
      <div style={{ display: 'grid', gap: 8, width: 240 }}>
        <SortableTableHeader
          align="start"
          direction={startDir}
          onClick={() => setStartDir(cycle(startDir))}
        >
          Start aligned
        </SortableTableHeader>
        <SortableTableHeader
          align="end"
          direction={endDir}
          onClick={() => setEndDir(cycle(endDir))}
        >
          End aligned
        </SortableTableHeader>
      </div>
    )
  },
}

// `data-priority` is surfaced by the component, but the HIDING is the host
// table's job — it reacts to the table's own inline-size via a container
// query. These stories replicate `DataTable`'s real breakpoints
// (priority=3 hides < 600px, priority=2 hides < 480px — see DataTable.scss)
// inside a `container-type: inline-size` box so the drop is actually visible.
// The `<style>` block is demo-only scaffolding; in production this lives in
// DataTable.scss, NOT in SortableTableHeader.
// `container-type` lives on the sized wrapper, NOT the flex row — the row
// is distended by its buttons and never shrinks below 600px, so the query
// would never fire if it were the container.
const PRIORITY_DEMO_CSS = `
.sth-priorityDemo { container-type: inline-size; }
@container (max-width: 600px) {
  .sth-priorityDemo [data-priority='3'] { display: none; }
}
@container (max-width: 480px) {
  .sth-priorityDemo [data-priority='2'] { display: none; }
}
`

// Headers are laid out 3 / 1 / 2 (not 1 / 2 / 3) so the drop isn't just the
// trailing column vanishing — priority 3 sits first and disappears from the
// middle of the row, which reads as real priority-based hiding.
function PriorityRow() {
  const [p1, setP1] = useState<SortDirection>('none')
  const [p2, setP2] = useState<SortDirection>('none')
  const [p3, setP3] = useState<SortDirection>('none')
  return (
    <div style={{ display: 'flex', gap: 16, minWidth: 0 }}>
      <SortableTableHeader priority={3} direction={p3} onClick={() => setP3(cycle(p3))}>
        Amount (p3)
      </SortableTableHeader>
      <SortableTableHeader priority={1} direction={p1} onClick={() => setP1(cycle(p1))}>
        Name (p1)
      </SortableTableHeader>
      <SortableTableHeader priority={2} direction={p2} onClick={() => setP2(cycle(p2))}>
        Date (p2)
      </SortableTableHeader>
    </div>
  )
}

// Slide to shrink the container and watch headers drop out — priority=3
// hides under 600px, priority=2 under 480px. Same slider pattern as
// DataTable's `AdaptivePriority` story (width query references the
// container, not the page).
export const Priority: Story = {
  render: function Render() {
    const [width, setWidth] = useState(720)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <style>{PRIORITY_DEMO_CSS}</style>
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
        <div
          className="sth-priorityDemo"
          style={{ width, maxWidth: '100%', overflow: 'hidden', transition: 'width 80ms linear' }}
        >
          <PriorityRow />
        </div>
      </div>
    )
  },
}

// Single resizable container (slider) — drag to check the header stays
// readable 280 → 1200px. Same pattern as DataTable's `AdaptivePriority`
// and Input's `Adaptive` story (three fixed boxes overflow the frame).
export const Adaptive: Story = {
  render: function Render() {
    const [width, setWidth] = useState(600)
    const [startDir, setStartDir] = useState<SortDirection>('asc')
    const [endDir, setEndDir] = useState<SortDirection>('desc')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 320 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Container width: {width}px</span>
          <input
            type="range"
            min={280}
            max={1200}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
        <div
          style={{
            width,
            maxWidth: '100%',
            border: '1px dashed var(--color-border-default)',
            borderRadius: 8,
            padding: 12,
            transition: 'width 80ms linear',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <SortableTableHeader direction={startDir} onClick={() => setStartDir(cycle(startDir))}>
              Transaction date
            </SortableTableHeader>
            <SortableTableHeader
              align="end"
              direction={endDir}
              onClick={() => setEndDir(cycle(endDir))}
            >
              Amount
            </SortableTableHeader>
          </div>
        </div>
      </div>
    )
  },
}

type Row = { id: string; date: string; amount: number }

const ROWS: readonly Row[] = [
  { id: 'r1', date: '2026-05-10', amount: 42 },
  { id: 'r2', date: '2026-05-12', amount: 17 },
  { id: 'r3', date: '2026-05-09', amount: 88 },
  { id: 'r4', date: '2026-05-14', amount: 5 },
  { id: 'r5', date: '2026-05-11', amount: 63 },
]

type SortKey = 'date' | 'amount'

export const InTable: Story = {
  render: function Render() {
    // Single-column active sort, matching the real consumer
    // (activity-ledger.tsx) — clicking a header makes it active and resets
    // the other header to `'none'`.
    const [activeKey, setActiveKey] = useState<SortKey>('date')
    const [dateDir, setDateDir] = useState<SortDirection>('desc')
    const [amountDir, setAmountDir] = useState<SortDirection>('none')

    function toggle(key: SortKey) {
      if (key === 'date') {
        const next = cycle(dateDir)
        setDateDir(next)
        if (next !== 'none') {
          setActiveKey('date')
          setAmountDir('none')
        }
      } else {
        const next = cycle(amountDir)
        setAmountDir(next)
        if (next !== 'none') {
          setActiveKey('amount')
          setDateDir('none')
        }
      }
    }

    const sorted = (() => {
      const copy = [...ROWS]
      if (activeKey === 'date' && dateDir !== 'none') {
        copy.sort((a, b) => (dateDir === 'asc' ? 1 : -1) * a.date.localeCompare(b.date))
      } else if (activeKey === 'amount' && amountDir !== 'none') {
        copy.sort((a, b) => (amountDir === 'asc' ? 1 : -1) * (a.amount - b.amount))
      }
      return copy
    })()

    const ariaSort: Record<SortDirection, 'ascending' | 'descending' | 'none'> = {
      asc: 'ascending',
      desc: 'descending',
      none: 'none',
    }

    return (
      <table style={{ width: 360, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th aria-sort={ariaSort[dateDir]} style={{ textAlign: 'left' }}>
              <SortableTableHeader direction={dateDir} onClick={() => toggle('date')}>
                Date
              </SortableTableHeader>
            </th>
            <th aria-sort={ariaSort[amountDir]} style={{ textAlign: 'right' }}>
              <SortableTableHeader
                direction={amountDir}
                align="end"
                onClick={() => toggle('amount')}
              >
                Amount
              </SortableTableHeader>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: 8 }}>{r.date}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
}
