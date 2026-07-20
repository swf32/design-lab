import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { FavouriteToggle } from './FavouriteToggle'

const meta = {
  title: 'Brand / Atoms / FavouriteToggle',
  component: FavouriteToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FavouriteToggle>

export default meta
type Story = StoryObj<typeof meta>

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 16,
        padding: 24,
        borderRadius: 12,
        background: 'var(--color-bg-root)',
      }}
    >
      {children}
    </div>
  )
}

export const Default: Story = {
  name: 'Default (off)',
  render: () => {
    const [fav, setFav] = useState(false)
    return (
      <Stage>
        <FavouriteToggle isFavourite={fav} onToggle={setFav} />
      </Stage>
    )
  },
}

export const Active: Story = {
  name: 'Active (favourited)',
  render: () => {
    const [fav, setFav] = useState(true)
    return (
      <Stage>
        <FavouriteToggle isFavourite={fav} onToggle={setFav} />
      </Stage>
    )
  },
}

export const States: Story = {
  name: 'States — off + active side-by-side',
  render: () => (
    <Stage>
      <FavouriteToggle isFavourite={false} onToggle={() => {}} />
      <FavouriteToggle isFavourite={true} onToggle={() => {}} />
    </Stage>
  ),
}

export const OnCoverImage: Story = {
  name: 'On cover image (real usage)',
  render: () => {
    const [fav, setFav] = useState(false)
    return (
      <div
        style={{
          position: 'relative',
          width: 240,
          height: 320,
          borderRadius: 12,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #5b3b1f 0%, #d6a14a 45%, #f5e6b8 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'inline-flex',
            gap: 6,
          }}
        >
          <FavouriteToggle isFavourite={fav} onToggle={setFav} />
        </div>
      </div>
    )
  },
}

export const CustomAriaLabel: Story = {
  name: 'Custom aria-label',
  render: () => {
    const [fav, setFav] = useState(false)
    return (
      <Stage>
        <FavouriteToggle
          isFavourite={fav}
          onToggle={setFav}
          label={fav ? 'Unpin from board' : 'Pin to board'}
        />
      </Stage>
    )
  },
}
