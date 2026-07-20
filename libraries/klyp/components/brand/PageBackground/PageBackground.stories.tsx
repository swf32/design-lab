import type { Meta, StoryObj } from '../__shared/stories-types'
import { PageBackground } from './PageBackground'

const meta = {
  title: 'Brand / Molecules / PageBackground',
  component: PageBackground,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageBackground>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
      <PageBackground />
    </div>
  ),
}
