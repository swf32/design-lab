import './WireframeCard.scss'
import type { ReactNode } from 'react'
import { Chip, type ChipColor } from '../../../atoms/data-display/Chip/Chip'
import { WireframeScreenPreview } from '../../workbench/WireframeScreenPreview/WireframeScreenPreview'

export type WireframeCardProps = {
  name: string
  description: string
  status: 'draft' | 'review' | 'approved'
  layoutCount: number
  stateCount: number
  transitionCount: number
  preview: ReactNode
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
  preview,
  selected = false,
  onClick,
}: WireframeCardProps) {
  return (
    <article className={`dl-wireframe-card${selected ? ' dl-wireframe-card--selected' : ''}`}>
      <WireframeScreenPreview>{preview}</WireframeScreenPreview>
      <button
        type="button"
        className="dl-wireframe-card__action"
        aria-current={selected ? 'page' : undefined}
        aria-label={`Open ${name} Wireframe. ${description} ${layoutCount} layouts, ${stateCount} states, ${transitionCount} transitions.`}
        onClick={onClick}
      />
      <footer className="dl-wireframe-card__footer">
        <strong>{name}</strong>
        <Chip size="small" color={statusColors[status]} variant="soft">
          {status}
        </Chip>
      </footer>
    </article>
  )
}
