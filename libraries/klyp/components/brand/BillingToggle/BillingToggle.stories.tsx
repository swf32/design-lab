import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { type BillingPeriod, BillingToggle } from './BillingToggle'

const meta = {
  component: BillingToggle,
  title: 'Brand / Atoms / BillingToggle',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Monthly / Annual segmented switcher — a thin wrapper over `<TabSwitcher shape="pill">` with two pre-baked items and an optional "Save N%" gold chip on the Annual option. Controlled: pass `value` + `onValueChange`. Drives the billing period on the /pricing tier grid and inside `<PricingCompareMatrix>`. Animation (Motion FLIP sliding indicator) comes verbatim from TabSwitcher.',
      },
    },
  },
} satisfies Meta<typeof BillingToggle>

export default meta
type Story = StoryObj<typeof meta>

/** Controlled demo wrapper — BillingToggle owns no internal state. */
function Demo(props: {
  annualSavingsPercent?: number | null
  size?: 'sm' | 'md' | 'lg'
  ariaLabel: string
}) {
  const [value, setValue] = useState<BillingPeriod>('annual')
  return <BillingToggle {...props} value={value} onValueChange={setValue} />
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Annual pre-selected with a "Save 10%" chip — the /pricing default state.',
      },
    },
  },
  render: () => <Demo ariaLabel="Billing period" annualSavingsPercent={10} />,
}

export const NoSavingsChip: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Plain Monthly / Annual switch — omit `annualSavingsPercent` (or pass 0 / null).',
      },
    },
  },
  render: () => <Demo ariaLabel="Billing period" />,
}

export const Sizes: Story = {
  parameters: {
    docs: {
      description: { story: 'The three pill heights — `sm` / `md` (default, 40px) / `lg`.' },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Demo ariaLabel="Billing period — small" size="sm" annualSavingsPercent={10} />
      <Demo ariaLabel="Billing period — medium" size="md" annualSavingsPercent={10} />
      <Demo ariaLabel="Billing period — large" size="lg" annualSavingsPercent={10} />
    </div>
  ),
}
