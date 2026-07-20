import './Badge.stories.scss'

import { CheckOutline, GiftOutline, MagicStarOutline } from '@klyp/icons'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Badge, type BadgeIntent } from './Badge'

const meta = {
  title: 'UI / Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'New', intent: 'gray', variant: 'subtle', size: 'md' },
  argTypes: {
    intent: {
      control: 'select',
      options: [
        'gray',
        'blue',
        'purple',
        'amber',
        'red',
        'pink',
        'green',
        'teal',
        'gold',
        'inverted',
        'featured',
        'premium',
      ] satisfies BadgeIntent[],
    },
    variant: { control: 'inline-radio', options: ['solid', 'subtle', 'outline'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const COLOR_INTENTS = [
  'gray',
  'blue',
  'purple',
  'amber',
  'red',
  'pink',
  'green',
  'teal',
  'gold',
] as const satisfies readonly BadgeIntent[]

const SINGLE_LOOK_INTENTS = [
  'inverted',
  'featured',
  'premium',
] as const satisfies readonly BadgeIntent[]

export const Default: Story = {}

export const Intents: Story = {
  render: () => (
    <div className="klyp-Badge-stories__column">
      {COLOR_INTENTS.map((intent) => (
        <div key={intent} className="klyp-Badge-stories__row">
          <Badge intent={intent} variant="subtle">
            {intent}
          </Badge>
          <Badge intent={intent} variant="solid">
            {intent}
          </Badge>
        </div>
      ))}
      <div className="klyp-Badge-stories__row">
        {SINGLE_LOOK_INTENTS.map((intent) => (
          <Badge key={intent} intent={intent}>
            {intent}
          </Badge>
        ))}
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="klyp-Badge-stories__row klyp-Badge-stories__row--sizes">
      <Badge intent="blue" size="sm">
        Small
      </Badge>
      <Badge intent="blue" size="md">
        Medium
      </Badge>
      <Badge intent="blue" size="lg">
        Large
      </Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="klyp-Badge-stories__row">
      <Badge intent="green" icon={CheckOutline}>
        Verified
      </Badge>
      <Badge intent="amber" icon={MagicStarOutline}>
        Featured
      </Badge>
      <Badge intent="purple" variant="solid" icon={GiftOutline}>
        Bonus
      </Badge>
      <Badge intent="featured" icon={MagicStarOutline}>
        Featured
      </Badge>
      <Badge intent="premium" icon={MagicStarOutline}>
        Premium
      </Badge>
    </div>
  ),
}

export const WithIconsMatrix: Story = {
  name: 'With icons — full matrix',
  render: () => (
    <div className="klyp-Badge-stories__column">
      {COLOR_INTENTS.map((intent) => (
        <div key={intent} className="klyp-Badge-stories__matrixRow">
          <span className="klyp-Badge-stories__matrixLabel">{intent}</span>
          <Badge intent={intent} variant="subtle" size="sm" icon={CheckOutline}>
            {intent}
          </Badge>
          <Badge intent={intent} variant="subtle" size="md" icon={CheckOutline}>
            {intent}
          </Badge>
          <Badge intent={intent} variant="subtle" size="lg" icon={CheckOutline}>
            {intent}
          </Badge>
          <Badge intent={intent} variant="solid" size="sm" icon={CheckOutline}>
            {intent}
          </Badge>
          <Badge intent={intent} variant="solid" size="md" icon={CheckOutline}>
            {intent}
          </Badge>
          <Badge intent={intent} variant="solid" size="lg" icon={CheckOutline}>
            {intent}
          </Badge>
        </div>
      ))}
    </div>
  ),
}

export const IconOnly: Story = {
  name: 'Icon-only (requires title)',
  args: {
    intent: 'green',
    icon: CheckOutline,
    title: 'Verified',
    children: undefined,
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="klyp-Badge-stories__row">
      <Badge intent="blue" disabled>
        Blue
      </Badge>
      <Badge intent="green" variant="solid" disabled>
        Active
      </Badge>
      <Badge intent="featured" disabled>
        Featured
      </Badge>
    </div>
  ),
}
