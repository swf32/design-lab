import './Button.scss'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { inspectionAttributes, slotAttributes } from '@design-lab/system/inspection'
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  fullWidth?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  children: ReactNode
}
export function Button({
  variant = 'secondary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leading,
  trailing,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`dl-button dl-button--${variant} dl-button--${size}${fullWidth ? ' dl-button--full' : ''}${loading ? ' dl-button--loading' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
      {...inspectionAttributes('Button', {
        variant,
        size,
        loading,
        fullWidth,
        disabled: Boolean(disabled),
        children: typeof children === 'string' ? children : undefined,
      })}
    >
      {loading ? (
        <span className="dl-button__spinner" />
      ) : (
        leading != null && <span {...slotAttributes('leading')}>{leading}</span>
      )}
      <span>{children}</span>
      {!loading && trailing != null && <span {...slotAttributes('trailing')}>{trailing}</span>}
    </button>
  )
}
