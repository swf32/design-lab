import { Button, type ButtonProps } from './Button'

export const stories = [
  {
    id: 'variants',
    kind: 'variant' as const,
    name: 'Variant hierarchy',
    description: "Compares emphasis across Klyp's seven button variants.",
    examples: [
      { label: 'Primary', props: { variant: 'primary' } },
      { label: 'Secondary', props: { variant: 'secondary' } },
      { label: 'Outline', props: { variant: 'outline' } },
      { label: 'Ghost', props: { variant: 'ghost' } },
      { label: 'Destructive', props: { variant: 'destructive' } },
      { label: 'Accent', props: { variant: 'accent' } },
      { label: 'Link', props: { variant: 'link' } },
    ],
  },
  {
    id: 'sizes',
    kind: 'variant' as const,
    name: 'Sizes',
    description: 'The five label-carrying sizes (the icon-only sizes are a separate axis).',
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
      'idle → processing → success → error — each state swaps its built-in icon and label.',
    examples: [
      { label: 'Idle', props: { state: 'idle' } },
      { label: 'Processing', props: { state: 'processing' } },
      { label: 'Success', props: { state: 'success' } },
      { label: 'Error', props: { state: 'error' } },
    ],
  },
  {
    id: 'disabled',
    kind: 'state' as const,
    name: 'Disabled',
    description: 'Disabled treatment on the primary and outline variants.',
    examples: [
      { label: 'Primary disabled', props: { variant: 'primary', disabled: true } },
      { label: 'Outline disabled', props: { variant: 'outline', disabled: true } },
    ],
  },
]

export function renderStoryExample(example: { props: Record<string, unknown> }) {
  const props = example.props as Partial<
    Pick<ButtonProps, 'variant' | 'size' | 'state' | 'disabled'>
  >
  return (
    <Button
      variant={props.variant}
      size={props.size}
      state={props.state}
      disabled={props.disabled}
    >
      Generate
    </Button>
  )
}
