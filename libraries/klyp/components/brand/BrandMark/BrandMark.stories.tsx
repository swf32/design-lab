import type { Meta, StoryObj } from '../__shared/stories-types'
import { BrandMark } from './BrandMark'

const meta = {
  title: 'Brand / Atoms / BrandMark',
  component: BrandMark,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['symbol', 'wordmark', 'lockup'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BrandMark>

export default meta
type Story = StoryObj<typeof meta>

export const Lockup: Story = { args: { variant: 'lockup', size: 'md' } }

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <BrandMark variant="symbol" />
      <BrandMark variant="wordmark" />
      <BrandMark variant="lockup" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <BrandMark size="sm" />
      <BrandMark size="md" />
      <BrandMark size="lg" />
    </div>
  ),
}
