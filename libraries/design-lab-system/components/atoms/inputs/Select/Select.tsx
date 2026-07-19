import './Select.scss'
import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { ArrowDownIcon } from '../../../../assets/icons'

export type SelectSize = 'small' | 'medium' | 'large'

export type SelectOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> & {
  label: ReactNode
  options: readonly SelectOption[]
  size?: SelectSize
  fullWidth?: boolean
  visuallyHideLabel?: boolean
  helperText?: ReactNode
  errorMessage?: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    size = 'medium',
    fullWidth = false,
    visuallyHideLabel = false,
    helperText,
    errorMessage,
    className,
    id: suppliedId,
    disabled,
    'aria-describedby': suppliedDescription,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const controlId = suppliedId ?? `dl-select-${generatedId.replace(/:/g, '')}`
  const messageId = helperText || errorMessage ? `${controlId}-message` : undefined
  const description = [suppliedDescription, messageId].filter(Boolean).join(' ') || undefined
  const rootClass = [
    'dl-select',
    `dl-select--${size}`,
    fullWidth && 'dl-select--full',
    errorMessage && 'dl-select--invalid',
    disabled && 'dl-select--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <label
        className={`dl-select__label${visuallyHideLabel ? ' dl-select__label--hidden' : ''}`}
        htmlFor={controlId}
      >
        {label}
      </label>
      <div className="dl-select__frame">
        <select
          {...props}
          ref={ref}
          id={controlId}
          disabled={disabled}
          aria-describedby={description}
          aria-invalid={Boolean(errorMessage) || undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ArrowDownIcon size={14} aria-hidden="true" />
      </div>
      {(errorMessage || helperText) && (
        <span
          id={messageId}
          className={`dl-select__message${errorMessage ? ' dl-select__message--error' : ''}`}
          role={errorMessage ? 'alert' : undefined}
        >
          {errorMessage ?? helperText}
        </span>
      )}
    </div>
  )
})
