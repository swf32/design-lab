import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { type PromptIntent, PromptIntentToolbar } from './PromptIntentToolbar'

const meta = {
  title: 'Brand / Molecules / PromptIntentToolbar',
  component: PromptIntentToolbar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PromptIntentToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [intent, setIntent] = useState<PromptIntent>('action')
    return (
      <div style={{ width: 480 }}>
        <PromptIntentToolbar intent={intent} onIntentChange={setIntent} />
      </div>
    )
  },
}
