import {
  CheckOutline,
  CopyOutline,
  EditPencilOutline,
  FilterOutline,
  RotateCcwOutline,
  TrashOutline,
} from '@klyp/icons/outline'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Toolbar } from '../Toolbar/Toolbar'
import { ToolButton, type ToolButtonSize } from './ToolButton'

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>

const meta = {
  component: ToolButton,
  title: 'UI / ToolButton',
  tags: ['autodocs'],
  // `icon` / `confirmIcon` are ComponentType<SVGProps> — supplied as a default
  // arg (a real Iconsax glyph), NOT a control. Controls cover the real scalar
  // props: variant / size (unions), label / tooltip (text), isActive / isPending
  // / isDisabled (booleans). `iconSize` is number | 'auto' — left out of controls
  // (the two-axis Sizing story showcases it; not a clean single-widget control).
  args: {
    icon: CopyOutline,
    label: 'Copy',
    variant: 'ghost',
    size: 'sm',
    isActive: false,
    isPending: false,
    isDisabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['ghost', 'bare', 'subtle', 'solid', 'outline', 'danger'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    label: { control: 'text' },
    tooltip: { control: 'text' },
    isActive: { control: 'boolean' },
    isPending: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ToolButton>

export default meta
type Story = StoryObj<typeof meta>

const cap: CSSProperties = { fontSize: 11, color: 'var(--color-fg-muted)' }

export const Default: Story = {}

/** Variants: ghost (default) / bare (no wash) / subtle / solid (boxed) /
 *  outline (border, no fill) / danger. */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <ToolButton {...args} variant="ghost" label="Ghost" />
      <ToolButton {...args} variant="bare" label="Bare (no wash)" />
      <ToolButton {...args} variant="subtle" label="Subtle" />
      <ToolButton {...args} variant="solid" label="Solid" />
      <ToolButton {...args} variant="outline" label="Outline (border, no fill)" />
      <ToolButton {...args} variant="danger" icon={TrashOutline} label="Delete" />
    </div>
  ),
}

/**
 * Two-axis sizing in ONE matrix.
 *   • Rows = container size (the hit-area: xs 24 → xl 56px).
 *   • Columns = icon size (the glyph). "default" = the constant 16px you get
 *     when `iconSize` is omitted; "auto" = the container-scaling ramp
 *     (16/20/24/28/32); the numbers are exact `iconSize` overrides.
 * The "default" column stays a flat 16px down the whole column; "auto" grows
 * with the container — that contrast IS the two-axis model.
 */
export const Sizing: Story = {
  render: (args) => {
    const containers: ToolButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
    const iconCols: (number | 'auto' | 'default')[] = ['default', 'auto', 24, 32]
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `64px repeat(${iconCols.length}, 64px)`,
          gap: 8,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {/* header row */}
        <span style={{ ...cap, justifySelf: 'start' }}>cont. ↓ / icon →</span>
        {iconCols.map((c) => (
          <span key={`h-${c}`} style={cap}>
            {typeof c === 'string' ? c : `${c}px`}
          </span>
        ))}
        {/* body */}
        {containers.map((size) => (
          <Row key={size} size={size} iconCols={iconCols} icon={args.icon} />
        ))}
      </div>
    )
  },
}

function Row({
  size,
  iconCols,
  icon,
}: {
  size: ToolButtonSize
  iconCols: (number | 'auto' | 'default')[]
  icon: IconCmp
}) {
  return (
    <>
      <span style={{ ...cap, justifySelf: 'start' }}>{size}</span>
      {iconCols.map((c) => (
        <ToolButton
          key={`${size}-${c}`}
          icon={icon}
          label={`${size} container, ${c} icon`}
          size={size}
          {...(c === 'default' ? {} : { iconSize: c })}
        />
      ))}
    </>
  )
}

/** Static states: default / hover / active (toggled) / disabled. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(
        [
          { label: 'Default', props: {} },
          // Forced hover — RAC owns `data-hovered`, so the component's SCSS
          // also matches `data-force-hover` (a custom attr that passes
          // through) to render the hover surface statically, no pointer.
          { label: 'Hover', props: { 'data-force-hover': true } },
          { label: 'Active', props: { isActive: true } },
          { label: 'Disabled', props: { isDisabled: true } },
        ] as const
      ).map(({ label, props }) => (
        <div
          key={label}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <ToolButton {...args} size="md" label={label} {...props} />
          <span style={cap}>{label}</span>
        </div>
      ))}
    </div>
  ),
}

/** Pending — glyph swaps for a spinner, press is blocked, aria-busy set. */
export const Pending: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <ToolButton {...args} size="md" label="Loading" isPending />
      <ToolButton {...args} variant="subtle" size="md" label="Loading" isPending />
      <ToolButton
        {...args}
        variant="danger"
        icon={TrashOutline}
        size="md"
        label="Deleting"
        isPending
      />
    </div>
  ),
}

/**
 * Confirm-swap — press flips the glyph to `confirmIcon` and the tooltip to
 * `confirmLabel` for `confirmMs`, then reverts. (Press the button to see it.)
 */
export const Confirm: Story = {
  render: (args) => (
    <ToolButton
      {...args}
      label="Copy"
      confirmIcon={CheckOutline}
      confirmLabel="Copied!"
      onPress={() => {}}
    />
  ),
}

/**
 * In a real `Toolbar` (roving-focus container) — the canonical use case.
 * Arrow keys move focus between actions; the last one is destructive.
 */
export const CompositionInToolbar: Story = {
  name: 'Composition — in Toolbar',
  render: () => (
    <Toolbar aria-label="Message actions">
      <ToolButton icon={CopyOutline} label="Copy" />
      <ToolButton icon={EditPencilOutline} label="Edit" />
      <ToolButton icon={FilterOutline} label="Filter" />
      <ToolButton icon={RotateCcwOutline} label="Regenerate" />
      <ToolButton icon={TrashOutline} label="Delete" variant="danger" />
    </Toolbar>
  ),
}
