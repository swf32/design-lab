import { useState } from 'react'

import type { Meta, StoryObj } from '../__shared/stories-types'
import { WalletRow } from './WalletRow'

const meta = {
  title: 'Brand / Molecules / WalletRow',
  component: WalletRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WalletRow>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Placeholder logo node — stories DO NOT import `@klyp/brand/CryptoLogo`
 * directly to avoid a parallel-build cycle. Consumers in real callsites
 * pass `<CryptoLogo ticker="USDT" withNetworkBadge="TRC20" />` as the
 * `logo` prop; here we render a colored circle to keep the story file
 * self-contained.
 */
const LogoStub = ({ color = '#26A17B' }: { color?: string }) => (
  <div
    style={{
      width: 32,
      height: 32,
      background: color,
      borderRadius: '50%',
    }}
  />
)

export const Default: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <WalletRow
        id="w1"
        name="Main wallet"
        ticker="USDT"
        network="TRC20"
        addressTail="TXyZ…k9Lm"
        logo={<LogoStub />}
      />
    </div>
  ),
}

export const Selected: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <WalletRow
        id="w2"
        name="Main wallet"
        ticker="USDT"
        network="TRC20"
        addressTail="TXyZ…k9Lm"
        logo={<LogoStub />}
        selected
      />
    </div>
  ),
}

export const WithDefault: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <WalletRow
        id="w3"
        name="Main wallet"
        ticker="USDT"
        network="TRC20"
        addressTail="TXyZ…k9Lm"
        logo={<LogoStub />}
        isDefault
        selected
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <WalletRow
        id="w4"
        name="Frozen wallet"
        ticker="USDC"
        network="ERC20"
        addressTail="0x8b…b3F"
        logo={<LogoStub color="#3E73C4" />}
        disabled
      />
    </div>
  ),
}

export const InRadioGroup: Story = {
  render: () => {
    const [sel, setSel] = useState('w1')
    const wallets = [
      { id: 'w1', name: 'Main wallet', addressTail: 'TXyZ…k9Lm', color: '#26A17B' },
      { id: 'w2', name: 'Trading wallet', addressTail: 'TAaB…m2Qe', color: '#26A17B' },
      { id: 'w3', name: 'Cold storage', addressTail: 'TZxK…p7Rd', color: '#26A17B' },
    ]
    return (
      <div
        role="radiogroup"
        aria-label="Select wallet"
        style={{ display: 'grid', gap: 8, width: 360 }}
      >
        {wallets.map((w) => (
          <WalletRow
            key={w.id}
            id={w.id}
            name={w.name}
            ticker="USDT"
            network="TRC20"
            addressTail={w.addressTail}
            logo={<LogoStub color={w.color} />}
            isDefault={w.id === 'w1'}
            selected={sel === w.id}
            onSelect={() => setSel(w.id)}
          />
        ))}
      </div>
    )
  },
}

export const Compact: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <WalletRow
        id="w5"
        name="Main wallet"
        ticker="USDT"
        network="TRC20"
        addressTail="TXyZ…k9Lm"
        logo={<LogoStub />}
        density="compact"
        selected
      />
    </div>
  ),
}
