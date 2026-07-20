import { Skeleton } from '@klyp/ui'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { BoardCard } from './BoardCard'

const meta = {
  title: 'Brand / Molecules / BoardCard',
  component: BoardCard,
  tags: ['autodocs'],
  args: { name: 'Canvas 1', meta: '3 days ago' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BoardCard>

export default meta
type Story = StoryObj<typeof meta>

// ─── Inline mock thumbnail ──────────────────────────────────────────────────
// Deterministic 16:10 node-graph SVG seeded by a string. Lives in the
// stories file (not the production component) because it's only used to
// give the catalog preview tiles visually distinct thumbnails — the live
// `/canvas` route owns its own copy (`routes/canvas.index.tsx` →
// `MockBoardPreview`). One-shot helper, two callsites here, well under
// the extract-to-primitive threshold.

function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function makeRng(seed: number) {
  let state = seed || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) % 1_000_000) / 1_000_000
  }
}

function MockPreview({ seed }: { seed: string }) {
  const rng = makeRng(hashString(seed))
  const W = 320
  const H = 200
  const NODE_COUNT = 4 + Math.floor(rng() * 3)
  const PALETTE = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
  type Node = { x: number; y: number; w: number; h: number; color: string }
  const nodes: Node[] = []
  for (let i = 0; i < NODE_COUNT; i++) {
    const w = 50 + rng() * 30
    const h = 32 + rng() * 18
    const x = 16 + rng() * (W - 32 - w)
    const y = 16 + rng() * (H - 32 - h)
    nodes.push({ x, y, w, h, color: PALETTE[Math.floor(rng() * PALETTE.length)] ?? '#3b82f6' })
  }
  const edges: [number, number][] = []
  for (let i = 1; i < nodes.length; i++) {
    edges.push([Math.floor(rng() * i), i])
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ display: 'block', background: 'var(--color-bg-canvas)' }}
    >
      <defs>
        <pattern id={`grid-${seed}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#grid-${seed})`} />
      {edges.map(([a, b], i) => {
        const A = nodes[a]
        const B = nodes[b]
        if (!A || !B) return null
        const x1 = A.x + A.w
        const y1 = A.y + A.h / 2
        const x2 = B.x
        const y2 = B.y + B.h / 2
        const cx = (x1 + x2) / 2
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth={1.2}
          />
        )
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={6}
            fill="rgba(20,20,22,0.92)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
          <rect
            x={n.x + 8}
            y={n.y + 8}
            width={n.w - 16}
            height={4}
            rx={2}
            fill={n.color}
            opacity={0.85}
          />
          <rect
            x={n.x + 8}
            y={n.y + 18}
            width={(n.w - 16) * 0.7}
            height={3}
            rx={1.5}
            fill="rgba(255,255,255,0.25)"
          />
        </g>
      ))}
    </svg>
  )
}

// ─── Stories ────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <BoardCard
        name="Cinematic intro reel"
        meta="Edited 12m ago"
        thumbnail={<MockPreview seed="storm-pelican-93" />}
      />
    </div>
  ),
}

export const Grid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--gutter-grid)',
        width: '100%',
      }}
    >
      <BoardCard
        name="Cinematic intro reel"
        meta="Edited 12m ago"
        thumbnail={<MockPreview seed="storm-pelican-93" />}
      />
      <BoardCard
        name="Product launch board"
        meta="2h ago"
        thumbnail={<MockPreview seed="amber-violet-graph" />}
      />
      <BoardCard
        name="Generative b-roll"
        meta="yesterday"
        thumbnail={<MockPreview seed="sapling-quill-04" />}
      />
      <BoardCard
        name="Asset variations"
        meta="3 days ago"
        thumbnail={<MockPreview seed="midnight-current-77" />}
      />
      <BoardCard
        name="Storyboard scratch"
        meta="2 weeks ago"
        thumbnail={<MockPreview seed="ember-thicket-12" />}
      />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 16 }}>
      <BoardCard name="Idle" meta="just now" thumbnail={<MockPreview seed="idle-board-01" />} />
      <BoardCard
        name="Active (last opened)"
        meta="2h ago"
        active
        thumbnail={<MockPreview seed="active-board-02" />}
      />
      <BoardCard name="With long title that has to truncate" meta="14 days ago" />
    </div>
  ),
}

export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ width: 240 }}>
        <BoardCard
          name="240px container"
          meta="just now"
          thumbnail={<MockPreview seed="narrow-board-01" />}
        />
      </div>
      <div style={{ width: 360 }}>
        <BoardCard
          name="360px container"
          meta="2 days ago"
          thumbnail={<MockPreview seed="medium-board-02" />}
        />
      </div>
      <div style={{ width: 520 }}>
        <BoardCard
          name="520px container"
          meta="2 weeks ago"
          thumbnail={<MockPreview seed="wide-board-03" />}
        />
      </div>
    </div>
  ),
}

// ─── LazyImage — canonical pattern for future canvas snapshots ──────────────
// When the backend ships real board snapshots (rasterised canvas state),
// consumers will pass an <img> through the `thumbnail` slot. The slot has
// `aspect-ratio: 16/10` + `overflow: clip` on the parent, so any source
// renders cleanly. `loading="lazy"` defers off-screen network requests,
// `decoding="async"` keeps the main thread responsive on initial paint.

const SAMPLE_SNAPSHOT =
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=375&fit=crop'

export const LazyImage: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <BoardCard
        name="Real backend snapshot"
        meta="Edited just now"
        thumbnail={
          <img
            src={SAMPLE_SNAPSHOT}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        }
      />
    </div>
  ),
}

// ─── LoadingThumbnail — while backend renders the snapshot ──────────────────
// Real-world race condition: board metadata (name, updatedAt) arrives in
// the first query, but the per-board snapshot URL is computed async on
// the server. Card should appear immediately with a skeleton on the
// thumbnail slot instead of an empty placeholder — keeps perceived
// performance high and avoids a layout shift when the image lands.

export const LoadingThumbnail: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <BoardCard
        name="Snapshot rendering…"
        meta="just now"
        thumbnail={
          <Skeleton radius="none" style={{ width: '100%', height: '100%', display: 'block' }} />
        }
      />
    </div>
  ),
}

// ─── ErrorFallback — when the snapshot fetch fails ──────────────────────────
// Network error / 404 / backend crash → consumer renders a labeled
// fallback inside the slot. BoardCard's `overflow: clip` enforces the
// 16:10 frame so the error UI can't bleed past the card outline.

export const ErrorFallback: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <BoardCard
        name="Brand intro experiments"
        meta="1 week ago"
        thumbnail={
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: 'var(--color-fg-muted)',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 500,
              background: 'var(--color-bg-surface)',
            }}
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden>
              <path
                d="M12 8v5m0 3h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>Preview unavailable</span>
          </div>
        }
      />
    </div>
  ),
}
