import type { Meta, StoryObj } from '../__shared/stories-types'
import { InlineWarning } from './InlineWarning'

const meta = {
  title: 'Brand / Atoms / InlineWarning',
  component: InlineWarning,
  tags: ['autodocs'],
  args: {
    tone: 'warning',
    size: 'md',
    lead: 'Irreversible.',
    children:
      'Sending to a wrong-network address means lost funds — verify the address and TRC20 network above.',
  },
  argTypes: {
    tone: { control: 'select', options: ['info', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InlineWarning>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <InlineWarning tone="info" lead="Heads up.">
        Some informational context here.
      </InlineWarning>
      <InlineWarning tone="warning" lead="Caution.">
        A reversible-with-effort action.
      </InlineWarning>
      <InlineWarning tone="danger" lead="Irreversible.">
        A truly destructive action.
      </InlineWarning>
    </div>
  ),
}

export const WithoutLead: Story = {
  args: { lead: undefined, children: 'Body-only message, no bolded lead.' },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <InlineWarning size="sm" lead="Small.">
        Tighter typography for dense surfaces.
      </InlineWarning>
      <InlineWarning size="md" lead="Default.">
        Normal callout size.
      </InlineWarning>
    </div>
  ),
}
