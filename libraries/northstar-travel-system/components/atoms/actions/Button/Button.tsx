import './Button.scss'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

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
  return (
    <button
      {...props}
      type={type}
      className={`northstar-button northstar-button--${variant}${fullWidth ? ' northstar-button--full' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
    >
      <span>{children}</span>
    </button>
  )
}
