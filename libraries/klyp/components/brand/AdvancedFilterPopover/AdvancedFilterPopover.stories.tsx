import {
  AudioOutline,
  FrameOutline,
  ImageOutline,
  Messages2Outline,
  VideoOutline,
} from '@klyp/icons/outline'
import { Checkbox } from '@klyp/ui/Checkbox'
import { CheckboxGroup } from '@klyp/ui/CheckboxGroup'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { AdvancedFilterPopover } from './AdvancedFilterPopover'

const meta = {
  title: 'Brand / Atoms / AdvancedFilterPopover',
  component: AdvancedFilterPopover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AdvancedFilterPopover>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The popover content reads as ONE menu — section labels (Type / Source)
 * over `menu-row` checkbox options, matching the DS DropdownMenu. The
 * trigger shows a single accent dot when any axis is active (no number,
 * nothing at all when empty). Multiselect; the host owns the state.
 */
function FilterMenu({
  initialTypes = [],
  initialSources = [],
}: {
  initialTypes?: string[]
  initialSources?: string[]
}) {
  const [types, setTypes] = useState<string[]>(initialTypes)
  const [sources, setSources] = useState<string[]>(initialSources)
  const activeCount = (types.length > 0 ? 1 : 0) + (sources.length > 0 ? 1 : 0)
  return (
    <AdvancedFilterPopover ariaLabel="Advanced filters" activeCount={activeCount}>
      <AdvancedFilterPopover.Row label="Type">
        <CheckboxGroup aria-label="Type" layout="rows" value={types} onChange={setTypes}>
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
      </AdvancedFilterPopover.Row>
      <AdvancedFilterPopover.Row label="Source">
        <CheckboxGroup aria-label="Source" layout="rows" value={sources} onChange={setSources}>
          <Checkbox value="series" data-variant="menu-row">
            <VideoOutline aria-hidden width={20} height={20} />
            Series
          </Checkbox>
          <Checkbox value="chat" data-variant="menu-row">
            <Messages2Outline aria-hidden width={20} height={20} />
            Chat
          </Checkbox>
          <Checkbox value="canvas" data-variant="menu-row">
            <FrameOutline aria-hidden width={20} height={20} />
            Canvas
          </Checkbox>
        </CheckboxGroup>
      </AdvancedFilterPopover.Row>
    </AdvancedFilterPopover>
  )
}

/** Default — no active filters, so the trigger is a quiet icon button (no dot). */
export const Default: Story = {
  render: () => <FilterMenu />,
}

/** Active — at least one axis selected, so a single accent dot shows on the trigger. */
export const Active: Story = {
  render: () => <FilterMenu initialTypes={['image']} initialSources={['series']} />,
}

/** Disabled — trigger non-interactive; the popover never opens. */
export const Disabled: Story = {
  render: () => (
    <AdvancedFilterPopover ariaLabel="Disabled filters" isDisabled activeCount={2}>
      <AdvancedFilterPopover.Row label="Type">
        <CheckboxGroup aria-label="Type" layout="rows" value={['image']} onChange={() => {}}>
          <Checkbox value="image" data-variant="menu-row" isDisabled>
            <ImageOutline aria-hidden width={20} height={20} />
            Image
          </Checkbox>
        </CheckboxGroup>
      </AdvancedFilterPopover.Row>
    </AdvancedFilterPopover>
  ),
}
