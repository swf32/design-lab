import { Button } from '@klyp/ui'
import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { PromptField, type PromptFieldAttachment } from './PromptField'

const meta = {
  component: PromptField,
  title: 'Brand / Molecules / PromptField',
  tags: ['autodocs'],
  args: {
    busy: false,
    status: 'idle',
    paste: true,
    drop: true,
    children: (
      <>
        <PromptField.Textarea placeholder="Describe what you want…" />
        <PromptField.Footer>
          <PromptField.AttachButton />
          <PromptField.Spacer />
          <PromptField.Submit label="Send" />
        </PromptField.Footer>
      </>
    ),
  },
  argTypes: {
    busy: { control: 'boolean' },
    status: { control: 'select', options: ['idle', 'submitting', 'streaming', 'error'] },
    paste: { control: 'boolean' },
    drop: { control: 'boolean' },
    dropOverlayLabel: { control: 'text' },
    className: { control: false },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Unified prompt-input compound for chat and studio. Built-in: paste, drop, file picker, @-mention scan. Attachment tiles render via <AttachmentSlot>; chips via the inline chip variant. Submit uses the DS <Button> (accent idle / secondary Stop). 50 MB cap by default, file types configurable via `fileAccept` / `maxBytes`.',
      },
    },
  },
} satisfies Meta<typeof PromptField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return (
      <div style={{ width: 640 }}>
        <PromptField value={val} onValueChange={setVal} onSubmit={() => alert(`Sent: ${val}`)}>
          <PromptField.Textarea placeholder="Describe what you want…" />
          <PromptField.Footer>
            <PromptField.AttachButton />
            <PromptField.Spacer />
            <PromptField.Submit label="Send" />
          </PromptField.Footer>
        </PromptField>
      </div>
    )
  },
}

export const WithAttachments: Story = {
  render: () => {
    const [val, setVal] = useState('Look at this character reference and describe a scene')
    const [items, setItems] = useState<PromptFieldAttachment[]>([
      {
        id: '1',
        kind: 'character',
        name: 'Sheriff Holmes',
        thumbnailUrl: 'https://picsum.photos/seed/sheriff/160/160',
      },
      {
        id: '2',
        kind: 'location',
        name: 'Allen Street Bar',
        thumbnailUrl: 'https://picsum.photos/seed/bar/160/160',
      },
      {
        id: '3',
        kind: 'upload',
        name: 'reference-screenshot.png',
        thumbnailUrl: 'https://picsum.photos/seed/refshot/160/160',
      },
    ])
    return (
      <div style={{ width: 640 }}>
        <PromptField
          value={val}
          onValueChange={setVal}
          attachments={items}
          onAttachmentsChange={setItems}
          onFiles={(files) => {
            const next = files.map((f) => ({
              id: `upload-${crypto.randomUUID()}`,
              kind: 'upload' as const,
              name: f.name,
              thumbnailUrl: URL.createObjectURL(f),
            }))
            setItems([...items, ...next])
          }}
        >
          <PromptField.Attachments variant="tile" />
          <PromptField.Textarea placeholder="Describe…" />
          <PromptField.Footer>
            <PromptField.AttachButton />
            <PromptField.Spacer />
            <PromptField.CostPreview etaSec={40} usd={0.08} />
            <PromptField.Submit label="Generate" />
          </PromptField.Footer>
        </PromptField>
      </div>
    )
  },
}

export const Uploading: Story = {
  render: () => {
    const items: PromptFieldAttachment[] = [
      {
        id: '1',
        kind: 'upload',
        name: 'big-photo.jpg',
        thumbnailUrl: 'https://picsum.photos/seed/bigphoto/160/160',
        uploading: true,
      },
    ]
    return (
      <div style={{ width: 640 }}>
        <PromptField defaultValue="Analyze this" attachments={items} onAttachmentsChange={() => {}}>
          <PromptField.Attachments variant="tile" />
          <PromptField.Textarea placeholder="Describe…" />
          <PromptField.Footer>
            <PromptField.AttachButton />
            <PromptField.Spacer />
            <PromptField.Submit label="Submit" />
          </PromptField.Footer>
        </PromptField>
      </div>
    )
  },
}

