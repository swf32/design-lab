import { UsersBulk, VideoBulk } from '@klyp/icons'
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@klyp/ui'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { SelectableCard } from './SelectableCard'

const meta = {
  title: 'Brand / Molecules / SelectableCard',
  component: SelectableCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SelectableCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SelectableCard
        icon={<UsersBulk />}
        title="With my team"
        description="For studios collaborating on serial AI content."
      />
    </div>
  ),
}

/**
 * `Selected` simulates the visual state by manually setting
 * `data-selected="true"` on the card root — useful for design previews
 * outside an actual RadioGroup / CheckboxGroup.
 */
export const Selected: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SelectableCard
        data-selected="true"
        icon={<UsersBulk />}
        title="With my team"
        description="For studios collaborating on serial AI content."
      />
    </div>
  ),
}

export const WithoutDescription: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <SelectableCard icon={<VideoBulk />} title="Music video" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SelectableCard
        data-disabled="true"
        icon={<UsersBulk />}
        title="With my team"
        description="For studios collaborating on serial AI content."
      />
    </div>
  ),
}

/**
 * `InRadioGroup` — real-world usage inside a RAC RadioGroup. The card's
 * selected check is driven by the parent `[data-selected]` attribute.
 */
export const InRadioGroup: Story = {
  render: () => (
    <div style={{ width: 640 }}>
      <RadioGroup aria-label="Use mode" defaultValue="solo" layout="grid">
        <Radio value="solo" data-variant="card">
          <SelectableCard
            icon={<UsersBulk />}
            title="Solo"
            description="Just me, exploring serial AI content."
          />
        </Radio>
        <Radio value="team" data-variant="card">
          <SelectableCard
            icon={<UsersBulk />}
            title="With my team"
            description="For studios collaborating on serial AI content."
          />
        </Radio>
      </RadioGroup>
    </div>
  ),
}

/**
 * `InCheckboxGroup` — same molecule inside a multi-select group.
 */
export const InCheckboxGroup: Story = {
  render: () => (
    <div style={{ width: 720 }}>
      <CheckboxGroup aria-label="What do you create?" defaultValue={['short-serial']} layout="grid">
        <Checkbox value="short-serial" data-variant="card">
          <SelectableCard icon={<VideoBulk />} title="Short serial" />
        </Checkbox>
        <Checkbox value="music-video" data-variant="card">
          <SelectableCard icon={<VideoBulk />} title="Music video" />
        </Checkbox>
      </CheckboxGroup>
    </div>
  ),
}
