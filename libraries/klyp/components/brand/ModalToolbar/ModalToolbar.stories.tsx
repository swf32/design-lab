import { Button } from '@klyp/ui/Button'
import { SearchField } from '@klyp/ui/SearchField'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { ModalToolbar } from './ModalToolbar'

const meta = {
  title: 'Brand / Molecules / ModalToolbar',
  component: ModalToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof ModalToolbar>

export default meta
type Story = StoryObj<typeof meta>

// A representative filter cluster (left slot) — reads like the LibraryPicker
// toolbar it was extracted from: a few section chips + a Filters control.
const controls = (
  <>
    <Button variant="secondary" size="sm">
      All
    </Button>
    <Button variant="secondary" size="sm">
      Images
    </Button>
    <Button variant="secondary" size="sm">
      Video
    </Button>
    <Button variant="secondary" size="sm">
      Filters
    </Button>
  </>
)

const search = <SearchField size="lg" variant="outline" aria-label="Search" placeholder="Search" />

// ⚠️ ModalToolbar is `container-type: inline-size` — it has NO intrinsic width and
// flips its own layout off its OWN width. So every story MUST give it a DEFINITE
// `width` frame (NOT just `max-width`, which leaves the width indefinite — the
// container then collapses to ~0 in the catalog's flex stage and mis-fires the
// query into the stacked mobile layout). Same fixed-`width` decorator pattern as
// AssetCard. In production LibraryPicker's header / sheet supplies the width.

// Default — desktop layout (container ≥ 640px): the control cluster fills the
// left, the search pins right at its fixed width.
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 760 }}>
      <ModalToolbar {...args} />
    </div>
  ),
  args: { controls, search },
}

// Spacious — a wide (920px) container; the controls-left / search-right split is
// at its roomiest.
export const Spacious: Story = {
  render: (args) => (
    <div style={{ width: 920 }}>
      <ModalToolbar {...args} />
    </div>
  ),
  args: { controls, search },
}

// Compact — a narrow (360px) container (mobile / sheet): the controls stack on
// top as a wrapping row, the search drops full-width below.
export const Compact: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <ModalToolbar {...args} />
    </div>
  ),
  args: { controls, search },
}

// Adaptive — the SAME toolbar at three container widths, stacked top-to-bottom,
// so the 640px flip (row ⇄ stacked) is visible in a single shot.
export const Adaptive: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {[880, 600, 360].map((w) => (
        <div key={w} style={{ width: w }}>
          <div
            style={{
              fontSize: 11,
              marginBottom: 8,
              fontVariantNumeric: 'tabular-nums',
              opacity: 0.6,
            }}
          >
            {w}px
          </div>
          <ModalToolbar {...args} />
        </div>
      ))}
    </div>
  ),
  args: { controls, search },
}
