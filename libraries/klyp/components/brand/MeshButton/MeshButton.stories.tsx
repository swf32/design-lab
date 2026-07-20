import { MeshButton, type MeshButtonProps } from './MeshButton'

export const stories = [
  {
    id: 'tones',
    kind: 'variant' as const,
    name: 'Tones',
    description: 'The four mesh palettes — gold is the default premium CTA treatment.',
    examples: [
      { label: 'Gold', props: { tone: 'gold' } },
      { label: 'Neutral', props: { tone: 'neutral' } },
      { label: 'Purple', props: { tone: 'purple' } },
      { label: 'Blue', props: { tone: 'blue' } },
    ],
  },
  {
    id: 'sizes',
    kind: 'variant' as const,
    name: 'Sizes',
    description: 'MeshButton across its five sizes.',
    examples: [
      { label: 'XS', props: { size: 'xs' } },
      { label: 'SM', props: { size: 'sm' } },
      { label: 'MD', props: { size: 'md' } },
      { label: 'LG', props: { size: 'lg' } },
      { label: 'XL', props: { size: 'xl' } },
    ],
  },
  {
    id: 'state-machine',
    kind: 'state' as const,
    name: 'State machine',
    description:
      'idle → processing → success → error — animated Iconsax icon swap with a label-width spring.',
    examples: [
      { label: 'Idle', props: { state: 'idle' } },
      { label: 'Processing', props: { state: 'processing' } },
      { label: 'Success', props: { state: 'success' } },
      { label: 'Error', props: { state: 'error' } },
    ],
  },
  {
    id: 'busy-and-active',
    kind: 'state' as const,
    name: 'Busy and active',
    description: 'Legacy static-mode flags: busy disables input, active arms the gold surface.',
    examples: [
      { label: 'Idle', props: {} },
      { label: 'Busy', props: { busy: true } },
      { label: 'Active', props: { active: true } },
    ],
  },
]

export function renderStoryExample(example: { props: Record<string, unknown> }) {
  const props = example.props as Partial<
    Pick<MeshButtonProps, 'tone' | 'size' | 'state' | 'busy' | 'active'>
  >
  return (
    <MeshButton
      tone={props.tone}
      size={props.size}
      state={props.state}
      busy={props.busy}
      active={props.active}
    >
      Generate
    </MeshButton>
  )
}
