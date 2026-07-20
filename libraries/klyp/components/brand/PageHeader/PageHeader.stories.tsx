import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { PageHeader } from './PageHeader'

const meta = {
  title: 'Brand / Molecules / PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

function Stage({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 24 }}>{children}</div>
}

const seriesCrumbs = [
  { label: 'Home', to: '/' },
  { label: 'Series', to: '/series' },
]

export const Default: Story = {
  name: 'Default — full composite',
  render: () => (
    <Stage>
      <PageHeader
        crumbs={seriesCrumbs}
        eyebrow="Series"
        title="Ash & Ember"
        description="A neo-noir tale set in a smoldering city."
        actions={<Button>+ New episode</Button>}
      />
    </Stage>
  ),
}

export const TitleOnly: Story = {
  name: 'Title only',
  render: () => (
    <Stage>
      <PageHeader title="Library" />
    </Stage>
  ),
}

export const TitleAndDescription: Story = {
  name: 'Title + description',
  render: () => (
    <Stage>
      <PageHeader
        title="Library"
        description="Everything you've generated across canvases and chats."
      />
    </Stage>
  ),
}

export const TitleAndActions: Story = {
  name: 'Title + actions',
  render: () => (
    <Stage>
      <PageHeader title="Library" actions={<Button>+ New asset</Button>} />
    </Stage>
  ),
}

export const NoBreadcrumbs: Story = {
  name: 'No breadcrumbs — eyebrow + title + description + actions',
  render: () => (
    <Stage>
      <PageHeader
        eyebrow="Series"
        title="Ash & Ember"
        description="A neo-noir tale set in a smoldering city."
        actions={<Button>+ New episode</Button>}
      />
    </Stage>
  ),
}

export const NoEyebrow: Story = {
  name: 'No eyebrow — breadcrumbs + title + actions',
  render: () => (
    <Stage>
      <PageHeader
        crumbs={seriesCrumbs}
        title="Ash & Ember"
        description="A neo-noir tale set in a smoldering city."
        actions={<Button>+ New episode</Button>}
      />
    </Stage>
  ),
}

export const NoActions: Story = {
  name: 'No actions — breadcrumbs + title + description',
  render: () => (
    <Stage>
      <PageHeader
        crumbs={seriesCrumbs}
        title="Ash & Ember"
        description="A neo-noir tale set in a smoldering city."
      />
    </Stage>
  ),
}

export const Level2: Story = {
  name: 'Level 2 — h2 (sub-section header)',
  render: () => (
    <Stage>
      <PageHeader
        level={2}
        title="Recent activity"
        description="Last 30 days of generations across this workspace."
      />
    </Stage>
  ),
}

export const LongTitle: Story = {
  name: 'Long title — wraps gracefully',
  render: () => (
    <Stage>
      <PageHeader
        crumbs={seriesCrumbs}
        eyebrow="Series"
        title="The Cartographer's Daughter and the Cinder Mountain Expedition"
        description="A multi-season noir set against a dying empire — long-form descriptions still need to wrap and breathe."
        actions={<Button>+ New episode</Button>}
      />
    </Stage>
  ),
}

export const MultipleActions: Story = {
  name: 'Multiple actions — secondary + primary',
  render: () => (
    <Stage>
      <PageHeader
        crumbs={seriesCrumbs}
        title="Ash & Ember"
        description="A neo-noir tale set in a smoldering city."
        actions={
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <Button variant="ghost">Share</Button>
            <Button>+ New episode</Button>
          </div>
        }
      />
    </Stage>
  ),
}
