import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { BadgeToggle } from './BadgeToggle'

const meta = {
  title: 'Brand / Atoms / BadgeToggle',
  component: BadgeToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BadgeToggle>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default — filter row driven by the Studio Library kinds. Each item carries
 * its own intent colour; the selected item fills with the matching subtle
 * background while neutral hover keeps unselected items legible.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('all')
    return (
      <BadgeToggle value={value} onValueChange={setValue} ariaLabel="Filter by kind">
        <BadgeToggle.Item value="all" intent="gold">
          All
        </BadgeToggle.Item>
        <BadgeToggle.Item value="character" intent="blue">
          Char
        </BadgeToggle.Item>
        <BadgeToggle.Item value="location" intent="green">
          Loc
        </BadgeToggle.Item>
        <BadgeToggle.Item value="outfit" intent="amber">
          Out
        </BadgeToggle.Item>
        <BadgeToggle.Item value="vibe" intent="purple">
          Vibe
        </BadgeToggle.Item>
        <BadgeToggle.Item value="script" intent="red">
          Scr
        </BadgeToggle.Item>
      </BadgeToggle>
    )
  },
}

/**
 * Intents — sweep across all nine Badge intents to verify each renders both
 * idle (dot only) and selected (subtle wash) state correctly. Click any
 * pill to inspect its selected look.
 */
export const Intents: Story = {
  render: () => {
    const [value, setValue] = useState('blue')
    return (
      <BadgeToggle value={value} onValueChange={setValue} ariaLabel="Intent">
        <BadgeToggle.Item value="gray" intent="gray">
          Gray
        </BadgeToggle.Item>
        <BadgeToggle.Item value="blue" intent="blue">
          Blue
        </BadgeToggle.Item>
        <BadgeToggle.Item value="purple" intent="purple">
          Purple
        </BadgeToggle.Item>
        <BadgeToggle.Item value="amber" intent="amber">
          Amber
        </BadgeToggle.Item>
        <BadgeToggle.Item value="red" intent="red">
          Red
        </BadgeToggle.Item>
        <BadgeToggle.Item value="pink" intent="pink">
          Pink
        </BadgeToggle.Item>
        <BadgeToggle.Item value="green" intent="green">
          Green
        </BadgeToggle.Item>
        <BadgeToggle.Item value="teal" intent="teal">
          Teal
        </BadgeToggle.Item>
        <BadgeToggle.Item value="gold" intent="gold">
          Gold
        </BadgeToggle.Item>
      </BadgeToggle>
    )
  },
}

/**
 * States — md size + disabled group. Shows alternate density (matches a row
 * of `<Badge size="md">` static badges) and verifies disabled treatment.
 */
export const States: Story = {
  render: () => {
    const [value, setValue] = useState('character')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BadgeToggle value={value} onValueChange={setValue} ariaLabel="Md size" size="md">
          <BadgeToggle.Item value="character" intent="blue">
            Char
          </BadgeToggle.Item>
          <BadgeToggle.Item value="location" intent="green">
            Loc
          </BadgeToggle.Item>
          <BadgeToggle.Item value="vibe" intent="purple">
            Vibe
          </BadgeToggle.Item>
        </BadgeToggle>

        <BadgeToggle value={value} onValueChange={setValue} ariaLabel="Disabled group" isDisabled>
          <BadgeToggle.Item value="character" intent="blue">
            Char
          </BadgeToggle.Item>
          <BadgeToggle.Item value="location" intent="green">
            Loc
          </BadgeToggle.Item>
          <BadgeToggle.Item value="vibe" intent="purple">
            Vibe
          </BadgeToggle.Item>
        </BadgeToggle>
      </div>
    )
  },
}
