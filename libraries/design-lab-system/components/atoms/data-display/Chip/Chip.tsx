import './Chip.scss'
import type { HTMLAttributes, ReactNode } from 'react'

export type ChipColor = 'default' | 'accent' | 'success' | 'warning' | 'danger'
export type ChipVariant = 'primary' | 'secondary' | 'tertiary' | 'soft'
export type ChipSize = 'small' | 'medium' | 'large'

export type ChipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  children: ReactNode
  color?: ChipColor
  variant?: ChipVariant
  size?: ChipSize
  startContent?: ReactNode
  endContent?: ReactNode
  disabled?: boolean
}

export function Chip({
  children,
  color = 'default',
  variant = 'secondary',
  size = 'medium',
  startContent,
  endContent,
  disabled = false,
  className,
  ...props
}: ChipProps) {
  const rootClass = [
    'dl-chip',
    `dl-chip--${color}`,
    `dl-chip--${variant}`,
    `dl-chip--${size}`,
    disabled && 'dl-chip--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={rootClass} aria-disabled={disabled || undefined} {...props}>
      {startContent != null && (
        <span className="dl-chip__content dl-chip__content--start">{startContent}</span>
      )}
      <span className="dl-chip__label">{children}</span>
      {endContent != null && (
        <span className="dl-chip__content dl-chip__content--end">{endContent}</span>
      )}
    </span>
  )
}
