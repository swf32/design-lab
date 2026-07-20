import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { AppTopbar } from './AppTopbar'

const meta = {
  title: 'Brand / Molecules / AppTopbar',
  component: AppTopbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppTopbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AppTopbar
      crumbs={[
        { label: 'Home', to: '/' },
        { label: 'Series', to: '/series' },
        { label: 'Ash & Ember' },
      ]}
      actions={<Button>+ New episode</Button>}
    />
  ),
}
