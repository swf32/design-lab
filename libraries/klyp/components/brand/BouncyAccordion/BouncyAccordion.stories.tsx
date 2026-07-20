import type { Meta, StoryObj } from '../__shared/stories-types'
import { BouncyAccordion, type BouncyAccordionItem } from './BouncyAccordion'

const meta = {
  title: 'Brand / Molecules / BouncyAccordion',
  component: BouncyAccordion,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BouncyAccordion>

export default meta
type Story = StoryObj<typeof meta>

const STAGE_STYLE = { width: 640, height: 640 }

const FAQ_ITEMS: BouncyAccordionItem[] = [
  {
    id: 'tokens',
    title: 'How do tokens work?',
    description:
      'Tokens are one currency for every model on Klyp. The cost is printed on the Generate button before you commit — no per-provider math in your head.',
  },
  {
    id: 'cost',
    title: 'Why do some generations cost more than others?',
    description:
      'Different models, different compute. Cost scales with the model you pick plus its settings — resolution, duration, batch size.',
  },
  {
    id: 'rollover',
    title: 'Do unused tokens roll over?',
    description:
      'Plan tokens roll over for 30 days; top-up packs roll over for 90 days. Anything older drops off automatically.',
  },
  {
    id: 'failures',
    title: 'What happens if a generation fails?',
    description:
      'Tokens metered for a failed generation are refunded automatically — you only pay for successful output.',
  },
]

export const Default: Story = {
  render: () => (
    <div style={STAGE_STYLE}>
      <BouncyAccordion items={FAQ_ITEMS} width={560} />
    </div>
  ),
}

export const DefaultActive: Story = {
  render: () => (
    <div style={STAGE_STYLE}>
      <BouncyAccordion items={FAQ_ITEMS} width={560} defaultActiveIndex={0} />
    </div>
  ),
}

export const ThreeItems: Story = {
  render: () => (
    <div style={STAGE_STYLE}>
      <BouncyAccordion items={FAQ_ITEMS.slice(0, 3)} width={560} />
    </div>
  ),
}

// Multi-paragraph answers — proves the row grows to fit (height: auto)
// instead of clipping under a fixed cap. Open the first row to verify the
// full answer is visible with no truncation.
const LONG_ITEMS: BouncyAccordionItem[] = [
  {
    id: 'long-billing',
    title: 'How does billing actually work end to end?',
    description:
      'When you hit Generate, Klyp meters the exact token cost of that model and its settings before the request leaves your browser, holds it against your balance, and only finalizes the charge once the provider returns a successful result. If the generation fails or times out, the hold is released automatically and nothing is deducted. Plan tokens replenish every billing cycle and roll over for 30 days; top-up packs roll over for 90. You can watch the running balance in the header and the per-generation cost on every node, so there is never a surprise at the end of the month.',
  },
  {
    id: 'long-models',
    title: 'Which models are included and how do I switch between them?',
    description:
      'Every model in the catalog — text, image, and video — is available on a single balance, so switching providers never means a new contract or a separate invoice. Pick a model from the picker on any node, adjust resolution, duration, or batch size, and the cost on the Generate button updates live. Mixing models inside one board is encouraged: draft with a fast cheap model, then re-run the keepers through a flagship without rebuilding your prompt graph.',
  },
]

export const LongAnswers: Story = {
  render: () => (
    <div style={{ width: 640, height: 720 }}>
      <BouncyAccordion items={LONG_ITEMS} width={560} defaultActiveIndex={0} />
    </div>
  ),
}

// allowMultiple — several answers can stay open at once for side-by-side
// comparison (e.g. roll-over vs. failure refunds on a pricing FAQ).
export const Multiple: Story = {
  render: () => (
    <div style={STAGE_STYLE}>
      <BouncyAccordion items={FAQ_ITEMS} width={560} allowMultiple defaultActiveIndex={0} />
    </div>
  ),
}

export const SingleItem: Story = {
  render: () => (
    <div style={STAGE_STYLE}>
      <BouncyAccordion items={FAQ_ITEMS.slice(0, 1)} width={560} />
    </div>
  ),
}
