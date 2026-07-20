import type { Meta, StoryObj } from '../__shared/stories-types'
import {
  AudioPlayer,
  AudioPlayerCurrentTime,
  AudioPlayerDuration,
  AudioPlayerProvider,
} from './AudioPlayer'

const meta = {
  title: 'UI / AudioPlayer',
  component: AudioPlayer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AudioPlayer>

export default meta
type Story = StoryObj<typeof meta>

// Sample ElevenLabs public CDN audio — used for visual testing only
const DEMO_SRC = 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3'

// Sample peaks data — 80 normalised bars (0..1)
const SAMPLE_PEAKS = [
  0.2, 0.5, 0.7, 0.4, 0.8, 0.6, 0.3, 0.9, 0.5, 0.4, 0.2, 0.6, 0.8, 0.7, 0.5, 0.3, 0.4, 0.9, 0.7,
  0.5, 0.3, 0.6, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3, 0.5, 0.7, 0.8, 0.6, 0.4, 0.2,
  0.5, 0.7, 0.6, 0.4, 0.8, 0.5, 0.3, 0.7, 0.6, 0.4, 0.2, 0.5, 0.8, 0.6, 0.4, 0.7, 0.5, 0.3, 0.6,
  0.4, 0.8, 0.7, 0.5, 0.3, 0.6, 0.4, 0.2, 0.7, 0.5, 0.9, 0.6, 0.4, 0.3, 0.5, 0.7, 0.6, 0.4, 0.8,
  0.5, 0.3, 0.6, 0.4,
]

/** Default player with pre-computed peaks. Click Play to test audio. */
export const Default: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <AudioPlayer src={DEMO_SRC} peaks={SAMPLE_PEAKS} />
    </div>
  ),
}

/** No peaks — scrubber renders synthetic bars. */
export const SyntheticWaveform: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <AudioPlayer src={DEMO_SRC} />
    </div>
  ),
}

/**
 * Loading — simulates the state before audio metadata arrives.
 * Uses a deliberately slow/broken URL to keep it in the buffering state.
 * In production this appears for ~200-500ms on first play.
 */
export const Loading: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <AudioPlayer src="https://example.invalid/audio.mp3" peaks={SAMPLE_PEAKS} />
    </div>
  ),
}

/**
 * Custom layout — shows how to compose sub-primitives manually using
 * AudioPlayerProvider + useAudioPlayer hooks.
 */
export const CustomComposition: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <AudioPlayerProvider src={DEMO_SRC}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
          }}
        >
          <AudioPlayerCurrentTime />
          <span style={{ opacity: 0.3 }}>/</span>
          <AudioPlayerDuration />
        </div>
      </AudioPlayerProvider>
    </div>
  ),
}
