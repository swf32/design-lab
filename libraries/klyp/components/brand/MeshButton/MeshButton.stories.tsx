import { MagicStarOutline } from '@klyp/icons/outline'
import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { type BadgeState, MeshButton } from './MeshButton'

const meta = {
  component: MeshButton,
  title: 'Brand / Atoms / MeshButton',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Premium CTA with an always-on golden goo-blob mesh. Use sparingly for primary actions (Submit, Generate, Send). Two modes: **static** (legacy, pass children freely) and **state machine** (`state` prop drives idle → processing → success → error animation with Iconsax icons + label width spring).',
      },
    },
  },
  args: {
    children: 'Generate',
    tone: 'gold',
    size: 'md',
    // Playground shows ONE state at a time, so fit the width to the current
    // state (no trailing dead-space). The real component default is fixed —
    // see the "fluid vs fixed width" story for the locked behaviour.
    fluidWidth: true,
  },
  argTypes: {
    tone: { control: 'select', options: ['gold', 'neutral', 'purple', 'blue'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    state: {
      // `none` → undefined (static mode). String keys + mapping + labels so a
      // non-string value never lands raw in the select.
      options: ['none', 'idle', 'processing', 'success', 'error'],
      mapping: { none: undefined },
      control: { type: 'select', labels: { none: '— none (static)' } },
    },
    busy: { control: 'boolean' },
    active: { control: 'boolean' },
    fill: { control: 'boolean' },
    fluidWidth: { control: 'boolean' },
    quietState: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    iconLeft: { control: false },
    iconRight: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof MeshButton>

export default meta
type Story = StoryObj<typeof meta>

// ===========================================================================
// Helpers
// ===========================================================================

const BADGE_STATES: BadgeState[] = ['idle', 'processing', 'success', 'error']
const nextBadgeState = (s: BadgeState): BadgeState =>
  BADGE_STATES[(BADGE_STATES.indexOf(s) + 1) % BADGE_STATES.length] as BadgeState

// ===========================================================================
// 1. Default — single static button (legacy mode)
// ===========================================================================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The medium-size gold variant, no state machine. This is what you get if you pass nothing but `children`.',
      },
    },
  },
}

// ===========================================================================
// 2. Sizes — sm / md / lg side-by-side
// ===========================================================================

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Five heights: **xs** 24 / **sm** 32 / **md** 40 (default) / **lg** 48 / **xl** 56 px. Padding scales with the size; left padding tightens when an icon sits in front of the label.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <MeshButton size="xs">Extra small</MeshButton>
      <MeshButton size="sm">Small</MeshButton>
      <MeshButton size="md">Medium</MeshButton>
      <MeshButton size="lg">Large</MeshButton>
      <MeshButton size="xl">Extra large</MeshButton>
    </div>
  ),
}

// ===========================================================================
// 3. Tones — gold (default) vs neutral
// ===========================================================================

export const Tones: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Gold is the brand default — use it for one moment-of-truth CTA per screen. Neutral strips the warm hot-spots from the mesh palette for secondary actions that still need the goo-blob feel. Purple swaps the gold hot-spots for Geist purple (900 / 700 / 400) while keeping the silver counterpoint blob — same goo physics, different mood.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <MeshButton tone="gold">Gold (default)</MeshButton>
      <MeshButton tone="neutral">Neutral</MeshButton>
      <MeshButton tone="purple">Purple</MeshButton>
      <MeshButton tone="blue">Blue</MeshButton>
    </div>
  ),
}

// ===========================================================================
// 3b. Prefix / suffix icons (static mode)
// ===========================================================================

export const PrefixSuffix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Static-mode icons via `iconLeft` (prefix) and `iconRight` (suffix). The leading/trailing padding tightens on the icon side (optical compensation), mirroring Button. In state-machine mode the morphing icon is always on the left.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <MeshButton iconLeft={MagicStarOutline}>Prefix</MeshButton>
      <MeshButton iconRight={MagicStarOutline}>Suffix</MeshButton>
      <MeshButton iconLeft={MagicStarOutline} iconRight={MagicStarOutline}>
        Both
      </MeshButton>
    </div>
  ),
}

