import type { CSSProperties } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { ConversationHistory } from './ConversationHistory'

const meta = {
  component: ConversationHistory,
  title: 'Brand / Molecules / ConversationHistory',
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationHistory>

export default meta
type Story = StoryObj<typeof meta>

// The panel is height:100% (it fills its host's height) + owns its own 280↔72px
// width + demo data (DEMO_ITEMS). Just a sized frame — the catalog stage centres
// the panel, which is fine for the preview.
const frame: CSSProperties = { height: 560 }

export const Default: Story = {
  render: () => (
    <div style={frame}>
      <ConversationHistory />
    </div>
  ),
}

export const ActiveRow: Story = {
  render: () => (
    <div style={frame}>
      <ConversationHistory activeId="demo-teaser" />
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div style={frame}>
      <ConversationHistory defaultCollapsed />
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <div style={frame}>
      <ConversationHistory items={[]} />
    </div>
  ),
}
