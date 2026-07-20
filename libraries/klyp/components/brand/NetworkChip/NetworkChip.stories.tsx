import type { Meta, StoryObj } from '../__shared/stories-types'

import { NetworkChip } from './NetworkChip'

const meta = {
  component: NetworkChip,
  title: 'Brand / Atoms / NetworkChip',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    selected: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact identity badge surfacing currency ticker + chain network at a glance (`USDT · Tron`). Optional caller-supplied brand logo on the leading edge. Used in the Withdraw drawer Review screen and anywhere a "this is USDT on TRC20" pill is needed (not the full WalletRow or NetworkInfoCard). Selected state uses a neutral white-50% ring — gold accent is reserved for true CTAs, not selection markers.',
      },
    },
  },
} satisfies Meta<typeof NetworkChip>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Mock logo node used by the stories so the chip can be previewed without
 * depending on the `CryptoLogo` brand primitive (would introduce a parallel
 * package cycle during build). The chip clamps it to 14×14 via SCSS.
 */
function MockLogo({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '100%',
        height: '100%',
        background: color,
        borderRadius: '50%',
      }}
    />
  )
}

export const Default: Story = {
  render: () => <NetworkChip ticker="USDT" network="Tron" logo={<MockLogo color="#26A17B" />} />,
}

export const WithoutLogo: Story = {
  args: { ticker: 'USDC', network: 'ERC20' },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <NetworkChip ticker="USDT" network="TRC20" size="sm" logo={<MockLogo color="#26A17B" />} />
      <NetworkChip ticker="USDT" network="TRC20" size="md" logo={<MockLogo color="#26A17B" />} />
    </div>
  ),
}

/**
 * Selected — neutral white-50% ring (NOT gold). Demonstrates the
 * single-accent rule: gold is reserved for true CTAs / key state, not
 * for selection markers that may surface N-at-once.
 */
export const Selected: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <NetworkChip ticker="USDT" network="TRC20" logo={<MockLogo color="#26A17B" />} />
      <NetworkChip ticker="USDT" network="TRC20" selected logo={<MockLogo color="#26A17B" />} />
    </div>
  ),
}
