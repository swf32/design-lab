import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { MediaCardActions } from './MediaCardActions'

const meta = {
  title: 'Brand / Molecules / MediaCardActions',
  component: MediaCardActions,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MediaCardActions>

export default meta
type Story = StoryObj<typeof meta>

function Stage({ children, height = 200 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 260,
        minHeight: height,
        padding: 12,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #1a1410 0%, #4a3a26 45%, #b58a3a 100%)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
      }}
    >
      {children}
    </div>
  )
}

export const Default: Story = {
  name: 'Default — non-trash row',
  render: () => (
    <Stage>
      <MediaCardActions
        entityName="Hero shot 04"
        onSaveToDevice={() => alert('save')}
        onDelete={() => alert('delete')}
      />
    </Stage>
  ),
}

export const WithFavouriteToggle: Story = {
  name: 'With favourite toggle item',
  render: () => {
    const [fav, setFav] = useState(false)
    return (
      <Stage>
        <MediaCardActions
          entityName="Hero shot 04"
          isFavourite={fav}
          onToggleFavourite={setFav}
          onSaveToDevice={() => {}}
          onDelete={() => {}}
        />
      </Stage>
    )
  },
}

export const FavouritedRow: Story = {
  name: 'Already favourited',
  render: () => {
    const [fav, setFav] = useState(true)
    return (
      <Stage>
        <MediaCardActions
          entityName="Hero shot 04"
          isFavourite={fav}
          onToggleFavourite={setFav}
          onSaveToDevice={() => {}}
          onDelete={() => {}}
        />
      </Stage>
    )
  },
}

export const InTrashRow: Story = {
  name: 'Trash row — Restore + Delete forever',
  render: () => (
    <Stage>
      <MediaCardActions
        entityName="Old draft 02"
        inTrash
        onSaveToDevice={() => {}}
        onRestore={() => alert('restore')}
        onPermanentDelete={() => alert('delete forever')}
      />
    </Stage>
  ),
}

export const MinimalSurface: Story = {
  name: 'Minimal — save only',
  render: () => (
    <Stage>
      <MediaCardActions entityName="Read-only asset" onSaveToDevice={() => {}} />
    </Stage>
  ),
}
