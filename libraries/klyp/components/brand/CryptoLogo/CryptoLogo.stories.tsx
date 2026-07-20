import type { Meta, StoryObj } from '../__shared/stories-types'
import { CryptoLogo } from './CryptoLogo'

const meta = {
  title: 'Brand / Atoms / CryptoLogo',
  component: CryptoLogo,
  tags: ['autodocs'],
  argTypes: {
    ticker: {
      control: 'select',
      options: ['USDT', 'USDC', 'TRX', 'ETH', 'SOL', 'POL', 'BASE', 'ARB'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    withNetworkBadge: { control: 'select', options: [undefined, 'TRC20', 'ERC20'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CryptoLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { ticker: 'USDT' } }

export const Tickers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <CryptoLogo ticker="USDT" />
      <CryptoLogo ticker="USDC" />
      <CryptoLogo ticker="TRX" />
      <CryptoLogo ticker="ETH" />
      <CryptoLogo ticker="SOL" />
      <CryptoLogo ticker="POL" />
      <CryptoLogo ticker="BASE" />
      <CryptoLogo ticker="ARB" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <CryptoLogo ticker="USDT" size="sm" />
      <CryptoLogo ticker="USDT" size="md" />
      <CryptoLogo ticker="USDT" size="lg" />
      <CryptoLogo ticker="USDT" size="xl" />
    </div>
  ),
}

export const WithNetworkBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <CryptoLogo ticker="USDT" size="lg" withNetworkBadge="TRC20" />
      <CryptoLogo ticker="USDC" size="lg" withNetworkBadge="ERC20" />
    </div>
  ),
}
