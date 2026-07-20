import type { Meta, StoryObj } from '../__shared/stories-types'
import { AssetMention, type AssetSuggestion } from './AssetMention'

const meta = {
  title: 'Brand / Molecules / AssetMention',
  component: AssetMention,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AssetMention>

export default meta
type Story = StoryObj<typeof meta>

const suggestions: AssetSuggestion[] = [
  { id: 'c1', kind: 'character', name: 'Lilith Vance', hint: 'Protagonist' },
  { id: 'l1', kind: 'location', name: 'Estate noir', hint: 'Setting' },
  { id: 'o1', kind: 'outfit', name: 'Tuxedo', hint: 'Formal wear' },
  { id: 'v1', kind: 'vibe', name: 'Noir mood', hint: '35mm grain' },
  { id: 's1', kind: 'scene', name: 'Scene 03', hint: 'Wide alley' },
]

export const Default: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 320, height: 280 }}>
      <AssetMention open onOpenChange={() => {}} suggestions={suggestions} onSelect={() => {}} />
    </div>
  ),
}
