import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { PickerCard } from './PickerCard'

// =====================================================================
// PickerCard stories
// =====================================================================
// Visual A/B with the live currency picker in the Withdraw drawer:
// `apps/web/src/features/referrals/withdraw/shared/components/add-wallet-form.tsx`
// (`__currencyCard`). Logos here are flat placeholders — the real
// callsite renders <CryptoLogo /> at 32px; same footprint.
// =====================================================================

const LogoUsdt = (
  <div
    style={{
      width: 32,
      height: 32,
      background: '#26A17B',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 500,
      fontSize: 13,
    }}
  >
    ₮
  </div>
)

const LogoUsdc = (
  <div
    style={{
      width: 32,
      height: 32,
      background: '#3E73C4',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 500,
      fontSize: 13,
    }}
  >
    $
  </div>
)

const meta = {
  title: 'Brand / Atoms / PickerCard',
  component: PickerCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
  },
} satisfies Meta<typeof PickerCard>

export default meta
type Story = StoryObj<typeof meta>

/** Single tile — default (horizontal layout, idle state). */
export const Default: Story = {
  args: {
    id: 'usdt',
    label: 'USDT',
    sub: 'Tether',
    visual: LogoUsdt,
  },
}

/** Selected state — surface-solid background + neutral white radio dot.
 * Gold accent is reserved for primary CTAs (single-accent rule). */
export const Selected: Story = {
  args: {
    id: 'usdt',
    label: 'USDT',
    sub: 'Tether',
    visual: LogoUsdt,
    selected: true,
  },
}

/** Vertical layout — visual stacked above label (chip-grid form). */
export const Vertical: Story = {
  args: {
    id: 'usdt',
    label: 'USDT',
    sub: 'Tether',
    visual: LogoUsdt,
    layout: 'vertical',
  },
}

/** Padding scale — sm / md / lg. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 280 }}>
      <PickerCard id="s1" label="Small" sub="compact" visual={LogoUsdt} size="sm" />
      <PickerCard id="s2" label="Medium" sub="default" visual={LogoUsdt} size="md" />
      <PickerCard id="s3" label="Large" sub="spacious" visual={LogoUsdt} size="lg" />
    </div>
  ),
}

/** Every visual state side-by-side — review aid. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 280 }}>
      <PickerCard id="st-idle" label="Idle" sub="default state" visual={LogoUsdt} />
      <PickerCard
        id="st-sel"
        label="Selected"
        sub="surface-solid + radio dot"
        visual={LogoUsdt}
        selected
      />
      <PickerCard id="st-dis" label="Disabled" sub="non-interactive" visual={LogoUsdt} disabled />
      <PickerCard
        id="st-dis-sel"
        label="Disabled + selected"
        sub="locked choice"
        visual={LogoUsdt}
        selected
        disabled
      />
    </div>
  ),
}

/** Disabled — non-interactive, 50% opacity. */
export const Disabled: Story = {
  args: {
    id: 'locked',
    label: 'Locked',
    sub: 'Coming soon',
    visual: LogoUsdt,
    disabled: true,
  },
}

/** Two cards composed inside a `<div role="radiogroup">`. */
export const InRadioGroup: Story = {
  render: () => {
    const [sel, setSel] = useState<'usdt' | 'usdc'>('usdt')
    return (
      <div
        role="radiogroup"
        aria-label="Currency"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: 480 }}
      >
        <PickerCard
          id="usdt"
          label="USDT"
          sub="Tether"
          visual={LogoUsdt}
          selected={sel === 'usdt'}
          onSelect={() => setSel('usdt')}
        />
        <PickerCard
          id="usdc"
          label="USDC"
          sub="USD Coin"
          visual={LogoUsdc}
          selected={sel === 'usdc'}
          onSelect={() => setSel('usdc')}
        />
      </div>
    )
  },
}

/** Visual A/B with the Withdraw-drawer "Add wallet" currency picker.
 *
 * Mimics `klyp-withdraw-AddWalletForm__currencyCard` 1:1 — same gap,
 * padding, min-height, depth ladder. Use this story to verify PickerCard
 * matches the production callsite. */
export const WithCryptoLogo: Story = {
  render: () => {
    const [sel, setSel] = useState<'USDT' | 'USDC'>('USDT')
    return (
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span
          style={{
            color: 'var(--color-fg-muted)',
            fontSize: 'var(--font-size-12)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          Currency
        </span>
        <div
          role="radiogroup"
          aria-label="Choose currency"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <PickerCard
            id="ab-usdt"
            label="USDT"
            sub="Tether"
            visual={LogoUsdt}
            selected={sel === 'USDT'}
            onSelect={() => setSel('USDT')}
          />
          <PickerCard
            id="ab-usdc"
            label="USDC"
            sub="USD Coin"
            visual={LogoUsdc}
            selected={sel === 'USDC'}
            onSelect={() => setSel('USDC')}
          />
        </div>
      </div>
    )
  },
}
