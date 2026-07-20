import type { Meta, StoryObj } from '../__shared/stories-types'
import { Button } from '../Button/Button'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet'

const meta = {
  title: 'UI / Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/** All four anchor sides in one place. The single source for side behaviour —
 *  left / right slide horizontally, top / bottom vertically. */
export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger>Open {side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>{side[0].toUpperCase() + side.slice(1)} sheet</SheetTitle>
              <SheetDescription>Anchored to the {side} edge.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

/** Width presets via `size` (left/right). `full` is edge-to-edge; for an exact
 *  one-off width set the `--sheet-width` custom property instead. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg', 'full'] as const).map((size) => (
        <Sheet key={size}>
          <SheetTrigger>Open {size}</SheetTrigger>
          <SheetContent side="right" size={size}>
            <SheetHeader>
              <SheetTitle>Size: {size}</SheetTitle>
              <SheetDescription>Right panel at the {size} width preset.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

/** Header + body + footer, content fits — `<SheetBody>` doesn't scroll, the
 *  footer pins to the bottom. */
export const BodyShort: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger>Open short body</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Not enough content to scroll.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p>A couple of lines of body content. No scrollbar appears.</p>
        </SheetBody>
        <SheetFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** Long body — only `<SheetBody>` scrolls; header + footer stay pinned. */
export const BodyScroll: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger>Open long body</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Long content</SheetTitle>
          <SheetDescription>Body scrolls independently.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} style={{ marginBottom: 12 }}>
              Paragraph {i + 1} — content that exceeds the panel height to demonstrate scroll
              behaviour inside the body region while header/footer stay pinned.
            </p>
          ))}
        </SheetBody>
        <SheetFooter>
          <Button>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

/** Backdrop variants — `blur` (default) / `opaque` / `transparent`. One
 *  button per option; default `blur` is unchanged from before. */
export const Backdrop: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['blur', 'opaque', 'transparent'] as const).map((backdrop) => (
        <Sheet key={backdrop}>
          <SheetTrigger>Open {backdrop}</SheetTrigger>
          <SheetContent side="right" backdrop={backdrop}>
            <SheetHeader>
              <SheetTitle>Backdrop: {backdrop}</SheetTitle>
              <SheetDescription>Scrim treatment behind the panel.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}

/** Close button — opt-in top-right X (like Dialog). Off by default. */
export const WithCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger>Open with close button</SheetTrigger>
      <SheetContent side="right" showCloseButton>
        <SheetHeader>
          <SheetTitle>With close button</SheetTitle>
          <SheetDescription>Top-right X, same as Dialog.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

/** Non-dismissable — backdrop click and Esc are blocked. Use for
 *  destructive / in-flight actions where accidental close would lose work. */
export const NonDismissable: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger>Open locked sheet</SheetTrigger>
      <SheetContent side="right" isDismissable={false}>
        <SheetHeader>
          <SheetTitle>Processing…</SheetTitle>
          <SheetDescription>
            Backdrop click and Esc are disabled. Use an explicit button to close.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button>Cancel job</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}
