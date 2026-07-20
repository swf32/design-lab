import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { SnakeBorder } from './SnakeBorder'

const meta = {
  title: 'Brand / Atoms / SnakeBorder',
  component: SnakeBorder,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SnakeBorder>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Dark surface so the ring + glow halo actually read — the bare snake on the
 * transparent catalog bg is just a thin line. Mirrors real usage where the
 * border wraps a card.
 */
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 220,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-surface)',
        color: 'var(--color-fg-subtle)',
        fontSize: 12,
      }}
    >
      {children}
    </div>
  )
}

/** Headline — the chat "generating" look: bold wide cone + glow halo. */
export const BoldGeneratingGlow: Story = {
  name: 'Generating (bold) + glow',
  render: () => (
    <SnakeBorder
      state="generating"
      intensity="bold"
      glow
      color="var(--color-accent)"
      duration="3.6s"
    >
      <Demo>Generating…</Demo>
    </SnakeBorder>
  ),
}

/** intensity default (legacy thin spike) vs bold + glow (chat). */
export const IntensityComparison: Story = {
  name: 'default vs bold + glow',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
      <SnakeBorder state="generating" color="var(--color-accent)">
        <Demo>default</Demo>
      </SnakeBorder>
      <SnakeBorder
        state="generating"
        intensity="bold"
        glow
        color="var(--color-accent)"
        duration="3.6s"
      >
        <Demo>bold + glow</Demo>
      </SnakeBorder>
    </div>
  ),
}

/** Ambient — slow rotation; glow honoured on ambient with just the `glow` prop. */
export const Ambient: Story = {
  render: () => (
    <SnakeBorder state="ambient" glow color="var(--color-accent)">
      <Demo>Ambient</Demo>
    </SnakeBorder>
  ),
}

/** All four states (glow where it applies: ambient + bold generating; submit has its own burst). */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
      <SnakeBorder state="idle" color="var(--color-accent)">
        <Demo>idle</Demo>
      </SnakeBorder>
      <SnakeBorder state="ambient" glow color="var(--color-accent)">
        <Demo>ambient</Demo>
      </SnakeBorder>
      <SnakeBorder
        state="generating"
        intensity="bold"
        glow
        color="var(--color-accent)"
        duration="3.6s"
      >
        <Demo>generating</Demo>
      </SnakeBorder>
      <SnakeBorder state="submit" color="var(--color-accent)">
        <Demo>submit</Demo>
      </SnakeBorder>
    </div>
  ),
}

/** Idle — ring hidden (opacity 0). */
export const Idle: Story = {
  render: () => (
    <SnakeBorder state="idle">
      <Demo>Idle (ring hidden)</Demo>
    </SnakeBorder>
  ),
}
