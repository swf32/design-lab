import { AudioOutline, ImageOutline, MagicStarOutline, VideoOutline } from '@klyp/icons'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { NodeFrame } from './NodeFrame'

const meta = {
  title: 'Brand / Canvas / NodeFrame',
  component: NodeFrame,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'image', 'video', 'audio', 'media', 'marker'],
    },
    state: {
      control: 'select',
      options: ['default', 'hovered', 'selected', 'generating', 'error', 'done'],
    },
    layout: {
      control: 'inline-radio',
      options: ['card-padded', 'image-fills'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NodeFrame>

export default meta
type Story = StoryObj<typeof meta>

const SamplePrompt = () => (
  <p
    style={{
      margin: 0,
      fontSize: 13,
      lineHeight: 1.4,
      color: 'var(--color-fg-muted)',
    }}
  >
    A young East Asian woman with dark wavy hair, standing on an urban sidewalk holding a bouquet of
    flowers.
  </p>
)

// Sample 4:3 image preview for image-fills layout demo — pinned reference URL.
const SampleImage = () => (
  <img
    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=240&fit=crop"
    alt="Generated"
    style={{ display: 'block', width: 280, height: 210, objectFit: 'cover' }}
  />
)

export const Default: Story = {
  args: {
    title: 'Text Prompt',
    iconSlot: <MagicStarOutline width={14} height={14} />,
    children: <SamplePrompt />,
  },
}

export const VariantCardPadded: Story = {
  args: {
    title: 'Text Prompt',
    layout: 'card-padded',
    variant: 'text',
    iconSlot: <MagicStarOutline width={14} height={14} />,
    children: <SamplePrompt />,
  },
}

export const VariantImageFills: Story = {
  args: {
    title: 'Image Generator',
    layout: 'image-fills',
    variant: 'image',
    state: 'hovered', // force chrome visible in storybook
    iconSlot: <ImageOutline width={14} height={14} />,
    children: <SampleImage />,
  },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 280px)', gap: 16 }}>
      <NodeFrame
        title="Text Prompt"
        variant="text"
        iconSlot={<MagicStarOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Image Generator"
        variant="image"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Video Generation"
        variant="video"
        iconSlot={<VideoOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Audio Reference"
        variant="audio"
        iconSlot={<AudioOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame title="Media" variant="media" iconSlot={<ImageOutline width={14} height={14} />}>
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame title="Sticky Note" variant="marker">
        <SamplePrompt />
      </NodeFrame>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 280px)', gap: 16 }}>
      <NodeFrame
        title="Default (chrome hidden until hover)"
        variant="image"
        state="default"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Hovered"
        variant="image"
        state="hovered"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Selected"
        variant="image"
        state="selected"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Generating"
        variant="image"
        state="generating"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Done"
        variant="image"
        state="done"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
      <NodeFrame
        title="Error"
        variant="image"
        state="error"
        iconSlot={<ImageOutline width={14} height={14} />}
      >
        <SamplePrompt />
      </NodeFrame>
    </div>
  ),
}
