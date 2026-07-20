import type { Meta, StoryObj } from '../__shared/stories-types'
import { NodeStatusPill } from './NodeStatusPill'

const meta = {
  title: 'Brand / Canvas / NodeStatusPill',
  component: NodeStatusPill,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'queued', 'running', 'done', 'error'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NodeStatusPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    status: 'queued',
  },
}

export const All: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 24,
        alignItems: 'center',
      }}
    >
      {(['idle', 'queued', 'running', 'done', 'error'] as const).map((s) => (
        <div
          key={s}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          {/* Force-render idle by passing a label so it shows in the matrix. */}
          <NodeStatusPill status={s} label={s === 'idle' ? 'Idle' : undefined} />
          <span style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>{s}</span>
        </div>
      ))}
    </div>
  ),
}
