import type { Meta, StoryObj } from '../__shared/stories-types'
import { ComingSoonPage } from './ComingSoonPage'

const meta = {
  title: 'Brand / Molecules / ComingSoonPage',
  component: ComingSoonPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ComingSoonPage>

export default meta
type Story = StoryObj<typeof meta>

// TODO: ComingSoonPage uses TanStack Router `<Link>`. Inside Storybook
// without a RouterProvider it may throw; the story is left here so the
// codemod / router-decorator pass can fix it later.
export const Default: Story = {
  render: () => (
    <ComingSoonPage title="History" description="Re-runs and remixes for finished episodes." />
  ),
}
