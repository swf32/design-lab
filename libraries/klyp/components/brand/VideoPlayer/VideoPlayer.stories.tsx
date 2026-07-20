import type { Meta, StoryObj } from '../__shared/stories-types'
import { VideoPlayer, type VideoSource } from './VideoPlayer'

const meta = {
  title: 'Brand / Molecules / VideoPlayer',
  component: VideoPlayer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof VideoPlayer>

export default meta
type Story = StoryObj<typeof meta>

/** Sample MP4 (Blender Foundation, CC-BY) — interactive in the catalog. */
const SAMPLE: VideoSource[] = [
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video/mp4',
  },
]
const POSTER =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'

/** Default — poster + a single MP4 source. Hover to reveal the controls bar. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <VideoPlayer sources={SAMPLE} poster={POSTER} label="Big Buck Bunny" />
    </div>
  ),
}

/** No poster — first decoded frame shows once metadata loads. */
export const WithoutPoster: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <VideoPlayer sources={SAMPLE} label="Sample clip without poster" />
    </div>
  ),
}

/**
 * States — the controls bar is visible whenever the player is paused or
 * hovered. Both instances render paused, so the bar (play · volume · seek ·
 * fullscreen) is shown by default; hover the timeline for the thumbnail
 * preview, and use the volume button for the vertical scrub popover.
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
      <VideoPlayer sources={SAMPLE} poster={POSTER} label="Player A" />
      <VideoPlayer sources={SAMPLE} poster={POSTER} label="Player B" />
    </div>
  ),
}

/**
 * Adaptive — the same player at 280 / 600 / 1200px container widths. Below the
 * 26rem container breakpoint the control row tightens, drops the remaining-time
 * read-out, and shrinks the hover-preview so nothing overflows or wraps.
 */
export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {[280, 600, 1200].map((w) => (
        <div key={w}>
          <div
            style={{
              marginBottom: 8,
              fontSize: 12,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-fg-muted, #888)',
            }}
          >
            {w}px
          </div>
          <div style={{ width: w, maxWidth: '100%' }}>
            <VideoPlayer sources={SAMPLE} poster={POSTER} label={`Player ${w}px`} />
          </div>
        </div>
      ))}
    </div>
  ),
}
