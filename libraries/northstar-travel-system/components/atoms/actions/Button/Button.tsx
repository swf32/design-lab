import './Button.scss'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { inspectionAttributes, slotAttributes } from '@design-lab/system/inspection'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const label = typeof children === 'string' ? children : 'Action'
  return (
    <button
      {...inspectionAttributes('Button', {
        variant,
        fullWidth,
        disabled: Boolean(disabled),
        children: label,
      })}
      {...props}
      type={type}
      className={`northstar-button northstar-button--${variant}${fullWidth ? ' northstar-button--full' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
    >
      <span {...slotAttributes('label')}>{children}</span>
    </button>
  )
}
