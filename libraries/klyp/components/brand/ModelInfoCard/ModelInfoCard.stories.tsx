import { useState } from 'react'
import type { Meta, StoryObj } from '../__shared/stories-types'
import { ProviderIcon } from '../ProviderIcon'
import { ModelInfoCard, type ModelInfoMetric } from './ModelInfoCard'

const TEXT_METRICS: readonly ModelInfoMetric[] = [
  { label: 'Intelligence', value: 9, tone: 'success' },
  { label: 'Speed', value: 5, tone: 'warning' },
  { label: 'Context', value: 8, tone: 'info' },
  { label: 'Cost', value: 7, tone: 'danger' },
]

const VIDEO_METRICS: readonly ModelInfoMetric[] = [
  { label: 'Quality', value: 8, tone: 'success' },
  { label: 'Speed', value: 4, tone: 'warning' },
  { label: 'Cost', value: 6, tone: 'danger' },
]

const meta = {
  component: ModelInfoCard,
  title: 'Brand / ModelInfoCard',
  tags: ['autodocs'],
  args: {
    name: 'Claude Opus 4.7',
    provider: 'Anthropic',
    description:
      'Frontier reasoning model for long, multi-step creative work. Strongest instruction-following in the lineup.',
    configHeading: 'Configuration',
    icon: <ProviderIcon provider="anthropic" size="lg" />,
    metrics: TEXT_METRICS,
  },
  argTypes: {
    name: { control: 'text' },
    provider: { control: 'text' },
    description: { control: 'text' },
    configHeading: { control: 'text' },
    icon: { control: false },
    metrics: { control: false },
    facts: { control: false },
    config: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof ModelInfoCard>

export default meta
type Story = StoryObj<typeof meta>

/** Text model — full card: metrics grid + live (locally controlled)
 *  Reasoning configuration switcher. */
export const Default: Story = {
  render: (args) => <DefaultDemo {...args} />,
}

function DefaultDemo(args: Story['args']) {
  const [reasoning, setReasoning] = useState('medium')
  return (
    <div style={{ width: 320 }}>
      <ModelInfoCard
        {...args}
        config={{
          label: 'Reasoning',
          options: [
            { id: 'low', label: 'Low' },
            { id: 'medium', label: 'Medium' },
            { id: 'high', label: 'High' },
          ],
          value: reasoning,
          onChange: setReasoning,
        }}
      />
    </div>
  )
}

/** Video model — 3-metric bar set + capability fact chips, no config. */
export const VideoModel: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <ModelInfoCard
        name="Kling 3.0"
        provider="Kling"
        icon={<ProviderIcon provider="kling" size="lg" />}
        description="Cinematic text-to-video and image-to-video with native audio. Strong motion coherence on character shots."
        metrics={VIDEO_METRICS}
        facts={['up to 15s', '1080p', 'audio', 'start/end frames']}
      />
    </div>
  ),
}

/** Minimal — name + description only (a model with no analysed metrics yet). */
export const Minimal: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <ModelInfoCard
        name="Grok Imagine"
        provider="xAI"
        icon={<ProviderIcon provider="xai" size="lg" />}
        description="Aurora image generation. Billed per image."
      />
    </div>
  ),
}

/** Adaptive — the metrics grid collapses to one column in narrow containers
 *  (280px) and breathes at 600px. */
export const Adaptive: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {[280, 600].map((w) => (
        <div key={w} style={{ width: w }}>
          <ModelInfoCard
            name="Seedance 2.0"
            provider="Seedance"
            icon={<ProviderIcon provider="seedance" size="lg" />}
            description="Multi-reference video generation with strict prompt adherence."
            metrics={VIDEO_METRICS}
            facts={['up to 12s', '720p', 'reference video']}
          />
        </div>
      ))}
    </div>
  ),
}
