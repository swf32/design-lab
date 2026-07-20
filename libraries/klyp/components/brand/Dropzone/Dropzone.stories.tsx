import { UploadOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Dropzone } from './Dropzone'

const meta = {
  title: 'Brand / Atoms / Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 360 }}>{children}</div>
)

export const Default: Story = {
  render: () => (
    <Frame>
      <Dropzone
        onDropFiles={(files) => console.log(files)}
        label="Drop files here"
        hint="PNG, JPG, WEBP up to 10 MB"
      />
    </Frame>
  ),
}

/**
 * Three content configurations — bare label, label + hint, fully
 * custom inner content via the `children` slot.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <Dropzone onDropFiles={() => {}} label="Bare label" />
      <Dropzone onDropFiles={() => {}} label="Label + hint" hint="Hint line under the label" />
      <Dropzone onDropFiles={() => {}}>
        <strong>Custom inner content</strong>
        <span>via the children slot</span>
      </Dropzone>
    </div>
  ),
}

/**
 * `children` slot composes icon + copy + a real `<Button>` action.
 *
 * The Dropzone root listens for clicks AND drops on the whole surface,
 * so any descendant click bubbles up and opens the file picker. The
 * inner Button is for keyboard users (Dropzone here passes `noKeyboard`)
 * and as an explicit visual affordance — drag-drop still works on the
 * surrounding dashed area.
 *
 * This is the pattern used by the chat composer's library-picker modal
 * (`apps/web/src/features/chat/components/library-picker-modal.tsx`).
 */
export const WithAction: Story = {
  render: () => (
    <Frame>
      <Dropzone
        onDropFiles={(files) => console.log(files)}
        accept={{ 'image/*': [] }}
        multiple
        noKeyboard
      >
        <UploadOutline width={32} height={32} aria-hidden="true" />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-fg-primary)' }}>
          Drop an image or upload your own media
        </p>
        <Button variant="outline">Upload an image</Button>
      </Dropzone>
    </Frame>
  ),
}

/**
 * Default state vs. disabled vs. accept/multiple constraints.
 * Drag-over and reject visuals are exercised at runtime — pull a
 * file onto each zone to see them.
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <Dropzone onDropFiles={() => {}} label="Default" />
      <Dropzone onDropFiles={() => {}} disabled label="Disabled" />
      <Dropzone
        onDropFiles={() => {}}
        accept={{ 'image/*': [] }}
        multiple
        label="Image-only, multiple"
        hint="Drag-drop or click to pick"
      />
    </div>
  ),
}
