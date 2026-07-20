import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { AspectRatioPicker } from './aspect-ratio-picker'
import type { AspectRatio } from './types'

const meta = {
  title: 'Brand / Atoms / AspectRatioPicker',
  component: AspectRatioPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AspectRatioPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<AspectRatio>('16:9')
    return (
      <div style={{ width: 360 }}>
        <AspectRatioPicker value={value} onChange={setValue} />
      </div>
    )
  },
}
