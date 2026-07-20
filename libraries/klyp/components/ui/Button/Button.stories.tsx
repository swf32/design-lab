import { Fragment, useEffect, useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { Slider } from '../Slider'
import { Button, type ButtonState } from './Button'

// Local story-only layout helper (ui/primitives was removed in the 2026-06-12
// DS cleanup — Button.stories was its last consumer).
const Cluster = ({ gap: _gap, children }: { gap?: string; children?: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>{children}</div>
)

const meta = {
  title: 'UI / Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Submit',
    // Playground shows ONE state at a time, so fit the width to the current
    // state (no trailing dead-space). The real component default is fixed —
    // see the "fixed vs fluid width" story for the locked behaviour.
    fluidWidth: true,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link', 'accent'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    glow: {
      control: 'inline-radio',
      options: ['accent', 'neutral'],
    },
    state: {
      // `none` maps to `undefined` (no state machine — the plain static
      // button). Storybook-canonical `options` (string keys) + `mapping`
      // (key → real value) + `control.labels` (display text), so a
      // non-string value never lands raw in the select.
      options: ['none', 'idle', 'processing', 'success', 'error'],
      mapping: { none: undefined },
      control: { type: 'select', labels: { none: '— none (static)' } },
    },
    quietState: { control: 'boolean' },
    fluidWidth: { control: 'boolean' },
    animateWidth: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    fill: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'primary' },
}

export const Variants: Story = {
  render: () => (
    <Cluster gap="sm">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button variant="accent">Accent</Button>
    </Cluster>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Cluster gap="sm">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </Cluster>
  ),
}

/**
 * States × variants matrix — every variant shown in the states that
 * actually render WITHOUT interaction: default, processing (animated
 * spinner via `state='processing'`), disabled. So a consumer sees how
 * secondary / outline / ghost / destructive / link each look busy +
 * disabled, not just primary.
 *
 * Hover / pressed / focus-visible are deliberately NOT here: React Aria
 * owns those `data-*` attributes (writes them only on real interaction)
 * and strips any forced value — a static tile would just duplicate
 * Default and mislead. Hover the buttons in the catalog to see them live.
 */
const STATE_VARIANTS = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
  'accent',
] as const
const STATE_COLUMNS = ['Default', 'Processing', 'Disabled'] as const

const ColLabel = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontSize: 11, opacity: 0.7 }}>{children}</code>
)

export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(3, max-content)',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <span />
      {STATE_COLUMNS.map((c) => (
        <ColLabel key={c}>{c}</ColLabel>
      ))}
      {STATE_VARIANTS.map((variant) => (
        <Fragment key={variant}>
          <ColLabel>{variant}</ColLabel>
          <Button variant={variant}>Button</Button>
          <Button variant={variant} state="processing" labels={{ processing: 'Button' }}>
            Button
          </Button>
          <Button variant={variant} isDisabled>
            Button
          </Button>
        </Fragment>
      ))}
    </div>
  ),
}

/**
 * `glow` — swaps the colour of the accent variant's glow treatment (radial
 * bg + inset inner-glow): `accent` (default) is the brand accent (gold klyp
 * / blue unreals), `neutral` is white-alpha — reads as a silver/gray glow
 * on the dark surface. Same geometry, same hover brighten; only the glow
 * colour changes. Ignored by every other variant.
 */
export const AccentGlow: Story = {
  name: 'Accent — glow colour',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto max-content',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <ColLabel>accent (default)</ColLabel>
      <Button variant="accent">Generate</Button>
      <ColLabel>neutral</ColLabel>
      <Button variant="accent" glow="neutral">
        Generate
      </Button>
    </div>
  ),
}

/**
 * Icon-square sizes — `size="icon"` renders a 40×40 square (icon-xs/sm/lg
 * give the smaller/larger squares). Icon child only, no text label.
 */
