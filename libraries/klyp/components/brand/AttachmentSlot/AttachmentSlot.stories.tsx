import type { Meta, StoryObj } from '../__shared/stories-types'
import type { AttachmentItem } from '../AttachmentSlotGroup'
import { AttachmentSlotGroup } from '../AttachmentSlotGroup'
import { AttachmentSlot, type AttachmentSlotKind } from './AttachmentSlot'

const noop = () => undefined
const noopId = (_id: string) => undefined

const meta = {
  component: AttachmentSlot,
  title: 'Brand / AttachmentSlot',
  tags: ['autodocs'],
  // NOTE: `media` is intentionally NOT a default arg — with resolveState an
  // explicit `media` (no name/thumb) promotes the cell to a fallback tile,
  // which would hide the empty-pill `label`. The control still exposes it.
  args: {
    shape: 'pill',
    fileKind: 'file',
    status: 'idle',
    label: 'Reference',
    disabled: false,
    onClick: noop,
    onRemove: noop,
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['pill', 'square'] },
    media: { control: 'inline-radio', options: ['image', 'video'] },
    status: { control: 'select', options: ['idle', 'uploading', 'error', 'warning'] },
    fileKind: {
      control: 'select',
      options: ['image', 'video', 'audio', 'pdf', 'doc', 'xls', 'txt', 'document', 'file'],
    },
    label: { control: 'text' },
    badge: { control: 'text' },
    name: { control: 'text' },
    message: { control: 'text' },
    thumbnailUrl: { control: 'text' },
    disabled: { control: 'boolean' },
    icon: { control: false },
    onClick: { control: false },
    onRemove: { control: false },
    onReplace: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof AttachmentSlot>

export default meta
type Story = StoryObj<typeof meta>

const THUMB = '/model-samples/openai.avif'
// `#t=0.5` seeks to 0.5s so the browser paints a real first frame as the
// poster (a bare <video preload="metadata"> renders black until played).
const VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.5'

// ────────────────────────────────────────────────────────────────────
// CELL (atom) stories — single-cell states.
// ────────────────────────────────────────────────────────────────────

export const EmptyPill: Story = {
  args: { shape: 'pill', label: 'Reference', onRemove: undefined },
}

export const EmptySquare: Story = {
  args: { shape: 'square', label: 'Start', onRemove: undefined },
}

export const ImageTile: Story = {
  args: { thumbnailUrl: THUMB, badge: 'Ref 1', name: 'hero.png', onReplace: noop },
}

export const ImageFallback: Story = {
  args: { media: 'image', onRemove: undefined },
}

export const VideoTile: Story = {
  args: { thumbnailUrl: VIDEO, media: 'video', name: 'clip.mp4' },
}

const FILE_KINDS: AttachmentSlotKind[] = [
  'pdf',
  'doc',
  'xls',
  'txt',
  'audio',
  'image',
  'video',
  'document',
  'file',
]
const FILE_NAME: Record<AttachmentSlotKind, string> = {
  pdf: 'pitch-deck.pdf',
  doc: 'screenplay-final.docx',
  xls: 'budget-q3.xlsx',
  txt: 'notes-readme.txt',
  audio: 'voiceover-take-3.wav',
  image: 'reference-board.png',
  video: 'b-roll-clip.mp4',
  document: 'treatment-v2.pages',
  file: 'archive-bundle.zip',
}

export const FileKinds: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      {FILE_KINDS.map((kind) => (
        <AttachmentSlot key={kind} name={FILE_NAME[kind]} fileKind={kind} onRemove={noop} />
      ))}
    </div>
  ),
}

export const Uploading: Story = {
  args: { thumbnailUrl: THUMB, status: 'uploading', name: 'up.png' },
}

export const ErrorState: Story = {
  args: { thumbnailUrl: THUMB, status: 'error', message: 'Upload failed', name: 'err.png' },
}

export const Warning: Story = {
  args: {
    thumbnailUrl: THUMB,
    status: 'warning',
    message: "Kling doesn't accept WebP",
    name: 'warn.webp',
  },
}

export const WithBadge: Story = {
  args: { thumbnailUrl: THUMB, badge: 'Start' },
}

export const WithReplace: Story = {
  args: { thumbnailUrl: THUMB, onReplace: noop },
}

export const Disabled: Story = {
  args: { thumbnailUrl: THUMB, disabled: true },
}

// ────────────────────────────────────────────────────────────────────
// COMPOSITION (Group) stories — one per VideoReference state.
// ────────────────────────────────────────────────────────────────────

const startItem: AttachmentItem = { id: 'start', thumbnailUrl: THUMB, media: 'image' }
const endItem: AttachmentItem = { id: 'end', thumbnailUrl: THUMB, media: 'image' }
const ref = (n: number, over?: Partial<AttachmentItem>): AttachmentItem => ({
  id: `ref-${n}`,
  thumbnailUrl: THUMB,
  media: 'image',
  ...over,
})

