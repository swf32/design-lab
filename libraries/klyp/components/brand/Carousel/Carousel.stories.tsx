import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Carousel } from './Carousel'

const meta = {
  title: 'Brand / Molecules / Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================================
//  Demo card — stand-in for a real <ContentCard>. Presentational only.
// ============================================================================

function DemoCard({ n }: { n: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        aspectRatio: '16 / 9',
        padding: 'var(--space-16)',
        borderRadius: 'var(--r-card)',
        border: '1px solid var(--color-border-default)',
        background: `linear-gradient(135deg, var(--color-bg-surface-solid), var(--color-bg-surface))`,
        color: 'var(--color-fg-primary)',
        fontSize: 'var(--font-size-14)',
      }}
    >
      <span style={{ color: 'var(--color-fg-muted)', fontSize: 'var(--font-size-12)' }}>
        Lesson {String(n).padStart(2, '0')}
      </span>
      <span>Card {n}</span>
    </div>
  )
}

function makeCards(count: number): ReactNode[] {
  return Array.from({ length: count }, (_, i) => <DemoCard key={`card-${i + 1}`} n={i + 1} />)
}

function Frame({ width, children }: { width: number | string; children: ReactNode }) {
  return (
    <div style={{ padding: 'var(--space-16)', background: 'var(--color-bg-root)' }}>
      <div style={{ width, maxWidth: '100%' }}>{children}</div>
    </div>
  )
}

// ============================================================================
//  Stories
// ============================================================================

export const Default: Story = {
  name: 'Default — infinite loop + autoplay',
  render: () => (
    <Frame width={960}>
      <Carousel title="Featured">{makeCards(7)}</Carousel>
    </Frame>
  ),
}

// Variants: per-view counts and the static fallback for few cards.
export const Variants: Story = {
  name: 'Variants — per-view & static fallback',
  render: () => (
    <Frame width={960}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
        <Carousel title="3 per view" perView={3}>
          {makeCards(8)}
        </Carousel>
        <Carousel title="2 per view (default)">{makeCards(8)}</Carousel>
        <Carousel title="Static row — 2 cards (no loop/arrows)">{makeCards(2)}</Carousel>
      </div>
    </Frame>
  ),
}

// States: autoplay on vs. off (manual paging only).
export const States: Story = {
  name: 'States — autoplay on / manual only',
  render: () => (
    <Frame width={960}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
        <Carousel title="Autoplay on (pauses on hover/focus)">{makeCards(6)}</Carousel>
        <Carousel title="Manual only (autoplay off)" autoplay={false}>
          {makeCards(6)}
        </Carousel>
      </div>
    </Frame>
  ),
}

// Adaptive: the canonical 280 / 600 / 1200 container test. The track collapses
// to 1-up under 36rem and shows the full per-view layout when it has room.
export const Adaptive: Story = {
  name: 'Adaptive — 280 / 600 / 1200',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-32)',
        padding: 'var(--space-16)',
        background: 'var(--color-bg-root)',
      }}
    >
      <div style={{ width: 280 }}>
        <Carousel title="280px">{makeCards(6)}</Carousel>
      </div>
      <div style={{ width: 600 }}>
        <Carousel title="600px">{makeCards(6)}</Carousel>
      </div>
      <div style={{ width: 1200 }}>
        <Carousel title="1200px" perView={3}>
          {makeCards(6)}
        </Carousel>
      </div>
    </div>
  ),
}
