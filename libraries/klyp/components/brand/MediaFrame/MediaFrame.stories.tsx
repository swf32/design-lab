import { type CSSProperties, useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { MediaFrame } from './MediaFrame'

const meta = {
  component: MediaFrame,
  title: 'Brand / MediaFrame',
  tags: ['autodocs'],
  args: { modality: 'image', aspect: '1:1', etaSec: 5 },
  argTypes: {
    modality: { control: 'inline-radio', options: ['image', 'video'] },
    aspect: {
      control: 'select',
      options: ['1:1', '16:9', '9:16', '3:2', '2:3', '21:9', '9:21', '4:3', '3:4'],
    },
    etaSec: { control: 'number' },
    src: { control: 'text' },
    label: { control: 'text' },
    alt: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof MediaFrame>

export default meta
type Story = StoryObj<typeof meta>

// Mockup image for the reveal/ready demo (picsum — same convention as the
// other brand stories: MediaCard / MediaGrid / LibraryPicker).
const SAMPLE_IMAGE = 'https://picsum.photos/seed/klyp-mediaframe/640/640'

// Constrain the fluid frame (it sizes off --chat-media-*) for the catalog.
function box(heightCap: string): CSSProperties {
  return {
    '--chat-media-max-w': '100%',
    '--chat-media-max-h': heightCap,
  } as CSSProperties
}

export const Generating: Story = {
  render: () => (
    <div style={box('240px')}>
      <MediaFrame modality="image" aspect="1:1" etaSec={5} />
    </div>
  ),
}

export const Ready: Story = {
  name: 'Ready (revealed)',
  render: () => (
    <div style={box('240px')}>
      <MediaFrame modality="image" aspect="1:1" src={SAMPLE_IMAGE} alt="sample" />
    </div>
  ),
}

// Interactive: replay the generating → blur-reveal transition.
function RevealDemo() {
  const [src, setSrc] = useState<string | undefined>(undefined)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const replay = () => {
    window.clearTimeout(timer.current)
    setSrc(undefined)
    // Let the snake run a beat (~1.5s) before the media reveals — instant
    // reveal made it flash + look jerky.
    timer.current = window.setTimeout(() => setSrc(SAMPLE_IMAGE), 1500)
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        alignItems: 'flex-start',
        ...box('260px'),
      }}
    >
      <button
        type="button"
        onClick={replay}
        style={{
          font: 'inherit',
          fontSize: 12,
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid var(--color-border-subtle, var(--color-border))',
          background: 'var(--color-bg-surface-elevated)',
          color: 'var(--color-fg-primary)',
          cursor: 'pointer',
        }}
      >
        ▶ Replay reveal
      </button>
      <MediaFrame modality="image" aspect="1:1" etaSec={5} src={src} alt="sample" />
    </div>
  )
}

export const Reveal: Story = {
  name: 'Reveal (generating → media)',
  render: () => <RevealDemo />,
}

export const Formats: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'flex-start',
        ...box('150px'),
      }}
    >
      <MediaFrame modality="image" aspect="1:1" label="1:1" />
      <MediaFrame modality="image" aspect="16:9" label="16:9" />
      <MediaFrame modality="video" aspect="9:16" label="9:16" />
      <MediaFrame modality="video" aspect="21:9" label="21:9" />
    </div>
  ),
}
