import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'UI / Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: { radius: 'card', animation: 'wave' },
  argTypes: {
    radius: {
      control: 'select',
      options: ['sm', 'chip', 'card', 'section', 'panel', 'full'],
    },
    animation: { control: 'inline-radio', options: ['wave', 'none'] },
    className: { control: false },
    style: { control: false },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// CSSProperties doesn't type custom CSS vars; cast through Record.
function stagger(i: number): CSSProperties {
  return { '--klyp-stagger-i': i } as CSSProperties
}

// -------------------------------------------------------------------
// 1. Default — solo Skeleton with default card radius. Solo usage
// reads as a plain Pulse (no neighbouring blocks to cascade with).
// -------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Skeleton style={{ height: 96 }} />
    </div>
  ),
}

// -------------------------------------------------------------------
// 2. Radii — every semantic radius alias from the locked 5-step ramp
// (plus `full` for circles + `sm` for tight indicators).
// -------------------------------------------------------------------

export const Radii: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-16)',
        width: 520,
      }}
    >
      {(['sm', 'chip', 'card', 'section', 'panel', 'full'] as const).map((r, i) => (
        <div key={r} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Skeleton
            radius={r}
            style={
              r === 'full'
                ? { width: 56, height: 56, ...stagger(i) }
                : { height: 56, ...stagger(i) }
            }
          />
          <span
            style={{
              fontSize: 'var(--font-size-11)',
              color: 'var(--color-fg-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {r}
          </span>
        </div>
      ))}
    </div>
  ),
}

// -------------------------------------------------------------------
// 3. Pulse Wave — the marquee behaviour. 10 stacked Skeletons with
// sequential `--klyp-stagger-i`. Each block runs the same 1.6s
// opacity breath but offset by 120ms per index; the visible result
// is one continuous wave rolling top-down through the stack.
// -------------------------------------------------------------------

export const PulseWave: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
        width: 360,
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} radius="chip" style={{ height: 14, ...stagger(i) }} />
      ))}
    </div>
  ),
}

// -------------------------------------------------------------------
// 4. TextBlock — realistic pattern: avatar + 2 text lines + meta
// chips. Mirrors the layout used inside list-row and card-row
// loading states (e.g. activity ledger, library grid). Sequential
// stagger so the wave reads inside the row too.
// -------------------------------------------------------------------

export const TextBlock: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-12)',
        padding: 'var(--space-16)',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--r-section)',
        width: 420,
      }}
    >
      <Skeleton radius="full" style={{ width: 40, height: 40, flexShrink: 0, ...stagger(0) }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Skeleton radius="chip" style={{ height: 14, width: '60%', ...stagger(1) }} />
        <Skeleton radius="chip" style={{ height: 12, width: '90%', ...stagger(2) }} />
        <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
          <Skeleton radius="chip" style={{ height: 18, width: 56, ...stagger(3) }} />
          <Skeleton radius="chip" style={{ height: 18, width: 72, ...stagger(4) }} />
        </div>
      </div>
    </div>
  ),
}

// -------------------------------------------------------------------
// 5. Static — `animation="none"` renders a quiet, non-animated block
// (same resting look as prefers-reduced-motion) for callers that want
// to opt one instance out of motion without an OS setting.
// -------------------------------------------------------------------

export const Static: Story = {
  name: 'Static (animation="none")',
  render: () => (
    <div style={{ width: 320 }}>
      <Skeleton animation="none" style={{ height: 96 }} />
    </div>
  ),
}
