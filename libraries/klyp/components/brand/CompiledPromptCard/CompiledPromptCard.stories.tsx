import type { Meta, StoryObj } from '../__shared/stories-types'
import { CompiledPromptCard } from './CompiledPromptCard'

const meta = {
  title: 'Brand / Molecules / CompiledPromptCard',
  component: CompiledPromptCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CompiledPromptCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <CompiledPromptCard
        title="Final prompt"
        subtitle="What the model receives"
        tokens={847}
        version="v4"
        cost="$0.08"
      >
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {`Wide noir alley shot of Lilith Vance in a tuxedo,
estate-noir lighting, 35mm, smoke drifts.`}
        </pre>
      </CompiledPromptCard>
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <CompiledPromptCard collapsed title="Final prompt" tokens={120} cost="$0.01">
        <pre>Hidden body</pre>
      </CompiledPromptCard>
    </div>
  ),
}
