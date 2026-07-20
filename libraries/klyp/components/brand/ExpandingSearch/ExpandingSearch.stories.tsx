import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { ExpandingSearch } from './ExpandingSearch'

const meta = {
  title: 'Brand / Atoms / ExpandingSearch',
  component: ExpandingSearch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ExpandingSearch>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default — bare ExpandingSearch. Click the lupe to expand; type;
 * press Escape or click the close X to collapse.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return <ExpandingSearch ariaLabel="Search" value={value} onChange={setValue} />
  },
}

/**
 * InToolbar — the real usage model. Search sits in a `justify-content:
 * flex-end`, `flex-wrap: nowrap` row with fixed-width siblings (`flex: 0 0
 * auto`). The search is the only flexible element (`flex: 1 1 auto;
 * min-width: 0`): closed it caps itself to a 40px square via its own
 * animated `max-width`, so it sits flush against the trailing Filter chip
 * with the free space to the LEFT. On open it grows LEFTWARD to fill that
 * gap — the right edge stays pinned, siblings never move or overlay. This
 * is the Library toolbar contract.
 */
export const InToolbar: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <>
        <style>{`
          .story-search-host {
            display: flex;
            flex-wrap: nowrap;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: var(--color-bg-surface);
            border: 1px solid var(--color-border-subtle);
            border-radius: 12px;
            width: 420px;
          }
          .story-search-host .klyp-ExpandingSearch {
            flex: 1 1 auto;
            min-width: 0;
          }
          .story-search-chip {
            flex: 0 0 auto;
            padding: 8px 12px;
            background: var(--color-bg-surface-solid);
            border-radius: 10px;
            font-size: 13px;
            font-weight: 500;
          }
        `}</style>
        <div className="story-search-host">
          <span className="story-search-chip">Create</span>
          <ExpandingSearch ariaLabel="Search assets" value={value} onChange={setValue} />
          <span className="story-search-chip">Filter</span>
        </div>
      </>
    )
  },
}

/**
 * Prefilled — a controlled value is set, but the search renders COLLAPSED
 * (40px square): `open` is internal state with no `defaultOpen`. Click the
 * magnifier to reveal the field with the value already populated.
 */
export const Prefilled: Story = {
  render: () => {
    const [value, setValue] = useState('character')
    return <ExpandingSearch ariaLabel="Search" value={value} onChange={setValue} />
  },
}

/**
 * Disabled — trigger non-interactive; cannot expand. Use when the
 * surrounding view has no searchable content.
 */
export const Disabled: Story = {
  render: () => (
    <ExpandingSearch ariaLabel="Search disabled" value="" onChange={() => {}} isDisabled />
  ),
}
