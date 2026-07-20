import { toast } from 'sonner'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Button } from '../Button/Button'
import { Toaster } from './Toast'

const meta = {
  title: 'UI / Toast',
  component: Toaster,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Showcase — every semantic state stacked the way users actually see them:
 * info / success (with close + Undo action) / plain message (no icon) /
 * error / info. Fires on a button press (NOT on mount) so opening the
 * catalog page doesn't dump a wall of toasts into every visitor's face.
 */
export const Showcase: Story = {
  render: () => {
    const fireAll = () => {
      const opts = { duration: Number.POSITIVE_INFINITY as number }
      toast.dismiss()

      // Fire in reverse visual order — Sonner stacks newest on top in
      // `top-center`, so we want `info (top)` to fire last. Stagger 60ms
      // between toasts so Sonner reliably emits each one without batching
      // (which can silently drop duplicates when ids overlap).
      const fires = [
        () => toast.info('This is a info message', { ...opts, id: 'showcase-info-bottom' }),
        () => toast.error('This is a error message', { ...opts, id: 'showcase-error' }),
        () => toast('This is a message', { ...opts, id: 'showcase-message' }),
        () =>
          toast.success('This is a success message', {
            ...opts,
            id: 'showcase-success',
            action: { label: 'Undo', onClick: () => {} },
          }),
        () => toast.info('This is a info message', { ...opts, id: 'showcase-info-top' }),
      ]
      fires.forEach((fn, i) => {
        setTimeout(fn, i * 60)
      })
    }

    return (
      <div
        style={{ minHeight: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Toaster closeButton position="top-center" expand visibleToasts={8} gap={12} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onPress={fireAll}>Show all states</Button>
          <Button onPress={() => toast.dismiss()}>Dismiss all</Button>
        </div>
      </div>
    )
  },
}

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onPress={() => toast('Saved')}>Default</Button>
        <Button onPress={() => toast.success('Episode created')}>Success</Button>
        <Button onPress={() => toast.info('Heads up')}>Info</Button>
        <Button onPress={() => toast.warning('Be careful')}>Warning</Button>
        <Button onPress={() => toast.error('Generation failed')}>Error</Button>
      </div>
    </div>
  ),
}

/** All semantic tones — one button per tone, easier to inspect each. */
export const Tones: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onPress={() => toast('Neutral toast')}>Neutral</Button>
        <Button onPress={() => toast.success('Saved successfully')}>Success</Button>
        <Button onPress={() => toast.info('FYI — new model available')}>Info</Button>
        <Button onPress={() => toast.warning('Quota nearly reached')}>Warning</Button>
        <Button onPress={() => toast.error('Network error')}>Error / Danger</Button>
      </div>
    </div>
  ),
}

/** Toast with a description (two-line body). */
export const WithDescription: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onPress={() =>
          toast.success('Episode saved', {
            description: 'Synced to cloud at 12:34 PM.',
          })
        }
      >
        Show with description
      </Button>
    </div>
  ),
}

/** Toast with an inline action button (e.g. Undo). */
export const WithAction: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onPress={() =>
          toast('Asset deleted', {
            description: 'Moved to Trash.',
            action: {
              label: 'Undo',
              onClick: () => toast.success('Restored'),
            },
          })
        }
      >
        Show with action
      </Button>
    </div>
  ),
}

/** Closable — `closeButton` prop on the Toaster adds an "×" affordance
 *  to every toast (top-left, per Sonner default). Useful for persistent
 *  toasts the user must dismiss manually. */
export const Closable: Story = {
  render: () => (
    <div>
      <Toaster closeButton />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onPress={() => toast.success('Saved — has × close button')}>Success</Button>
        <Button onPress={() => toast.error('Failed — close manually')}>Error</Button>
      </div>
    </div>
  ),
}

/** Persistent toast — duration: Infinity. Closes only via dismiss. */
export const Persistent: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onPress={() =>
          toast('I will stay until dismissed', {
            duration: Number.POSITIVE_INFINITY,
            action: { label: 'Dismiss', onClick: () => {} },
          })
        }
      >
        Show persistent toast
      </Button>
    </div>
  ),
}

/** Custom duration — short (1 s) and long (10 s) compared to the default. */
export const CustomDuration: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onPress={() => toast('Quick toast (1 s)', { duration: 1000 })}>Short — 1s</Button>
        <Button onPress={() => toast('Slow toast (10 s)', { duration: 10000 })}>Long — 10s</Button>
      </div>
    </div>
  ),
}

/** Loading state — spinner toast while a promise is in flight. */
export const Loading: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onPress={() => {
          const id = toast.loading('Rendering scene…')
          setTimeout(() => toast.success('Scene ready', { id }), 1500)
        }}
      >
        Trigger loading toast
      </Button>
    </div>
  ),
}

/** Promise toast — auto-switches loading → success / error from a Promise. */
export const PromiseToast: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          onPress={() =>
            toast.promise(
              new Promise((resolve) => {
                setTimeout(() => resolve('done'), 1500)
              }),
              {
                loading: 'Saving…',
                success: 'Saved',
                error: 'Save failed',
              },
            )
          }
        >
          Promise → success
        </Button>
        <Button
          onPress={() =>
            toast.promise(
              new Promise((_resolve, reject) => {
                setTimeout(() => reject(new Error('boom')), 1500)
              }),
              {
                loading: 'Saving…',
                success: 'Saved',
                error: 'Save failed',
              },
            )
          }
        >
          Promise → error
        </Button>
      </div>
    </div>
  ),
}

/** Dismiss programmatically. Useful for global error handlers etc. */
export const ProgrammaticDismiss: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onPress={() => toast('Sticky toast', { id: 'sticky', duration: 60000 })}>
          Show
        </Button>
        <Button onPress={() => toast.dismiss('sticky')}>Dismiss</Button>
        <Button onPress={() => toast.dismiss()}>Dismiss all</Button>
      </div>
    </div>
  ),
}

/** Position variants — passed to the Toaster, not individual toasts.
 *  Production app mounts a single <Toaster /> at the root. This story
 *  remounts the Toaster at the chosen position. */
export const Positions: Story = {
  render: () => (
    <div>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onPress={() => toast('Top-right anchored')}>top-right (active)</Button>
        <Button
          onPress={() =>
            toast.info(
              'For a real positional preview, instantiate <Toaster position="…" /> at the desired anchor — Sonner allows one positioned toaster at a time per page.',
            )
          }
        >
          About positions
        </Button>
      </div>
    </div>
  ),
}

/** Rich-colors mode — Toaster prop that re-tints toasts with the tone colour. */
export const RichColors: Story = {
  render: () => (
    <div>
      <Toaster richColors />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onPress={() => toast.success('Success — rich')}>Success</Button>
        <Button onPress={() => toast.info('Info — rich')}>Info</Button>
        <Button onPress={() => toast.warning('Warning — rich')}>Warning</Button>
        <Button onPress={() => toast.error('Error — rich')}>Error</Button>
      </div>
    </div>
  ),
}
