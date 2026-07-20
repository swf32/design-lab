import { AlertTriangleBulk, FilmBulk, InfoBulk, SearchBulk } from '@klyp/icons'
import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Brand / Molecules / EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <EmptyState
        icon={<FilmBulk style={{ width: 32, height: 32 }} />}
        title="No episodes yet"
        description="Create your first episode to get going."
        actions={<Button>+ New episode</Button>}
      />
    </div>
  ),
}

export const Compact: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <EmptyState compact title="Empty rail" description="Drop assets here." />
    </div>
  ),
}

// === New states for stable promotion ================================
// (do not remove or rename stories above — public catalog references them)

/** No icon — text-only empty for ultra-dense inline empties. */
export const NoIcon: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <EmptyState title="Nothing here" description="The list is empty." />
    </div>
  ),
}

/** No actions — pure informational empty (no CTA). */
export const WithoutActions: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <EmptyState
        icon={<SearchBulk style={{ width: 32, height: 32 }} />}
        title="No results"
        description="Try a different query."
      />
    </div>
  ),
}

/** Sizes: compact (small panels), comfortable (default), spacious (hero). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 480 }}>
      <EmptyState
        size="compact"
        icon={<FilmBulk style={{ width: 20, height: 20 }} />}
        title="Compact"
        description="For small panels and inline lists."
      />
      <EmptyState
        size="comfortable"
        icon={<FilmBulk style={{ width: 28, height: 28 }} />}
        title="Comfortable"
        description="Default density."
      />
      <EmptyState
        size="spacious"
        icon={<FilmBulk style={{ width: 40, height: 40 }} />}
        title="Spacious"
        description="Hero-style empty pages."
      />
    </div>
  ),
}

/** Tones — neutral / info / warning. Tints the icon frame. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 480 }}>
      <EmptyState
        tone="neutral"
        icon={<FilmBulk style={{ width: 28, height: 28 }} />}
        title="Neutral"
        description="Default informational empty."
      />
      <EmptyState
        tone="info"
        icon={<InfoBulk style={{ width: 28, height: 28 }} />}
        title="Heads up"
        description="Informational — filter applied, dataset trimmed."
      />
      <EmptyState
        tone="warning"
        icon={<AlertTriangleBulk style={{ width: 28, height: 28 }} />}
        title="Quota reached"
        description="You've used 100% of this month's renders."
      />
    </div>
  ),
}

/** Alignment — `start` for left-aligned inline list empties. */
export const AlignStart: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <EmptyState
        align="start"
        icon={<FilmBulk style={{ width: 24, height: 24 }} />}
        title="No drafts in this folder"
        description="Drafts you create will appear here."
        actions={<Button>+ New draft</Button>}
      />
    </div>
  ),
}

/** With action button — the common Library / History pattern. */
export const WithAction: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <EmptyState
        icon={<FilmBulk style={{ width: 32, height: 32 }} />}
        title="Library is empty"
        description="Generate or upload your first asset."
        actions={
          <>
            <Button>Upload</Button>
            <Button>Generate</Button>
          </>
        }
      />
    </div>
  ),
}
