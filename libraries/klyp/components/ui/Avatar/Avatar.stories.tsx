import type { Meta, StoryObj } from '../__shared/stories-types'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './Avatar'

const meta = {
  title: 'UI / Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  // Storybook controls contract (FE-team convention): the catalog
  // ComponentPlayground — like Storybook's native Controls — drives the
  // bare component from `args`/`argTypes` over REAL props only. `size`/`shape`
  // → select (>3 options), `loading` → boolean. `children` is supplied as a
  // default ReactNode arg (the fallback initials need <AvatarFallback> styling,
  // so a raw text control would render unstyled) and is intentionally NOT a
  // control. Compound composition (image / badge / group) lives in the showcase
  // stories below, not as playground controls.
  args: {
    size: 'lg',
    shape: 'circle',
    loading: false,
    children: <AvatarFallback>KV</AvatarFallback>,
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'rounded', 'card', 'sharp'] },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

// ─── 1. Default ───────────────────────────────────────────────────────────────
/** Canonical usage: loaded photo with an initials fallback underneath. */
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="User" />
      <AvatarFallback>VL</AvatarFallback>
    </Avatar>
  ),
}

// ─── 2. Sizes ─────────────────────────────────────────────────────────────────
/** Full size ramp xs → xl. Initials scale with container via per-size font tokens. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Avatar key={s} size={s}>
          <AvatarFallback>VL</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}

// ─── 3. FallbackStates ────────────────────────────────────────────────────────
/**
 * Two fallback triggers side by side:
 * – No image (only AvatarFallback provided)
 * – Broken URL (image errors out → fallback takes over)
 * Both correctly show initials — "ER" / "NF" are never the real content.
 */
export const FallbackStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Avatar size="lg">
          <AvatarFallback>VL</AvatarFallback>
        </Avatar>
        <span style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>no image</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Avatar size="lg">
          <AvatarImage src="https://invalid.example.com/nope.jpg" alt="Broken" />
          <AvatarFallback>VL</AvatarFallback>
        </Avatar>
        <span style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>broken url</span>
      </div>
    </div>
  ),
}

// ─── 4. WithBadge ─────────────────────────────────────────────────────────────
/** Accent badge (decorative) over a portrait. */
export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="User" />
      <AvatarFallback>VL</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  ),
}

// ─── 5. StatusBadgeTones ──────────────────────────────────────────────────────
/** All five badge tones: accent / online / busy / away / offline. */
export const StatusBadgeTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {([undefined, 'online', 'busy', 'away', 'offline'] as const).map((tone, i) => (
        <div
          key={i}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <Avatar size="lg">
            <AvatarFallback>VL</AvatarFallback>
            <AvatarBadge {...(tone ? { tone } : {})} />
          </Avatar>
          <span style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>{tone ?? 'accent'}</span>
        </div>
      ))}
    </div>
  ),
}

// ─── 6. BadgeSizes ────────────────────────────────────────────────────────────
/**
 * Status badge at every size tier.
 * xs → 6px pip (no SVG); sm → 8px; md → 10px; lg → 12px; xl → 14px.
 */
export const BadgeSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div
          key={s}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <Avatar size={s}>
            <AvatarFallback>VL</AvatarFallback>
            <AvatarBadge tone="online" />
          </Avatar>
          <span style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>{s}</span>
        </div>
      ))}
    </div>
  ),
}

// ─── 7. Shapes ────────────────────────────────────────────────────────────────
/**
 * Four-step radius ramp — all at size="xl" with a portrait so the corner shape reads clearly.
 * sharp 4px · rounded 8px · card 12px · circle full.
 */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      {(
        [
          { shape: 'sharp', label: 'sharp\n4px', img: 'https://i.pravatar.cc/120?img=11' },
          { shape: 'rounded', label: 'rounded\n8px', img: 'https://i.pravatar.cc/120?img=22' },
          { shape: 'card', label: 'card\n12px', img: 'https://i.pravatar.cc/120?img=33' },
          { shape: 'circle', label: 'circle\nfull', img: 'https://i.pravatar.cc/120?img=44' },
        ] as const
      ).map(({ shape, label, img }) => (
        <div
          key={shape}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <Avatar size="xl" shape={shape}>
            <AvatarImage src={img} alt="User" />
            <AvatarFallback>VL</AvatarFallback>
          </Avatar>
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-fg-muted)',
              textAlign: 'center',
              whiteSpace: 'pre',
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  ),
}

// ─── 8. Group ─────────────────────────────────────────────────────────────────
/** Basic overlap group — initials only. */
export const Group: Story = {
  render: () => (
    <AvatarGroup>
      {['A', 'B', 'C', 'D'].map((l) => (
        <Avatar key={l}>
          <AvatarFallback>{l}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  ),
}

// ─── 9. GroupSizes ────────────────────────────────────────────────────────────
/**
 * Three group rows sm / md / lg with portraits — GroupCount matches Avatar size.
 * Proves the size alignment fix: "+2" chip is flush with siblings.
 */
const GROUP_IMGS = [
  'https://i.pravatar.cc/80?img=5',
  'https://i.pravatar.cc/80?img=15',
  'https://i.pravatar.cc/80?img=25',
]

export const GroupSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--color-fg-muted)', width: 20 }}>{s}</span>
          <AvatarGroup>
            {GROUP_IMGS.map((src, i) => (
              <Avatar key={i} size={s}>
                <AvatarImage src={src} alt="" />
                <AvatarFallback>{String.fromCharCode(65 + i)}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount size={s}>+2</AvatarGroupCount>
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
}

// ─── 10. GroupWithImages ──────────────────────────────────────────────────────
/** Five-member group with real portraits + overflow count — ring separation and overlap depth. */
export const GroupWithImages: Story = {
  render: () => (
    <AvatarGroup>
      {[1, 9, 17, 25].map((img) => (
        <Avatar key={img} size="md">
          <AvatarImage src={`https://i.pravatar.cc/80?img=${img}`} alt="" />
          <AvatarFallback>{String.fromCharCode(64 + img / 8 + 1)}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount size="md">+8</AvatarGroupCount>
    </AvatarGroup>
  ),
}

// ─── 11. GroupWithShapes ──────────────────────────────────────────────────────
/**
 * Groups across all four shape variants with real portraits.
 * circle = people; card/rounded/sharp = entities (projects, assets, workspaces).
 */
export const GroupWithShapes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {(
        [
          { shape: 'circle', label: 'circle', imgs: [3, 13, 23] },
          { shape: 'rounded', label: 'rounded', imgs: [4, 14, 24] },
          { shape: 'card', label: 'card', imgs: [5, 15, 35] },
          { shape: 'sharp', label: 'sharp', imgs: [6, 16, 36] },
        ] as const
      ).map(({ shape, label, imgs }) => (
        <div key={shape} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--color-fg-muted)', width: 48 }}>{label}</span>
          <AvatarGroup>
            {imgs.map((img) => (
              <Avatar key={img} size="md" shape={shape}>
                <AvatarImage src={`https://i.pravatar.cc/80?img=${img}`} alt="" />
                <AvatarFallback>{img}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount size="md">+4</AvatarGroupCount>
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
}

// ─── 12. Loading ──────────────────────────────────────────────────────────────
/** Skeleton pulse at sm / md / lg / xl while portrait is being fetched. */
export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Avatar key={s} size={s} loading />
      ))}
    </div>
  ),
}