// ===========================================================================
// 4. States (legacy) — idle / busy / disabled
// ===========================================================================

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Static-mode states: **idle** (mesh drifts 10–14s), **busy** (mesh accelerated 6–9s + `cursor: progress`), **disabled** (mesh hidden, blend stripped, `cursor: not-allowed`). Hover bumps text to full white and adds an inset gold glow.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <MeshButton>Idle</MeshButton>
      <MeshButton busy>Generating…</MeshButton>
      <MeshButton isDisabled>Disabled</MeshButton>
    </div>
  ),
}

// ===========================================================================
// 5. Multi-state — interactive cycle (the main demo)
// ===========================================================================

export const MultiStateDemo: Story = {
  name: 'Multi-state — interactive cycle',
  parameters: {
    docs: {
      description: {
        story:
          'Port of motion.dev "Multi state badge" tutorial. Click cycles **idle → processing → success → error → idle**. Iconsax icons swap with slide+blur, label width springs to fit, error shakes the badge, success pops it by 1.2×. All timings 1:1 from the production bundle.',
      },
    },
  },
  render: () => {
    const [state, setState] = useState<BadgeState>('idle')
    return (
      <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
        <MeshButton
          state={state}
          iconLeft={MagicStarOutline}
          onPress={() => setState(nextBadgeState(state))}
        >
          Generate
        </MeshButton>
      </div>
    )
  },
}

// ===========================================================================
// 6. Multi-state — auto-advance flow (real submit simulation)
// ===========================================================================

export const MultiStateAutoFlow: Story = {
  name: 'Multi-state — auto-advance flow',
  parameters: {
    docs: {
      description: {
        story:
          'Simulates a realistic submit: click → processing for 2s → success for 1.5s → back to idle. This is the shape of a typical async handler; in your code the state transitions wrap a `try/await/catch` around the actual mutation.',
      },
    },
  },
  render: () => {
    const [state, setState] = useState<BadgeState>('idle')
    useEffect(() => {
      if (state === 'idle') return
      if (state === 'processing') {
        const id = setTimeout(() => setState('success'), 2000)
        return () => clearTimeout(id)
      }
      if (state === 'success' || state === 'error') {
        const id = setTimeout(() => setState('idle'), 1500)
        return () => clearTimeout(id)
      }
    }, [state])
    return (
      <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
        <MeshButton
          state={state}
          iconLeft={MagicStarOutline}
          onPress={() => setState('processing')}
        >
          Generate
        </MeshButton>
      </div>
    )
  },
}

// ===========================================================================
// 7. Multi-state — grid (all 4 states side-by-side)
// ===========================================================================

export const MultiStateGrid: Story = {
  name: 'Multi-state — states grid',
  parameters: {
    docs: {
      description: {
        story:
          'All 4 badge states rendered simultaneously — the real component, no DOM mocks. The spinner is actually rotating, the check is mid-draw on every mount, the error is mid-shake. Useful for side-by-side visual review.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      {BADGE_STATES.map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ minWidth: 100, color: 'var(--alpha-white-70)', fontSize: 13 }}>{s}</span>
          <MeshButton state={s} iconLeft={MagicStarOutline}>
            Generate
          </MeshButton>
        </div>
      ))}
    </div>
  ),
}

// ===========================================================================
// 8. Multi-state — fixed width comparison
// ===========================================================================

