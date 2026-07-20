import { AudioOutline, ImageOutline, VideoOutline } from '@klyp/icons/outline'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Checkbox } from '../Checkbox'
import { CheckboxGroup } from './CheckboxGroup'

const meta = {
  title: 'UI / CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <CheckboxGroup aria-label="Tools" defaultValue={['rotate']}>
      <Checkbox value="rotate">Rotate</Checkbox>
      <Checkbox value="zoom">Zoom</Checkbox>
      <Checkbox value="pan">Pan</Checkbox>
    </CheckboxGroup>
  ),
}

export const GridLayout: Story = {
  render: () => (
    <div style={{ width: 720 }}>
      <CheckboxGroup
        aria-label="What do you create?"
        defaultValue={['short-serial', 'social-short']}
        layout="grid"
      >
        <Checkbox value="short-serial" data-variant="card">
          Short serial
        </Checkbox>
        <Checkbox value="long-episode" data-variant="card">
          Long episode
        </Checkbox>
        <Checkbox value="music-video" data-variant="card">
          Music video
        </Checkbox>
        <Checkbox value="commercial" data-variant="card">
          Commercial
        </Checkbox>
        <Checkbox value="social-short" data-variant="card">
          Social short
        </Checkbox>
        <Checkbox value="storyboard" data-variant="card">
          Storyboard
        </Checkbox>
      </CheckboxGroup>
    </div>
  ),
}

/**
 * `MenuRow` — the `data-variant="menu-row"` Checkbox reads as a DropdownMenu
 * item: compact 36px row, checkbox molecule on the left, a 20px leading glyph
 * + 14/medium label, hover-fill highlight, no card border. Used for
 * multi-select filter lists inside a popover (e.g. AdvancedFilterPopover).
 */
export const MenuRow: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <CheckboxGroup aria-label="Media type" defaultValue={['image']} layout="rows">
        <Checkbox value="image" data-variant="menu-row">
          <ImageOutline aria-hidden width={20} height={20} />
          Image
        </Checkbox>
        <Checkbox value="video" data-variant="menu-row">
          <VideoOutline aria-hidden width={20} height={20} />
          Video
        </Checkbox>
        <Checkbox value="audio" data-variant="menu-row">
          <AudioOutline aria-hidden width={20} height={20} />
          Audio
        </Checkbox>
      </CheckboxGroup>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup aria-label="Frozen" defaultValue={['b']} isDisabled>
      <Checkbox value="a">First option</Checkbox>
      <Checkbox value="b">Second option</Checkbox>
      <Checkbox value="c">Third option</Checkbox>
    </CheckboxGroup>
  ),
}

/**
 * `WithMaxSelections` — demonstrates user-side validation: the consumer
 * caps the selection at 2. Extra items become disabled until one is freed.
 */
export const WithMaxSelections: Story = {
  render: () => {
    function MaxTwo() {
      const [value, setValue] = useState<string[]>(['cost'])
      const max = 2
      const atCap = value.length >= max
      const items: Array<{ id: string; label: string }> = [
        { id: 'cost', label: 'Cost per generation' },
        { id: 'few-gens', label: 'Not enough generations' },
        { id: 'inconsistent-character', label: 'Inconsistent character' },
        { id: 'bad-output', label: 'Bad output quality' },
      ]
      return (
        <div style={{ width: 480 }}>
          <p
            style={{
              marginBottom: 12,
              color: 'var(--color-fg-muted)',
              fontSize: 'var(--font-size-13)',
            }}
          >
            Pick up to {max} ({value.length}/{max} selected)
          </p>
          <CheckboxGroup aria-label="Painpoints" value={value} onChange={setValue} layout="rows">
            {items.map((item) => (
              <Checkbox
                key={item.id}
                value={item.id}
                data-variant="card"
                isDisabled={atCap && !value.includes(item.id)}
              >
                {item.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
      )
    }
    return <MaxTwo />
  },
}
