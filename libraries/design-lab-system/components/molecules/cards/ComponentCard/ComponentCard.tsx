import './ComponentCard.scss'
import type { ReactNode } from 'react'
import { Chip, type ChipColor } from '../../../atoms/data-display/Chip/Chip'

export type ComponentCardProps = {
  name: string
  entry: string
  meta: string
  preview: ReactNode
  previewAnimated?: boolean
  selected?: boolean
  status?: string | null
  onClick?: () => void
}

function statusPresentation(status: string) {
  const normalized = status.toLowerCase()
  const colors: Record<string, ChipColor> = {
    ready: 'success',
    'in-progress': 'accent',
    wireframe: 'warning',
  }
  return {
    color: colors[normalized] ?? 'default',
    label: normalized
      .split('-')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' '),
  }
}

export function ComponentCard({
  name,
  preview,
  previewAnimated = false,
  selected = false,
  status,
  onClick,
}: ComponentCardProps) {
  const presentation = status ? statusPresentation(status) : null
  return (
    <button
      type="button"
      className={`dl-component-card${previewAnimated ? ' dl-component-card--preview-animated' : ''}${selected ? ' dl-component-card--selected' : ''}`}
      aria-current={selected ? 'page' : undefined}
      onClick={onClick}
    >
      <span className="dl-component-card__preview">{preview}</span>
      <span className="dl-component-card__footer">
        <strong>{name}</strong>
        {presentation && (
          <Chip color={presentation.color} variant="soft" size="small">
            {presentation.label}
          </Chip>
        )}
      </span>
    </button>
  )
}
