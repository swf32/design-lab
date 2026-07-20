import { CardRemoveBulk } from '@klyp/icons/bulk'
import { DangerOutline, TickOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui'

import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { StatusDialog } from './StatusDialog'

const meta = {
  title: 'Brand / Molecules / StatusDialog',
  component: StatusDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatusDialog>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

// Trigger-driven so the catalog preview renders a button (not a permanently
// open, un-closable overlay). Mirrors Modal.stories.tsx — `open` is real
// state, so ✕ / scrim / ESC actually dismiss it.

// Canonical instance — Figma "Payment Failed" (Development file, node 4:16).
export const Default: Story = {
  name: 'Payment Failed (danger)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Show “Payment Failed”</Button>
        <StatusDialog
          open={open}
          onOpenChange={setOpen}
          size="md"
          tone="danger"
          icon={CardRemoveBulk}
          title="Payment Failed"
          message="Update your payment method or try again to apply the change."
          description="We couldn't charge your card for the Creator • Annual plan ($278.40). Your subscription stays on the previous plan for now."
          secondaryAction={{ label: 'Got It', onPress: noop }}
          // closeOnPress:false — Contact Support hands off to the chat widget;
          // keep the failure dialog open behind it (user may need the details).
          primaryAction={{ label: 'Contact Support', onPress: noop, closeOnPress: false }}
        />
      </>
    )
  },
}

// Success tone — single acknowledgement action.
export const Success: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Show success</Button>
        <StatusDialog
          open={open}
          onOpenChange={setOpen}
          tone="success"
          icon={TickOutline}
          title="Plan updated"
          message="You're on Creator • Annual now."
          description="Your new limits are active immediately."
          primaryAction={{ label: 'Done', onPress: noop, variant: 'primary' }}
        />
      </>
    )
  },
}

// Warning tone — two actions, destructive primary.
export const Warning: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="destructive" onPress={() => setOpen(true)}>
          Show warning
        </Button>
        <StatusDialog
          open={open}
          onOpenChange={setOpen}
          tone="warning"
          icon={DangerOutline}
          title="Leaving without saving?"
          message="You have unsaved changes."
          description="If you leave now, your latest edits will be discarded."
          secondaryAction={{ label: 'Keep editing', onPress: noop }}
          primaryAction={{ label: 'Discard', onPress: noop, variant: 'destructive' }}
        />
      </>
    )
  },
}
