import type { Meta, StoryObj } from '../__shared/stories-types'
import { PreviewThumb } from './PreviewThumb'

const meta = {
  title: 'Brand / Atoms / PreviewThumb',
  component: PreviewThumb,
  tags: ['autodocs'],
  argTypes: {
    ratio: { control: 'select', options: ['9:16', '16:9', '1:1', '4:5'] },
    state: { control: 'select', options: ['empty', 'loading', 'ready'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PreviewThumb>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { args: { ratio: '9:16', state: 'empty', caption: 'No render yet' } }

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 480 }}>
      <PreviewThumb ratio="1:1" state="empty" caption="Empty" />
      <PreviewThumb ratio="1:1" state="loading" caption="Loading" />
      <PreviewThumb ratio="1:1" state="ready" caption="Last render · 12m" />
    </div>
  ),
}

export const Ratios: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      <PreviewThumb ratio="16:9" state="empty" caption="16:9" />
      <PreviewThumb ratio="1:1" state="empty" caption="1:1" />
      <PreviewThumb ratio="9:16" state="empty" caption="9:16" />
    </div>
  ),
}
