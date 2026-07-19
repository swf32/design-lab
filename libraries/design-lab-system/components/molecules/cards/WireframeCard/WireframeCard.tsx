import './WireframeCard.scss'
import { Chip, type ChipColor } from '../../../atoms/data-display/Chip/Chip'
import { inspectionAttributes } from '@design-lab/system/inspection'

export type WireframeCardProps = {
  name: string
  description: string
  status: 'draft' | 'review' | 'approved'
  layoutCount: number
  stateCount: number
  transitionCount: number
  selected?: boolean
  onClick?: () => void
}

const statusColors: Record<WireframeCardProps['status'], ChipColor> = {
  draft: 'warning',
  review: 'accent',
  approved: 'success',
}

export function WireframeCard({
  name,
  description,
  status,
  layoutCount,
  stateCount,
  transitionCount,
  selected = false,
  onClick,
}: WireframeCardProps) {
  return (
    <button
      type="button"
      className={`dl-wireframe-card${selected ? ' dl-wireframe-card--selected' : ''}`}
      aria-current={selected ? 'page' : undefined}
      onClick={onClick}
      {...inspectionAttributes('WireframeCard', {
        name,
        status,
        layoutCount,
        stateCount,
        transitionCount,
        selected,
      })}
    >
      <span className="dl-wireframe-card__preview" aria-hidden="true">
        <i />
        <span>
          <b />
          <b />
          <b />
        </span>
      </span>
      <span className="dl-wireframe-card__content">
        <span className="dl-wireframe-card__header">
          <span>
            <small>{status}</small>
            <strong>{name}</strong>
          </span>
          <Chip size="small" color={statusColors[status]} variant="soft">
            {layoutCount} layouts
          </Chip>
        </span>
        <span className="dl-wireframe-card__description">{description}</span>
        <span className="dl-wireframe-card__footer">
          <span>{stateCount} states</span>
          <span>{transitionCount} transitions</span>
          <b>Open review</b>
        </span>
      </span>
    </button>
  )
}
