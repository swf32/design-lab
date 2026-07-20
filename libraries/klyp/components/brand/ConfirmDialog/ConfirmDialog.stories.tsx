import { Button } from '@klyp/ui'
import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  title: 'Brand / Molecules / ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 24,
        background: 'var(--color-bg-root)',
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}

export const Default: Story = {
  name: 'Default — destructive (delete asset)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button onPress={() => setOpen(true)}>Delete asset</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => alert('deleted')}
          title="Delete asset?"
          description={'"Hero shot 04" will be moved to trash. You can restore it later.'}
          confirmLabel="Delete"
        />
      </Stage>
    )
  },
}

export const PrimaryTone: Story = {
  name: 'Primary tone (non-destructive)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button onPress={() => setOpen(true)}>Publish</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => alert('published')}
          tone="primary"
          title="Publish episode?"
          description="This will make the episode visible to everyone."
          confirmLabel="Publish"
        />
      </Stage>
    )
  },
}

export const PermanentDelete: Story = {
  name: 'Permanent delete — strong copy',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button variant="destructive" onPress={() => setOpen(true)}>
          Delete forever
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => alert('deleted forever')}
          title="Delete forever?"
          description={'"Hero shot 04" will be removed permanently. This cannot be undone.'}
          confirmLabel="Delete forever"
        />
      </Stage>
    )
  },
}

export const WithExtraBody: Story = {
  name: 'With extra body slot',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button onPress={() => setOpen(true)}>Remove member</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => alert('removed')}
          title="Remove team member?"
          description="Anya Holm will lose access to this workspace immediately."
          confirmLabel="Remove"
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-13)',
              color: 'var(--color-fg-muted)',
            }}
          >
            Their boards stay; only access is revoked. You can re-invite them later.
          </p>
        </ConfirmDialog>
      </Stage>
    )
  },
}
