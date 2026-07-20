import type { Meta, StoryObj } from '../__shared/stories-types'
import { SearchField } from './SearchField'

const meta = {
  title: 'UI / SearchField',
  component: SearchField,
  tags: ['autodocs'],
  // Playground controls (FE-team convention): ComponentPlayground drives the
  // bare SearchField from `args`/`argTypes` over REAL props only. `size`/
  // `variant` → inline-radio (3 options each); `placeholder` / `defaultValue`
  // → text; `isDisabled` / `isReadOnly` / `isInvalid` → boolean (RAC field
  // props). SearchField builds its icon / input / clear-button slots
  // internally, so no children control is needed. `className` shown, not
  // editable.
  args: {
    placeholder: 'Search',
    size: 'md',
    variant: 'outline',
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['outline', 'filled', 'ghost'] },
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    className: { control: false },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

// Shared layout helpers — inline (story-only, three callsites, well
// under the extract-to-primitive threshold).
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

export const Default: Story = {}

export const WithValue: Story = {
  args: { defaultValue: 'canvas board' },
}

export const Sizes: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>sm</span>
        <SearchField size="sm" placeholder="Small (28px)" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>md</span>
        <SearchField size="md" placeholder="Medium (32px)" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>lg</span>
        <SearchField size="lg" placeholder="Large (40px)" />
      </div>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>outline</span>
        <SearchField variant="outline" placeholder="Outline" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>filled</span>
        <SearchField variant="filled" placeholder="Filled" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>ghost</span>
        <SearchField variant="ghost" placeholder="Ghost" />
      </div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>Default</span>
        <SearchField placeholder="Resting" />
      </div>
      <div style={rowStyle}>
        {/* Hover can't be faked statically — RAC owns `data-hovered` and strips
            it off a passed prop. Real hover only: move the cursor over the field
            and the border lightens (`--color-border-strong`). */}
        <span style={labelStyle}>Hover</span>
        <SearchField placeholder="Hover me — border lightens" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Focused</span>
        <SearchField placeholder="Auto-focused on render" autoFocus />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>With value</span>
        <SearchField defaultValue="canvas board" />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Read-only</span>
        <SearchField defaultValue="read-only query" isReadOnly />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Disabled</span>
        <SearchField placeholder="Disabled" isDisabled />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Invalid</span>
        <SearchField defaultValue="!!" isInvalid />
      </div>
    </div>
  ),
}
