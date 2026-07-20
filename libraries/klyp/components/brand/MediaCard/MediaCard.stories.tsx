import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { FavouriteToggle } from '../FavouriteToggle/FavouriteToggle'
import { MediaCardActions } from '../MediaCardActions/MediaCardActions'
import type { MediaGridItem } from '../MediaGrid/MediaGrid'
import { MediaCard } from './MediaCard'

// Mock items — defined ABOVE `meta` so `meta.args` can reference them at
// module-eval time without a temporal-dead-zone error.
const sampleImage: MediaGridItem = {
  id: 'item-1',
  src: 'https://picsum.photos/seed/klyp-card-1/768/1024',
  width: 768,
  height: 1024,
  alt: 'Hero shot 04',
  kind: 'image',
}

const sampleVideo: MediaGridItem = {
  id: 'item-vid',
  src: 'https://picsum.photos/seed/klyp-card-vid/1280/720',
  width: 1280,
  height: 720,
  alt: 'Ash & Ember teaser',
  kind: 'video',
  durationLabel: '0:42',
}

const meta = {
  title: 'Brand / Molecules / MediaCard',
  component: MediaCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // MediaCard fills its parent (100% × 100%) — the catalog Playground mounts
    // the bare component, so without a sized wrapper it renders at 0 height.
    playground: { wrapperStyle: { width: 220, aspectRatio: '3 / 4' } },
  },
  args: {
    item: sampleImage,
    isSelected: false,
    selectionActive: false,
    isHovered: false,
    // Passed through (not controls) so the boolean controls produce a visible
    // change: onItemClick makes the card interactive, onSelectionClick lets the
    // checkbox appear when `selectionActive` is toggled on.
    onItemClick: () => {},
    onSelectionClick: () => {},
  },
  argTypes: {
    isSelected: { control: 'boolean' },
    selectionActive: { control: 'boolean' },
    isHovered: { control: 'boolean' },
    className: { control: false },
  },
} satisfies Meta<typeof MediaCard>

export default meta
type Story = StoryObj<typeof meta>

function Frame({
  width = 260,
  aspectRatio = '3 / 4',
  children,
}: {
  width?: number
  aspectRatio?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: 24,
        background: 'var(--color-bg-root)',
        display: 'inline-block',
      }}
    >
      <div style={{ width, aspectRatio }}>{children}</div>
    </div>
  )
}

export const Default: Story = {
  name: 'Default — image, non-interactive',
  render: () => (
    <Frame>
      <MediaCard item={sampleImage} />
    </Frame>
  ),
}

export const Interactive: Story = {
  name: 'Interactive — click to open',
  render: () => (
    <Frame>
      <MediaCard item={sampleImage} onItemClick={(id) => alert(`open ${id}`)} />
    </Frame>
  ),
}

export const WithOverlay: Story = {
  name: 'With overlay — favourite + 3-dots',
  render: () => {
    const [fav, setFav] = useState(false)
    return (
      <Frame>
        <MediaCard
          item={sampleImage}
          onItemClick={() => {}}
          renderOverlay={(it) => (
            <>
              <FavouriteToggle
                isFavourite={fav}
                onToggle={setFav}
                label={`Favourite ${it.alt ?? it.id}`}
              />
              <MediaCardActions
                entityName={it.alt ?? it.id}
                isFavourite={fav}
                onToggleFavourite={setFav}
                onSaveToDevice={() => {}}
                onDelete={() => {}}
              />
            </>
          )}
        />
      </Frame>
    )
  },
}

export const Selected: Story = {
  name: 'Selected (green ring + checkbox)',
  render: () => (
    <Frame>
      <MediaCard item={sampleImage} onSelectionClick={() => {}} isSelected selectionActive />
    </Frame>
  ),
}

export const SelectionMode: Story = {
  name: 'Selection mode active — checkbox visible',
  render: () => (
    <Frame>
      <MediaCard item={sampleImage} onSelectionClick={() => {}} selectionActive />
    </Frame>
  ),
}

export const VideoWithDuration: Story = {
  name: 'Video poster with duration badge',
  render: () => (
    <Frame aspectRatio="16 / 9" width={360}>
      <MediaCard item={sampleVideo} onItemClick={() => {}} />
    </Frame>
  ),
}

export const Square: Story = {
  name: 'Square (1:1) — grid mode aspect',
  render: () => (
    <Frame aspectRatio="1 / 1">
      <MediaCard item={sampleImage} onItemClick={() => {}} />
    </Frame>
  ),
}
