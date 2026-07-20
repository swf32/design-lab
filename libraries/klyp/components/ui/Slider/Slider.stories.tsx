import type { Meta, StoryObj } from '../__shared/stories-types'
import { Slider } from './Slider'

const meta = {
  title: 'UI / Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Slider defaultValue={40} minValue={0} maxValue={100} aria-label="Quality" />
    </div>
  ),
}

export const Range: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Slider defaultValue={[20, 80]} minValue={0} maxValue={100} aria-label="Range" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Slider defaultValue={50} isDisabled aria-label="Disabled" />
    </div>
  ),
}