export const Icon: Story = {
  render: () => (
    <Cluster gap="sm">
      {/* No explicit icon px — the button sizes its `> svg` per `data-size`*/}
      {/* via `--icon-size-*` tokens. Just drop the glyph in.*/}
      <Button size="icon-xs" aria-label="Sparkle">
        <SparkleIcon />
      </Button>
      <Button size="icon-sm" aria-label="Sparkle">
        <SparkleIcon />
      </Button>
      <Button size="icon" aria-label="Sparkle">
        <SparkleIcon />
      </Button>
      <Button size="icon-lg" aria-label="Sparkle">
        <SparkleIcon />
      </Button>
    </Cluster>
  ),
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  // Corrected geometry — the previous star was visually off-centre.
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M9.96745 3.2998L11.7091 8.2248L16.6341 9.96647L11.7091 11.7081L9.96745 16.6331L8.22578 11.7081L3.30078 9.96647L8.22578 8.2248L9.96745 3.2998Z"
        stroke="currentColor"
        strokeWidth={1.33333}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Prefix / suffix icons — `iconLeft` sits before the label, `iconRight`
 * after. Use either or both. The gap is the button's own token gap.
 */
export const PrefixSuffix: Story = {
  render: () => (
    <Cluster gap="sm">
      <Button iconLeft={SparkleIcon}>Prefix</Button>
      <Button iconRight={ArrowRight}>Suffix</Button>
      <Button iconLeft={SparkleIcon} iconRight={ArrowRight}>
        Both
      </Button>
      <Button iconRight={ArrowRight} variant="outline">
        Continue
      </Button>
    </Cluster>
  ),
}

/**
 * State-machine mode: each click cycles
 * idle → processing → success / error → idle. The BUTTON width locks to
 * the widest state's content, and the icon + label stay centred as one
 * group — so when the label length changes they re-centre together and
 * the gap between them never changes. The morphing icon follows the side
 * you give it: `iconLeft` → morphs on the left, `iconRight` → on the right.
 */
export const StateMachine: Story = {
  render: () => {
    const [left, setLeft] = useState<ButtonState>('idle')
    const [right, setRight] = useState<ButtonState>('idle')
    const run = (set: (s: ButtonState) => void, current: ButtonState) => {
      if (current !== 'idle') return
      set('processing')
      setTimeout(() => {
        set(Math.random() > 0.5 ? 'success' : 'error')
        setTimeout(() => set('idle'), 1400)
      }, 1200)
    }
    return (
      <Cluster gap="sm">
        <Button state={left} iconLeft={SparkleIcon} onPress={() => run(setLeft, left)}>
          Generate
        </Button>
        <Button state={right} iconRight={SparkleIcon} onPress={() => run(setRight, right)}>
          Generate
        </Button>
      </Cluster>
    )
  },
}

/**
 * State-machine auto-advance — realistic submit simulation. Click →
 * processing 1.5s → success/error 1.4s → back to idle. This is the shape
 * of a typical async handler; in real code the transitions wrap a
 * `try/await/catch` around the actual mutation. Watch the icon swap
 * (spinner → check/cross) and label re-centre as one group.
 */
export const StateMachineAutoFlow: Story = {
  name: 'State machine — auto-advance flow',
  render: () => {
    const [state, setState] = useState<ButtonState>('idle')
    useEffect(() => {
      if (state === 'idle') return
      if (state === 'processing') {
        const id = setTimeout(() => setState(Math.random() > 0.5 ? 'success' : 'error'), 1500)
        return () => clearTimeout(id)
      }
      const id = setTimeout(() => setState('idle'), 1400)
      return () => clearTimeout(id)
    }, [state])
    return (
      <Button state={state} iconLeft={SparkleIcon} onPress={() => setState('processing')}>
        Generate
      </Button>
    )
  },
}

/**
 * All four states side-by-side — the real component, no DOM mocks. The
 * spinner is actually rotating, the check is mid-draw on mount, the error
 * is mid-shake. Left column morphs the prefix icon, right column the
 * suffix — same machine, mirrored slot.
 */
export const StateMachineGrid: Story = {
  name: 'State machine — states grid',
  render: () => {
    const states: ButtonState[] = ['idle', 'processing', 'success', 'error']
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto max-content max-content',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span />
        <ColLabel>iconLeft</ColLabel>
        <ColLabel>iconRight</ColLabel>
        {states.map((s) => (
          <Fragment key={s}>
            <ColLabel>{s}</ColLabel>
            <Button state={s} iconLeft={SparkleIcon}>
              Generate
            </Button>
            <Button state={s} iconRight={SparkleIcon}>
              Generate
            </Button>
          </Fragment>
        ))}
      </div>
    )
  },
}

/**
 * `quietState` — suppresses the success pop (1.2× scale) and error shake
 * (±6px) while keeping the icon + label swap. Use in paired layouts
 * (input + Send) where a scaling/shaking button breaks alignment with the
 * sibling control. Top button is loud (default), bottom is quiet — state
 * is shared, so one click advances both.
 */