// F1 — frames, both slots empty.
export const FrameEmptyDual: Story = {
  render: () => (
    <AttachmentSlotGroup mode="frames" frameSlots={2} items={[]} max={2} onAdd={noop} />
  ),
}

// F2 — frames, single slot, empty.
export const FrameEmptySingle: Story = {
  render: () => (
    <AttachmentSlotGroup mode="frames" frameSlots={1} items={[]} max={1} onAdd={noop} />
  ),
}

// F3 — frames, Start filled, End empty.
export const FrameOneFilled: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="frames"
      frameSlots={2}
      items={[startItem]}
      max={2}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
      onSwap={noop}
    />
  ),
}

// F4 — frames, both filled, swap enabled.
export const FrameTwoFilled: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="frames"
      frameSlots={2}
      items={[startItem, endItem]}
      max={2}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
      onSwap={noop}
    />
  ),
}

// F4-noSwap — both filled, no swap handler → swap button omitted.
export const FrameTwoFilledNoSwap: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="frames"
      frameSlots={2}
      items={[startItem, endItem]}
      max={2}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
    />
  ),
}

// R1 — reference empty, multi cap → "Reference (up to 4)".
export const ReferenceEmptyMulti: Story = {
  render: () => <AttachmentSlotGroup mode="reference" items={[]} max={4} onAdd={noop} />,
}

// R1' — reference empty, single cap → "Reference".
export const ReferenceEmptySingle: Story = {
  render: () => <AttachmentSlotGroup mode="reference" items={[]} max={1} onAdd={noop} />,
}

// R2 — reference below cap → tiles + Add.
export const ReferenceBelowCap: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2), ref(3)]}
      max={4}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
    />
  ),
}

// R3 — reference at cap → no Add tile.
export const ReferenceAtCap: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2), ref(3), ref(4)]}
      max={4}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
    />
  ),
}

// T3 — uploading tile inside a group.
export const TileUploadingInGroup: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2, { status: 'uploading' })]}
      max={4}
      onAdd={noop}
      onRemove={noopId}
    />
  ),
}

// T4 — error tile inside a group.
export const TileErrorInGroup: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2, { status: 'error', message: 'Upload failed' })]}
      max={4}
      onAdd={noop}
      onRemove={noopId}
    />
  ),
}

// T5 — warning tile inside a group (neutral ring + title).
export const TileWarningInGroup: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2, { status: 'warning', message: "Kling doesn't accept WebP" })]}
      max={4}
      onAdd={noop}
      onRemove={noopId}
    />
  ),
}

// V1–V7 — video-clip lane (ready + uploading) under reference tiles.
export const VideoClipsLane: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2)]}
      max={4}
      videoClips={[
        { id: 'clip-1', thumbnailUrl: VIDEO },
        { id: 'clip-2', thumbnailUrl: VIDEO, status: 'uploading' },
      ]}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
      onRemoveClip={noopId}
    />
  ),
}

// List mode — mixed file lane with per-file-type glyphs.
export const ListMode: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="list"
      items={[
        { id: 'l-pdf', name: 'pitch-deck.pdf', fileKind: 'pdf' },
        { id: 'l-doc', name: 'screenplay.docx', fileKind: 'doc' },
        { id: 'l-xls', name: 'budget-q3.xlsx', fileKind: 'xls' },
        { id: 'l-img', name: 'hero.png', media: 'image', thumbnailUrl: THUMB },
        { id: 'l-vid', name: 'clip.mp4', media: 'video', thumbnailUrl: VIDEO },
      ]}
      max={8}
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
    />
  ),
}

// C1 — disabled group (root data-disabled + every child disabled).
export const GroupDisabled: Story = {
  render: () => (
    <AttachmentSlotGroup
      mode="reference"
      items={[ref(1), ref(2)]}
      max={4}
      disabled
      onAdd={noop}
      onRemove={noopId}
      onReplace={noopId}
    />
  ),
}

// Roll-up — the three modes side by side.
export const ModeMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
      <AttachmentSlotGroup
        mode="frames"
        frameSlots={2}
        items={[startItem]}
        max={2}
        onAdd={noop}
        onRemove={noopId}
        onReplace={noopId}
        onSwap={noop}
      />
      <AttachmentSlotGroup
        mode="reference"
        items={[ref(1), ref(2)]}
        max={4}
        onAdd={noop}
        onRemove={noopId}
        onReplace={noopId}
      />
      <AttachmentSlotGroup
        mode="list"
        items={[
          { id: 'm-pdf', name: 'brief.pdf', fileKind: 'pdf' },
          { id: 'm-xls', name: 'sheet.xlsx', fileKind: 'xls' },
        ]}
        max={8}
        onAdd={noop}
        onRemove={noopId}
      />
    </div>
  ),
}
