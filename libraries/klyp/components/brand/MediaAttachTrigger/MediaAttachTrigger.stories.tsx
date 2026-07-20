import { Slider } from '@klyp/ui'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import {
  type MediaAttachKind,
  type MediaAttachMode,
  MediaAttachTrigger,
} from './MediaAttachTrigger'

const noop = (_id: string) => undefined

const MODES: Record<string, MediaAttachMode[]> = {
  frameRef: [
    { id: 'frames', label: 'Start & End frames', description: 'Two keyframes — first + last' },
    { id: 'reference', label: 'References', description: 'Up to 9 style images' },
  ],
  framesOnly: [{ id: 'frames', label: 'Start & End frames' }],
  refOnly: [{ id: 'reference', label: 'References', description: 'Up to 7 images' }],
}

const meta = {
  component: MediaAttachTrigger,
  title: 'Brand / Molecules / MediaAttachTrigger',
  tags: ['autodocs'],
  args: {
    mediaTypes: ['image', 'video'] as MediaAttachKind[],
    modes: MODES.frameRef,
    onSelectMode: noop,
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    mediaTypes: { control: false },
    modes: { control: false },
    onSelectMode: { control: false },
    onDropFiles: { control: false },
  },
} satisfies Meta<typeof MediaAttachTrigger>

export default meta
type Story = StoryObj<typeof meta>

/** Seedance 2.0 shape — image + video input, Start&End ↔ Reference toggle. */
export const Default: Story = {}

/** The splayed icon stack scales with how many media kinds the model accepts:
 *  1 → straight, 2 → ±10°, 3 → centre raised + ±10°. */
export const MediaTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <MediaAttachTrigger
        mediaTypes={['image']}
        modes={MODES.frameRef}
        onSelectMode={noop}
        label="Add Start&End Frames or References"
      />
      <MediaAttachTrigger
        mediaTypes={['image', 'video']}
        modes={MODES.frameRef}
        onSelectMode={noop}
        label="Add Start&End Frames or References"
      />
      <MediaAttachTrigger
        mediaTypes={['audio', 'image', 'video']}
        modes={MODES.frameRef}
        onSelectMode={noop}
        label="Add Start&End Frames or References"
      />
    </div>
  ),
}

/** One mode → the trigger is a direct action (no dropdown). Two+ → click opens
 *  the mode dropdown. */
export const Modes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <MediaAttachTrigger
        mediaTypes={['image']}
        modes={MODES.framesOnly}
        onSelectMode={noop}
        label="Add Start & End frames"
      />
      <MediaAttachTrigger
        mediaTypes={['image']}
        modes={MODES.refOnly}
        onSelectMode={noop}
        label="Add References"
      />
      <MediaAttachTrigger
        mediaTypes={['image', 'video']}
        modes={MODES.frameRef}
        onSelectMode={noop}
      />
    </div>
  ),
}

/** Enabled vs disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <MediaAttachTrigger
        mediaTypes={['image', 'video']}
        modes={MODES.frameRef}
        onSelectMode={noop}
      />
      <MediaAttachTrigger
        mediaTypes={['image', 'video']}
        modes={MODES.frameRef}
        onSelectMode={noop}
        disabled
      />
    </div>
  ),
}

/** Drag the slider to resize the slot. As it narrows past the label the text
 *  truncates with an ellipsis; the icon stack + padding stay intact. */
export const Adaptive: Story = {
  name: 'Adaptive — resizable slot',
  render: () => {
    const [width, setWidth] = useState(320)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 420 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>slot width: {width}px</span>
          <Slider
            aria-label="Slot width"
            min={120}
            max={420}
            value={width}
            onChange={(v) => setWidth(typeof v === 'number' ? v : v[0])}
          />
        </div>
        <div style={{ width }}>
          <MediaAttachTrigger
            mediaTypes={['audio', 'image', 'video']}
            modes={MODES.frameRef}
            onSelectMode={noop}
            label="Add Start&End Frames or References"
          />
        </div>
      </div>
    )
  },
}
