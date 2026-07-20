import type { Meta, StoryObj } from '../__shared/stories-types'
import { InspectorRow } from './InspectorRow'

const meta = {
  title: 'Brand / Atoms / InspectorRow',
  component: InspectorRow,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InspectorRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <InspectorRow label="Model" value="Sonnet 4.5" />
      <InspectorRow label="Duration" value="40s" />
      <InspectorRow label="Aspect" value="16:9" />
    </div>
  ),
}
