import './Slider.scss'
import {
  useId,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export type SliderColor = 'default' | 'accent' | 'success' | 'warning' | 'danger'
export type SliderSize = 'small' | 'medium' | 'large'

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'children'
  | 'color'
  | 'defaultValue'
  | 'max'
  | 'min'
  | 'onChange'
  | 'size'
  | 'step'
  | 'type'
  | 'value'
> & {
  label?: ReactNode
  value?: number
  defaultValue?: number
  minValue?: number
  maxValue?: number
  step?: number
  color?: SliderColor
  size?: SliderSize
  showValue?: boolean
  formatValue?: (value: number) => ReactNode
  onChange?: ChangeEventHandler<HTMLInputElement>
  onValueChange?: (value: number) => void
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function Slider({
  label,
  value,
  defaultValue = 0,
  minValue = 0,
  maxValue = 100,
  step = 1,
  color = 'accent',
  size = 'medium',
  showValue = true,
  formatValue = (current) => current,
  onChange,
  onValueChange,
  className,
  disabled,
  id: suppliedId,
  style,
  ...props
}: SliderProps) {
  const generatedId = useId()
  const controlId = suppliedId ?? `dl-slider-${generatedId.replace(/:/g, '')}`
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    clamp(defaultValue, minValue, maxValue),
  )
  const currentValue = clamp(value ?? uncontrolledValue, minValue, maxValue)
  const range = Math.max(maxValue - minValue, 1)
  const progress = ((currentValue - minValue) / range) * 100
  const rootClass = [
    'dl-slider',
    `dl-slider--${color}`,
    `dl-slider--${size}`,
    disabled && 'dl-slider--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const rootStyle = {
    ...style,
    '--slider-progress': `${progress}%`,
  } as CSSProperties

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.currentTarget.value)
    if (value === undefined) setUncontrolledValue(next)
    onChange?.(event)
    onValueChange?.(next)
  }

  return (
    <div className={rootClass} style={rootStyle}>
      {(label || showValue) && (
        <div className="dl-slider__header">
          {label && (
            <label className="dl-slider__label" htmlFor={controlId}>
              {label}
            </label>
          )}
          {showValue && (
            <output className="dl-slider__output" htmlFor={controlId}>
              {formatValue(currentValue)}
            </output>
          )}
        </div>
      )}
      <input
        {...props}
        id={controlId}
        className="dl-slider__control"
        type="range"
        min={minValue}
        max={maxValue}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  )
}
