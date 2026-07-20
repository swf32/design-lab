import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { Drawer } from './Drawer'

const meta = {
  title: 'Brand / Molecules / Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Right: Story = {
  render: () => (
    <Drawer
      side="right"
      title="Inspector"
      description="Right-anchored slide-in panel."
      trigger={<Button>Open right</Button>}
    >
      <p>Body content.</p>
    </Drawer>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Drawer side="bottom" title="Mobile sheet" trigger={<Button>Open bottom</Button>}>
      <p>Bottom sheet content.</p>
    </Drawer>
  ),
}
