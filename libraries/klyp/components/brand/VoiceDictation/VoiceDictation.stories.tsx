import type { Meta, StoryObj } from '../__shared/stories-types'
import { VoiceDictation, type VoiceDictationView } from './VoiceDictation'

// Story-only stubs. Real capture needs a mic + the consumer's STT backend;
// here we resolve a canned transcript so the interactive Default still works.
const mockTranscribe = async (): Promise<string> => {
  await new Promise((r) => setTimeout(r, 1200))
  return 'This is a dictated chunk of text.'
}
const noop = () => {}

const meta = {
  component: VoiceDictation,
  title: 'Brand / Molecules / VoiceDictation',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    onTranscribe: mockTranscribe,
    onResult: noop,
    disabled: false,
    fluid: false,
    cover: false,
  },
  argTypes: {
    // Most useful live control — forces each visual state without a mic.
    previewState: {
      control: 'select',
      options: ['idle', 'permission', 'holding', 'toggle', 'transcribing', 'error'],
    },
    disabled: { control: 'boolean' },
    fluid: { control: 'boolean' },
    cover: { control: 'boolean' },
    holdThresholdMs: { control: { type: 'range', min: 100, max: 1500, step: 50 } },
    maxDurationMs: { control: { type: 'range', min: 5000, max: 300000, step: 5000 } },
    // Callbacks / slots — not editable.
    className: { control: false },
    onTranscribe: { control: false },
    onResult: { control: false },
    onError: { control: false },
  },
} satisfies Meta<typeof VoiceDictation>

export default meta
type Story = StoryObj<typeof meta>

/** Idle mic — tap to start, hold for push-to-talk. (Live; needs mic permission.) */
export const Default: Story = {}

const ALL_VIEWS: { view: VoiceDictationView; label: string }[] = [
  { view: 'idle', label: 'idle' },
  { view: 'permission', label: 'permission' },
  { view: 'holding', label: 'holding (push-to-talk)' },
  { view: 'toggle', label: 'toggle (recording)' },
  { view: 'transcribing', label: 'transcribing' },
  { view: 'error', label: 'error' },
]

/** Every visual state side-by-side (forced via `previewState`). */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--space-20)' }}>
      {ALL_VIEWS.map(({ view, label }) => (
        <div key={view} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
          <span
            style={{
              width: 'var(--space-128)',
              fontSize: 'var(--font-size-12, 12px)',
              color: 'var(--color-fg-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {label}
          </span>
          <VoiceDictation {...args} previewState={view} />
        </div>
      ))}
    </div>
  ),
}

/** Disabled — control is inert (e.g. while the composer is submitting). */
export const Disabled: Story = {
  args: { disabled: true },
}

/** The recording bar (fluid) across narrow → wide containers (280 / 600 /
 *  1200). Frames clamp to `min(px, 100%)`; `fluid` makes the bar fill the
 *  frame and the waveform grow (bar count scales with width). */
export const Adaptive: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--space-24)', width: '100%' }}>
      {[280, 600, 1200].map((w) => (
        <div
          key={w}
          style={{
            width: `min(${w}px, 100%)`,
            padding: 'var(--space-12)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--r-card)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <VoiceDictation {...args} previewState="toggle" fluid />
        </div>
      ))}
    </div>
  ),
}

/** Cover mode — while recording the bar lifts into a full-width ABSOLUTE overlay
 *  over its (position:relative) parent, hiding everything beneath. In the chat
 *  composer this covers the footer so Send can't be hit while dictating. The
 *  ✗ ✓ cluster mirrors the footer geometry in pure CSS (36px squares, 8px gap,
 *  flush right) so ✗ sits on the mic slot and ✓ on the Send slot. */
export const Cover: Story = {
  render: (args) => (
    <div
      style={{
        position: 'relative',
        minWidth: '420px',
        height: 'var(--control-size-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-8)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--r-chip)',
      }}
    >
      <span style={{ marginRight: 'auto', color: 'var(--color-fg-muted)', fontSize: '12px' }}>
        mock footer · Send →
      </span>
      <VoiceDictation {...args} previewState="toggle" cover />
    </div>
  ),
}
