import type { Meta, StoryObj } from '../__shared/stories-types'
import {
  ConversationRow,
  type ConversationRowItem,
  type ConversationRowLabels,
} from './ConversationRow'

const meta = {
  component: ConversationRow,
  title: 'Brand / Molecules / ConversationRow',
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationRow>

export default meta
type Story = StoryObj<typeof meta>

const LABELS: ConversationRowLabels = {
  rename: 'Rename',
  pin: 'Pin',
  unpin: 'Unpin',
  delete: 'Delete',
  generating: 'Generating',
  actionsFor: (title) => `Actions for ${title}`,
}

const NOW = 1_700_000_000_000

const ITEM: ConversationRowItem = {
  id: 'demo-1',
  title: 'Brand video ideas',
  modality: 'video',
  lastMessageAt: NOW,
}

// Presentational component — handlers are no-ops in isolation.
const noop = () => {}
const noopText = (_: string) => {}

const handlers = {
  onSelect: noop,
  onStartRename: noop,
  onPin: noop,
  onDelete: noop,
  onRenameChange: noopText,
  onRenameCommit: noop,
  onRenameCancel: noop,
}

/** Renders rows inside a fixed-width rail-like container (rows are flex:1). */
function Rail({ width = 280, children }: { width?: number; children: React.ReactNode }) {
  return <div style={{ width, padding: 8 }}>{children}</div>
}

export const Default: Story = {
  render: () => (
    <Rail>
      <ConversationRow item={ITEM} labels={LABELS} {...handlers} />
    </Rail>
  ),
}

export const WithTime: Story = {
  render: () => (
    <Rail width={420}>
      <ConversationRow
        item={ITEM}
        labels={LABELS}
        showTime
        formatTime={() => '2h ago'}
        {...handlers}
      />
    </Rail>
  ),
}

export const States: Story = {
  render: () => (
    <Rail>
      <ConversationRow
        item={{ ...ITEM, id: 'a', title: 'Active conversation' }}
        active
        labels={LABELS}
        {...handlers}
      />
      <ConversationRow
        item={{ ...ITEM, id: 'b', title: 'Generating…', status: 'pending' }}
        labels={LABELS}
        {...handlers}
      />
      <ConversationRow
        item={{ ...ITEM, id: 'c', title: 'Pinned chat', pinnedAt: NOW }}
        labels={LABELS}
        {...handlers}
      />
      <ConversationRow
        item={{ ...ITEM, id: 'd', title: 'Renaming this one' }}
        isRenaming
        renameText="Renaming this one"
        labels={LABELS}
        {...handlers}
      />
    </Rail>
  ),
}

// Truncation across realistic row widths (the row lives in a ~240–560px rail /
// list, never 1200px). Stacked vertically so the preview never overflows; the
// narrow rows clip the long title to an ellipsis.
export const Truncation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
      {[240, 360, 560].map((w) => (
        <div
          key={w}
          style={{
            width: w,
            maxWidth: '100%',
            overflow: 'hidden',
            border: '1px dashed var(--color-border-subtle)',
            padding: 8,
          }}
        >
          <ConversationRow
            item={{
              ...ITEM,
              title: `${w}px — a long conversation title that truncates with an ellipsis when the row is narrow`,
            }}
            labels={LABELS}
            {...handlers}
          />
        </div>
      ))}
    </div>
  ),
}
