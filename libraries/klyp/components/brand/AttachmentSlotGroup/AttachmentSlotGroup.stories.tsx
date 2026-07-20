import type { Meta, StoryObj } from '../__shared/stories-types'
import { type AttachmentItem, AttachmentSlotGroup } from './AttachmentSlotGroup'

const noop = () => undefined
const noopId = (_id: string) => undefined
const noopMode = (_id: string) => undefined

/** Local catalog thumbnails — model-sample AVIFs already shipped in
 *  apps/web/public (same set Composer / AttachmentSlot stories use) —
 *  no picsum / external network dependency. */
const THUMBS = [
  '/model-samples/openai.avif',
  '/model-samples/google.avif',
  '/model-samples/luma.avif',
  '/model-samples/runway.avif',
] as const

const img = (id: string, i: number, over?: Partial<AttachmentItem>): AttachmentItem => ({
  id,
  thumbnailUrl: THUMBS[i % THUMBS.length],
  media: 'image',
  ...over,
})

const meta = {
  component: AttachmentSlotGroup,
  title: 'Brand / Molecules / AttachmentSlotGroup',
  tags: ['autodocs'],
  args: {
    mode: 'frames',
    items: [],
    max: 2,
    frameSlots: 2,
    disabled: false,
    onAdd: noop,
    onRemove: noopId,
    onReplace: noopId,
  },
  argTypes: {
    mode: { control: 'select', options: ['frames', 'reference', 'list'] },
    max: { control: 'number' },
    frameSlots: { control: 'inline-radio', options: [1, 2] },
    disabled: { control: 'boolean' },
    // Collection / callback / copy props — no sensible playground control.
    requiredCaption: { control: 'text' },
    items: { control: false },
    videoClips: { control: false },
    otherFiles: { control: false },
    labels: { control: false },
    onAdd: { control: false },
    onRemove: { control: false },
    onReplace: { control: false },
    onSwap: { control: false },
    onDropToSlot: { control: false },
    onRemoveClip: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof AttachmentSlotGroup>

export default meta
type Story = StoryObj<typeof meta>

/** FramesEmpty — frames mode, both keyframe slots empty: two 80px SQUARE slots
 *  (image glyph + Start / End badge). Clicking one calls `onAdd` (the app routes
 *  it to the library picker). */
export const FramesEmpty: Story = {
  args: { mode: 'frames', items: [], max: 2, frameSlots: 2 },
}

/** FramesRequired — a single-mode model that REQUIRES an input (e.g. Grok
 *  Imagine Video 1.5, image-to-video): the empty square shows the "(required)"
 *  caption directly, no chooser. */
export const FramesRequired: Story = {
  args: {
    mode: 'frames',
    items: [],
    max: 1,
    frameSlots: 1,
    requiredCaption: '(required)',
  },
}

/** FramesFilled — both keyframe slots filled: image tiles with Start / End
 *  badges plus the start↔end SWAP button injected between the cells
 *  (rendered whenever `onSwap` is provided and ≥1 slot is filled). */
export const FramesFilled: Story = {
  args: {
    mode: 'frames',
    items: [img('start', 0, { slot: 0 }), img('end', 1, { slot: 1 })],
    max: 2,
    frameSlots: 2,
    onSwap: noop,
  },
}

/** Reference — reference mode below the cap: filled ref tiles (auto "Ref N"
 *  badges) followed by the square ADD tile; the Add tile disappears once
 *  `items.length` reaches `max`. */
export const Reference: Story = {
  args: {
    mode: 'reference',
    items: [img('ref-1', 0), img('ref-2', 1)],
    max: 4,
  },
}

/** ReferenceAddCell — the "Add" cell states its accepted formats (real glyphs,
 *  image + video) + a DYNAMIC single-line "Add up to N images or M videos"
 *  caption (recomputed from the remaining capacity across both lanes). */
export const ReferenceAddCell: Story = {
  args: {
    mode: 'reference',
    items: [img('ref-1', 0)],
    max: 9,
    addFormats: ['image', 'video'],
    addCaption: (imgFilled, vidFilled) =>
      `Add up to ${9 - imgFilled} images or ${3 - vidFilled} videos`,
    videoClips: [{ id: 'clip-1', name: 'b-roll.mp4' }],
    onRemoveClip: noopId,
  },
}

/** Chooser (collapsed) — a multi-mode model's EMPTY state shows the media-aware
 *  pill instead of bare slot pills; clicking it expands the split-panel picker
 *  (a composer-level overlay — see the AttachModePicker stories). */
export const Chooser: Story = {
  args: {
    mode: 'reference',
    items: [],
    max: 9,
    chooser: {
      mediaTypes: ['image', 'video'],
      label: 'Add Start & End frames or References',
      panels: [
        {
          id: 'frames',
          label: 'Start & End frames',
          caption: 'First + last keyframe',
          mediaTypes: ['image'],
        },
        {
          id: 'reference',
          label: 'References',
          caption: 'Up to 9 images or 3 videos',
          mediaTypes: ['image', 'video'],
        },
      ],
      expanded: false,
      onExpandedChange: noop,
      onPick: noopMode,
    },
  },
}

/** BothModes — GROUNDWORK PREVIEW (#3): a model that accepts Start/End frames
 *  AND references at the same time (e.g. Kling O1) renders BOTH lanes. Composed
 *  here from two groups until the backend capability lands
 *  (`getVideoImageCapability` is generated — see the chat CHANGELOG). */
export const BothModes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <AttachmentSlotGroup
        mode="frames"
        items={[img('start', 0, { slot: 0 })]}
        max={2}
        frameSlots={2}
        onAdd={noop}
        onRemove={noopId}
        onReplace={noopId}
        onSwap={noop}
      />
      <AttachmentSlotGroup
        mode="reference"
        items={[img('ref-1', 1)]}
        max={7}
        addFormats={['image']}
        addCaption={(imgFilled) => `Add up to ${7 - imgFilled} images`}
        onAdd={noop}
        onRemove={noopId}
        onReplace={noopId}
      />
    </div>
  ),
}

/** List — the file-attachment lane (each item self-resolves to a file card
 *  via `fileKind`) plus BOTH auxiliary lanes: `videoClips` (video tiles,
 *  removed via `onRemoveClip`) and `otherFiles` (non-media cards — here one
 *  carries a per-file `warning` status from the caller's model checks). */
export const List: Story = {
  args: {
    mode: 'list',
    items: [
      { id: 'l-pdf', name: 'pitch-deck.pdf', fileKind: 'pdf' },
      { id: 'l-doc', name: 'screenplay.docx', fileKind: 'doc' },
      img('l-img', 2, { name: 'hero.png' }),
    ],
    max: 8,
    videoClips: [
      { id: 'clip-1', name: 'b-roll.mp4' },
      { id: 'clip-2', name: 'take-2.mp4', status: 'uploading' },
    ],
    otherFiles: [
      { id: 'f-xls', name: 'budget-q3.xlsx', fileKind: 'xls' },
      {
        id: 'f-wav',
        name: 'voiceover.wav',
        fileKind: 'audio',
        status: 'warning',
        message: 'Audio input is not supported by this model',
      },
    ],
    onRemoveClip: noopId,
  },
}
