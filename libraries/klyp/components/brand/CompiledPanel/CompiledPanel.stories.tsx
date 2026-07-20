import type { Meta, StoryObj } from '../__shared/stories-types'
import { CompiledPanel } from './CompiledPanel'

const meta = {
  title: 'Brand / Molecules / CompiledPanel',
  component: CompiledPanel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CompiledPanel>

export default meta
type Story = StoryObj<typeof meta>

// TODO: Production CompiledPanel reads `built` from Convex
// `api.atoms.previewBuiltPrompt`. Story passes a static mock so the panel
// renders in isolation.
const mockBuilt = {
  textBlocks: ['Wide noir alley shot of Lilith Vance', 'estate-noir lighting, 35mm'],
  references: [],
  apiParams: { model: 'sonnet-4.5', temperature: 0.7 },
}

export const Default: Story = {
  render: () => (
    <CompiledPanel open onOpenChange={() => {}} built={mockBuilt as never} isLoading={false} />
  ),
}
