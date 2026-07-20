import type { Meta, StoryObj } from '../__shared/stories-types'
import { Switch } from './Switch'

const meta = {
  title: 'UI / Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    children: 'Enable beta features',
    size: 'md',
    isSelected: false,
    isDisabled: false,
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Switch>Enable beta features</Switch>,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Switch size="sm">Small</Switch>
      <Switch size="md">Medium</Switch>
      <Switch size="lg">Large</Switch>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Switch>Off (default)</Switch>
      <Switch defaultSelected>On</Switch>
      <Switch isDisabled>Disabled off</Switch>
      <Switch isDisabled defaultSelected>
        Disabled on
      </Switch>
    </div>
  ),
}

// COMPOSITION example — the full-width "toggle row" (label + inline hint on the
// left, track on the right) is NOT a Switch prop. It's the consuming layout
// wrapping <Switch> in a flex row (row-reverse + width:100% + padding), exactly
// as the chat composer does (composer-settings-popover.tsx ToggleRow). Named as
// composition so it doesn't read as Switch API.
export const Composition: Story = {
  name: 'Composition — toggle row',
  render: () => (
    <Switch
      defaultSelected
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        width: 280,
        height: 40,
        paddingInline: 12,
        borderRadius: 10,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
        Static camera
        <span style={{ fontSize: 11, opacity: 0.6 }}>(~50% cost)</span>
      </span>
    </Switch>
  ),
}