export const AttachmentStates: Story = {
  render: () => {
    const items: PromptFieldAttachment[] = [
      {
        id: '1',
        kind: 'upload',
        name: 'ok.png',
        thumbnailUrl: 'https://picsum.photos/seed/okatt/160/160',
      },
      {
        id: '2',
        kind: 'upload',
        name: 'uploading.png',
        thumbnailUrl: 'https://picsum.photos/seed/upatt/160/160',
        uploading: true,
      },
      {
        id: '3',
        kind: 'upload',
        name: 'too-big.png',
        thumbnailUrl: 'https://picsum.photos/seed/erratt/160/160',
        error: 'Too large — max 50 MB',
      },
      {
        id: '4',
        kind: 'upload',
        name: 'small.png',
        thumbnailUrl: 'https://picsum.photos/seed/warnatt/160/160',
        warning: 'Needs ≥300px on the short side',
      },
    ]
    return (
      <div style={{ width: 640 }}>
        <PromptField
          defaultValue="Attachments in every state"
          attachments={items}
          onAttachmentsChange={() => {}}
        >
          <PromptField.Attachments variant="tile" />
          <PromptField.Textarea placeholder="Describe…" />
          <PromptField.Footer>
            <PromptField.AttachButton />
            <PromptField.Spacer />
            <PromptField.Submit label="Generate" />
          </PromptField.Footer>
        </PromptField>
      </div>
    )
  },
}

export const Busy: Story = {
  render: () => (
    <div style={{ width: 640 }}>
      <PromptField defaultValue="Generate the next scene" busy>
        <PromptField.Textarea placeholder="Describe…" />
        <PromptField.Footer>
          <PromptField.AttachButton />
          <PromptField.Spacer />
          <PromptField.Submit label="Generate" busyLabel="Generating…" />
        </PromptField.Footer>
      </PromptField>
    </div>
  ),
}

export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {[280, 480, 800].map((w) => (
        <div key={w} style={{ width: w, border: '1px dashed #444', padding: 8 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{w}px container</div>
          <PromptField defaultValue="">
            <PromptField.Textarea placeholder="Describe…" />
            <PromptField.Footer>
              <PromptField.AttachButton />
              <PromptField.Spacer />
              <PromptField.Submit label="Send" />
            </PromptField.Footer>
          </PromptField>
        </div>
      ))}
    </div>
  ),
}

export const StatusSwap: Story = {
  render: () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'streaming' | 'error'>('idle')
    const cycle = () => {
      const next: typeof status =
        status === 'idle'
          ? 'submitting'
          : status === 'submitting'
            ? 'streaming'
            : status === 'streaming'
              ? 'error'
              : 'idle'
      setStatus(next)
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 480 }}>
        <Button onPress={cycle}>status: {status} (click to cycle)</Button>
        <PromptField
          value="Hello"
          onValueChange={() => {}}
          attachments={[]}
          onAttachmentsChange={() => {}}
          status={status}
          onStop={() => alert('stop pressed')}
        >
          <PromptField.Textarea placeholder="Demo" />
          <PromptField.Footer>
            <PromptField.Spacer />
            <PromptField.Submit>Generate</PromptField.Submit>
          </PromptField.Footer>
        </PromptField>
      </div>
    )
  },
}

// Narrow / mobile pane (320px) with a full tile row in every state. The error /
// warning text lives in each tile's top-left status badge (hover for the toned
// tooltip), so a long message never takes row space or shoves the neighbouring
// tiles; the clear-all trash stays centred on the 80px tile.
export const MobileTiles: Story = {
  render: () => {
    const items: PromptFieldAttachment[] = [
      {
        id: '1',
        kind: 'upload',
        name: 'ok.png',
        thumbnailUrl: 'https://picsum.photos/seed/mok/160/160',
      },
      {
        id: '2',
        kind: 'upload',
        name: 'uploading.png',
        thumbnailUrl: 'https://picsum.photos/seed/mup/160/160',
        uploading: true,
      },
      {
        id: '3',
        kind: 'upload',
        name: 'too-big.png',
        thumbnailUrl: 'https://picsum.photos/seed/merr/160/160',
        error: 'Too large — max 50 MB',
      },
      {
        id: '4',
        kind: 'upload',
        name: 'small.png',
        thumbnailUrl: 'https://picsum.photos/seed/mwarn/160/160',
        warning: 'Needs ≥300px on the short side',
      },
    ]
    return (
      <div style={{ width: 320, border: '1px dashed #444', padding: 8 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>320px container</div>
        <PromptField
          defaultValue="Look at these references"
          attachments={items}
          onAttachmentsChange={() => {}}
        >
          <PromptField.Attachments variant="tile" />
          <PromptField.Textarea placeholder="Describe…" />
          <PromptField.Footer>
            <PromptField.AttachButton />
            <PromptField.Spacer />
            <PromptField.Submit label="Generate" />
          </PromptField.Footer>
        </PromptField>
      </div>
    )
  },
}
