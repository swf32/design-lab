import { Button } from '@klyp/ui'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { AssetCard, type AssetCardKind } from './AssetCard'

const SAMPLE_COVER =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=800&fit=crop'

const meta = {
  title: 'Brand / Molecules / AssetCard',
  component: AssetCard,
  tags: ['autodocs'],
  argTypes: {
    kind: {
      control: 'select',
      options: ['series', 'episode', 'scene', 'character', 'location', 'outfit', 'vibe'],
    },
    style: { control: 'select', options: ['bleed', 'classic'] },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Image-bleed entity card with container-query inner sizing. Forced 3:4 aspect, fluid width.',
      },
    },
  },
} satisfies Meta<typeof AssetCard>

export default meta
type Story = StoryObj<typeof meta>

// ───────────────────────────────────────────────────────────────────────────
// Default
// ───────────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    kind: 'character',
    title: 'Carpathian Ranger',
    description: 'Widowed ranger of the high passes. Carries her late husband’s carving knife.',
    coverUrl: SAMPLE_COVER,
    onClick: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}

// ───────────────────────────────────────────────────────────────────────────
// All types — type-pill colour reference
// ───────────────────────────────────────────────────────────────────────────

const ALL_KINDS: AssetCardKind[] = [
  'series',
  'episode',
  'scene',
  'character',
  'location',
  'outfit',
  'vibe',
]

export const AllKinds: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        width: 'min(1200px, 100%)',
      }}
    >
      {ALL_KINDS.map((kind) => (
        <AssetCard
          key={kind}
          kind={kind}
          title={`${kind.charAt(0).toUpperCase()}${kind.slice(1)} title`}
          description="Lorem ipsum dolor sit amet consectetur adipiscing elit."
          coverUrl={SAMPLE_COVER}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
}

// ───────────────────────────────────────────────────────────────────────────
// Adaptive — three container widths show CQ scaling
// ───────────────────────────────────────────────────────────────────────────

export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {[180, 280, 480].map((w) => (
        <div key={w} style={{ width: w }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-fg-muted)',
              marginBottom: 8,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {w}px
          </div>
          <AssetCard
            kind="character"
            title="Carpathian Ranger"
            description="Widowed ranger of the high passes."
            coverUrl={SAMPLE_COVER}
            onClick={() => {}}
          />
        </div>
      ))}
    </div>
  ),
}

// ───────────────────────────────────────────────────────────────────────────
// With slots — studio context (drag handle + actions slot)
// ───────────────────────────────────────────────────────────────────────────

export const WithSlots: Story = {
  args: {
    kind: 'scene',
    title: 'INT. CABIN. NIGHT',
    description: 'Ranger reads husband’s last journal page.',
    coverUrl: SAMPLE_COVER,
    dragHandle: (
      <div
        style={{
          width: 28,
          height: 28,
          background: 'var(--color-bg-glass)',
          borderRadius: 'var(--radius-sm)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-fg-muted)',
          fontSize: 14,
          backdropFilter: 'blur(6px)',
        }}
      >
        ⠿
      </div>
    ),
    actionsSlot: <Button aria-label="Add">+</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}

// ───────────────────────────────────────────────────────────────────────────
// States — default / loading / no cover
// ───────────────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 240px)',
        gap: 16,
      }}
    >
      <AssetCard
        kind="character"
        title="Default"
        description="Standard card."
        coverUrl={SAMPLE_COVER}
        onClick={() => {}}
      />
      <AssetCard kind="character" title="Loading" loading />
      <AssetCard
        kind="character"
        title="No cover fallback"
        description="Brand gradient placeholder."
        onClick={() => {}}
      />
    </div>
  ),
}
