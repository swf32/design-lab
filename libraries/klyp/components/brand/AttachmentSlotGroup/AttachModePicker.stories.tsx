import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { type AttachModePanel, AttachModePicker } from './AttachModePicker'

const noop = (_id: string) => undefined

// Sized wrapper — the picker fills its host (the composer takeover). Stories
// give it a composer-ish box so the panels show at a realistic height.
function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 640,
        maxWidth: '100%',
        height: 132,
        padding: 12,
        borderRadius: 18,
        background: 'var(--color-bg-panel)',
      }}
    >
      {children}
    </div>
  )
}

const FRAME_REF: AttachModePanel[] = [
  {
    id: 'frames',
    label: 'Start & End frames',
    caption: 'First + last keyframe',
    mediaTypes: ['image'],
  },
  {
    id: 'reference',
    label: 'References',
    caption: 'Up to 9 images or 3 videos',
    mediaTypes: ['image', 'video'],
  },
]

const meta = {
  component: AttachModePicker,
  title: 'Brand / Molecules / AttachModePicker',
  tags: ['autodocs'],
  args: {
    panels: FRAME_REF,
    onPick: noop,
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    panels: { control: false },
    onPick: { control: false },
    onHoverTarget: { control: false },
    onCancel: { control: false },
    incompatibleLabel: { control: false },
    rejectedPanel: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof AttachModePicker>

export default meta
type Story = StoryObj<typeof meta>

/** Two modes — Start&End (image-only) vs References (image + video). Each panel
 *  shows its accepted-format glyphs, name + a short caption. */
export const Default: Story = {
  render: (args) => (
    <Frame>
      <AttachModePicker {...args} />
    </Frame>
  ),
}

/** With the Cancel block (right, ~15%) — click OR drop on it to back out. */
export const WithCancel: Story = {
  render: (args) => (
    <Frame>
      <AttachModePicker {...args} onCancel={() => undefined} cancelLabel="Cancel" />
    </Frame>
  ),
}

/** Reject — a file dropped on a panel that can't take its kind shakes it (here
 *  the frames panel, which is image-only, after a video drop). */
export const Reject: Story = {
  render: (args) => (
    <Frame>
      <AttachModePicker {...args} rejectedPanel="frames" />
    </Frame>
  ),
}

/** Three modes — the panels flex evenly however many there are. */
export const ThreeModes: Story = {
  render: (args) => (
    <Frame>
      <AttachModePicker
        {...args}
        panels={[
          ...FRAME_REF,
          { id: 'video', label: 'Video-to-video', caption: 'Up to 3 clips', mediaTypes: ['video'] },
        ]}
        onCancel={() => undefined}
      />
    </Frame>
  ),
}
