import './TripCard.scss'

export type TripCardProps = {
  origin: string
  destination: string
  departure: string
  arrival: string
  duration: string
  carrier: string
  price: string
  selected?: boolean
}

export function TripCard({
  origin,
  destination,
  departure,
  arrival,
  duration,
  carrier,
  price,
  selected = false,
}: TripCardProps) {
  return (
    <article className={`northstar-trip-card${selected ? ' is-selected' : ''}`}>
      <header>
        <span>{carrier}</span>
        <strong>{price}</strong>
      </header>
      <div className="northstar-trip-card__route">
        <div>
          <strong>{departure}</strong>
          <span>{origin}</span>
        </div>
        <div className="northstar-trip-card__journey">
          <span>{duration}</span>
          <i />
          <small>Direct</small>
        </div>
        <div>
          <strong>{arrival}</strong>
          <span>{destination}</span>
        </div>
      </div>
      <footer>
        <span>Flexible fare included</span>
        <button type="button">{selected ? 'Selected' : 'Choose trip'}</button>
      </footer>
    </article>
  )
}
