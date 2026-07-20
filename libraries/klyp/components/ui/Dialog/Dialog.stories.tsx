import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { Button } from '../Button/Button'
import { Input } from '../Input/Input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog'

const meta = {
  title: 'UI / Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <Button>Open dialog</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>This is a brand-styled modal dialog.</DialogDescription>
        </DialogHeader>
        <p>Body content goes here.</p>
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// NOTE: no `defaultOpen` story here on purpose. The catalog renders every story
// inline on one page, so an auto-open dialog throws its fixed full-viewport
// overlay over the whole page (dark scrim covering the catalog). Every overlay
// story must open via a trigger button — never `defaultOpen` / controlled-open.
//
// NOTE: no `args`/`argTypes` (→ no playground) on purpose — same as Sheet and
// Modal. The bare <Dialog> root is a trigger context that renders nothing
// inline, and a playground-driven `open` control (controlled open with no
// onOpenChange wiring) would strand the overlay on screen. The knobs that
// matter (backdrop / showCloseButton / isDismissable / controlled mode) are
// each covered by a dedicated trigger-based story below.

// =====================================================================
// Scrollable — tall content stays within the viewport
// =====================================================================
// The card caps at the viewport height (max-height on __content) and the
// inner __dialog scrolls; the close X stays pinned. These two stories
// prove the fix: open them with very tall content and confirm the footer
// buttons remain reachable via scroll instead of falling off-screen.

/** ~1000px of stacked rows — scrolls inside the card, footer reachable. */
export const TallContentOverflow: Story = {
  name: 'Scrollable · Tall content',
  render: () => (
    <Dialog>
      <Button>Open long list</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Long list — no scroll</DialogTitle>
          <DialogDescription>
            30 rows below. The card outgrows the screen and the footer is unreachable.
          </DialogDescription>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--r-card)',
              }}
            >
              Row {i + 1} — content that stacks vertically
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Confirm (try reaching me)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** A long form — body scrolls, the Submit button stays reachable. */
export const LongFormOverflow: Story = {
  name: 'Scrollable · Long form',
  render: () => (
    <Dialog>
      <Button>Open long form</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create something</DialogTitle>
          <DialogDescription>15 fields — the Submit button falls off-screen.</DialogDescription>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label
                htmlFor={`dialog-longform-field-${i}`}
                style={{ color: 'var(--color-fg-muted)' }}
              >
                Field {i + 1}
              </label>
              <Input id={`dialog-longform-field-${i}`} placeholder={`Value ${i + 1}`} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// =====================================================================
// Backdrop variants — blur (default) / opaque / transparent
// =====================================================================
// Each button opens a dialog with a different backdrop. `blur` is the
// default and matches every existing callsite; `opaque` drops the blur
// (cheaper over video / canvas); `transparent` shows no backdrop at all.

const backdropDemo = (label: string, backdrop: 'blur' | 'opaque' | 'transparent') => (
  <Dialog>
    <Button>{label}</Button>
    <DialogContent backdrop={backdrop}>
      <DialogHeader>
        <DialogTitle>Backdrop: {backdrop}</DialogTitle>
        <DialogDescription>Look at the area behind this dialog.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const BackdropVariants: Story = {
  name: 'Backdrop variants',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {backdropDemo('Blur (default)', 'blur')}
      {backdropDemo('Opaque', 'opaque')}
      {backdropDemo('Transparent', 'transparent')}
    </div>
  ),
}

// =====================================================================
// Controlled (standalone) — isOpen/onOpenChange, no <Dialog> wrapper
// =====================================================================
// The programmatic-mount mode: open state lives in the caller, DialogContent
// gets `isOpen` + `onOpenChange` directly. RAC publishes its own overlay
// state context, so <DialogClose> still works without a trigger wrapper.
// This is the shell mode LibraryPicker / sign-up-modal use.

function ControlledDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open controlled</Button>
      <DialogContent isOpen={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Controlled dialog</DialogTitle>
          <DialogDescription>
            Open state lives outside — `isOpen` + `onOpenChange`, no trigger context.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onPress={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onPress={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </>
  )
}

export const Controlled: Story = {
  name: 'Controlled (standalone)',
  render: () => <ControlledDemo />,
}

/** Hidden corner ✕ — `showCloseButton={false}`; the footer owns closing
 *  (`DialogFooter showCloseButton` renders the default outline Close via
 *  DialogClose). Modal does the same — it draws its own header ✕. */
export const WithoutCloseButton: Story = {
  name: 'Without close button',
  render: () => (
    <Dialog>
      <Button>Open without corner ✕</Button>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No corner close</DialogTitle>
          <DialogDescription>
            The ✕ is opted out — closing happens via the footer (or Esc / backdrop).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
}

/** Non-dismissable — `isDismissable={false}` blocks backdrop-click dismiss
 *  (RAC). Esc, the corner ✕ and explicit DialogClose actions still close —
 *  they go through overlay state, not the dismiss interaction. */
export const NonDismissable: Story = {
  name: 'Non-dismissable',
  render: () => (
    <Dialog>
      <Button>Open locked dialog</Button>
      <DialogContent isDismissable={false}>
        <DialogHeader>
          <DialogTitle>Deleting 12 assets…</DialogTitle>
          <DialogDescription>
            Clicking outside won't close this dialog — use the buttons (or Esc).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose variant="secondary">Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
