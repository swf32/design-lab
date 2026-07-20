import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { FavouriteToggle } from '../FavouriteToggle/FavouriteToggle'
import { MediaCardActions } from '../MediaCardActions/MediaCardActions'
import { MediaGrid, type MediaGridItem } from './MediaGrid'
import { useMediaGridSelection } from './useMediaGridSelection'

// ============================================================================
//  Mock data — variable aspect ratios mimic Magnific's mixed library
// ============================================================================
//
// Defined ABOVE `meta` so `meta.args` can call `makeItems()` at module-eval
// time without hitting the SAMPLE_IMAGES temporal-dead-zone.

const SAMPLE_IMAGES: { w: number; h: number }[] = [
  { w: 1024, h: 1024 }, // square
  { w: 1024, h: 1024 },
  { w: 1024, h: 1024 },
  { w: 720, h: 1280 }, // 9:16 vertical
  { w: 720, h: 1280 },
  { w: 720, h: 1280 },
  { w: 1280, h: 720 }, // 16:9 horizontal
  { w: 1024, h: 1024 },
  { w: 768, h: 1024 }, // 3:4
  { w: 720, h: 1280 },
  { w: 1024, h: 1024 },
  { w: 1024, h: 1024 },
  { w: 1280, h: 720 },
  { w: 720, h: 1280 },
  { w: 1024, h: 1024 },
  { w: 720, h: 1280 },
]

// Picsum gives stable seeded thumbnails — good enough for visual review.
// `count` keeps each preview small enough to read at a glance.
function makeItems(count = SAMPLE_IMAGES.length): MediaGridItem[] {
  return SAMPLE_IMAGES.slice(0, count).map((dims, idx) => ({
    id: `item-${idx}`,
    src: `https://picsum.photos/seed/klyp-grid-${idx}/${dims.w}/${dims.h}`,
    width: dims.w,
    height: dims.h,
    alt: `Asset ${idx + 1}`,
    kind: idx % 4 === 0 && idx > 0 ? 'video' : 'image',
    durationLabel: idx % 4 === 0 && idx > 0 ? `0:${String(15 + idx).padStart(2, '0')}` : undefined,
  }))
}

// Frame — gives the preview a DEFINITE width so the absolute-positioned masonry
// can measure and pack (a `width:100%` on the grid alone collapses to 0 inside
// the centered StoryCard stage). `width:'100%'` fills the stage and never
// overflows; `box-sizing:border-box` keeps the padding inside that width. Pass a
// fixed `width` only to demonstrate a narrow container.
function Frame({
  width = '100%',
  children,
}: {
  width?: number | string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        width,
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: 16,
        background: 'var(--color-bg-root)',
        borderRadius: 12,
      }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Brand / Molecules / MediaGrid',
  component: MediaGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // MediaGrid masonry items are position:absolute, so the grid has ZERO
    // intrinsic width — the catalog Playground mounts the bare component and
    // does not apply story decorators, so it needs an explicit-width wrapper or
    // it renders blank. See ComponentPlayground `parameters.playground`.
    playground: { wrapperStyle: { width: '100%' } },
  },
  args: {
    items: makeItems(6),
    viewMode: 'masonry',
    minItemWidth: 280,
    gap: 8,
    // Catalog previews don't scroll like /library — render every tile so the
    // preview is never a blank windowed box.
    windowed: false,
  },
  argTypes: {
    // ≤3 options → inline-radio per the catalog control convention.
    viewMode: { control: 'inline-radio', options: ['masonry', 'grid'] },
    minItemWidth: { control: 'range', min: 160, max: 360, step: 20 },
    gap: { control: 'range', min: 0, max: 24, step: 2 },
    windowed: { control: 'boolean' },
    className: { control: false },
  },
} satisfies Meta<typeof MediaGrid>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================================
//  Stories — every preview fits the frame width (no horizontal scroll). The
//  masonry re-packs to whatever width the <Frame> gives it; column count is
//  driven by minItemWidth, demonstrated by the Narrow / Dense stories.
// ============================================================================

export const Default: Story = {
  render: () => (
    <Frame>
      <MediaGrid
        items={makeItems(9)}
        windowed={false}
        onItemClick={(id) => console.log('click', id)}
      />
    </Frame>
  ),
}

export const GridMode: Story = {
  name: 'View mode — grid (forced 1:1, CSS Grid)',
  render: () => (
    <Frame>
      <MediaGrid
        items={makeItems(9)}
        viewMode="grid"
        windowed={false}
        onItemClick={(id) => console.log('click', id)}
      />
    </Frame>
  ),
}

export const Selection: Story = {
  name: 'Selection — checkboxes + selected ring (cmd / shift)',
  render: () => {
    const items = useMemo(() => makeItems(9), [])
    const selection = useMediaGridSelection({ orderedIds: items.map((i) => i.id) })
    return (
      <Frame>
        <MediaGrid
          items={items}
          windowed={false}
          selectionMode
          selectedIds={selection.selectedIds}
          onSelectionClick={(c) =>
            selection.handleItemClick(c.id, { meta: c.meta, shift: c.shift })
          }
        />
      </Frame>
    )
  },
}

export const NarrowContainer: Story = {
  name: 'Adaptive — narrow container (1 col)',
  render: () => (
    <Frame width={320}>
      <MediaGrid items={makeItems(6)} windowed={false} />
    </Frame>
  ),
}

export const DenseItems: Story = {
  name: 'Dense — smaller items (minItemWidth 180)',
  render: () => (
    <Frame>
      <MediaGrid items={makeItems(12)} minItemWidth={180} windowed={false} />
    </Frame>
  ),
}

export const Empty: Story = {
  name: 'Empty — no items (caller owns the empty-state UI)',
  render: () => (
    <Frame>
      <MediaGrid items={[]} windowed={false} />
    </Frame>
  ),
}

// MediaGrid is the *single* component that owns asset-card rendering on
// /library — the per-card markup lives inside (memo'd `MediaCard`) for
// virtualization and selection coupling. This story isolates one card so
// the catalog has a "this is the asset card" visual anchor.
export const SingleCard: Story = {
  name: 'Single card — isolated asset tile with overlay',
  render: () => {
    const [fav, setFav] = useState(false)
    const item: MediaGridItem = {
      id: 'item-solo',
      src: 'https://picsum.photos/seed/klyp-card-solo/768/1024',
      width: 768,
      height: 1024,
      alt: 'Hero shot 04',
      kind: 'image',
    }
    return (
      <Frame width={260}>
        <MediaGrid
          items={[item]}
          windowed={false}
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
