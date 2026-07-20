import {
  CopyOutline,
  EditPencilOutline,
  RotateCcwOutline,
  SendUpOutline,
} from '@klyp/icons/outline'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { StoryCell, StoryFrame, StoryRow, StoryStack } from '../__shared/story-layout'
import { ToolButton } from '../ToolButton'
import { Toolbar } from './Toolbar'

// Default children for the playground preview — a 3-action row. `children`
// isn't a live control (it's a ReactNode), so it's supplied as a default arg.
const demoChildren = (
  <>
    <ToolButton icon={CopyOutline} label="Copy" />
    <ToolButton icon={EditPencilOutline} label="Edit" />
    <ToolButton icon={RotateCcwOutline} label="Regenerate" />
  </>
)

const meta = {
  component: Toolbar,
  title: 'UI / Toolbar',
  tags: ['autodocs'],
  args: {
    'aria-label': 'Demo toolbar',
    orientation: 'horizontal',
    children: demoChildren,
  },
  argTypes: {
    'aria-label': { control: 'text' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

/** Default — a flat roving-focus row of actions. */
export const Default: Story = {}

/**
 * Grouped — `<Toolbar.Group>` clusters actions; the gap between groups is the
 * only separation (no divider). Roving focus still cycles across all buttons.
 */
export const Grouped: Story = {
  render: (args) => (
    <Toolbar {...args} aria-label="Grouped toolbar">
      <Toolbar.Group>
        <ToolButton icon={CopyOutline} label="Copy" />
        <ToolButton icon={SendUpOutline} label="Use as prompt" />
      </Toolbar.Group>
      <Toolbar.Group>
        <ToolButton icon={EditPencilOutline} label="Edit" />
        <ToolButton icon={RotateCcwOutline} label="Regenerate" />
      </Toolbar.Group>
    </Toolbar>
  ),
}

/** Orientation — horizontal (default) vs vertical stacking. */
export const Orientation: Story = {
  render: () => (
    <StoryRow gap="xl">
      {(['horizontal', 'vertical'] as const).map((orientation) => (
        <StoryCell key={orientation} label={orientation}>
          <Toolbar aria-label={`${orientation} toolbar`} orientation={orientation}>
            <ToolButton icon={CopyOutline} label="Copy" />
            <ToolButton icon={EditPencilOutline} label="Edit" />
            <ToolButton icon={RotateCcwOutline} label="Regenerate" />
          </Toolbar>
        </StoryCell>
      ))}
    </StoryRow>
  ),
}

/**
 * Roving focus — the primitive's reason to exist. Tab moves focus INTO the
 * toolbar (one tab-stop), then ← / → (or ↑ / ↓ when vertical) move between
 * actions; Tab again exits. Click in and try the arrow keys.
 */
export const RovingFocus: Story = {
  render: () => (
    <StoryCell label="Tab in → ← / → between actions → Tab out">
      <Toolbar aria-label="Roving-focus demo">
        <ToolButton icon={CopyOutline} label="Copy" />
        <ToolButton icon={SendUpOutline} label="Use as prompt" />
        <ToolButton icon={EditPencilOutline} label="Edit" />
        <ToolButton icon={RotateCcwOutline} label="Regenerate" />
      </Toolbar>
    </StoryCell>
  ),
}

/** Adaptive — the row holds its rhythm at 280 / 600 / 1200px container widths. */
export const Adaptive: Story = {
  render: () => (
    <StoryStack gap="md">
      {[280, 600, 1200].map((w) => (
        <StoryCell key={w} label={`${w}px`}>
          <StoryFrame width={w}>
            <Toolbar aria-label={`At ${w}px`}>
              <ToolButton icon={CopyOutline} label="Copy" />
              <ToolButton icon={EditPencilOutline} label="Edit" />
              <ToolButton icon={RotateCcwOutline} label="Regenerate" />
            </Toolbar>
          </StoryFrame>
        </StoryCell>
      ))}
    </StoryStack>
  ),
}