export const QuietState: Story = {
  name: 'State machine — quiet (no pop/shake)',
  render: () => {
    const [state, setState] = useState<ButtonState>('idle')
    const run = () => {
      if (state !== 'idle') return
      setState('processing')
      setTimeout(() => {
        setState(Math.random() > 0.5 ? 'success' : 'error')
        setTimeout(() => setState('idle'), 1400)
      }, 1200)
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ColLabel>loud</ColLabel>
          <Button state={state} iconLeft={SparkleIcon} onPress={run}>
            Generate
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ColLabel>quiet</ColLabel>
          <Button state={state} quietState iconLeft={SparkleIcon} onPress={run}>
            Generate
          </Button>
        </div>
      </div>
    )
  },
}

/**
 * `fluidWidth` — fixed (default) vs fluid width in state-machine mode. Top
 * button locks to the widest state (no reflow); bottom springs to fit the
 * current state, like MeshButton — it visibly grows/shrinks as the label
 * changes. State is shared, so one click advances both and the delta is
 * obvious. Labels are deliberately contrasting (`Go` vs `Sending message…`).
 */
export const FluidWidth: Story = {
  name: 'State machine — fixed vs fluid width',
  render: () => {
    const [state, setState] = useState<ButtonState>('idle')
    const demoLabels = {
      idle: 'Go',
      processing: 'Sending message…',
      success: 'Sent!',
      error: 'Failed',
    }
    const advance = () =>
      setState((s) =>
        s === 'idle'
          ? 'processing'
          : s === 'processing'
            ? 'success'
            : s === 'success'
              ? 'error'
              : 'idle',
      )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ColLabel>fixed</ColLabel>
          <Button state={state} labels={demoLabels} iconLeft={SparkleIcon} onPress={advance}>
            Go
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ColLabel>fluid</ColLabel>
          <Button
            state={state}
            fluidWidth
            labels={demoLabels}
            iconLeft={SparkleIcon}
            onPress={advance}
          >
            Go
          </Button>
        </div>
      </div>
    )
  },
}

/**
 * `fill` — slot-based width: the button stretches to its section (default is
 * inline). `fullWidth` is kept as a deprecated alias. Replaces the
 * per-consumer `& .klyp-Button { width: 100% }` override pattern.
 */
export const Fill: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
      <Button fill iconLeft={SparkleIcon}>
        Continue
      </Button>
      <Button fill iconRight={ArrowRight} variant="outline">
        Use another account
      </Button>
    </div>
  ),
}

/**
 * `fill` truncation — drag the slider to resize the slot. As it gets
 * narrower than the label, the text truncates with an ellipsis while the
 * icon and the padding compensation stay intact.
 */
export const FillTruncate: Story = {
  name: 'Fill — truncation (resizable slot)',
  render: () => {
    const [width, setWidth] = useState(280)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ColLabel>slot width: {width}px</ColLabel>
          <Slider
            aria-label="Slot width"
            min={80}
            max={360}
            value={width}
            onChange={(v) => setWidth(typeof v === 'number' ? v : v[0])}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width }}>
          <Button fill iconLeft={SparkleIcon}>
            Generate a brand new image
          </Button>
          <Button fill iconRight={ArrowRight} variant="outline">
            Continue to the next step
          </Button>
        </div>
      </div>
    )
  },
}

/**
 * `animateWidth` — static button (no state machine) whose width SPRINGS when
 * its content changes. Click to cycle the label through different lengths: the
 * width eases to fit instead of snapping (≈260ms, no overshoot). The second
 * button lives in a 180px slot — when the label can't fit it truncates with an
 * ellipsis while the width still animates up to the cap. Mirrors a picker pill
 * whose summary swaps as you tweak a setting.
 */
export const AnimateWidth: Story = {
  name: 'animateWidth — fluid pill',
  render: () => {
    const labels = ['9:16 · 720p', '16:9 · 1080p', 'Square · 2K', 'Ultra-wide cinematic · 4K HDR']
    const [i, setI] = useState(0)
    const next = () => setI((n) => (n + 1) % labels.length)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <ColLabel>free width — springs to fit (click to cycle)</ColLabel>
          <Button animateWidth variant="secondary" iconLeft={SparkleIcon} onPress={next}>
            {labels[i]}
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <ColLabel>clamped to a 180px slot — long label truncates</ColLabel>
          <div style={{ display: 'flex', minWidth: 0, width: 180 }}>
            <Button animateWidth variant="secondary" iconLeft={SparkleIcon} onPress={next}>
              {labels[i]}
            </Button>
          </div>
        </div>
      </div>
    )
  },
}
