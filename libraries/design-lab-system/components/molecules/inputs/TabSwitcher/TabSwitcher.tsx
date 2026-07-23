import './TabSwitcher.scss'
import type { CSSProperties, ReactNode } from 'react'

export type TabSwitcherVariant = 'segmented' | 'toggle'
export type TabSwitcherSize = 'small' | 'medium'

type TabSwitcherOptionBase<Value extends string> = {
  value: Value
  disabled?: boolean
}

export type TabSwitcherOption<Value extends string = string> = TabSwitcherOptionBase<Value> &
  (
    | {
        label: ReactNode
        icon?: ReactNode
        accessibleLabel?: string
      }
    | {
        label?: never
        icon: ReactNode
        accessibleLabel: string
      }
  )

export interface TabSwitcherProps<Value extends string = string> {
  options: readonly TabSwitcherOption<Value>[]
  value: Value
  onChange: (value: Value) => void
  ariaLabel: string
  variant?: TabSwitcherVariant
  size?: TabSwitcherSize
  iconSize?: number
  className?: string
}

export function TabSwitcher<Value extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = 'segmented',
  size = 'medium',
  iconSize,
  className = '',
}: TabSwitcherProps<Value>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const switcherStyle = {
    '--tab-switcher-icon-size': `${iconSize ?? (size === 'small' ? 14 : 16)}px`,
    ...(variant === 'toggle'
      ? {
          '--tab-switcher-count': options.length,
          '--tab-switcher-index': selectedIndex,
        }
      : {}),
  } as CSSProperties

  return (
    <div
      className={`dl-tab-switcher dl-tab-switcher--${variant} dl-tab-switcher--${size} ${className}`.trim()}
      style={switcherStyle}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={selected ? 'is-active' : ''}
            aria-label={option.accessibleLabel}
            aria-pressed={selected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
          >
            <span className="dl-tab-switcher__content">
              {option.icon !== undefined && (
                <span className="dl-tab-switcher__icon" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              {option.label !== undefined && (
                <span className="dl-tab-switcher__label">{option.label}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
