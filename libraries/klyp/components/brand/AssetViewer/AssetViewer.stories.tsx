import { Button } from '@klyp/ui/Button'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { AssetViewer, type AssetViewerItem } from './AssetViewer'

// Sample gallery — a mix of image + video items with references, mirroring
// the prototype DATA set (seeded picsum thumbs).
const img = (seed: string, w = 900, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`

const ITEMS: AssetViewerItem[] = [
  {
    id: 'a',
    src: img('klyp-a'),
    name: 'Neon alley, rain',
    mediaKind: 'image',
    prompt:
      'A cinematic neon-lit alley after rain, reflections on wet asphalt, volumetric fog, shallow depth of field, 35mm, moody teal and magenta grade, ultra-detailed.',
    model: 'Seedream 4',
    quality: 'High',
    aspectRatio: '3:4',
    refs: [
      { src: img('ref-1', 200, 200), badge: 'Ref 1' },
      { src: img('ref-2', 200, 200), badge: 'Ref 2' },
      { src: img('ref-3', 200, 200), badge: 'Ref 3' },
    ],
  },
  {
    id: 'b',
    src: img('klyp-b'),
    name: 'Portrait study',
    mediaKind: 'image',
    prompt: 'Studio portrait, soft key light, 85mm, neutral background.',
    model: 'Gemini 3 Pro Image',
    quality: 'Medium',
    aspectRatio: '1:1',
  },
  {
    id: 'c',
    src: img('klyp-c', 1280, 720),
    thumbSrc: img('klyp-c', 200, 200),
    name: 'Drone flythrough',
    mediaKind: 'video',
    prompt: 'Aerial drone flythrough over a misty pine forest at dawn.',
    model: 'Kling 2.5',
    duration: '5s',
    aspectRatio: '16:9',
    resolution: '1080p',
    audio: 'On',
    refs: [
      { src: img('frame-start', 200, 200), badge: 'Start' },
      { src: img('frame-end', 200, 200), badge: 'End' },
    ],
  },
  {
    id: 'd',
    src: img('klyp-d'),
    name: 'Abstract gradient',
    mediaKind: 'image',
    model: 'Seedream 4',
    quality: 'High',
    aspectRatio: '3:4',
  },
  {
    id: 'e',
    src: img('klyp-e'),
    name: 'City at dusk',
    mediaKind: 'image',
    model: 'Seedream 4',
    quality: 'High',
    aspectRatio: '3:4',
  },
]

const meta = {
  component: AssetViewer,
  title: 'Brand / AssetViewer',
  tags: ['autodocs'],
  args: { context: 'library' },
  argTypes: {
    context: { control: 'inline-radio', options: ['library', 'asset'] },
    items: { control: false },
    activeId: { control: false },
    onActiveChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof AssetViewer>

export default meta
type Story = StoryObj<typeof meta>

// The overlay is `position: fixed`; the `transform` on the wrapper scopes that
// fixed box to this preview frame so it doesn't hijack the whole catalog page.
function Demo({ context }: { context: 'library' | 'asset' }) {
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  const [open, setOpen] = useState(true)
  return (
    <div
      style={{
        position: 'relative',
        height: 680,
        borderRadius: 'var(--r-section)',
        overflow: 'hidden',
        background: 'var(--color-bg-root)',
        transform: 'translateZ(0)',
      }}
    >
      {open ? (
        <AssetViewer
          items={ITEMS}
          activeId={activeId}
          onActiveChange={setActiveId}
          context={context}
          onClose={() => setOpen(false)}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Button variant="primary" size="md" onPress={() => setOpen(true)}>
            Reopen viewer
          </Button>
        </div>
      )}
    </div>
  )
}

export const Library: Story = {
  args: { context: 'library' },
  render: (a) => <Demo context={a.context ?? 'library'} />,
}

export const Asset: Story = {
  args: { context: 'asset' },
  render: (a) => <Demo context={a.context ?? 'asset'} />,
}

export const Default: Story = {
  render: () => <Demo context="library" />,
}
