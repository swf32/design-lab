import './TabSwitcher.scss'
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export type TabSwitcherVariant = 'segmented' | 'toggle'
export type TabSwitcherSize = 'small' | 'medium'
export type TabSwitcherOverflow = 'fit' | 'wrap' | 'scroll'

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
  overflow?: TabSwitcherOverflow
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
  overflow = 'fit',
  className = '',
}: TabSwitcherProps<Value>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const switcherStyle: CSSProperties & Record<`--${string}`, string | number> = {
    '--tab-switcher-icon-size': `${iconSize ?? (size === 'small' ? 14 : 16)}px`,
    ...(variant === 'segmented'
      ? {
          '--tab-switcher-indicator-x': `${indicator.x}px`,
          '--tab-switcher-indicator-y': `${indicator.y}px`,
          '--tab-switcher-indicator-width': `${indicator.width}px`,
          '--tab-switcher-indicator-height': `${indicator.height}px`,
          '--tab-switcher-indicator-opacity': indicator.width > 0 ? 1 : 0,
        }
      : {
          '--tab-switcher-count': options.length,
          '--tab-switcher-index': selectedIndex,
        }),
  }

  useLayoutEffect(() => {
    if (variant !== 'segmented') return
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const selected = root.querySelector<HTMLButtonElement>('button[data-selected="true"]')
      if (!selected) return
      setIndicator({
        x: selected.offsetLeft,
        y: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    root.querySelectorAll('button').forEach((button) => observer.observe(button))
    return () => observer.disconnect()
  }, [options.length, overflow, size, value, variant])

  return (
    <div
      ref={rootRef}
      className={`dl-tab-switcher dl-tab-switcher--${variant} dl-tab-switcher--${size} dl-tab-switcher--overflow-${overflow} ${className}`.trim()}
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
            data-selected={selected}
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
