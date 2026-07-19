import { TripCard } from './TripCard'

export const stories = [
  {
    id: 'selection',
    kind: 'state' as const,
    name: 'Selection state',
    description: 'Compares an available journey before and after selection.',
    examples: [
      { label: 'Available', props: { selected: false } },
      { label: 'Selected', props: { selected: true } },
    ],
  },
]

export function renderStoryExample(example: { props: Record<string, unknown> }) {
  return (
    <TripCard
      origin="Lisbon"
      destination="Copenhagen"
      departure="09:10"
      arrival="12:25"
      duration="3h 15m"
      carrier="Northstar Air"
      price="€184"
      selected={Boolean(example.props.selected)}
    />
  )
}
