import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { SearchIcon } from '../../../assets/icons/SearchIcon'

export type InputVariant = 'text' | 'search' | 'textarea'
export type InputSize = 'small' | 'medium' | 'large'

type SharedInputProps = {
  label: ReactNode
  variant?: InputVariant
  size?: InputSize
  helperText?: ReactNode
  errorMessage?: ReactNode
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  fullWidth?: boolean
  visuallyHideLabel?: boolean
  showCount?: boolean
  className?: string
  controlClassName?: string
}

export type TextInputProps = SharedInputProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'prefix' | 'size'> & {
  variant?: 'text' | 'search'
  rows?: never
}

export type TextareaInputProps = SharedInputProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
  variant: 'textarea'
  type?: never
}

export type InputProps = TextInputProps | TextareaInputProps

function contentLength(value: unknown) {
  if (Array.isArray(value)) return value.join(',').length
  return value == null ? 0 : String(value).length
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(function Input(props, ref) {
  const {
    label,
    variant = 'text',
    size = 'medium',
    helperText,
    errorMessage,
    startAdornment,
    endAdornment,
    fullWidth = false,
    visuallyHideLabel = false,
    showCount = false,
    className = '',
    controlClassName = '',
    id: suppliedId,
    required,
    disabled,
    readOnly,
    maxLength,
    value,
    defaultValue,
    onChange,
    'aria-describedby': suppliedDescription,
    'aria-invalid': suppliedInvalid,
    ...nativeProps
  } = props
  const generatedId = useId()
  const controlId = suppliedId ?? `dl-input-${generatedId.replace(/:/g, '')}`
  const hintId = helperText && !errorMessage ? `${controlId}-hint` : undefined
  const errorId = errorMessage ? `${controlId}-error` : undefined
  const description = [suppliedDescription, errorId, hintId].filter(Boolean).join(' ') || undefined
  const invalid = Boolean(errorMessage) || suppliedInvalid === true || suppliedInvalid === 'true'
  const [uncontrolledLength, setUncontrolledLength] = useState(() => contentLength(defaultValue))
  const length = value === undefined ? uncontrolledLength : contentLength(value)
  const hasStartAdornment = variant === 'search' || startAdornment != null
  const rootClass = [
    'dl-input',
    `dl-input--${variant}`,
    `dl-input--${size}`,
    fullWidth && 'dl-input--full',
    invalid && 'dl-input--invalid',
    disabled && 'dl-input--disabled',
    readOnly && 'dl-input--readonly',
    className,
  ].filter(Boolean).join(' ')
  const controlClass = ['dl-input__control', controlClassName].filter(Boolean).join(' ')
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (value === undefined) setUncontrolledLength(event.currentTarget.value.length)
    ;(onChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined)?.(event)
  }
  const commonProps = {
    id: controlId,
    disabled,
    readOnly,
    required,
    maxLength,
    value,
    defaultValue,
    onChange: handleChange,
    className: controlClass,
    'aria-describedby': description,
    'aria-invalid': invalid || undefined,
  }

  return <div className={rootClass}>
    <label className={`dl-input__label${visuallyHideLabel ? ' dl-input__label--hidden' : ''}`} htmlFor={controlId}>
      <span>{label}</span>
      {required && <span className="dl-input__required" aria-hidden="true">required</span>}
    </label>
    <div className="dl-input__frame">
      {hasStartAdornment && <span className="dl-input__adornment dl-input__adornment--start" aria-hidden={variant === 'search' && startAdornment == null ? 'true' : undefined}>
        {variant === 'search' && startAdornment == null ? <SearchIcon size={16}/> : startAdornment}
      </span>}
      {variant === 'textarea'
        ? <textarea {...(nativeProps as TextareaHTMLAttributes<HTMLTextAreaElement>)} {...commonProps} ref={ref as React.ForwardedRef<HTMLTextAreaElement>}/>
        : <input {...(nativeProps as InputHTMLAttributes<HTMLInputElement>)} {...commonProps} type={variant === 'search' ? 'search' : (props as TextInputProps).type} ref={ref as React.ForwardedRef<HTMLInputElement>}/>
      }
      {endAdornment != null && <span className="dl-input__adornment dl-input__adornment--end">{endAdornment}</span>}
    </div>
    {(errorMessage || helperText || showCount) && <div className="dl-input__meta">
      <span id={errorId ?? hintId} className={errorMessage ? 'dl-input__message dl-input__message--error' : 'dl-input__message'} role={errorMessage ? 'alert' : undefined}>
        {errorMessage ?? helperText}
      </span>
      {showCount && <span className="dl-input__count" aria-live="polite">{length}{typeof maxLength === 'number' ? ` / ${maxLength}` : ''}</span>}
    </div>}
  </div>
})
