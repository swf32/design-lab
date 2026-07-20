import { DownloadOutline, MaximizeOutline, TrashOutline } from '@klyp/icons/outline'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { BulkActionsBar } from './BulkActionsBar'

const meta = {
  title: 'Brand / Molecules / BulkActionsBar',
  component: BulkActionsBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BulkActionsBar>

export default meta
type Story = StoryObj<typeof meta>

// Minimal icon-only button — production callers should swap in a real
// `<ToolButton>` (which requires both icon + children label) or a tailored
// surface-specific button. This is sufficient for visual story preview.
function StoryActionButton({
  label,
  Icon,
  onClick,
}: {
  label: string
  Icon: (p: { width?: number; height?: number }) => React.JSX.Element
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        padding: 0,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: 'var(--color-fg-primary)',
        cursor: 'pointer',
      }}
    >
      <Icon width={16} height={16} />
    </button>
  )
}

export const Default: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        minHeight: 320,
        padding: 24,
        background: 'var(--color-bg-root)',
      }}
    >
      <BulkActionsBar count={2} onClear={() => alert('clear')}>
        <StoryActionButton label="Download" Icon={DownloadOutline} />
        <StoryActionButton label="Upscale" Icon={MaximizeOutline} />
        <StoryActionButton label="Delete" Icon={TrashOutline} />
      </BulkActionsBar>
    </div>
  ),
}

export const SingleItem: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        minHeight: 320,
        padding: 24,
        background: 'var(--color-bg-root)',
      }}
    >
      <BulkActionsBar count={1} onClear={() => {}}>
        <StoryActionButton label="Download" Icon={DownloadOutline} />
        <StoryActionButton label="Delete" Icon={TrashOutline} />
      </BulkActionsBar>
    </div>
  ),
}

export const Inline: Story = {
  name: 'Inline (no fixed positioning)',
  render: () => (
    <div style={{ padding: 24, background: 'var(--color-bg-root)' }}>
      <BulkActionsBar count={5} onClear={() => {}} inline>
        <StoryActionButton label="Download" Icon={DownloadOutline} />
        <StoryActionButton label="Upscale" Icon={MaximizeOutline} />
        <StoryActionButton label="Delete" Icon={TrashOutline} />
      </BulkActionsBar>
    </div>
  ),
}
