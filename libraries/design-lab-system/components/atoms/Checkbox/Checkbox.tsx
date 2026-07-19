import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react'

export type CheckboxSize = 'small' | 'medium'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> & {
  label?: ReactNode
  description?: ReactNode
  indeterminate?: boolean
  size?: CheckboxSize
}

export function Checkbox({
  label,
  description,
  indeterminate = false,
  size = 'medium',
  className,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const Root = label || description ? 'label' : 'span'

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return <Root className={`dl-checkbox dl-checkbox--${size}${className ? ` ${className}` : ''}`}>
    <input ref={inputRef} type="checkbox" {...props}/>
    <span className="dl-checkbox__box" aria-hidden="true"/>
    {(label || description) && <span className="dl-checkbox__content">
      {label && <span className="dl-checkbox__label">{label}</span>}
      {description && <span className="dl-checkbox__description">{description}</span>}
    </span>}
  </Root>
}
