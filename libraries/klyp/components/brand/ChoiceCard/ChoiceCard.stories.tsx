import type { Meta, StoryObj } from '../__shared/stories-types'
import { ChoiceCard } from './ChoiceCard'

// Sample cover used to demonstrate image-bleed treatment.
const COVER = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=600&fit=crop'

const meta = {
  title: 'Brand / ChoiceCard',
  component: ChoiceCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    state: { control: 'select', options: ['active', 'soon'] },
  },
} satisfies Meta<typeof ChoiceCard>

export default meta
type Story = StoryObj<typeof meta>

/** Single card — default state with cover image. */
export const Default: Story = {
  args: {
    id: 'guided',
    title: 'Guided',
    desc: 'Step by step. I’ll explain along the way.',
    imageUrl: COVER,
    onPress: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
}

/** Three variants side-by-side: with image / without image / long copy. */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 240px)',
        gap: 16,
      }}
    >
      <ChoiceCard
        id="img"
        title="With image"
        desc="Cover bleeds full-card and fades into the dark base."
        imageUrl={COVER}
        onPress={() => {}}
      />
      <ChoiceCard
        id="noimg"
        title="No image"
        desc="Branded gradient placeholder, same anatomy as image cards."
        onPress={() => {}}
      />
      <ChoiceCard
        id="long"
        title="Long copy demo"
        desc="Two lines clamp gracefully — Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        imageUrl={COVER}
        onPress={() => {}}
      />
    </div>
  ),
}

/** Active vs soon — both with image to show the muted-wrapper opacity. */
export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 240px)',
        gap: 16,
      }}
    >
      <ChoiceCard
        id="active"
        title="Active"
        desc="Default state — primary affordance, hover lifts the card."
        imageUrl={COVER}
        onPress={() => {}}
      />
      <ChoiceCard
        id="soon"
        title="Coming soon"
        desc="Muted via wrapper opacity. Still clickable — consumer wires a toast."
        imageUrl={COVER}
        state="soon"
        onPress={() => {}}
      />
    </div>
  ),
}
