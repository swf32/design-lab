import type { Meta, StoryObj } from '../__shared/stories-types'
import { EditorActionFab } from './EditorActionFab'

// Inline placeholder icon — Storybook isolated build doesn't pull
// `@klyp/icons` to keep stories cheap. Real callers pass an Iconsax
// outline glyph at 24×24 via the `icon` prop.
function PlaceholderIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h18M3 12h18M3 17h12" />
    </svg>
  )
}

const meta = {
  title: 'Brand / Molecules / EditorActionFab',
  component: EditorActionFab,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Open editor panels',
    icon: <PlaceholderIcon />,
  },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'primary'] },
    count: { control: { type: 'number', min: 0, max: 200 } },
    isOpen: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
  // The component is `position: fixed` — Storybook centred preview otherwise
  // anchors it to the iframe's bottom-right. Render in a relative wrapper.
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          inlineSize: 320,
          blockSize: 200,
          padding: 16,
          // Provide token defaults so the story renders correctly outside the
          // app shell where the FAB normally tracks the composer / keyboard.
          ['--composer-h-mobile' as string]: '64px',
          ['--kb-offset' as string]: '0px',
          ['--safe-area-bottom' as string]: '0px',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EditorActionFab>

export default meta
type Story = StoryObj<typeof meta>

/** Default — neutral tone, no badge, closed sheet. */
export const Default: Story = {}

/** Tone variants — neutral (default) vs primary (single-accent gold). */
export const Tones: Story = {
  render: (args) => (
    <div style={{ position: 'relative', inlineSize: 320, blockSize: 200 }}>
      <EditorActionFab {...args} aria-label="Neutral" tone="neutral" />
      <div style={{ position: 'absolute', insetInlineEnd: 96 }}>
        <EditorActionFab {...args} aria-label="Primary" tone="primary" />
      </div>
    </div>
  ),
}

/** With count badge — pinned top-right, semantic danger colour. */
export const WithBadge: Story = {
  args: { count: 7 },
}

/** Badge overflow — values > 99 render as `99+`. */
export const BadgeOverflow: Story = {
  args: { count: 248 },
}

/** Open state — sheet is mounted, FAB dims via `data-open`. */
export const Open: Story = {
  args: { isOpen: true },
}

/** Disabled — used during long-running async actions. */
export const Disabled: Story = {
  args: { isDisabled: true },
}
