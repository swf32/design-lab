import type { Meta, StoryObj } from '../__shared/stories-types'
import { Radio, RadioGroup } from './RadioGroup'

const meta = {
  title: 'UI / RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup aria-label="Favourite frame" defaultValue="wide">
      <Radio value="wide">Wide</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="close">Close-up</Radio>
    </RadioGroup>
  ),
}

// NOTE — composition, NOT a RadioGroup prop. The `card` variant is a
// composition: `<Radio data-variant="card">` + a card body. In production
// that body is `<SelectableCard>` from `@klyp/brand` (a tier above `@klyp/ui`),
// which renders the selection indicator top-right. This story can't import
// brand (tier boundary), so the body + top-right radio indicator are inlined
// here purely to show the shape — the real composition lives at the
// SelectableCard catalog page. Named `Composition — …` so the catalog doesn't
// read it as RadioGroup's own API.
export const CompositionCard: Story = {
  name: 'Composition — card',
  render: () => (
    <div style={{ width: 480 }}>
      <style>{`
        /* Lay the card body out as a vertical stack, left-aligned. The base
         * .klyp-Radio is flex-row/center; the card variant needs a column. */
        .klyp-Radio[data-variant='card'] {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-4);
          /* Reserve room on the right so text never runs under the indicator. */
          padding-right: var(--space-40);
        }
        .klyp-Radio-storyInd {
          position: absolute;
          top: var(--space-12);
          right: var(--space-12);
          width: var(--icon-size-sm);
          height: var(--icon-size-sm);
          border: var(--bw-default) solid var(--color-border-default);
          border-radius: var(--radius-full);
        }
        .klyp-Radio[data-selected] .klyp-Radio-storyInd {
          border-color: var(--color-fg-primary);
          background: var(--color-fg-primary);
          box-shadow: inset 0 0 0 var(--space-4) var(--color-bg-root);
        }
        .klyp-Radio-storyTitle { font-weight: var(--font-weight-medium); }
        .klyp-Radio-storyDesc { color: var(--color-fg-muted); }
      `}</style>
      <RadioGroup aria-label="Use mode" defaultValue="solo" layout="grid">
        <Radio value="solo" data-variant="card">
          <span className="klyp-Radio-storyInd" aria-hidden />
          <span className="klyp-Radio-storyTitle">Solo</span>
          <span className="klyp-Radio-storyDesc">Just me, exploring serial AI content.</span>
        </Radio>
        <Radio value="team" data-variant="card">
          <span className="klyp-Radio-storyInd" aria-hidden />
          <span className="klyp-Radio-storyTitle">With my team</span>
          <span className="klyp-Radio-storyDesc">Collaborating on series and episodes.</span>
        </Radio>
      </RadioGroup>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup aria-label="Frozen" defaultValue="b" isDisabled>
      <Radio value="a">First option</Radio>
      <Radio value="b">Second option</Radio>
      <Radio value="c">Third option</Radio>
    </RadioGroup>
  ),
}
