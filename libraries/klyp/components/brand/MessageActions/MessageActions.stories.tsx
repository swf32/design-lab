import type { Meta, StoryObj } from '../__shared/stories-types'
import { StoryCell, StoryFrame, StoryRow, StoryStack } from '../__shared/story-layout'
import { MessageActions, type MessageRole } from './MessageActions'

// Async no-op so ToolButton's confirm-swap (Copy → Copied) actually fires when
// you click an action in the catalog.
const noop = async () => {
  await new Promise((r) => setTimeout(r, 200))
}
const log = (m: string) => () => console.log(m)

// Full handler bundle. The component renders an action ONLY when its callback
// is passed AND the role/variant gate matches — so one bundle drives every
// role/variant story (regenerate shows only for assistant, edit only for user,
// copy-image only for image, etc.).
const handlers = {
  onCopyText: noop,
  onCopyImage: noop,
  onCopyUrl: noop,
  onDownload: noop,
  onToPrompt: log('to-prompt'),
  onRegenerate: log('regenerate'),
  onEdit: log('edit'),
}

// `role` is a component prop (MessageRole), NOT the ARIA role attribute. Route
// it through a typed const so the a11y linter doesn't read a JSX `role="..."`
// literal as an (invalid) ARIA role.
const ASSISTANT: MessageRole = 'assistant'

const meta = {
  component: MessageActions,
  title: 'Brand / Molecules / MessageActions',
  tags: ['autodocs'],
  // Playground defaults: a fully-populated assistant bar. Switch `role` /
  // `variant` / `busy` live — the capability gate inside the component shows
  // the right subset (e.g. role=user swaps Regenerate→Edit, variant=image
  // reveals Copy-image + Download).
  args: {
    role: 'assistant',
    variant: 'text',
    busy: false,
    ...handlers,
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['user', 'assistant', 'system'] },
    variant: { control: 'inline-radio', options: ['text', 'image', 'video'] },
    busy: { control: 'boolean' },
    // Callbacks + className aren't live-editable — visible in the table, not as
    // controls (the bundle above wires them so the preview is populated). The
    // reserved-but-unrendered callbacks (onFeedbackUp/Down, onShare, onReadAloud)
    // are intentionally omitted here — they're a forward-compat contract on the
    // component, not playground controls; see their @reserved JSDoc in the props.
    onCopyText: { control: false },
    onCopyImage: { control: false },
    onCopyUrl: { control: false },
    onDownload: { control: false },
    onToPrompt: { control: false },
    onRegenerate: { control: false },
    onEdit: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof MessageActions>

export default meta
type Story = StoryObj<typeof meta>

/** Default — the common case: a populated assistant/text reply bar. */
export const Default: Story = {}

/**
 * Roles — user / assistant / system side by side. The action set differs by
 * role (assistant gets Regenerate, user gets Edit, system collapses to Copy).
 */
export const Roles: Story = {
  render: () => (
    <StoryStack gap="md">
      {(['user', 'assistant', 'system'] as const).map((role) => (
        <StoryCell key={role} label={role}>
          <MessageActions role={role} {...handlers} />
        </StoryCell>
      ))}
    </StoryStack>
  ),
}

/**
 * Variants — assistant role × text / image / video. Copy-image (image),
 * Copy-video + Download (video) reveal by variant gate.
 */
export const Variants: Story = {
  render: () => (
    <StoryStack gap="md">
      {(['text', 'image', 'video'] as const).map((variant) => (
        <StoryCell key={variant} label={variant}>
          <MessageActions role={ASSISTANT} variant={variant} {...handlers} />
        </StoryCell>
      ))}
    </StoryStack>
  ),
}

/**
 * States — rest vs busy. `busy` dims the row to 0.5 and blocks pointer events
 * while the parent is streaming. (Press Copy to see the transient
 * confirm-swap → Copied.) Hover-reveal is a CONSUMER concern (see
 * message-bubble) — the molecule itself is always visible.
 */
export const States: Story = {
  render: () => (
    <StoryRow gap="lg">
      {(
        [
          { label: 'Rest', busy: false },
          { label: 'Busy', busy: true },
        ] as const
      ).map(({ label, busy }) => (
        <StoryCell key={label} label={label}>
          <MessageActions role={ASSISTANT} busy={busy} {...handlers} />
        </StoryCell>
      ))}
    </StoryRow>
  ),
}

/** User vs assistant — the edit-only-on-user / regenerate-only-on-assistant asymmetry. */
export const UserVsAssistant: Story = {
  name: 'User vs assistant',
  render: () => (
    <StoryRow gap="lg">
      {(
        [
          { role: 'user', label: 'User — copy / insert / edit' },
          { role: 'assistant', label: 'Assistant — copy / insert / regenerate' },
        ] as const
      ).map(({ role, label }) => (
        <StoryCell key={role} label={label}>
          <MessageActions role={role} {...handlers} />
        </StoryCell>
      ))}
    </StoryRow>
  ),
}

/** Adaptive — the widest action set (image variant) wraps cleanly at 280 / 600
 *  / 1200px. Wrapping to two rows at 280px is expected, not a bug. */
export const Adaptive: Story = {
  render: () => (
    <StoryStack gap="md">
      {[280, 600, 1200].map((w) => (
        <StoryCell key={w} label={`${w}px`}>
          <StoryFrame width={w}>
            <MessageActions role={ASSISTANT} variant="image" {...handlers} />
          </StoryFrame>
        </StoryCell>
      ))}
    </StoryStack>
  ),
}
