import { control, definePlayground, type PlaygroundValues } from '@design-lab/system/playground'
import { TripCard } from './TripCard'

export const playground = definePlayground({
  name: 'Trip Card directions',
  description: 'Compare information density without changing the production lifecycle status.',
  defaultVariant: 'editorial',
  variants: [
    { id: 'editorial', name: 'Editorial', description: 'Balanced route and fare information.' },
    { id: 'compact', name: 'Compact', description: 'Shorter labels for dense result lists.' },
    { id: 'deal', name: 'Deal-led', description: 'Selection and price receive more emphasis.' },
  ],
  controls: {
    origin: control.string({ label: 'Origin', defaultValue: 'Lisbon' }),
    destination: control.string({ label: 'Destination', defaultValue: 'Copenhagen' }),
    price: control.string({ label: 'Price', defaultValue: '€184' }),
    selected: control.boolean({ label: 'Selected', defaultValue: false }),
  },
})

type Values = PlaygroundValues<typeof playground.controls>

export function renderPlaygroundVariant({ variant, values }: { variant: string; values: Values }) {
  const compact = variant === 'compact'
  const deal = variant === 'deal'
  return (
    <TripCard
      origin={values.origin}
      destination={values.destination}
      departure={compact ? '09:10' : '09:10 local'}
      arrival={compact ? '12:25' : '12:25 local'}
      duration={deal ? 'Best direct fare' : '3h 15m'}
      carrier={deal ? 'Limited Northstar fare' : 'Northstar Air'}
      price={values.price}
      selected={values.selected || deal}
    />
  )
}
