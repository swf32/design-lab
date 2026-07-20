import { Button } from '@klyp/ui/Button'
import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { PriceTicker, type PriceTickerProps } from './PriceTicker'
import './PriceTicker.stories.scss'

// =====================================================================
// Catalog story rendering note
// =====================================================================
//
// `PriceTicker` inherits `font-size` from its consumer (production:
// `PricingTierCard.__price` = 28px heading). The catalog renders stories
// via `story.render(args)` and does NOT apply meta-level `decorators`
// (see StoryCard.tsx), so every story wraps the ticker in the
// `.klyp-PriceTicker-story__price` frame to re-create that 28px context —
// otherwise it renders at the bare stage's body size.
//
// Interactive stories return a dedicated component (`<…Demo />`) rather
// than calling hooks inline: StoryCard invokes `story.render(args)` as a
// plain function, so hooks must live inside a real component to obey the
// rules of hooks.

function FrameTicker({ value, previousValue }: PriceTickerProps) {
  return (
    <div className="klyp-PriceTicker-story__frame">
      <span className="klyp-PriceTicker-story__price">
        <PriceTicker value={value} previousValue={previousValue} />
      </span>
    </div>
  )
}

function renderTicker(args: PriceTickerProps) {
  return <FrameTicker {...args} />
}

const meta = {
  component: PriceTicker,
  title: 'Brand / Atoms / PriceTicker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Animated price text used inside `PricingTierCard.__price`. When `value` changes (billing toggle, slider stop, discount applied) the old digits exit fast (140ms ease-in: `opacity→0`, `y→-4px`, `blur 0→2px`) and the new digits enter on the Klyp signature easing (220ms, reverse direction) — asymmetric per Emil Kowalski ("the eye latches onto what arrives"). An optional `previousValue` renders a struck-through chip to the LEFT of the live price (the pre-discount / pre-toggle figure); the root `layout` animates the row width as the chip enters / exits. A `visibility:hidden` sizer span keeps the width stable when the digit count changes (`$169 ↔ $152.10`), and `tabular-nums` keeps digit columns from jittering. Reduced-motion → pure 120ms opacity fade, no transform / no blur. Motion v12 owns all timing (NumberFlow rejected — `motion/react` is already in the stack).',
      },
    },
  },
  args: {
    value: '$26.10',
  },
} satisfies Meta<typeof PriceTicker>

export default meta
type Story = StoryObj<typeof meta>

// ===========================================================================
// 1. Default — resting live price, no strike
// ===========================================================================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The resting state — a single live price, no `previousValue`. Rendered at the production 28px heading size via the story frame. Inherits `font-size` / `font-weight` / `color` from the consumer.',
      },
    },
  },
  render: renderTicker,
}

// ===========================================================================
// 2. WithStrike — discount applied (struck pre-discount chip + live price)
// ===========================================================================

export const WithStrike: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Discount-active state — `previousValue` (`$10`) renders as a struck-through 14px chip to the LEFT of the live `$9`. This is what `PricingTierCard` passes when an offer stack discounts the headline price. The chip slides in from the left and the root `layout` animates the row width to make room.',
      },
    },
  },
  args: {
    value: '$9',
    previousValue: '$10',
  },
  render: renderTicker,
}

// ===========================================================================
// 3. BillingFlip — interactive: Monthly ↔ Annual crossfade
// ===========================================================================
//
// Demonstrates the value crossfade the user sees when toggling the
// Monthly / Annual switch on `/pricing`. Click to flip the price and
// watch the blur+Y crossfade.

function BillingFlipDemo() {
  const ANNUAL = '$26.10'
  const MONTHLY = '$29'
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual')
  const value = period === 'annual' ? ANNUAL : MONTHLY

  return (
    <div className="klyp-PriceTicker-story__frame">
      <span className="klyp-PriceTicker-story__price">
        <PriceTicker value={value} />
      </span>
      <div className="klyp-PriceTicker-story__controls">
        <Button
          variant={period === 'monthly' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setPeriod('monthly')}
        >
          Monthly
        </Button>
        <Button
          variant={period === 'annual' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setPeriod('annual')}
        >
          Annual
        </Button>
      </div>
      <span className="klyp-PriceTicker-story__hint">
        Flip the period — the digits crossfade ($29 ↔ $26.10).
      </span>
    </div>
  )
}

export const BillingFlip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interactive — the Monthly / Annual crossfade. Toggling the period changes `value`; the old price exits up + blurs out while the new price enters down on the Klyp easing. Same behaviour the `/pricing` billing toggle drives across all four tier cards.',
      },
    },
  },
  render: () => <BillingFlipDemo />,
}

// ===========================================================================
// 4. SliderStops — interactive: Studio allowance slider stops
// ===========================================================================
//
// Mirrors the Studio tier's discrete-stop slider: each stop resolves to a
// different price, and moving between stops crossfades the ticker.

const STUDIO_STOPS = ['$152.10', '$179.10', '$215.10', '$242.10']

function SliderStopsDemo() {
  const [stop, setStop] = useState(0)

  return (
    <div className="klyp-PriceTicker-story__frame">
      <span className="klyp-PriceTicker-story__price">
        <PriceTicker value={STUDIO_STOPS[stop]} />
      </span>
      <div className="klyp-PriceTicker-story__controls">
        {STUDIO_STOPS.map((price, i) => (
          <Button
            key={price}
            variant={i === stop ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setStop(i)}
          >
            {`Stop ${i + 1}`}
          </Button>
        ))}
      </div>
      <span className="klyp-PriceTicker-story__hint">
        Move between Studio slider stops — the price crossfades, the width animates on the
        digit-count change ($152.10 → $242.10).
      </span>
    </div>
  )
}

export const SliderStops: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interactive — the allowance-slider use case. Each Studio slider stop resolves to a different price; stepping between stops crossfades the digits and the root `layout` animates the row width when the digit count changes. This is the second place `value` changes on `/pricing` (the first being the billing toggle above).',
      },
    },
  },
  render: () => <SliderStopsDemo />,
}
