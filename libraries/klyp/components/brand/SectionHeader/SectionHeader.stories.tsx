import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { SectionHeader } from './SectionHeader'

const meta = {
  title: 'Brand / Atoms / SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <SectionHeader
        eyebrow="Episode 02"
        title="Smoke and Mirrors"
        description="The pilot opens at the harbor."
        actions={<Button>Edit</Button>}
      />
    </div>
  ),
}

export const Levels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 600 }}>
      <SectionHeader level={1} title="H1 page title" />
      <SectionHeader level={2} title="H2 section title" />
      <SectionHeader level={3} title="H3 sub-section" />
    </div>
  ),
}
