import './RadioButton.scss'
import type { InputHTMLAttributes, ReactNode } from 'react'

export type RadioButtonColor = 'default' | 'accent' | 'success' | 'warning' | 'danger'
export type RadioButtonSize = 'small' | 'medium' | 'large'

export type RadioButtonProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'color' | 'size' | 'type'
> & {
  label: ReactNode
  description?: ReactNode
  color?: RadioButtonColor
  size?: RadioButtonSize
}

export function RadioButton({
  label,
  description,
  color = 'accent',
  size = 'medium',
  className,
  disabled,
  ...props
}: RadioButtonProps) {
  const rootClass = [
    'dl-radio-button',
    `dl-radio-button--${color}`,
    `dl-radio-button--${size}`,
    disabled && 'dl-radio-button--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={rootClass}>
      <input type="radio" disabled={disabled} {...props} />
      <span className="dl-radio-button__control" aria-hidden="true">
        <span className="dl-radio-button__indicator" />
      </span>
      <span className="dl-radio-button__content">
        <span className="dl-radio-button__label">{label}</span>
        {description && <span className="dl-radio-button__description">{description}</span>}
      </span>
    </label>
  )
}
