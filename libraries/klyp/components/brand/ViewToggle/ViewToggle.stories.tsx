import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { type ViewMode, ViewToggle } from './ViewToggle'

const meta = {
  component: ViewToggle,
  title: 'Brand / Molecules / ViewToggle',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two-option icon toggle for switching between Grid and Line (list) presentations. Wraps `<TabSwitcher>`. Used on Episodes and Scenes section headers.',
      },
    },
  },
} satisfies Meta<typeof ViewToggle>

export default meta

type Story = StoryObj<typeof meta>

// ============================================================================
//  Default — interactive
// ============================================================================

export const Default: Story = {
  args: {
    value: 'grid',
    onValueChange: () => {},
    ariaLabel: 'Episodes view',
  },
  render: (args: React.ComponentProps<typeof ViewToggle>) => {
    const [value, setValue] = useState<ViewMode>(args.value)
    return <ViewToggle {...args} value={value} onValueChange={setValue} />
  },
}

// ============================================================================
//  Variants — the two view modes (the component's only variant axis)
// ============================================================================

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <code style={{ fontSize: 12, opacity: 0.6 }}>value="grid"</code>
        <ViewToggle value="grid" onValueChange={() => {}} ariaLabel="Episodes view" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <code style={{ fontSize: 12, opacity: 0.6 }}>value="line"</code>
        <ViewToggle value="line" onValueChange={() => {}} ariaLabel="Scenes view" />
      </div>
    </div>
  ),
}

// ============================================================================
//  States — selection + disabled side-by-side
// ============================================================================

export const States: Story = {
  args: {
    value: 'grid',
    onValueChange: () => {},
    ariaLabel: 'Episodes view',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <code style={{ fontSize: 12, opacity: 0.6 }}>value="grid"</code>
        <ViewToggle value="grid" onValueChange={() => {}} ariaLabel="Episodes view" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <code style={{ fontSize: 12, opacity: 0.6 }}>value="line"</code>
        <ViewToggle value="line" onValueChange={() => {}} ariaLabel="Scenes view" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <code style={{ fontSize: 12, opacity: 0.6 }}>isDisabled</code>
        <ViewToggle value="grid" onValueChange={() => {}} ariaLabel="Episodes view" isDisabled />
      </div>
    </div>
  ),
}

// ============================================================================
//  Adaptive — narrow container collapses to icon-only
// ============================================================================

export const Adaptive: Story = {
  args: {
    value: 'grid',
    onValueChange: () => {},
    ariaLabel: 'Episodes view',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          containerType: 'inline-size',
          width: 600,
          padding: 12,
          border: '1px dashed rgba(255,255,255,0.2)',
        }}
      >
        <code style={{ display: 'block', fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
          container width: 600px (icon + label)
        </code>
        <ViewToggle value="grid" onValueChange={() => {}} ariaLabel="Episodes view" />
      </div>
      <div
        style={{
          containerType: 'inline-size',
          width: 320,
          padding: 12,
          border: '1px dashed rgba(255,255,255,0.2)',
        }}
      >
        <code style={{ display: 'block', fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
          container width: 320px (icon-only — labels hidden under 360px)
        </code>
        <ViewToggle value="grid" onValueChange={() => {}} ariaLabel="Episodes view" />
      </div>
    </div>
  ),
}
