import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { CanvasToolbar, type ToolbarMode } from './CanvasToolbar'

const meta = {
  title: 'Brand / Canvas / CanvasToolbar',
  component: CanvasToolbar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CanvasToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [mode, setMode] = useState<ToolbarMode>('select')
    return (
      <CanvasToolbar
        activeMode={mode}
        onModeChange={setMode}
        onCreate={() => {
          // No-op in Storybook — the parent canvas page wires this to the
          // node-type picker.
          console.info('+ Create clicked')
        }}
      />
    )
  },
}

const ALL_MODES: ToolbarMode[] = [null, 'select', 'pan', 'sticky', 'draw', 'frame']

export const ActiveStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      {ALL_MODES.map((m) => (
        <div key={m ?? 'none'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-fg-muted)' }}>
            activeMode={m === null ? 'null' : `"${m}"`}
          </span>
          <CanvasToolbar activeMode={m} />
        </div>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    activeMode: 'select',
  },
}