export const FixedWidth: Story = {
  name: 'Multi-state — fluid vs fixed width',
  parameters: {
    docs: {
      description: {
        story:
          "Top row: **`fluidWidth`** — label width springs to fit each state, button visually grows/shrinks. Bottom row: **fixed (default)** — pre-measures all 4 labels at mount, locks the button to the widest one. Both buttons share the same state machine, so a single click advances both simultaneously — that's how you see the difference. Labels here are deliberately contrasting (`Go` 2 chars vs `Sending message…` 16 chars) so the width delta is obvious. Fixed is the default — opt into `fluidWidth` for standalone CTAs. Naming matches Button.",
      },
    },
  },
  render: () => {
    const [state, setState] = useState<BadgeState>('idle')
    // Contrasting labels to make the fixed-vs-fluid delta highly visible.
    // Default `BADGE_LABELS` give too small a delta (≈30 px) at typical
    // viewport zooms; with these the locked width is unmistakably wider.
    const demoLabels = {
      idle: 'Go',
      processing: 'Sending message…',
      success: 'Sent!',
      error: 'Failed',
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ minWidth: 110, color: 'var(--alpha-white-70)', fontSize: 13 }}>
            fluidWidth
          </span>
          <MeshButton
            state={state}
            labels={demoLabels}
            iconLeft={MagicStarOutline}
            fluidWidth
            onPress={() => setState(nextBadgeState(state))}
          >
            Go
          </MeshButton>
          <span style={{ color: 'var(--alpha-white-50)', fontSize: 12 }}>← width animates</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ minWidth: 110, color: 'var(--alpha-white-70)', fontSize: 13 }}>
            Fixed (default)
          </span>
          <MeshButton
            state={state}
            labels={demoLabels}
            iconLeft={MagicStarOutline}
            onPress={() => setState(nextBadgeState(state))}
          >
            Go
          </MeshButton>
          <span style={{ color: 'var(--alpha-white-50)', fontSize: 12 }}>
            ← locked to widest ("Sending message…")
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            color: 'var(--alpha-white-50)',
            fontSize: 12,
            fontStyle: 'italic',
          }}
        >
          State is shared — one click advances both. Cycle: Go → Sending message… → Sent! → Failed →
          Go.
        </div>
      </div>
    )
  },
}

// ===========================================================================
// 9. Best practices — docs-only (no preview, just rules)
// ===========================================================================

export const BestPractices: Story = {
  name: 'Best practices',
  parameters: {
    docs: {
      description: {
        story: `
**Use for primary actions only.** One MeshButton per screen. The mesh is a "look at me" signal — multiple buttons compete and cheapen the brand. For secondary actions use \`GoldButton\` or a neutral RAC \`<Button>\`.

**State machine is parent-controlled.** The component does not manage its own \`state\` — wire it to your parent state machine:
\`\`\`tsx
const [state, setState] = useState<BadgeState>('idle')
async function onSubmit() {
  setState('processing')
  try { await save(); setState('success') }
  catch { setState('error') }
  finally { setTimeout(() => setState('idle'), 1500) }
}
<MeshButton state={state} onPress={onSubmit} iconLeft={MagicStarOutline}>Generate</MeshButton>
\`\`\`

**Width is fixed by default.** The button pre-measures all 4 labels at mount and locks to the widest, so it never reflows in tight layouts (chat composer, navbar, fixed grid). Opt into \`fluidWidth\` for standalone CTAs where the width should spring to fit each state. (Same prop + default as Button.)

**Icons come from \`@klyp/icons/outline\`.** Use \`iconLeft\` to pass an Iconsax outline icon for the idle state. The state-machine icons (spinner / check / cross) are built-in and visually matched to Iconsax — don't override them via children.

**Don't nest MeshButton inside MeshButton.** Mesh-on-mesh produces visual noise; the goo filter id collides; the parent state machine cascades into the child unintentionally.

**Reduced motion is respected automatically.** The component is wrapped in \`<MotionConfig reducedMotion="user">\` plus a \`useReducedMotion()\` guard on imperative \`animate()\`. Don't add your own motion preference checks on top.

**aria-live is built in.** Error → \`assertive\`, everything else → \`polite\`, with \`aria-atomic="true"\`. Screen readers get every state flip; don't double-announce from your own \`<output>\` element.

**Override labels per call with \`labels\` prop:**
\`\`\`tsx
<MeshButton
  state={state}
  labels={{ idle: 'Send', processing: 'Sending', success: 'Sent', error: 'Failed' }}
/>
\`\`\`
        `,
      },
    },
  },
  render: () => <></>,
}
