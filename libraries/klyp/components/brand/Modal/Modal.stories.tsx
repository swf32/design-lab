import { InfoCircleOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui'
import { Input } from '@klyp/ui/Input'

import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Modal } from './Modal'

const meta = {
  title: 'Brand / Molecules / Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

// Body content sits flush with the Modal's 24px content padding — no inline
// padding overrides. That keeps Title / Description / Body / Footer aligned
// to a single left rail (the canonical look from /canvas Rename + Delete).

export const Default: Story = {
  render: () => (
    <Modal
      title="Confirm action"
      description="Trigger-driven uncontrolled mode. Built-in Close button + scrim + ESC dismiss."
      trigger={<Button>Open modal</Button>}
    >
      <p>Body content goes here.</p>
    </Modal>
  ),
}

// ─── RenameDialog — mirrors /canvas Rename board flow ───────────────────────
// Controlled `open` state. Form body with a labelled Input — single column,
// no horizontal padding (Modal's content padding owns the left rail).
// Save/Cancel footer. `hideClose` because Cancel is the canonical dismiss.

const RENAME_FORM_ID = 'klyp-rename-story-form'

export const RenameDialog: Story = {
  name: 'Rename dialog (real /canvas pattern)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Rename board</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Rename board"
          description="Choose a new name for this board. 1-100 characters."
          size="sm"
          hideClose
          footer={
            <>
              <Button variant="secondary" size="md" onPress={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                form={RENAME_FORM_ID}
                type="submit"
                variant="primary"
                size="md"
                onPress={() => setOpen(false)}
              >
                Save
              </Button>
            </>
          }
        >
          <form
            id={RENAME_FORM_ID}
            onSubmit={(e) => {
              e.preventDefault()
              setOpen(false)
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <label
              htmlFor="rename-story-input"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-fg-muted)',
                lineHeight: 1.3,
              }}
            >
              Name
            </label>
            <Input
              id="rename-story-input"
              autoFocus
              type="text"
              size="md"
              variant="secondary"
              defaultValue="Cinematic intro reel"
              maxLength={100}
              placeholder="Board name"
            />
          </form>
        </Modal>
      </>
    )
  },
}

// ─── DeleteDialog — mirrors /canvas Delete board confirmation ───────────────
// No body slot (title + description carry the message). Destructive footer
// with focus parked on Cancel (safe default for destructive actions).

export const DeleteDialog: Story = {
  name: 'Delete dialog (real /canvas pattern)',
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="destructive" onPress={() => setOpen(true)}>
          Delete board…
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Delete board?"
          description='"Cinematic intro reel" will be moved to trash. You can restore it later.'
          size="sm"
          hideClose
          footer={
            <>
              <Button variant="secondary" size="md" autoFocus onPress={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="md" onPress={() => setOpen(false)}>
                Delete
              </Button>
            </>
          }
        />
      </>
    )
  },
}

// ─── FallbackCloseFooter — exercises the built-in Close button fallback ─────

export const FallbackCloseFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Open modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Default footer Close"
          description="No footer prop — the modal falls back to a single outline Close button in the footer."
        >
          <p>Use this when there's only a single dismiss action and no body actions.</p>
        </Modal>
      </>
    )
  },
}

// ─── Sizes — sm / md / lg / xl ──────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Modal key={size} size={size} title={`Modal ${size}`} trigger={<Button>{size}</Button>}>
          <p>Size: {size}</p>
        </Modal>
      ))}
    </div>
  ),
}

// ─── DialogKind — interruptive confirm at the fixed dialog width ────────────

export const DialogKind: Story = {
  render: () => (
    <Modal
      kind="dialog"
      title="Delete board?"
      description="Dialog kind — fixed --modal-w-dialog width, interruptive."
      trigger={<Button variant="destructive">Delete…</Button>}
      footer={
        <>
          <Button variant="secondary" size="md">
            Cancel
          </Button>
          <Button variant="destructive" size="md">
            Delete
          </Button>
        </>
      }
    />
  ),
}

// ─── IconHeader — leading icon beside the title (align='start') ─────────────

export const IconHeader: Story = {
  render: () => (
    <Modal
      icon={<InfoCircleOutline width={20} height={20} />}
      title="Media upload agreement"
      description="Leading icon beside the title (align='start')."
      trigger={<Button>Open</Button>}
      footer={
        <>
          <Button variant="secondary" size="md">
            Cancel
          </Button>
          <Button variant="primary" size="md">
            I agree
          </Button>
        </>
      }
    >
      <p>Body content.</p>
    </Modal>
  ),
}

// ─── AlertCentered — centered illustration + split footer (Payment Failed) ──

export const AlertCentered: Story = {
  render: () => (
    <Modal
      kind="dialog"
      align="center"
      icon={<InfoCircleOutline width={40} height={40} />}
      footerAlign="split"
      title="Payment failed"
      description="We couldn't charge your card. Your subscription stays on the previous plan for now."
      trigger={<Button variant="destructive">Show alert</Button>}
      footer={
        <>
          <Button variant="secondary" size="md">
            Got it
          </Button>
          <Button variant="primary" size="md">
            Contact support
          </Button>
        </>
      }
    />
  ),
}

// ─── FooterAlignment — start / end / split ──────────────────────────────────

export const FooterAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {(['start', 'end', 'split'] as const).map((fa) => (
        <Modal
          key={fa}
          footerAlign={fa}
          title={`footerAlign="${fa}"`}
          description="Footer action alignment on desktop."
          trigger={<Button>{fa}</Button>}
          footer={
            <>
              <Button variant="secondary" size="md">
                Cancel
              </Button>
              <Button variant="primary" size="md">
                Confirm
              </Button>
            </>
          }
        />
      ))}
    </div>
  ),
}

// ─── SnapSheet — mobileSheet="snap" (vaul drag-to-snap bottom sheet ≤640px) ──
// Controlled (snap requires it). On desktop this renders the normal Modal;
// resize the preview ≤640px to see the vaul snap sheet — drag handle, half /
// full detents, drag-down-to-dismiss. Surface mirrors MobilePanelSheet.

export const SnapSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onPress={() => setOpen(true)}>Open snap sheet</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          mobileSheet="snap"
          title="Snap sheet"
          description="On ≤640px this is a vaul drag-to-snap bottom sheet (half / full detents). On desktop it stays a regular modal."
          size="md"
          footer={
            <>
              <Button variant="secondary" size="md" onPress={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onPress={() => setOpen(false)}>
                Save
              </Button>
            </>
          }
        >
          <p>Drag the handle to snap between half and full height, or drag down to dismiss.</p>
        </Modal>
      </>
    )
  },
}
