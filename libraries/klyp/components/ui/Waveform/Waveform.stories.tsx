import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { AudioScrubber, Waveform } from './Waveform'

const meta = {
  title: 'UI / Waveform',
  component: Waveform,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Waveform>

export default meta
type Story = StoryObj<typeof meta>

// Sample peaks — 80 bars of fake TTS waveform data
const SAMPLE_PEAKS = [
  0.2, 0.5, 0.7, 0.4, 0.8, 0.6, 0.3, 0.9, 0.5, 0.4, 0.2, 0.6, 0.8, 0.7, 0.5, 0.3, 0.4, 0.9, 0.7,
  0.5, 0.3, 0.6, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3, 0.5, 0.7, 0.8, 0.6, 0.4, 0.2,
  0.5, 0.7, 0.6, 0.4, 0.8, 0.5, 0.3, 0.7, 0.6, 0.4, 0.2, 0.5, 0.8, 0.6, 0.4, 0.7, 0.5, 0.3, 0.6,
  0.4, 0.8, 0.7, 0.5, 0.3, 0.6, 0.4, 0.2, 0.7, 0.5, 0.9, 0.6, 0.4, 0.3, 0.5, 0.7, 0.6, 0.4, 0.8,
  0.5, 0.3, 0.6, 0.4,
]

/** Static waveform with pre-computed peaks (most common use-case: TTS result). */
export const Static: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Waveform peaks={SAMPLE_PEAKS} height={40} />
    </div>
  ),
}

/** No peaks provided — component renders synthetic bars from a seeded PRNG. */
export const SyntheticFallback: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Waveform height={40} />
    </div>
  ),
}

/** Seekable scrubber. Drag or keyboard-navigate (arrow keys / Home / End). */
export const Scrubbable: Story = {
  render: () => {
    const [progress, setProgress] = useState(0.3)
    return (
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AudioScrubber
          peaks={SAMPLE_PEAKS}
          progress={progress}
          duration={30}
          height={40}
          onSeek={setProgress}
        />
        <span style={{ fontSize: 12, opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(progress * 100)}%
        </span>
      </div>
    )
  },
}

/**
 * Adaptive — same component rendered at 280 / 600 / 1200px container widths.
 * Bar count scales automatically via the canvas ResizeObserver.
 */
export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {([280, 600, 1200] as const).map((w) => (
        <div key={w} style={{ width: w }}>
          <div style={{ fontSize: 10, opacity: 0.4, marginBottom: 4 }}>{w}px</div>
          <AudioScrubber peaks={SAMPLE_PEAKS} progress={0.4} height={36} />
        </div>
      ))}
    </div>
  ),
}
