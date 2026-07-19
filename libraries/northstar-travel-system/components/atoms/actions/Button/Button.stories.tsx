import { Button } from './Button'

export const stories = [
  {
    id: 'variants',
    kind: 'variant' as const,
    name: 'Action hierarchy',
    description: 'Compares primary and secondary travel actions.',
    examples: [
      { label: 'Primary', props: { variant: 'primary' } },
      { label: 'Secondary', props: { variant: 'secondary' } },
    ],
  },
  {
    id: 'disabled',
    kind: 'state' as const,
    name: 'Unavailable action',
    description: 'Keeps an unavailable action visible without allowing activation.',
    examples: [{ label: 'Disabled', props: { disabled: true } }],
  },
]

export function renderStoryExample(example: { props: Record<string, unknown> }) {
  return (
    <Button
      variant={example.props.variant === 'secondary' ? 'secondary' : 'primary'}
      disabled={Boolean(example.props.disabled)}
    >
      Search flights
    </Button>
  )
}
