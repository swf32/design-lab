import type { Meta, StoryObj } from '../__shared/stories-types'

import { CdnImage } from './CdnImage'

// A real R2 URL pattern (legacy dev domain). When VITE_R2_CDN_BASE is set
// to https://cdn.klyp.app in production, replace this with the matching
// host so transforms actually kick in.
const SAMPLE_LEGACY =
  'https://pub-a23eed752bab4d59833b249e84efe648.r2.dev/gen/sample/character/x/sample.png'

const meta = {
  component: CdnImage,
  title: 'Brand / CdnImage',
  tags: ['autodocs'],
  args: {
    src: SAMPLE_LEGACY,
    alt: 'Sample preview',
    size: 'card',
  },
} satisfies Meta<typeof CdnImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320, height: 320 }}>
      <CdnImage {...args} />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
      <div style={{ width: 80, height: 80 }}>
        <CdnImage {...args} size="chip" />
      </div>
      <div style={{ width: 160, height: 160 }}>
        <CdnImage {...args} size="card" />
      </div>
      <div style={{ width: 320, height: 320 }}>
        <CdnImage {...args} size="grid" />
      </div>
      <div style={{ width: 480, height: 270 }}>
        <CdnImage {...args} size="modal" />
      </div>
    </div>
  ),
}

export const Priority: Story = {
  args: { priority: true },
  render: (args) => (
    <div style={{ width: 480, height: 270 }}>
      <CdnImage {...args} size="modal" />
    </div>
  ),
}

export const LegacyUrlFallback: Story = {
  // URL doesn't match VITE_R2_CDN_BASE → component renders raw <img>
  // without transforms. Verifies dual-support path for un-migrated assets.
  args: { src: 'https://example.invalid/legacy/path.png' },
  render: (args) => (
    <div style={{ width: 320, height: 320 }}>
      <CdnImage {...args} />
    </div>
  ),
}
