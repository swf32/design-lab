import { useState } from 'react'
import { FileTrigger, Label, TextField } from 'react-aria-components'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Button } from '../Button'
import { Input } from './Input'

const meta = {
  title: 'UI / Input',
  component: Input,
  tags: ['autodocs'],
  // Playground controls (FE-team convention): ComponentPlayground drives the
  // bare Input from `args`/`argTypes` over REAL props only. `size`/`variant`
  // → inline-radio (3 options each); `type` → select (>3); `placeholder` /
  // `defaultValue` → text; `disabled` / `readOnly` → boolean (native input
  // props, not RAC `is*`). `className` is shown but not editable. Label /
  // helper / char-counter are COMPOSITION (see stories), not Input props.
  args: {
    placeholder: 'Type something…',
    size: 'md',
    variant: 'outline',
    type: 'text',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['outline', 'filled', 'ghost'] },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'url', 'search', 'tel'],
    },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Shared layout helpers — kept inline (story-only, three callsites max,
// well under the extract-to-primitive threshold).
const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minWidth: 320,
}

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  alignItems: 'center',
  gap: 12,
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
  // Indent label/helper/counter so their text lines up just inside the field's
  // rounded corner, not flush to the box edge. `--space-10` matches the chip
  // radius (10px) visually without coupling spacing to a radius token.
  paddingInline: 'var(--space-10)',
}

// Field label — same indent as the helper so the column reads aligned.
const fieldLabelStyle: React.CSSProperties = {
  ...labelStyle,
  paddingInline: 'var(--space-10)',
}

export const Default: Story = {}

export const WithValue: Story = {
  args: { defaultValue: 'Pre-filled' },
}

export const Sizes: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>sm</span>
        <Input size="sm" placeholder="Small (28px)" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>md</span>
        <Input size="md" placeholder="Medium (32px)" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>lg</span>
        <Input size="lg" placeholder="Large (40px)" />
      </div>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>outline</span>
        <Input variant="outline" placeholder="Outline" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>filled</span>
        <Input variant="filled" placeholder="Filled" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>ghost</span>
        <Input variant="ghost" placeholder="Ghost" />
      </div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>Default</span>
        <Input placeholder="Resting" />
      </div>
      <div style={rowStyle}>
        {/* Hover can't be faked statically — RAC owns `data-hovered` and strips
            it off a passed prop. Real hover only: move the cursor over the field
            and the border lightens (`--color-border-strong`). */}
        <span style={labelStyle}>Hover</span>
        <Input placeholder="Hover me — border lightens" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Focused</span>
        {/* biome-ignore lint/a11y/noAutofocus: focus state demo */}
        <Input placeholder="Auto-focused on render" autoFocus />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Disabled</span>
        <Input placeholder="Disabled" disabled />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Readonly</span>
        <Input defaultValue="Read-only value" readOnly />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Invalid</span>
        <Input defaultValue="bad@@" aria-invalid="true" />
      </div>
    </div>
  ),
}

export const SpecialTypes: Story = {
  render: function SpecialTypesRender() {
    // Native `<input type="file">` renders its button + status text from the
    // browser UI locale (e.g. «Обзор» / «файл не выбран» on a RU browser) and
    // can't be forced to English via lang/CSS. The DS-correct file picker is
    // React Aria's FileTrigger + our Button, where the label text is ours.
    const [fileName, setFileName] = useState<string | null>(null)
    return (
      <div style={stackStyle}>
        <div style={rowStyle}>
          <span style={labelStyle}>email</span>
          <Input type="email" placeholder="you@klyp.app" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>password</span>
          <Input type="password" placeholder="••••••••" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>number</span>
          <Input type="number" placeholder="42" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>url</span>
          <Input type="url" placeholder="https://klyp.app" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>search</span>
          <Input type="search" placeholder="Search…" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>tel</span>
          <Input type="tel" placeholder="+1 555 0100" />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>file</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <FileTrigger onSelect={(files) => setFileName(files?.[0]?.name ?? null)}>
              <Button variant="secondary" size="sm">
                Choose file
              </Button>
            </FileTrigger>
            <span
              style={{
                ...labelStyle,
                color: fileName ? 'var(--color-fg-primary)' : 'var(--color-fg-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileName ?? 'No file selected'}
            </span>
          </div>
        </div>
      </div>
    )
  },
}

// Single resizable container (slider) instead of three fixed boxes side-by-side
// (280+600+1200 overflowed the centered frame). Same pattern as DataTable's
// AdaptivePriority story — drag to check the field stays readable 280→1200px.
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
          <Input placeholder={`Fills ${width}px width`} />
        </div>
      </div>
    )
  },
}

// COMPOSITION example — `Input` itself has NO label/helper props. Label + helper
// come from wrapping the bare field in RAC `<TextField>` + `<Label>`. Named as a
// composition example so the catalog doesn't read it as an Input prop.
export const CompositionWithLabel: Story = {
  name: 'Composition — label + helper',
  render: () => (
    <div style={stackStyle}>
      <TextField style={fieldStyle}>
        <Label style={fieldLabelStyle}>Email</Label>
        <Input type="email" placeholder="you@klyp.app" />
        <span style={helperStyle}>We'll never share your email.</span>
      </TextField>
      <TextField style={fieldStyle} isRequired>
        <Label style={fieldLabelStyle}>Display name</Label>
        <Input placeholder="Your name" />
        <span style={helperStyle}>Visible on your profile.</span>
      </TextField>
    </div>
  ),
}

// COMPOSITION example — the char counter is a hand-built `<span>` wired to local
// state, NOT an Input prop. Field wrapped in RAC `<TextField>`; `aria-invalid`
// flips when over the limit. Named as composition so it doesn't read as Input API.
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
          <Input
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
