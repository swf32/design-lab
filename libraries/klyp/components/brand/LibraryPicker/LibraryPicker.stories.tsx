import { Button } from '@klyp/ui/Button'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import {
  LibraryPicker,
  type LibraryPickerFilter,
  type LibraryPickerItem,
  type LibraryPickerMediaType,
} from './LibraryPicker'

const meta = {
  title: 'Brand / Molecules / LibraryPicker',
  component: LibraryPicker,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LibraryPicker>

export default meta
type Story = StoryObj<typeof meta>

const PLACEHOLDER_NAMES = [
  'Isla Solis',
  'Neo-Noir',
  'Loading Dock',
  'Brutalist Corridor',
  'Daria Salk',
  'Karl Novak',
  'Dark Academia',
  'The Darkroom',
  'Mara Solis',
  'Ground-Floor Office',
  'Cottagecore',
  'Komorebi Pawn Shop',
]

function mockItem(idx: number): LibraryPickerItem {
  const aspectChoices: [number, number][] = [
    [768, 1024],
    [1024, 768],
    [1024, 1024],
    [1280, 720],
    [720, 1280],
  ]
  const [width, height] = aspectChoices[idx % aspectChoices.length] ?? [1024, 1024]
  const seed = (idx + 1) * 7
  const name = PLACEHOLDER_NAMES[idx % PLACEHOLDER_NAMES.length] ?? `Item ${idx + 1}`
  return {
    id: `mock-${idx}`,
    src: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    width,
    height,
    kind: 'image',
    alt: name,
    name,
  }
}

const MOCK_ITEMS: LibraryPickerItem[] = Array.from({ length: 14 }, (_, i) => mockItem(i))

const TriggerFrame = ({
  label,
  children,
}: {
  label: string
  children: (open: boolean, setOpen: (next: boolean) => void) => React.ReactNode
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ padding: 24 }}>
      <Button variant="default" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {children(open, setOpen)}
    </div>
  )
}

/**
 * Default — click "Open library" to mount the picker as a full-screen
 * overlay (the production behaviour). Close via ✕, ESC, or click outside.
 *
 * The catalog preview renders this trigger button at rest; opening the
 * picker temporarily takes over the screen until the user dismisses it.
 */
export const Default: Story = {
  render: () => (
    <TriggerFrame label="Open library">
      {(open, setOpen) => (
        <LibraryPicker
          open={open}
          onOpenChange={setOpen}
          items={MOCK_ITEMS}
          onPick={(picks) => console.log('picked', picks)}
          onUploadFiles={(files) => console.log('upload', files)}
        />
      )}
    </TriggerFrame>
  ),
}

/**
 * Variants — toggle the picker into a loading state (no items, spinner)
 * or an empty state (items list resolved but length 0). Use the buttons
 * to switch which state the picker mounts in.
 */
export const Variants: Story = {
  render: () => {
    const [mode, setMode] = useState<'closed' | 'loading' | 'empty'>('closed')
    return (
      <div style={{ display: 'flex', gap: 8, padding: 24 }}>
        <Button variant="default" onClick={() => setMode('loading')}>
          Open · loading
        </Button>
        <Button variant="outline" onClick={() => setMode('empty')}>
          Open · empty
        </Button>
        <LibraryPicker
          open={mode !== 'closed'}
          onOpenChange={(next) => {
            if (!next) setMode('closed')
          }}
          items={[]}
          isLoading={mode === 'loading'}
          onPick={() => {}}
          onUploadFiles={() => {}}
        />
      </div>
    )
  },
}

/**
 * States — controlled `filter` (section) + `mediaTypes` (multiselect Type)
 * state owned by the parent. Demonstrates the picker as a controlled
 * component: the section buttons mirror the iconOnly TabSwitcher; the Type
 * buttons mirror the multiselect Type popover (which shows a count badge when
 * ≥1 value is picked; empty array = "all"). The Source axis runs uncontrolled
 * here.
 */
export const States: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState<LibraryPickerFilter>('all')
    const [mediaTypes, setMediaTypes] = useState<LibraryPickerMediaType[]>([])
    return (
      <div style={{ display: 'flex', gap: 8, padding: 24, flexWrap: 'wrap' }}>
        <Button variant="default" onClick={() => setOpen(true)}>
          Open · section = {filter} · type = {mediaTypes.length ? mediaTypes.join(', ') : 'all'}
        </Button>
        <Button variant="outline" onClick={() => setFilter('generated')}>
          Generated
        </Button>
        <Button variant="outline" onClick={() => setFilter('favourites')}>
          Favourites
        </Button>
        <Button variant="outline" onClick={() => setMediaTypes(['image'])}>
          Type · image
        </Button>
        <Button variant="outline" onClick={() => setMediaTypes(['image', 'video'])}>
          Type · image + video
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFilter('all')
            setMediaTypes([])
          }}
        >
          Reset
        </Button>
        <LibraryPicker
          open={open}
          onOpenChange={setOpen}
          items={MOCK_ITEMS}
          filter={filter}
          onFilterChange={setFilter}
          mediaTypes={mediaTypes}
          onMediaTypesChange={setMediaTypes}
          onPick={(picks) => console.log('picked', picks)}
          onUploadFiles={(files) => console.log('upload', files)}
        />
      </div>
    )
  },
}

/**
 * SingleSelect — `maxSelect={1}`, the mode the composer's Start/End
 * video-frame slot pickers open in. Clicking a card replaces the selection
 * (no range/toggle); the footer confirms exactly one pick. The upload band +
 * whole-modal drag-drop still work, uploading a single file.
 */
export const SingleSelect: Story = {
  render: () => (
    <TriggerFrame label="Open · single-select">
      {(open, setOpen) => (
        <LibraryPicker
          open={open}
          onOpenChange={setOpen}
          items={MOCK_ITEMS}
          maxSelect={1}
          onPick={(picks) => console.log('picked', picks)}
          onUploadFiles={(files) => console.log('upload', files)}
        />
      )}
    </TriggerFrame>
  ),
}
