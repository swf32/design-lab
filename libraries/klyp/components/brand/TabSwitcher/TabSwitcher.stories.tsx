import { AudioOutline, EditPencilOutline, ImageOutline, VideoOutline } from '@klyp/icons/outline'
import { Badge } from '@klyp/ui'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { TabSwitcher } from './TabSwitcher'

const meta = {
  title: 'Brand / Atoms / TabSwitcher',
  component: TabSwitcher,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TabSwitcher>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default — three-option modality switcher. The signature use case in
 * Klyp Chat composer (text / image / video). Click an option and watch
 * the thumb FLIP-animate to its new position.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Modality">
        <TabSwitcher.Item value="text">Text</TabSwitcher.Item>
        <TabSwitcher.Item value="image">Image</TabSwitcher.Item>
        <TabSwitcher.Item value="video">Video</TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * Tone — accent. The active pill paints the BRAND ACCENT (`--color-accent`,
 * iris #755DED) with a solid-white active label, instead of the neutral
 * surface-solid pill. Reserved for the chat-composer output-modality switcher;
 * NOT a default for every segmented control (single-accent rule). Pairs with
 * `fullWidth`, as the composer footer uses it.
 */
export const ToneAccent: Story = {
  render: () => {
    const [value, setValue] = useState('video')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Output type" tone="accent">
        <TabSwitcher.Item value="video">Video</TabSwitcher.Item>
        <TabSwitcher.Item value="image">Image</TabSwitcher.Item>
        <TabSwitcher.Item value="text">Text</TabSwitcher.Item>
        <TabSwitcher.Item value="audio">Audio</TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * Sizes — sm / md (default) / lg. Use `md` to align with LabeledSelect
 * chip dropdowns; `sm` for inline filter rows; `lg` for primary
 * segmented controls (e.g. landing pages). Outer pill height = option
 * inner height + 2× --space-2 + 2× --bw-default (see TabSwitcher.scss
 * size variant block for the per-step values).
 */
export const Sizes: Story = {
  render: () => {
    const [a, setA] = useState('a')
    const [b, setB] = useState('b')
    const [c, setC] = useState('c')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TabSwitcher value={a} onValueChange={setA} ariaLabel="Small" size="sm">
          <TabSwitcher.Item value="a">Alpha</TabSwitcher.Item>
          <TabSwitcher.Item value="b">Beta</TabSwitcher.Item>
          <TabSwitcher.Item value="c">Gamma</TabSwitcher.Item>
        </TabSwitcher>
        <TabSwitcher value={b} onValueChange={setB} ariaLabel="Medium" size="md">
          <TabSwitcher.Item value="a">Alpha</TabSwitcher.Item>
          <TabSwitcher.Item value="b">Beta</TabSwitcher.Item>
          <TabSwitcher.Item value="c">Gamma</TabSwitcher.Item>
        </TabSwitcher>
        <TabSwitcher value={c} onValueChange={setC} ariaLabel="Large" size="lg">
          <TabSwitcher.Item value="a">Alpha</TabSwitcher.Item>
          <TabSwitcher.Item value="b">Beta</TabSwitcher.Item>
          <TabSwitcher.Item value="c">Gamma</TabSwitcher.Item>
        </TabSwitcher>
      </div>
    )
  },
}

/**
 * Two options — common case for binary toggles like compiled/raw or
 * monthly/yearly billing. Same visual contract, just two boxes wide.
 */
export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState('monthly')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Billing">
        <TabSwitcher.Item value="monthly">Monthly</TabSwitcher.Item>
        <TabSwitcher.Item value="yearly">Yearly</TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * Many options — five-way filter. Stress-test the layout: thumb still
 * snaps cleanly between adjacent and far-apart options.
 */
export const ManyOptions: Story = {
  render: () => {
    const [value, setValue] = useState('all')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Asset filter">
        <TabSwitcher.Item value="all">All</TabSwitcher.Item>
        <TabSwitcher.Item value="characters">Characters</TabSwitcher.Item>
        <TabSwitcher.Item value="locations">Locations</TabSwitcher.Item>
        <TabSwitcher.Item value="outfits">Outfits</TabSwitcher.Item>
        <TabSwitcher.Item value="vibes">Vibes</TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * WithIcons — each option may pass an Iconsax outline icon via the `icon`
 * prop. Sizing is automatic (sm 14 / md 16 / lg 18 to match font scale),
 * color inherits via `currentColor` so the icon follows the same
 * inactive→hover→active fg treatment as the label. Use this variant when
 * option labels alone don't carry enough semantic weight (modality
 * switchers, view-mode toggles) and you want an at-a-glance glyph.
 */
export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Modality">
        <TabSwitcher.Item value="text" icon={EditPencilOutline}>
          Text
        </TabSwitcher.Item>
        <TabSwitcher.Item value="image" icon={ImageOutline}>
          Image
        </TabSwitcher.Item>
        <TabSwitcher.Item value="video" icon={VideoOutline}>
          Video
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * WithIcons — sizes. Icon dimensions auto-scale with the size variant:
 * sm → 14px, md → 16px, lg → 18px. All three rows share a single state
 * so toggling any one advances the pill on all three simultaneously.
 */
export const WithIconsSizes: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TabSwitcher value={value} onValueChange={setValue} ariaLabel="sm" size="sm">
          <TabSwitcher.Item value="text" icon={EditPencilOutline}>
            Text
          </TabSwitcher.Item>
          <TabSwitcher.Item value="image" icon={ImageOutline}>
            Image
          </TabSwitcher.Item>
          <TabSwitcher.Item value="video" icon={VideoOutline}>
            Video
          </TabSwitcher.Item>
        </TabSwitcher>
        <TabSwitcher value={value} onValueChange={setValue} ariaLabel="md" size="md">
          <TabSwitcher.Item value="text" icon={EditPencilOutline}>
            Text
          </TabSwitcher.Item>
          <TabSwitcher.Item value="image" icon={ImageOutline}>
            Image
          </TabSwitcher.Item>
          <TabSwitcher.Item value="video" icon={VideoOutline}>
            Video
          </TabSwitcher.Item>
        </TabSwitcher>
        <TabSwitcher value={value} onValueChange={setValue} ariaLabel="lg" size="lg">
          <TabSwitcher.Item value="text" icon={EditPencilOutline}>
            Text
          </TabSwitcher.Item>
          <TabSwitcher.Item value="image" icon={ImageOutline}>
            Image
          </TabSwitcher.Item>
          <TabSwitcher.Item value="video" icon={VideoOutline}>
            Video
          </TabSwitcher.Item>
        </TabSwitcher>
      </div>
    )
  },
}

/**
 * ShapePill — `shape='pill'` swaps the outer + inner radii from `--r-card`
 * (12 / 8 px) to `--radius-full`, producing the fully-rounded look used by
 * `<BillingToggle>` Monthly/Annual. Same animation, same sizes — just a
 * different brand cue: "this is a settings toggle" vs the default
 * "this is a navigation tab". No other prop changes.
 */
export const ShapePill: Story = {
  render: () => {
    const [value, setValue] = useState('monthly')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Billing period" shape="pill">
        <TabSwitcher.Item value="monthly">Monthly</TabSwitcher.Item>
        <TabSwitcher.Item value="annual">Annual</TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * ShapePillSizes — pill variant across the size ramp. The shape change
 * is corner-radius only (`--radius-full` outer + inner); heights and
 * paddings match the card variant.
 */
export const ShapePillSizes: Story = {
  render: () => {
    const [a, setA] = useState('a')
    const [b, setB] = useState('b')
    const [c, setC] = useState('c')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TabSwitcher value={a} onValueChange={setA} ariaLabel="Small pill" size="sm" shape="pill">
          <TabSwitcher.Item value="a">Alpha</TabSwitcher.Item>
          <TabSwitcher.Item value="b">Beta</TabSwitcher.Item>
          <TabSwitcher.Item value="c">Gamma</TabSwitcher.Item>
        </TabSwitcher>
        <TabSwitcher value={b} onValueChange={setB} ariaLabel="Medium pill" size="md" shape="pill">
          <TabSwitcher.Item value="a">Alpha</TabSwitcher.Item>
          <TabSwitcher.Item value="b">Beta</TabSwitcher.Item>
          <TabSwitcher.Item value="c">Gamma</TabSwitcher.Item>
        </TabSwitcher>
        <TabSwitcher value={c} onValueChange={setC} ariaLabel="Large pill" size="lg" shape="pill">
          <TabSwitcher.Item value="a">Alpha</TabSwitcher.Item>
          <TabSwitcher.Item value="b">Beta</TabSwitcher.Item>
          <TabSwitcher.Item value="c">Gamma</TabSwitcher.Item>
        </TabSwitcher>
      </div>
    )
  },
}

/**
 * WithBadge — single option carrying a trailing `<Badge>` chip via the
 * `badge` prop. The wrapper handles inline positioning + 6px gap from the
 * label only; the badge styling is fully owned by the consumer (here a
 * `green` solid Badge — match `<BillingToggle>`). When an option has a
 * badge, SCSS tightens trailing padding to 4px so the chip sits with
 * uniform breathing room inside the inner pill.
 */
export const WithBadge: Story = {
  render: () => {
    const [value, setValue] = useState('annual')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Billing period">
        <TabSwitcher.Item value="monthly">Monthly</TabSwitcher.Item>
        <TabSwitcher.Item
          value="annual"
          badge={
            <Badge intent="green" variant="solid" size="md">
              Save 10%
            </Badge>
          }
        >
          Annual
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * MixedBadge — card-shape variant with multiple options where only some
 * carry a badge. Demonstrates that badge presence is per-item (no global
 * toggle) and that `data-has-badge` only tightens the offending option's
 * trailing padding — siblings keep the standard label rhythm. Gold badge
 * picked here for visual contrast against the green "savings" cue.
 */
export const MixedBadge: Story = {
  render: () => {
    const [value, setValue] = useState('pro')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Plan tier">
        <TabSwitcher.Item value="free">Free</TabSwitcher.Item>
        <TabSwitcher.Item
          value="pro"
          badge={
            <Badge intent="gold" variant="solid" size="md">
              Popular
            </Badge>
          }
        >
          Pro
        </TabSwitcher.Item>
        <TabSwitcher.Item
          value="team"
          badge={
            <Badge intent="purple" variant="solid" size="md">
              New
            </Badge>
          }
        >
          Team
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * DisabledSoon — the "coming soon" pattern: an option locked with
 * `isDisabled` (forwards to the RAC toggle — not selectable, `data-disabled`
 * dims it via --opacity-50) plus a gray subtle `<Badge>` naming why. Shipping
 * consumer: the chat top-bar Chat/Create surface switcher, where Create is
 * announced before the generation-grid mode exists.
 */
export const DisabledSoon: Story = {
  render: () => {
    const [value, setValue] = useState('chat')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Surface mode">
        <TabSwitcher.Item value="chat">Chat</TabSwitcher.Item>
        <TabSwitcher.Item
          value="create"
          isDisabled
          badge={
            <Badge intent="gray" variant="subtle" size="sm">
              Soon
            </Badge>
          }
        >
          Create
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * BillingToggleLook — pill-shape + a single Annual badge. This is the exact
 * composition `<BillingToggle>` ships in pricing pages. Kept here as a
 * canonical reference so designers and engineers can see the full
 * "fully-rounded + savings chip" pattern without opening BillingToggle's
 * own page.
 */
export const BillingToggleLook: Story = {
  render: () => {
    const [value, setValue] = useState('annual')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Billing period" shape="pill">
        <TabSwitcher.Item value="monthly">Monthly</TabSwitcher.Item>
        <TabSwitcher.Item
          value="annual"
          badge={
            <Badge intent="green" variant="solid" size="md">
              Save 20%
            </Badge>
          }
        >
          Annual
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * IconAndBadge — full slot combo: leading icon + label + trailing badge.
 * Layout reads left-to-right with 4px gap between icon and label and a 6px
 * gap before the badge. Useful when an option needs both a glyph affordance
 * (modality) and a status cue (new/beta/popular).
 */
export const IconAndBadge: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Modality">
        <TabSwitcher.Item value="text" icon={EditPencilOutline}>
          Text
        </TabSwitcher.Item>
        <TabSwitcher.Item
          value="image"
          icon={ImageOutline}
          badge={
            <Badge intent="gold" variant="solid" size="md">
              Pro
            </Badge>
          }
        >
          Image
        </TabSwitcher.Item>
        <TabSwitcher.Item
          value="video"
          icon={VideoOutline}
          badge={
            <Badge intent="purple" variant="solid" size="md">
              New
            </Badge>
          }
        >
          Video
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * FullWidth — slot-based layout. Outer pill stretches to fill its parent
 * (`flex: 1 1 0` per option, `min-width: 0` to prevent flex-min-content
 * blowout). Used in `<ModelPickerModal>` category row where the switcher
 * has to align with a fixed-width modal column. Parent must declare a
 * width — otherwise `fullWidth` has nothing to fill against. Demoed here
 * inside a 480px container.
 */
export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <div style={{ width: 480 }}>
        <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Asset modality" fullWidth>
          <TabSwitcher.Item value="all">All</TabSwitcher.Item>
          <TabSwitcher.Item value="text">Text</TabSwitcher.Item>
          <TabSwitcher.Item value="image">Image</TabSwitcher.Item>
          <TabSwitcher.Item value="video">Video</TabSwitcher.Item>
        </TabSwitcher>
      </div>
    )
  },
}

/**
 * FullWidthLongLabels — equal-width slots + labels longer than their slot.
 * SCSS truncates with `text-overflow: ellipsis` rather than allowing the
 * pill to overflow horizontally or wrap. Pair this with a narrower parent
 * (here 380px) to see the truncation kick in on at least one label.
 */
export const FullWidthLongLabels: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <div style={{ width: 380 }}>
        <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Generation kind" fullWidth>
          <TabSwitcher.Item value="text" icon={EditPencilOutline}>
            Text generation
          </TabSwitcher.Item>
          <TabSwitcher.Item value="image" icon={ImageOutline}>
            Photorealistic
          </TabSwitcher.Item>
          <TabSwitcher.Item value="video" icon={VideoOutline}>
            Cinematic video
          </TabSwitcher.Item>
          <TabSwitcher.Item value="audio" icon={AudioOutline}>
            Audio voiceover
          </TabSwitcher.Item>
        </TabSwitcher>
      </div>
    )
  },
}

/**
 * IconOnly — icon-only segmented control. Labels stay in the DOM for
 * screen readers but are visually hidden; each option surfaces its label
 * via a `<Tooltip>` on hover/focus (300ms delay). Used in the `/library`
 * toolbar so the filter row collapses to a compact icon strip.
 */
export const IconOnly: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Modality" iconOnly>
        <TabSwitcher.Item value="text" icon={EditPencilOutline}>
          Text
        </TabSwitcher.Item>
        <TabSwitcher.Item value="image" icon={ImageOutline}>
          Image
        </TabSwitcher.Item>
        <TabSwitcher.Item value="video" icon={VideoOutline}>
          Video
        </TabSwitcher.Item>
        <TabSwitcher.Item value="audio" icon={AudioOutline}>
          Audio
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}

/**
 * DisabledItem — one option is gated via `isDisabled` (forwarded straight
 * to the underlying RAC `ToggleButton`). The disabled option renders at
 * `--opacity-50`, cursor flips to `not-allowed`, keyboard arrow nav skips
 * it, and clicks are inert. Other options stay fully interactive — the
 * selection model is unaffected.
 */
export const DisabledItem: Story = {
  render: () => {
    const [value, setValue] = useState('image')
    return (
      <TabSwitcher value={value} onValueChange={setValue} ariaLabel="Modality">
        <TabSwitcher.Item value="text" icon={EditPencilOutline}>
          Text
        </TabSwitcher.Item>
        <TabSwitcher.Item value="image" icon={ImageOutline}>
          Image
        </TabSwitcher.Item>
        <TabSwitcher.Item value="video" icon={VideoOutline} isDisabled>
          Video (coming soon)
        </TabSwitcher.Item>
      </TabSwitcher>
    )
  },
}
