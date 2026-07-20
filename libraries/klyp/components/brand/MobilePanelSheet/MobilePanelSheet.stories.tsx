import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { MobilePanelSheet } from './MobilePanelSheet'

const meta = {
  title: 'Brand / Molecules / MobilePanelSheet',
  component: MobilePanelSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // Force a phone-class viewport so the snap-points read meaningfully.
    viewport: { defaultViewport: 'mobile1' },
  },
} satisfies Meta<typeof MobilePanelSheet>

export default meta
type Story = StoryObj<typeof meta>

/** Demo body — long content so the expand-snap scroll behaviour is visible. */
function DemoContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
        Drag the handle up to expand. Drag down past peek to dismiss.
      </p>
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: 13,
          }}
        >
          Sample row {i + 1}
        </div>
      ))}
    </div>
  )
}

/** Default — controlled state. Click to open at peek snap. */
export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
    title: 'Editor panels',
    description: 'Library · Inspector · Compose',
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open ?? false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Open sheet
        </button>
        <MobilePanelSheet {...args} open={open} onOpenChange={setOpen}>
          <DemoContent />
        </MobilePanelSheet>
      </div>
    )
  },
}

/** Always open at peek — pin for visual review. */
export const PeekDetent: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Library',
    initialSnap: 0,
  },
  render: (args) => (
    <MobilePanelSheet {...args}>
      <DemoContent />
    </MobilePanelSheet>
  ),
}

/** Always open at expand — pin for full-content layout review. */
export const ExpandDetent: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Library',
    initialSnap: 1,
  },
  render: (args) => (
    <MobilePanelSheet {...args}>
      <DemoContent />
    </MobilePanelSheet>
  ),
}

/** With description — paragraph announced to screen readers + visible
 *  under the title. Used when the panel context isn't obvious from
 *  surrounding chrome. */
export const WithDescription: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Inspector',
    description: 'Edit metadata for the selected asset. Changes save automatically.',
    initialSnap: 1,
  },
  render: (args) => (
    <MobilePanelSheet {...args}>
      <DemoContent />
    </MobilePanelSheet>
  ),
}
