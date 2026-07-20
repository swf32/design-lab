import { Button } from '@klyp/ui/Button'
import { type CSSProperties, useState } from 'react'
import {
  type MenuItemRenderProps,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  MenuTrigger as RACMenuTrigger,
} from 'react-aria-components'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Popover, type PopoverProps } from './Popover'

const meta = {
  component: Popover,
  title: 'Brand / Popover',
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

// === Shared layout helpers (story-only, inline per convention) ============
const menuStyle: CSSProperties = {
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  minWidth: 'var(--space-128)',
}

// Item LAYOUT (background is added per-state by `menuItemStyle` below).
const itemBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-12)',
  padding: 'var(--space-8)',
  borderRadius: 'var(--r-inner-section)',
  outline: 'none',
  cursor: 'pointer',
  fontSize: 13,
  color: 'var(--color-fg-primary)',
  transition: 'background var(--duration-fast) var(--easing-standard)',
}

// RAC passes interaction flags to `style` as a render-prop — this is how a
// menu item gets REAL hover / keyboard-focus / pressed states (an inline
// style object can't react to `data-hovered` etc.). Hover, roving-focus, and
// press all land on the same surface-hover token; the inner radius keeps the
// highlight concentric with the popover corner.
function menuItemStyle({ isHovered, isFocused, isPressed }: MenuItemRenderProps): CSSProperties {
  const active = isHovered || isFocused || isPressed
  return {
    ...itemBase,
    background: active ? 'var(--color-bg-surface-hover)' : 'transparent',
  }
}

// === Confirmation content (shared by Solid + Glass) =======================
// A popover isn't only a menu. The surface fits a short hero-style panel: a
// heading, a paragraph of body copy, and two actions on one row. Built with
// DialogTrigger + Dialog (the right RAC trigger for arbitrary content) so
// `close` is wired — both buttons dismiss the popover and carry their own DS
// Button states. Both stories render IDENTICAL content; only `surface`
// differs, so the two tabs are a direct solid-vs-glass comparison.
function ConfirmStory({ surface }: { surface: 'solid' | 'glass' }) {
  return (
    <RACDialogTrigger>
      <Button>Publish episode</Button>
      <Popover surface={surface} placement="bottom start" scrollbar={false}>
        <RACDialog
          style={{
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-12)',
            padding: 'var(--space-8)',
            maxWidth: 'min(34ch, 80vw)',
          }}
        >
          {({ close }) => (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: 14, color: 'var(--color-fg-primary)' }}>
                  Publish this episode?
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--color-fg-muted)',
                  }}
                >
                  It’ll go live for everyone with the link and appear in the series feed. You can
                  unpublish anytime from the episode menu.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
                <Button variant="ghost" size="sm" onPress={close}>
                  Not now
                </Button>
                <Button variant="primary" size="sm" onPress={close}>
                  Publish
                </Button>
              </div>
            </>
          )}
        </RACDialog>
      </Popover>
    </RACDialogTrigger>
  )
}

// === Solid — opaque surface ===============================================
// Same content as Glass; opaque background — best when content sits over busy
// UI and the blur would hurt legibility.
export const Solid: Story = {
  render: () => <ConfirmStory surface="solid" />,
}

// === Glass — translucent surface ==========================================
// Identical content to Solid; translucent + backdrop blur for hero-style
// panels over a calm backdrop.
export const Glass: Story = {
  render: () => <ConfirmStory surface="glass" />,
}

// === Scrollable — recent history =========================================
// The `scrollbar` prop earns its keep on genuinely long, unbounded lists
// (history menus) — the popover caps its height and the custom thin
// scrollbar appears on hover. Most popovers should size to their content
// (scrollbar={false}); reach for this only when the list can grow.
const RECENT = [
  'Pricing page RU/USD switch',
  'Tooltip padding + radius pass',
  'Popover story content',
  'Canvas node batch fan-out',
  'Asset editor metadata form',
  'Episode cover upload flow',
  'Composer settings popover',
  'Model picker provider icons',
  'Onboarding copy module',
  'Series index empty state',
  'Withdraw sheet — editorial vault',
  'Handoff batch 2 packaging',
  'Avatar shape ramp + IAB sizing',
  'CheckboxGroup stories import fix',
  'Dev sign-in panel polish',
  'Library picker keyboard nav',
  'Message bubble code block bar',
  'Generate button loading state',
  'Promote-to-asset modal copy',
  'Script composer mono toggle',
]

export const ScrollableHistory: Story = {
  render: () => (
    <RACMenuTrigger>
      <Button>Recent</Button>
      <Popover surface="solid" placement="bottom start" scrollbar>
        <RACMenu style={menuStyle} aria-label="Recent conversations">
          {RECENT.map((title, i) => (
            <RACMenuItem key={title} id={String(i)} style={menuItemStyle}>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </span>
            </RACMenuItem>
          ))}
        </RACMenu>
      </Popover>
    </RACMenuTrigger>
  ),
}

// === AnimatedHeight — opt-in smooth height morph ==========================
// `animateHeight` makes the popover GLIDE between content heights when its
// content changes height WHILE it stays open — instead of jumping. This is the
// composer-settings case: switching modality tabs (or here, toggling extra
// rows) changes the panel height, and the panel should glide. Same mechanism
// as Button's `animateWidth` (measure natural size in a layout effect, animate
// the REAL dimension with a Motion tween), but on the height axis.
//
// The toggle state lives in THIS top component (not inside the popover) so the
// popover's children genuinely change on toggle → the height-morph re-measures
// and animates. The "Show more / less" button sits inside the open popover and
// doesn't dismiss it, so you can watch the panel grow and shrink in place.
// Reduced motion → instant (the height jumps, no glide). Re-open to reset.
const SETTING_ROWS = [
  { label: 'Aspect ratio', value: '16:9' },
  { label: 'Resolution', value: '1080p' },
  { label: 'Duration', value: '5s' },
  { label: 'Seed', value: 'Random' },
  { label: 'Negative prompt', value: 'Off' },
  { label: 'Guidance', value: '7.5' },
]

const settingRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-12)',
  padding: 'var(--space-8)',
  borderRadius: 'var(--r-inner-section)',
  background: 'var(--color-bg-surface-hover)',
  fontSize: 13,
  color: 'var(--color-fg-primary)',
}

function AnimatedHeightStory() {
  const [expanded, setExpanded] = useState(false)

  return (
    <RACDialogTrigger>
      <Button>Generation settings</Button>
      <Popover animateHeight surface="solid" placement="bottom start" scrollbar={false}>
        <RACDialog
          style={{
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-12)',
            padding: 'var(--space-8)',
            width: 'min(36ch, 80vw)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <span style={{ fontSize: 14, color: 'var(--color-fg-primary)' }}>Video model</span>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--color-fg-muted)',
              }}
            >
              Toggle the advanced controls to watch the panel glide between heights instead of
              snapping.
            </p>
          </div>

          {expanded ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {SETTING_ROWS.map((row) => (
                <div key={row.label} style={settingRowStyle}>
                  <span>{row.label}</span>
                  <span
                    style={{ color: 'var(--color-fg-muted)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <Button variant="secondary" size="sm" onPress={() => setExpanded((v) => !v)}>
            {expanded ? 'Hide advanced' : 'Show advanced'}
          </Button>
        </RACDialog>
      </Popover>
    </RACDialogTrigger>
  )
}

export const AnimatedHeight: Story = {
  render: () => <AnimatedHeightStory />,
}
