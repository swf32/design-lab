import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { BrandMark } from '../BrandMark/BrandMark'
import { TopNav } from './TopNav'

const meta = {
  title: 'Brand / Molecules / TopNav',
  component: TopNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TopNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TopNav
      leading={<BrandMark variant="lockup" />}
      center={<span style={{ color: 'var(--color-fg-muted)' }}>Center slot</span>}
      trailing={<Button>Sign in</Button>}
    />
  ),
}
