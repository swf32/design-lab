import { useState } from 'react'
import { Label, TextField } from 'react-aria-components'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Textarea } from './Textarea'

const meta = {
  title: 'UI / Textarea',
  component: Textarea,
  tags: ['autodocs'],
  // Playground controls (FE-team convention): ComponentPlayground drives the
  // bare Textarea from `args`/`argTypes` over REAL props only. `size` →
  // inline-radio (3 options); `resize` → select (4 options); `placeholder` /
  // `defaultValue` → text; `disabled` / `readOnly` → boolean (native textarea
  // props). `className` is shown but not editable. Label / helper /
  // char-counter are COMPOSITION (see stories), not Textarea props.
  args: {
    placeholder: 'Type a message…',
    size: 'md',
    resize: 'none',
    autoGrow: false,
    minRows: 1,
    maxRows: 8,
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    resize: { control: 'select', options: ['none', 'vertical', 'horizontal', 'both'] },
    autoGrow: { control: 'boolean' },
    minRows: { control: 'number' },
    maxRows: { control: 'number' },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

// Shared layout helpers — story-only, kept inline (same pattern as Input).
const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minWidth: 320,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-fg-muted)',
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const helperStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-fg-muted)',
  paddingInline: 'var(--space-10)',
}

const fieldLabelStyle: React.CSSProperties = {
  ...labelStyle,
  paddingInline: 'var(--space-10)',
}

export const Default: Story = {
  args: { placeholder: 'Type a message…' },
}

export const WithValue: Story = {
  args: { defaultValue: 'A few lines of\nprefilled text\nlive here.' },
}

export const Sizes: Story = {
  render: () => (
    <div style={stackStyle}>
      <Textarea size="sm" placeholder="Small (min 48px)" />
      <Textarea size="md" placeholder="Medium (min 64px)" />
      <Textarea size="lg" placeholder="Large (min 80px)" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={stackStyle}>
      <Textarea placeholder="Default" />
      <Textarea placeholder="Auto-focused on render" autoFocus />
      <Textarea placeholder="Disabled" disabled />
      <Textarea placeholder="Readonly" readOnly defaultValue="Can't edit me" />
      <Textarea placeholder="Invalid" aria-invalid="true" />
    </div>
  ),
}

export const Resize: Story = {
  render: () => (
    <div style={stackStyle}>
      <Textarea resize="none" placeholder="resize: none (default) — auto-grows, no drag handle" />
      <Textarea resize="vertical" placeholder="resize: vertical — opt-in drag handle" />
      <Textarea resize="both" placeholder="resize: both — opt-in drag handle" />
    </div>
  ),
}

// JS auto-grow (cross-browser, capped) — folds in the former AutoTextarea.
// Grows 1→6 rows with content, then scrolls. Controlled via value/onValueChange.
export const AutoGrow: Story = {
  render: function AutoGrowRender() {
    const [value, setValue] = useState('')
    return (
      <div style={stackStyle}>
        <Textarea
          autoGrow
          minRows={1}
          maxRows={6}
          value={value}
          onValueChange={setValue}
          placeholder="Auto-grows 1→6 rows (JS, every browser), then scrolls"
        />
      </div>
    )
  },
}

// Single resizable container (slider) — same pattern as Input's Adaptive story.
// Drag to check the field stays readable 280→1200px.
export const Adaptive: Story = {
  render: function AdaptiveRender() {
    const [width, setWidth] = useState(600)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 320 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...labelStyle }}>
          <span>Container width: {width}px</span>
          <input
            type="range"
            min={280}
            max={1200}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
        <div
          style={{
            width,
            maxWidth: '100%',
            border: '1px dashed var(--color-border-default)',
            borderRadius: 8,
            padding: 12,
            transition: 'width 80ms linear',
          }}
        >
          <Textarea placeholder={`Fills ${width}px width`} />
        </div>
      </div>
    )
  },
}

// COMPOSITION example — `Textarea` itself has NO label/helper props (it's a
// primitive, like Input). Label + helper come from wrapping the bare field in
// RAC `<TextField>` + `<Label>`. Named as composition so the catalog doesn't
// read it as a Textarea prop.
export const CompositionWithLabel: Story = {
  name: 'Composition — label + helper',
  render: () => (
    <div style={stackStyle}>
      <TextField style={fieldStyle}>
        <Label style={fieldLabelStyle}>Premise</Label>
        <Textarea placeholder="What is this story about?" />
        <span style={helperStyle}>A sentence or two is enough.</span>
      </TextField>
    </div>
  ),
}

// COMPOSITION example — the char counter is a hand-built `<span>` wired to local
// state, NOT a Textarea prop. `aria-invalid` flips when over the limit. Named as
// composition so it doesn't read as Textarea API.
export const CompositionCharCounter: Story = {
  name: 'Composition — char counter',
  render: function CompositionCharCounterRender() {
    const max = 280
    const [value, setValue] = useState('')
    const remaining = max - value.length
    const over = remaining < 0

    return (
      <div style={{ ...stackStyle, minWidth: 360 }}>
        <TextField style={fieldStyle}>
          <Label style={fieldLabelStyle}>Bio</Label>
          <Textarea
            placeholder="Tell us about yourself"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            aria-invalid={over || undefined}
            maxLength={max + 20}
          />
          <span
            style={{
              ...helperStyle,
              color: over ? 'var(--color-status-danger)' : 'var(--color-fg-muted)',
              alignSelf: 'flex-end',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value.length}/{max}
          </span>
        </TextField>
      </div>
    )
  },
}
