import type { Meta, StoryObj } from '../__shared/stories-types'
import type { AssetSuggestion } from '../AssetMention/AssetMention'
import { MentionPicker } from './MentionPicker'

const meta = {
  title: 'Brand / Molecules / MentionPicker',
  component: MentionPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MentionPicker>

export default meta
type Story = StoryObj<typeof meta>

const suggestions: AssetSuggestion[] = [
  { id: 'c1', kind: 'character', name: 'Lilith Vance', meta: 'rogue · noir', usageCount: 8 },
  { id: 'c2', kind: 'character', name: 'Detective Roe', meta: 'lead', usageCount: 3 },
  { id: 'l1', kind: 'location', name: 'Estate noir', usageCount: 5 },
  { id: 'o1', kind: 'outfit', name: 'Tuxedo' },
  { id: 'v1', kind: 'vibe', name: 'Noir mood' },
  { id: 's1', kind: 'scene', name: 'Opening shot', usageCount: 1 },
]

const noop = () => {}

/** Stage: the picker is absolute-positioned inside a relative parent, the
 *  same shape a PromptComposer textarea wrapper provides. */
function Stage({ children }: { children: React.ReactNode }) {
  return <div style={{ position: 'relative', width: 360, height: 360 }}>{children}</div>
}

export const Default: Story = {
  render: () => (
    <Stage>
      <MentionPicker
        open
        onOpenChange={noop}
        query=""
        onQueryChange={noop}
        suggestions={suggestions}
        onPick={noop}
        onBrowseAll={noop}
        side="bottom"
      />
    </Stage>
  ),
}

/** Both anchor sides — `bottom` (below the input) and `top` (above it). */
export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Stage>
        <MentionPicker
          open
          onOpenChange={noop}
          query=""
          onQueryChange={noop}
          suggestions={suggestions}
          onPick={noop}
          onBrowseAll={noop}
          side="bottom"
        />
      </Stage>
      <Stage>
        <MentionPicker
          open
          onOpenChange={noop}
          query=""
          onQueryChange={noop}
          suggestions={suggestions.slice(0, 3)}
          onPick={noop}
          onBrowseAll={noop}
          side="top"
        />
      </Stage>
    </div>
  ),
}

/** States: typed query, the empty "no matches" result, and the footer
 *  ⌘K browse-all disabled when no handler is provided. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      <Stage>
        <MentionPicker
          open
          onOpenChange={noop}
          query="lil"
          onQueryChange={noop}
          suggestions={suggestions.slice(0, 1)}
          onPick={noop}
          onBrowseAll={noop}
          side="bottom"
        />
      </Stage>
      <Stage>
        <MentionPicker
          open
          onOpenChange={noop}
          query="zzz"
          onQueryChange={noop}
          suggestions={[]}
          onPick={noop}
          onBrowseAll={noop}
          side="bottom"
        />
      </Stage>
      <Stage>
        <MentionPicker
          open
          onOpenChange={noop}
          query=""
          onQueryChange={noop}
          suggestions={suggestions}
          onPick={noop}
          side="bottom"
        />
      </Stage>
    </div>
  ),
}
