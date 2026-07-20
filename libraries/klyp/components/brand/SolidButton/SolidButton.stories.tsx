import type { Meta, StoryObj } from '../__shared/stories-types'
import { SolidButton } from './SolidButton'

const meta = {
  component: SolidButton,
  title: 'Brand / Atoms / SolidButton',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Flat solid-fill CTA. Brand-gate target for `<MeshButton>` on the Unreals brand — when `VITE_BRAND !== "klyp"`, MeshButton renders SolidButton instead of the mesh-blob CTA. No border, no shadow, no inset glow, no blob mesh.',
      },
    },
  },
  args: {
    children: 'Generate',
    size: 'md',
  },
} satisfies Meta<typeof SolidButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <SolidButton size="xs">Extra small</SolidButton>
      <SolidButton size="sm">Small</SolidButton>
      <SolidButton size="md">Medium</SolidButton>
      <SolidButton size="lg">Large</SolidButton>
      <SolidButton size="xl">Extra large</SolidButton>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <SolidButton>Default</SolidButton>
      <SolidButton busy>Loading</SolidButton>
      <SolidButton isDisabled>Disabled</SolidButton>
    </div>
  ),
}
