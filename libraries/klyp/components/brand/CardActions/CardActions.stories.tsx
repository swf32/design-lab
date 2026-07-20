import type { Meta, StoryObj } from '../__shared/stories-types'
import { CardActions } from './CardActions'

const meta = {
  component: CardActions,
  title: 'Brand / Molecules / CardActions',
  tags: ['autodocs'],
  args: {
    entityName: 'Pyramid Fall',
    onArchive: () => alert('archive'),
    onGenerate: () => alert('generate'),
  },
  decorators: [
    // Mount inside a fake AssetCard so the :hover / :focus-within selectors fire
    (Story) => (
      <div
        className="klyp-AssetCard"
        style={{
          position: 'relative',
          width: 280,
          height: 380,
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--r-card)',
        }}
      >
        <Story />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            color: 'var(--color-fg-muted)',
            fontSize: 12,
          }}
        >
          Hover me to see actions
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof CardActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: {} }

export const Loading: Story = { args: { coverLoading: true } }

export const ArchivedRow: Story = { args: { archiveLabel: 'Restore Pyramid Fall' } }

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {(['default', 'hovered', 'pressed', 'disabled'] as const).map((s) => (
        <div
          key={s}
          className="klyp-AssetCard"
          style={{
            position: 'relative',
            width: 200,
            height: 280,
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--r-card)',
          }}
        >
          <CardActions {...args} coverLoading={s === 'disabled'} />
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              color: 'var(--color-fg-muted)',
              fontSize: 12,
            }}
          >
            {s}
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Adaptive: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {[120, 280, 600, 1200].map((w) => (
        <div
          key={w}
          className="klyp-AssetCard"
          style={{
            position: 'relative',
            width: w,
            height: 240,
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--r-card)',
            containerType: 'inline-size',
          }}
        >
          <CardActions {...args} />
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              color: 'var(--color-fg-muted)',
              fontSize: 12,
            }}
          >
            {w}px
          </div>
        </div>
      ))}
    </div>
  ),
}
