import type { Meta, StoryObj } from '../__shared/stories-types'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'UI / Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    children: 'I agree to terms',
    size: 'md',
    tone: 'neutral',
    isSelected: false,
    isIndeterminate: false,
    isDisabled: false,
    isInvalid: false,
    isReadOnly: false,
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    tone: { control: 'inline-radio', options: ['neutral', 'success'] },
    description: { control: 'text' },
    errorMessage: { control: 'text' },
    isSelected: { control: 'boolean' },
    isIndeterminate: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Checkbox>I agree to terms</Checkbox>,
}

export const Checked: Story = {
  render: () => <Checkbox defaultSelected>Selected</Checkbox>,
}

export const Indeterminate: Story = {
  render: () => <Checkbox isIndeterminate>Partial</Checkbox>,
}

export const WithDescription: Story = {
  render: () => <Checkbox description="Weekly digest, no spam">Subscribe to newsletter</Checkbox>,
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox size="sm" defaultSelected>
        Small
      </Checkbox>
      <Checkbox size="md" defaultSelected>
        Medium (default)
      </Checkbox>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox>Default</Checkbox>
      <Checkbox defaultSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox isDisabled defaultSelected>
        Disabled + Checked
      </Checkbox>
      <Checkbox isInvalid>Invalid</Checkbox>
      <Checkbox isInvalid defaultSelected>
        Invalid + Checked
      </Checkbox>
    </div>
  ),
}

export const SuccessTone: Story = {
  name: 'Success tone (opt-in)',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox tone="success" defaultSelected>
        Task complete
      </Checkbox>
      <Checkbox tone="success" isIndeterminate>
        Partially done
      </Checkbox>
      <Checkbox tone="success">Not started</Checkbox>
    </div>
  ),
}

export const ReadOnly: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox isReadOnly defaultSelected>
        Read-only (checked)
      </Checkbox>
      <Checkbox isReadOnly>Read-only (unchecked)</Checkbox>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <Checkbox isInvalid errorMessage="You must accept the terms to continue.">
      I accept the terms
    </Checkbox>
  ),
}
